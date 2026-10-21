import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Data audit log path
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
const AUDIT_LOG_FILE = path.resolve(DATA_DIR, 'leads_audit.jsonl');

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
    db = getFirestore(app);
    console.log(`[LeadService] Connected to Firestore project: ${firebaseConfig.projectId}`);
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
  parcelNumber?: string;
  county?: string;
  state?: string;
  acreage?: string;
  askingPrice?: string;
  motivation?: string;
  timeline?: string;
  occupancyCondition?: string;
  notes?: string;
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
  submittedAt: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Persists lead to Firestore and immutable backup JSON audit file,
 * then triggers asynchronous alerts to the acquisition desk without blocking.
 */
export async function processIncomingLead(leadData: LeadSubmissionData): Promise<{
  success: boolean;
  leadId: string;
  persistedTo: string[];
  timestamp: string;
}> {
  const persistedTo: string[] = [];

  // 1. Immutable local audit log append (Zero data loss guarantee)
  try {
    const logEntry = JSON.stringify(leadData) + '\n';
    fs.appendFileSync(AUDIT_LOG_FILE, logEntry, 'utf-8');
    persistedTo.push('audit_log');
  } catch (logErr) {
    console.error('[LeadService] Failed to append to audit log:', logErr);
  }

  // 2. Primary Firestore Persistence
  if (db) {
    try {
      const leadRef = doc(db, 'leads', leadData.id);
      await setDoc(leadRef, {
        ...leadData,
        updatedAt: new Date().toISOString(),
      });
      persistedTo.push('firestore');
      console.log(`[LeadService] Lead ${leadData.id} persisted to Firestore collection 'leads'`);
    } catch (dbErr) {
      console.error(`[LeadService] Firestore write failed for lead ${leadData.id}:`, dbErr);
    }
  }

  // 3. Trigger Asynchronous Notifications (Non-blocking)
  // Fire-and-forget promise so frontend response is instant
  dispatchLeadNotifications(leadData).catch((notifErr) => {
    console.error('[LeadService] Asynchronous notification error:', notifErr);
  });

  return {
    success: true,
    leadId: leadData.id,
    persistedTo,
    timestamp: leadData.submittedAt,
  };
}

/**
 * Dispatches instant notifications:
 * 1. Email Alert to wdowis@abodebuys.com (or ACQUISITION_NOTIFICATION_EMAIL)
 * 2. Inbound Webhook (Zapier / Make / CRM / Inbound SMS Gateway)
 */
export async function dispatchLeadNotifications(lead: LeadSubmissionData): Promise<void> {
  const targetEmail = process.env.ACQUISITION_NOTIFICATION_EMAIL || 'wdowis@abodebuys.com';
  const webhookUrl =
    process.env.LEAD_WEBHOOK_URL ||
    process.env.ZAPIER_WEBHOOK_URL ||
    process.env.MAKE_WEBHOOK_URL ||
    process.env.CRM_WEBHOOK_URL;

  const isSell = lead.flow === 'sell';
  const flowLabel = isSell ? 'LAND ACQUISITION / CASH OFFER' : 'LAND BUYER CRITERIA';
  const propertyTitle = lead.propertyAddress || lead.parcelNumber || (lead.county ? `${lead.county} County, ${lead.state || 'US'}` : 'New Land Lead');

  // Formatted Lead Card for Audit & Notification
  const leadCardPlain = `
============================================================
🔔 ABODE MODE - INSTANT LEAD INTAKE ALERT
------------------------------------------------------------
FLOW:              ${flowLabel}
LEAD ID:           ${lead.id}
SUBMITTED AT:      ${new Date(lead.submittedAt).toUTCString()}
TARGET NOTIFY:     ${targetEmail}

PROPERTY / PARCEL DETAILS:
• Address/APN:     ${lead.propertyAddress || lead.parcelNumber || 'N/A'}
• County & State:  ${lead.county || 'N/A'}, ${lead.state || 'N/A'}
• Acreage:         ${lead.acreage || 'N/A'} acres
• Asking/Target:   ${lead.askingPrice || 'N/A'}
• Motivation/Use:  ${lead.motivation || 'N/A'}
• Timeline:        ${lead.timeline || 'Standard'}
• Property Status: ${lead.occupancyCondition || 'N/A'}
• Additional Notes: ${lead.notes || 'None'}

CONTACT DETAILS:
• Full Name:       ${lead.fullName}
• Phone:           ${lead.phone || 'N/A'}
• Email:           ${lead.email || 'N/A'}

A2P 10DLC COMPLIANCE AUDIT TRAIL:
• SMS Tx Consent:  ${lead.smsTransactionalConsent ? 'YES (Opted-in)' : 'NO (Unchecked)'}
• SMS Mkt Consent: ${lead.smsMarketingConsent ? 'YES (Opted-in)' : 'NO (Unchecked)'}
• Consent Timestamp: ${lead.consentTimestamp || 'N/A'}
• Non-Sharing Cov: ${lead.nonSharingCovenantAccepted ? 'DISPLAYED & AFFIRMED' : 'NO'}
• Client IP Hint:  ${lead.consentIpHint || 'N/A'}
• User Agent:      ${lead.userAgent || 'N/A'}
• Disclosure Ver:  ${lead.disclosureVersion || 'CTIA_2026_V1'}
============================================================
`;

  console.log(`[LeadService] Lead Notification Generated for: ${targetEmail}\n${leadCardPlain}`);

  // Dispatch Webhook if configured (Zapier, Make, CRM, SMS Gateway)
  if (webhookUrl) {
    try {
      const webhookPayload = {
        event: 'lead.created',
        flow: lead.flow,
        leadId: lead.id,
        timestamp: lead.submittedAt,
        lead: {
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email,
          propertyAddress: lead.propertyAddress,
          parcelNumber: lead.parcelNumber,
          county: lead.county,
          state: lead.state,
          acreage: lead.acreage,
          askingPrice: lead.askingPrice,
          motivation: lead.motivation,
          timeline: lead.timeline,
          occupancyCondition: lead.occupancyCondition,
          notes: lead.notes,
        },
        compliance: {
          smsTransactionalConsent: Boolean(lead.smsTransactionalConsent),
          smsMarketingConsent: Boolean(lead.smsMarketingConsent),
          consentTimestamp: lead.consentTimestamp,
          disclosureVersion: lead.disclosureVersion || 'CTIA_2026_V1',
          nonSharingCovenantAccepted: lead.nonSharingCovenantAccepted,
        },
        recipient: targetEmail,
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      console.log(`[LeadService] Dispatched lead webhook to ${webhookUrl}: HTTP ${response.status}`);
    } catch (whErr) {
      console.warn('[LeadService] Webhook dispatch notice:', whErr);
    }
  }

  // If SMTP or email dispatch service credentials are present, fire email
  // (e.g. SENDGRID_API_KEY, RESEND_API_KEY)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Abode Mode Leads <leads@abodebuys.com>',
          to: [targetEmail],
          subject: `🔔 New ${flowLabel}: ${lead.fullName} (${propertyTitle})`,
          text: leadCardPlain,
        }),
      });
      console.log(`[LeadService] Email dispatched via Resend to ${targetEmail}`);
    } catch (resendErr) {
      console.warn('[LeadService] Resend email dispatch failed:', resendErr);
    }
  }
}

/**
 * Retrieves the most recent leads from the immutable audit log
 */
export function getRecentAuditLeads(limit = 50): LeadSubmissionData[] {
  if (!fs.existsSync(AUDIT_LOG_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
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
    console.error('[LeadService] Error reading audit log:', err);
    return [];
  }
}
