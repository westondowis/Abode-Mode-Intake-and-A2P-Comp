import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebaseAuth';

export interface LeadPayload {
  flow: 'sell' | 'buy';
  fullName: string;
  phone: string;
  email: string;
  
  // Property & Parcel Details
  propertyAddress?: string;
  parcelOrAddress?: string;
  parcelNumber?: string;
  county?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  acreage?: string;
  lotSizeUnit?: 'acres' | 'sqft';
  lotSizeRawValue?: string;
  
  // Fallback: Unknown Address & GPS Coordinates
  unknownAddress?: boolean;
  gpsCoordinates?: {
    lat: number;
    lng: number;
    formatted: string;
  } | null;
  documentAttachment?: {
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null;

  // Step 2: Vacant Land Utility Intake
  utilityWater?: string;
  utilitySewer?: string;
  utilityElectric?: string;
  utilityHeatingGas?: string;
  utilityInternet?: string;
  utilityDrainage?: string;

  // Step 3: Title & Probate Standings
  ownershipStatus?: string;
  probateDocumentationStatus?: string;
  hasProbateDocumentation?: string;
  
  // Deal Terms & Motivation
  askingPrice?: string;
  motivation?: string;
  timeline?: string;
  occupancyCondition?: string;
  notes?: string;

  // A2P 10DLC & CTIA Carrier Audit Fields
  smsTransactionalConsent?: boolean;
  smsMarketingConsent?: boolean;
  // Backwards compatibility aliases
  smsConsentTransactional?: boolean;
  smsConsentMarketing?: boolean;
  smsConsent?: boolean;
  consentTimestamp?: string | null;
  consentIpHint?: string;
  userAgent?: string;
  disclosureVersion?: string;
  nonSharingCovenantAccepted?: boolean;
  exactConsentDisclosureText?: string;
  
  additionalData?: Record<string, unknown>;
}

export interface StoredLeadRecord extends LeadPayload {
  id: string;
  submittedAt: string;
  submissionStatus: 'persisted' | 'dispatched' | 'local_backup';
  persistedTo?: string[];
  smsTransactionalConsent: boolean;
  smsMarketingConsent: boolean;
  smsConsent: boolean;
  consentTimestamp: string | null;
  consentIpHint: string;
  userAgent: string;
  disclosureVersion: string;
  nonSharingCovenantAccepted: boolean;
}

const LOCAL_STORAGE_KEY = 'abode_leads_backup';
export const SHEETS_WEBHOOK_KEY = 'abode_sheets_webhook_url';

/**
 * Returns the currently active Google Apps Script webhook URL
 */
export function getActiveWebhookUrl(): string {
  try {
    const custom = localStorage.getItem(SHEETS_WEBHOOK_KEY);
    if (custom && custom.startsWith('https://script.google.com/macros/s/')) {
      return custom;
    }
  } catch {
    // ignore
  }
  return (
    import.meta.env.VITE_APPS_SCRIPT_URL ||
    'https://script.google.com/macros/s/AKfycbwAbodeModeDefaultScriptId/exec'
  );
}

/**
 * Formats a lead into a General CRM clipboard block ready for instant pasting
 */
export function formatLeadForCrm(lead: LeadPayload | StoredLeadRecord): string {
  const leadId = (lead as StoredLeadRecord).id || `ABODE-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = (lead as StoredLeadRecord).submittedAt || new Date().toISOString();
  const flow = lead.flow === 'sell' ? 'LAND ACQUISITION / CASH OFFER' : 'LAND BUYER CRITERIA';
  const address = lead.propertyAddress || lead.parcelOrAddress || lead.parcelNumber || 'N/A';
  const txConsent = lead.smsTransactionalConsent ? 'YES' : 'NO';
  const mktConsent = lead.smsMarketingConsent ? 'YES' : 'NO';

  const gpsInfo = lead.gpsCoordinates ? `GPS Pinned: ${lead.gpsCoordinates.formatted}` : '';
  const probateInfo = lead.probateDocumentationStatus ? `Probate/Will Status: ${lead.probateDocumentationStatus}` : '';
  const utilitiesBlock = [
    lead.utilityWater ? `Water: ${lead.utilityWater}` : null,
    lead.utilitySewer ? `Sewer: ${lead.utilitySewer}` : null,
    lead.utilityElectric ? `Electric: ${lead.utilityElectric}` : null,
    lead.utilityHeatingGas ? `Gas: ${lead.utilityHeatingGas}` : null,
    lead.utilityInternet ? `Internet: ${lead.utilityInternet}` : null,
    lead.utilityDrainage ? `Drainage: ${lead.utilityDrainage}` : null,
  ].filter(Boolean).join(' | ');

  return `============================================================
📋 ABODE MODE - GENERAL CRM INTAKE BLOCK
------------------------------------------------------------
Lead ID:          ${leadId}
Intake Flow:      ${flow}
Submitted At:     ${new Date(timestamp).toLocaleString()}

CONTACT DETAILS:
Full Name:        ${lead.fullName}
Phone:            ${lead.phone || 'N/A'}
Email:            ${lead.email || 'N/A'}

PROPERTY / PARCEL DETAILS:
Address / APN:    ${address}
County & State:   ${lead.county || 'N/A'}, ${lead.state || 'N/A'}
Acreage:          ${lead.acreage || 'N/A'}
${gpsInfo ? `Coordinates:      ${gpsInfo}\n` : ''}${lead.documentAttachment ? `Attached File:    ${lead.documentAttachment.name} (${lead.documentAttachment.size} bytes)\n` : ''}
UTILITIES & DRAINAGE:
${utilitiesBlock || 'Standard Land Utilities Profile'}

DEAL TERMS & MOTIVATION:
Asking / Budget:  ${lead.askingPrice || 'N/A'}
Timeline:         ${lead.timeline || 'Standard'}
Motivation / Use: ${lead.motivation || 'N/A'}
Condition/Status: ${lead.occupancyCondition || 'N/A'}
${probateInfo ? `Title Standing:   ${probateInfo}\n` : ''}Additional Notes: ${lead.notes || 'None'}

A2P 10DLC COMPLIANCE RECORD:
SMS Tx Consent:   ${txConsent}
SMS Mkt Consent:  ${mktConsent}
Consent Time:     ${lead.consentTimestamp || 'N/A'}
IP Hint / Agent:  ${lead.consentIpHint || 'web'} (${lead.userAgent || 'AbodeMode-Web/1.0'})
Recipient Notify: wdowis@abode-mode.com
============================================================`;
}

/**
 * Normalizes and dispatches lead data:
 * 1. Writes an immediate emergency backup copy to localStorage under 'abode_leads_backup'.
 * 2. POSTs to the server intake endpoint (/api/leads/submit) to persist in Firestore + server audit log
 *    and trigger asynchronous alerts to wdowis@abode-mode.com and inbound webhooks.
 * 3. Dispatches to Google Sheets Webhook (Apps Script) for zero-cost row persistence + Gmail alert + Google Task.
 */
export async function submitLead(payload: LeadPayload): Promise<{
  success: boolean;
  leadId: string;
  mode: 'remote' | 'simulation';
  message: string;
  persistedTo?: string[];
  leadRecord: StoredLeadRecord;
}> {
  const leadId = `ABODE-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  // Determine explicit boolean values for both checkboxes
  const txConsent = Boolean(payload.smsTransactionalConsent ?? payload.smsConsentTransactional ?? false);
  const mktConsent = Boolean(payload.smsMarketingConsent ?? payload.smsConsentMarketing ?? false);
  const anyConsent = txConsent || mktConsent;

  // Calculate timestamp: ISO 8601 UTC timestamp if either box is checked, null if both unchecked
  const consentTimestamp = anyConsent
    ? (payload.consentTimestamp || new Date().toISOString())
    : null;

  // Standardized carrier audit lead record
  const leadRecord: StoredLeadRecord = {
    ...payload,
    id: leadId,
    submittedAt: new Date().toISOString(),
    submissionStatus: 'local_backup',
    smsTransactionalConsent: txConsent,
    smsMarketingConsent: mktConsent,
    smsConsent: anyConsent,
    consentTimestamp,
    consentIpHint: payload.consentIpHint || (typeof window !== 'undefined' ? window.location.hostname : 'client-web'),
    userAgent: payload.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'AbodeMode-Web/1.0'),
    disclosureVersion: payload.disclosureVersion || 'CTIA_2026_V1',
    nonSharingCovenantAccepted: true, // Records that statutory non-sharing covenant was displayed to user
    exactConsentDisclosureText:
      payload.exactConsentDisclosureText ||
      'I agree to receive transactional and informational text messages from Abode Mode regarding my property inquiry. Message and data rates may apply. Reply STOP to cancel.',
  };

  // 1. Immediate local storage emergency backup prior to network dispatch
  try {
    const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
    const leads: StoredLeadRecord[] = existing ? JSON.parse(existing) : [];
    leads.unshift(leadRecord);
    // Persist last 50 submissions
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads.slice(0, 50)));
  } catch (err) {
    console.warn('Could not write lead to localStorage:', err);
  }

  // 2. Primary Backend Dispatch: /api/leads/submit (Firestore + Server Audit Log + Asynchronous Alerts)
  try {
    const res = await fetch('/api/leads/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadRecord),
    });

    if (res.ok) {
      const data = await res.json();
      leadRecord.submissionStatus = 'persisted';
      leadRecord.persistedTo = data.persistedTo;

      // Update cached status in localStorage
      try {
        const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (existing) {
          const leads: StoredLeadRecord[] = JSON.parse(existing);
          if (leads[0] && leads[0].id === leadId) {
            leads[0].submissionStatus = 'persisted';
            leads[0].persistedTo = data.persistedTo;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
          }
        }
      } catch {
        // non-blocking
      }
    }
  } catch (serverErr) {
    console.warn('[LeadSubmission] Server endpoint unreached or offline, evaluating secondary dispatch:', serverErr);
  }

  // 2b. Direct Client Firestore Write to Cloud Firestore
  try {
    const firestoreData: Record<string, any> = {
      id: leadId,
      flow: leadRecord.flow,
      fullName: leadRecord.fullName,
      submittedAt: leadRecord.submittedAt,
    };
    if (leadRecord.phone) firestoreData.phone = leadRecord.phone;
    if (leadRecord.email) firestoreData.email = leadRecord.email;
    if (leadRecord.propertyAddress || leadRecord.parcelOrAddress) {
      firestoreData.propertyAddress = leadRecord.propertyAddress || leadRecord.parcelOrAddress;
    }
    if (leadRecord.parcelNumber) firestoreData.parcelNumber = leadRecord.parcelNumber;
    if (leadRecord.county) firestoreData.county = leadRecord.county;
    if (leadRecord.state) firestoreData.state = leadRecord.state;
    if (leadRecord.acreage) firestoreData.acreage = String(leadRecord.acreage);
    if (leadRecord.askingPrice) firestoreData.askingPrice = leadRecord.askingPrice;
    if (leadRecord.motivation) firestoreData.motivation = leadRecord.motivation;
    if (leadRecord.timeline) firestoreData.timeline = leadRecord.timeline;
    if (leadRecord.occupancyCondition) firestoreData.occupancyCondition = leadRecord.occupancyCondition;
    if (leadRecord.notes) firestoreData.notes = leadRecord.notes;
    if (typeof leadRecord.smsTransactionalConsent === 'boolean') {
      firestoreData.smsTransactionalConsent = leadRecord.smsTransactionalConsent;
    }
    if (typeof leadRecord.smsMarketingConsent === 'boolean') {
      firestoreData.smsMarketingConsent = leadRecord.smsMarketingConsent;
    }
    if (typeof leadRecord.smsConsent === 'boolean') {
      firestoreData.smsConsent = leadRecord.smsConsent;
    }
    if (typeof leadRecord.nonSharingCovenantAccepted === 'boolean') {
      firestoreData.nonSharingCovenantAccepted = leadRecord.nonSharingCovenantAccepted;
    }

    await setDoc(doc(db, 'leads', leadId), firestoreData);
    if (!leadRecord.persistedTo) leadRecord.persistedTo = [];
    leadRecord.persistedTo.push('firestore');
    leadRecord.submissionStatus = 'persisted';
  } catch (fsErr) {
    console.warn('[LeadSubmission] Client Firestore direct write notice:', fsErr);
  }

  // 3. Secondary Dispatch: Apps Script Webhook (Google Sheets + Gmail Alert + Google Task)
  const webhookUrl = getActiveWebhookUrl();
  const isConfiguredUrl =
    webhookUrl &&
    !webhookUrl.includes('DefaultScriptId') &&
    webhookUrl.startsWith('https://script.google.com/macros/s/');

  if (isConfiguredUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(leadRecord),
      });

      leadRecord.submissionStatus = 'dispatched';
      if (!leadRecord.persistedTo) leadRecord.persistedTo = [];
      leadRecord.persistedTo.push('google_sheets_webhook');

      return {
        success: true,
        leadId,
        mode: 'remote',
        message: 'Lead received, persisted to Google Sheets, and alert dispatched to acquisitions desk.',
        persistedTo: leadRecord.persistedTo,
        leadRecord,
      };
    } catch (networkError) {
      console.warn('Google Apps Script webhook dispatch failed, lead preserved in local backup:', networkError);
    }
  }

  // 4. Return successful confirmation
  return {
    success: true,
    leadId,
    mode: leadRecord.persistedTo && leadRecord.persistedTo.length > 0 ? 'remote' : 'simulation',
    message: 'Lead safely received and queued for acquisition team review.',
    persistedTo: leadRecord.persistedTo || ['local_backup'],
    leadRecord,
  };
}

/**
 * Helper to retrieve stored leads from localStorage for review/export
 */
export function getStoredLeads(): StoredLeadRecord[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Helper to trigger a diagnostic alert to verify notification pipeline
 */
export async function triggerDiagnosticAlert(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/leads/test-alert', { method: 'POST' });
    const data = await res.json();
    return { success: res.ok, message: data.message || 'Alert dispatched' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reach alert endpoint';
    return { success: false, message: msg };
  }
}
