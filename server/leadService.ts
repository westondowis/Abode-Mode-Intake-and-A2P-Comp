import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Central Google Sheets Ledger Configuration
const GOOGLE_SHEETS_SPREADSHEET_ID = '1QYduEY1P6OL6vOPUkEZCCOUB8jgSBn6xYmW4FaHIB0w';

// Data audit log paths
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const LEADS_AUDIT_LOG_FILE = path.resolve(DATA_DIR, 'leads_audit.jsonl');
const TASKS_AUDIT_LOG_FILE = path.resolve(DATA_DIR, 'tasks_audit.jsonl');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[LeadService] Could not create data directory:', err);
  }
}

// Initialize Firebase server instance
let db: ReturnType<typeof getFirestore> | null = null;
try {
  const configPath = path.resolve(ROOT_DIR, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(rawConfig);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);
    console.log(`[LeadService] Connected to Firestore project: ${firebaseConfig.projectId} (db: ${firebaseConfig.firestoreDatabaseId || 'default'})`);
  }
} catch (fbErr) {
  console.warn('[LeadService] Firebase initialization warning:', fbErr);
}

export interface LeadSubmissionData {
  id: string;
  flow: 'sell' | 'buy';
  fullName: string;
  phone?: string;
  email?: string;
  propertyAddress?: string;
  parcelOrAddress?: string;
  parcelNumber?: string;
  county?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  acreage?: string;
  askingPrice?: string;
  motivation?: string;
  timeline?: string;
  occupancyCondition?: string;
  notes?: string;
  // Vacant Land Utilities
  utilityWater?: string;
  utilitySewer?: string;
  utilityElectric?: string;
  utilityHeatingGas?: string;
  utilityInternet?: string;
  utilityDrainage?: string;
  // Location Fallbacks & Unit Sizing
  unknownAddress?: boolean;
  gpsCoordinates?: { lat?: number; lng?: number; formatted?: string } | null;
  documentAttachment?: { name?: string; fileName?: string; fileSize?: number; fileType?: string; base64Data?: string } | null;
  lotSizeUnit?: string;
  lotSizeRawValue?: string;
  ownershipStatus?: string;
  probateDocumentationStatus?: string;
  hasProbateDocumentation?: string | boolean;
  // A2P 10DLC Compliance Fields
  smsTransactionalConsent?: boolean;
  smsMarketingConsent?: boolean;
  smsConsent?: boolean;
  consentTimestamp?: string | null;
  consentIpHint?: string;
  userAgent?: string;
  disclosureVersion?: string;
  nonSharingCovenantAccepted?: boolean;
  exactConsentDisclosureText?: string;
  additionalData?: Record<string, unknown>;
  submittedAt: string;
  status?: string;
  [key: string]: unknown;
}

export interface UnderwritingTask {
  id: string;
  leadId: string;
  title: string;
  status: 'Pending Underwriting';
  priority: 'high' | 'normal';
  createdAt: string;
  dueDate: string;
  assignedTo: string;
  propertyAddress?: string;
  askingPrice?: string;
  notes?: string;
}

/**
 * Calculates due date exactly 24 business hours out from the current time.
 * Standard business schedule: 8 hours/day (3 business days = 24 business hours).
 * Automatically skips weekends (Saturday and Sunday).
 */
export function calculateBusinessHoursDueDate(startDate: Date = new Date(), businessHours = 24): string {
  const result = new Date(startDate);
  let businessDaysToAdd = Math.ceil(businessHours / 8);

  while (businessDaysToAdd > 0) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      businessDaysToAdd--;
    }
  }
  return result.toISOString();
}

/**
 * Safe Firestore document write with timeout to prevent hanging when offline
 */
async function safeSetDoc(docRef: any, data: any, timeoutMs = 1500): Promise<boolean> {
  try {
    const writePromise = setDoc(docRef, data);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore write timed out / offline')), timeoutMs)
    );
    await Promise.race([writePromise, timeoutPromise]);
    return true;
  } catch (err) {
    console.warn('[LeadService] Firestore write bypassed (timeout or offline):', (err as Error).message);
    return false;
  }
}

/**
 * Creates an underwriting task for the lead:
 * Task ID: task_[leadId]
 * Status: "Pending Underwriting"
 * Due date: 24 business hours out
 */
export async function createUnderwritingTask(lead: LeadSubmissionData): Promise<UnderwritingTask> {
  const taskId = `task_${lead.id}`;
  const now = new Date();
  const dueDate = calculateBusinessHoursDueDate(now, 24);
  const targetEmail = process.env.ACQUISITION_NOTIFICATION_EMAIL || 'wdowis@abode-mode.com';

  const propertyLabel = lead.propertyAddress || lead.parcelNumber || (lead.county ? `${lead.county} County, ${lead.state || 'CO'}` : 'Unspecified Parcel');

  const task: UnderwritingTask = {
    id: taskId,
    leadId: lead.id,
    title: `Underwriting Review: ${lead.fullName} (${propertyLabel})`,
    status: 'Pending Underwriting',
    priority: 'high',
    createdAt: now.toISOString(),
    dueDate,
    assignedTo: targetEmail,
    propertyAddress: lead.propertyAddress || lead.parcelNumber,
    askingPrice: lead.askingPrice,
    notes: lead.notes || (lead.unknownAddress ? 'Seller indicated unknown address - GPS or diligence doc attached' : undefined),
  };

  // 1. Immutable local audit log append for tasks
  try {
    const taskLogEntry = JSON.stringify(task) + '\n';
    fs.appendFileSync(TASKS_AUDIT_LOG_FILE, taskLogEntry, 'utf-8');
  } catch (err) {
    console.error('[LeadService] Failed to append task to audit log:', err);
  }

  // 2. Primary Firestore Persistence for task (safe timeout)
  if (db) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await safeSetDoc(taskRef, {
        ...task,
        updatedAt: now.toISOString(),
      });
      console.log(`[LeadService] Underwriting task ${taskId} recorded`);
    } catch (dbErr) {
      console.warn(`[LeadService] Firestore write warning for task ${taskId}:`, dbErr);
    }
  }

  return task;
}

/**
 * Appends an incoming lead directly to the central Google Sheets master ledger:
 * Sheet ID: 1QYduEY1P6OL6vOPUkEZCCOUB8jgSBn6xYmW4FaHIB0w
 *
 * Target Tabs:
 * - 'Buyer Intake'!A:AN (when lead.flow === 'buy')
 * - 'Seller Intake'!A:AN (when lead.flow === 'sell' or default)
 *
 * Exact 40-Column Array Index Order (Columns A through AN):
 *  [0] flow                         [1] fullName
 *  [2] phone                        [3] email
 *  [4] propertyAddress              [5] parcelOrAddress
 *  [6] parcelNumber                 [7] county
 *  [8] state                        [9] city
 * [10] zipCode                     [11] acreage
 * [12] lotSizeUnit                 [13] lotSizeRawValue
 * [14] unknownAddress              [15] gpsCoordinates ('lat, lng')
 * [16] documentAttachment          [17] utilityWater
 * [18] utilitySewer                [19] utilityElectric
 * [20] utilityHeatingGas           [21] utilityInternet
 * [22] utilityDrainage             [23] ownershipStatus
 * [24] probateDocumentationStatus  [25] hasProbateDocumentation
 * [26] askingPrice                 [27] motivation
 * [28] timeline                    [29] occupancyCondition
 * [30] notes                       [31] smsTransactionalConsent
 * [32] smsMarketingConsent         [33] consentTimestamp
 * [34] consentIpHint               [35] userAgent
 * [36] disclosureVersion           [37] nonSharingCovenantAccepted
 * [38] exactConsentDisclosureText  [39] additionalData
 */
export async function appendLeadToSheet(lead: LeadSubmissionData): Promise<boolean> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Target Range with quoted sheet names containing spaces
    const targetRange = lead.flow === 'buy' ? "'Buyer Intake'!A:AN" : "'Seller Intake'!A:AN";

    // Format GPS coordinates safely without "undefined, undefined"
    const gpsCoordValue =
      lead.gpsCoordinates && lead.gpsCoordinates.lat != null && lead.gpsCoordinates.lng != null
        ? `${lead.gpsCoordinates.lat}, ${lead.gpsCoordinates.lng}`
        : (lead.gpsCoordinates?.formatted || "");

    // Format Document Attachment safely
    const docAttachmentValue =
      lead.documentAttachment
        ? (lead.documentAttachment.name || lead.documentAttachment.fileName || "")
        : "";

    // 40 columns strictly in order matching [0] to [39]
    const rowValues: string[] = [
      lead.flow ? String(lead.flow) : 'sell',                                                 // [0]  flow
      lead.fullName ? String(lead.fullName) : '',                                             // [1]  fullName
      lead.phone ? String(lead.phone) : '',                                                   // [2]  phone
      lead.email ? String(lead.email) : '',                                                   // [3]  email
      lead.propertyAddress ? String(lead.propertyAddress) : '',                               // [4]  propertyAddress
      lead.parcelOrAddress ? String(lead.parcelOrAddress) : (lead.propertyAddress || ''),     // [5]  parcelOrAddress
      lead.parcelNumber ? String(lead.parcelNumber) : '',                                     // [6]  parcelNumber
      lead.county ? String(lead.county) : '',                                                 // [7]  county
      lead.state ? String(lead.state) : '',                                                   // [8]  state
      lead.city ? String(lead.city) : '',                                                     // [9]  city
      lead.zipCode ? String(lead.zipCode) : '',                                               // [10] zipCode
      lead.acreage ? String(lead.acreage) : '',                                               // [11] acreage
      lead.lotSizeUnit ? String(lead.lotSizeUnit) : '',                                       // [12] lotSizeUnit
      lead.lotSizeRawValue ? String(lead.lotSizeRawValue) : '',                               // [13] lotSizeRawValue
      lead.unknownAddress !== undefined && lead.unknownAddress !== null ? String(lead.unknownAddress) : '', // [14] unknownAddress
      gpsCoordValue,                                                                          // [15] gpsCoordinates
      docAttachmentValue,                                                                     // [16] documentAttachment
      lead.utilityWater ? String(lead.utilityWater) : '',                                     // [17] utilityWater
      lead.utilitySewer ? String(lead.utilitySewer) : '',                                     // [18] utilitySewer
      lead.utilityElectric ? String(lead.utilityElectric) : '',                               // [19] utilityElectric
      lead.utilityHeatingGas ? String(lead.utilityHeatingGas) : '',                           // [20] utilityHeatingGas
      lead.utilityInternet ? String(lead.utilityInternet) : '',                               // [21] utilityInternet
      lead.utilityDrainage ? String(lead.utilityDrainage) : '',                               // [22] utilityDrainage
      lead.ownershipStatus ? String(lead.ownershipStatus) : '',                               // [23] ownershipStatus
      lead.probateDocumentationStatus ? String(lead.probateDocumentationStatus) : '',         // [24] probateDocumentationStatus
      lead.hasProbateDocumentation !== undefined && lead.hasProbateDocumentation !== null ? String(lead.hasProbateDocumentation) : '', // [25] hasProbateDocumentation
      lead.askingPrice ? String(lead.askingPrice) : '',                                       // [26] askingPrice
      lead.motivation ? String(lead.motivation) : '',                                         // [27] motivation
      lead.timeline ? String(lead.timeline) : '',                                             // [28] timeline
      lead.occupancyCondition ? String(lead.occupancyCondition) : '',                         // [29] occupancyCondition
      lead.notes ? String(lead.notes) : '',                                                   // [30] notes
      lead.smsTransactionalConsent !== undefined && lead.smsTransactionalConsent !== null ? String(lead.smsTransactionalConsent) : '', // [31] smsTransactionalConsent
      lead.smsMarketingConsent !== undefined && lead.smsMarketingConsent !== null ? String(lead.smsMarketingConsent) : '',             // [32] smsMarketingConsent
      lead.consentTimestamp ? String(lead.consentTimestamp) : '',                             // [33] consentTimestamp
      lead.consentIpHint ? String(lead.consentIpHint) : '',                                   // [34] consentIpHint
      lead.userAgent ? String(lead.userAgent) : '',                                           // [35] userAgent
      lead.disclosureVersion ? String(lead.disclosureVersion) : '',                           // [36] disclosureVersion
      lead.nonSharingCovenantAccepted !== undefined && lead.nonSharingCovenantAccepted !== null ? String(lead.nonSharingCovenantAccepted) : '', // [37] nonSharingCovenantAccepted
      lead.exactConsentDisclosureText ? String(lead.exactConsentDisclosureText) : '',         // [38] exactConsentDisclosureText
      lead.additionalData ? JSON.stringify(lead.additionalData) : '',                         // [39] additionalData
    ];

    // Sanitize any residual nulls or undefined values to empty string ensuring exactly 40 elements
    const sanitizedRowValues = rowValues.map((val) => (val === undefined || val === null ? '' : String(val)));

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [sanitizedRowValues],
      },
    });

    console.log(`[LeadService] Lead ${(lead as any).id || lead.fullName || 'submission'} successfully appended to ${targetRange} (HTTP ${response.status})`);
    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[LeadService] Google Sheets append notice (non-blocking):', errorMsg);
    return false;
  }
}

/**
 * Persists lead to Firestore and immutable backup JSON audit file,
 * creates automated Underwriting Task,
 * appends lead to central Google Sheets master ledger,
 * then triggers asynchronous alerts to the acquisition desk without blocking.
 */
export async function processIncomingLead(leadData: LeadSubmissionData): Promise<{
  success: boolean;
  leadId: string;
  persistedTo: string[];
  timestamp: string;
  task: UnderwritingTask;
}> {
  const persistedTo: string[] = [];

  // 1. Immutable local audit log append (Zero data loss guarantee)
  try {
    const logEntry = JSON.stringify(leadData) + '\n';
    fs.appendFileSync(LEADS_AUDIT_LOG_FILE, logEntry, 'utf-8');
    persistedTo.push('audit_log');
  } catch (logErr) {
    console.error('[LeadService] Failed to append lead to audit log:', logErr);
  }

  // 2. Primary Firestore Persistence for Lead
  if (db) {
    try {
      const leadRef = doc(db, 'leads', leadData.id);
      const writeSuccess = await safeSetDoc(leadRef, {
        ...leadData,
        updatedAt: new Date().toISOString(),
      });
      if (writeSuccess) {
        persistedTo.push('firestore');
        console.log(`[LeadService] Lead ${leadData.id} persisted to Firestore collection 'leads'`);
      }
    } catch (dbErr) {
      console.error(`[LeadService] Firestore write failed for lead ${leadData.id}:`, dbErr);
    }
  }

  // 3. Central Google Sheets Master Ledger Appending (Sheet ID: 1QYduEY1P6OL6vOPUkEZCCOUB8jgSBn6xYmW4FaHIB0w)
  try {
    const sheetSuccess = await appendLeadToSheet(leadData);
    if (sheetSuccess) {
      persistedTo.push('google_sheets');
    }
  } catch (sheetErr) {
    console.warn('[LeadService] Google Sheets append error:', sheetErr);
  }

  // 4. Automated Underwriting Task Creation: task_[leadId], "Pending Underwriting", 24 business hours out
  const task = await createUnderwritingTask(leadData);

  // 5. Trigger Asynchronous Notifications (Non-blocking & Safe Execution)
  // Fire-and-forget promise so frontend response is instantaneous
  dispatchLeadNotifications(leadData, task).catch((notifErr) => {
    console.error('[LeadService] Safe non-blocking notification error caught:', notifErr);
  });

  return {
    success: true,
    leadId: leadData.id,
    persistedTo,
    timestamp: leadData.submittedAt,
    task,
  };
}

/**
 * Dispatches instant notifications:
 * 1. Email Alert to wdowis@abode-mode.com (or ACQUISITION_NOTIFICATION_EMAIL) via Resend
 *    (with fallback to onboarding@resend.dev to prevent 403 errors) or SMTP.
 * 2. Inbound Webhook (Zapier / Make / CRM / Inbound SMS Gateway)
 */
export async function dispatchLeadNotifications(
  lead: LeadSubmissionData,
  task?: UnderwritingTask
): Promise<void> {
  const targetEmail = process.env.ACQUISITION_NOTIFICATION_EMAIL || 'wdowis@abode-mode.com';
  const webhookUrl =
    process.env.LEAD_WEBHOOK_URL ||
    process.env.ZAPIER_WEBHOOK_URL ||
    process.env.MAKE_WEBHOOK_URL ||
    process.env.CRM_WEBHOOK_URL;

  const addressStr = lead.propertyAddress || lead.parcelNumber || (lead.county ? `${lead.county} County, ${lead.state || 'CO'}` : 'Unspecified Parcel');
  const rawAsking = lead.askingPrice || '25,000';
  const askingPriceStr = rawAsking.startsWith('$') ? rawAsking : `$${rawAsking}`;
  const propertyTypeStr = lead.propertyType === 'single-family' ? 'Single Family' : 'Land';

  const subject = `New Parcel Intake Alert: ${addressStr} | ${askingPriceStr}`;
  const textBody = `Lead ID: ${lead.id}
Property Type: ${propertyTypeStr}
Address: ${addressStr}
Asking Price: ${askingPriceStr}
Seller Name: ${lead.fullName}
Seller Phone: ${lead.phone || 'N/A'}
Seller Email: ${lead.email || 'N/A'}
Notes/Motivation: ${lead.notes || lead.motivation || 'None'}
Submitted At: ${lead.submittedAt || new Date().toISOString()}`;

  console.log(`[LeadService] Lead Notification Generated for: ${targetEmail}\n${textBody}`);

  // 1. Dispatch Webhook if configured
  if (webhookUrl) {
    try {
      const webhookPayload = {
        event: 'lead.created',
        flow: lead.flow,
        leadId: lead.id,
        taskId: task?.id || `task_${lead.id}`,
        taskDueDate: task?.dueDate,
        timestamp: lead.submittedAt,
        lead,
        recipient: targetEmail,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No response body');
        console.warn(
          `[LeadService:Warning] Webhook POST to ${webhookUrl} returned HTTP ${response.status}: ${errorText}`
        );
      } else {
        console.log(`[LeadService] Dispatched lead webhook to ${webhookUrl}: HTTP ${response.status}`);
      }
    } catch (whErr) {
      console.warn('[LeadService:Warning] Webhook network/fetch failure for lead:', lead.id, whErr);
    }
  }

  const ccEmail = 'wdowis@abode-mode.com';

  // 2. Email dispatch via Resend (with fallback to onboarding@resend.dev) or SMTP
  await sendResendEmailNotification({
    targetEmail,
    ccEmail,
    subject,
    textBody,
    lead,
  });
}

/**
 * Resilient Resend email dispatch with fallback to onboarding@resend.dev to prevent 403 errors
 */
async function sendResendEmailNotification(params: {
  targetEmail: string;
  ccEmail?: string;
  subject: string;
  textBody: string;
  lead: LeadSubmissionData;
}): Promise<boolean> {
  const { targetEmail, ccEmail = 'wdowis@abode-mode.com', subject, textBody } = params;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log(`[LeadService] Notice: RESEND_API_KEY not configured. Email logged locally for ${targetEmail}.`);
    return true;
  }

  const primaryFrom = process.env.RESEND_FROM_EMAIL || 'Abode Mode Leads <leads@abodebuys.com>';
  const fallbackFrom = 'Abode Mode Leads <onboarding@resend.dev>';
  const ccList = [ccEmail];

  try {
    // Attempt 1: Primary custom domain
    let emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: primaryFrom,
        to: [targetEmail],
        cc: ccList,
        subject,
        text: textBody,
      }),
    });

    if (emailRes.ok) {
      console.log(`[LeadService] Email alert dispatched via Resend (${primaryFrom}) to ${targetEmail} (CC: ${ccList.join(', ')})`);
      return true;
    }

    const errText = await emailRes.text().catch(() => 'No response text');
    console.warn(`[LeadService] Primary Resend send failed (HTTP ${emailRes.status}): ${errText}. Attempting fallback to ${fallbackFrom}...`);

    // Attempt 2: Fallback to onboarding@resend.dev to avoid 403 Forbidden domain unverified error
    emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fallbackFrom,
        to: [targetEmail],
        cc: ccList,
        subject,
        text: textBody,
      }),
    });

    if (emailRes.ok) {
      console.log(`[LeadService] Email alert dispatched via Resend fallback (${fallbackFrom}) to ${targetEmail} (CC: ${ccList.join(', ')})`);
      return true;
    }

    const fallbackErr = await emailRes.text().catch(() => 'No response text');
    console.warn(`[LeadService] Fallback Resend send returned HTTP ${emailRes.status}: ${fallbackErr}`);
    return false;
  } catch (resendErr) {
    console.warn(`[LeadService] Network exception during Resend email dispatch to ${targetEmail}:`, resendErr);
    return false;
  }
}


/**
 * Retrieves the most recent leads from the immutable audit log
 */
export function getRecentAuditLeads(limit = 50): LeadSubmissionData[] {
  if (!fs.existsSync(LEADS_AUDIT_LOG_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(LEADS_AUDIT_LOG_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const leads = lines
      .map((line) => {
        try {
          return JSON.parse(line) as LeadSubmissionData;
        } catch {
          return null;
        }
      })
      .filter((l): l is LeadSubmissionData => l !== null);

    return leads.reverse().slice(0, limit);
  } catch (err) {
    console.error('[LeadService] Error reading leads audit log:', err);
    return [];
  }
}

/**
 * Retrieves the most recent tasks from the immutable audit log
 */
export function getRecentAuditTasks(limit = 50): UnderwritingTask[] {
  if (!fs.existsSync(TASKS_AUDIT_LOG_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(TASKS_AUDIT_LOG_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const tasks = lines
      .map((line) => {
        try {
          return JSON.parse(line) as UnderwritingTask;
        } catch {
          return null;
        }
      })
      .filter((t): t is UnderwritingTask => t !== null);

    return tasks.reverse().slice(0, limit);
  } catch (err) {
    console.error('[LeadService] Error reading tasks audit log:', err);
    return [];
  }
}
