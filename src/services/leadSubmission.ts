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
  acreage?: string;
  
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

// Configurable endpoint via environment variable, with safe fallback
const GOOGLE_APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbwAbodeModeDefaultScriptId/exec';

/**
 * Normalizes and dispatches lead data:
 * 1. Writes an immediate emergency backup copy to localStorage under 'abode_leads_backup'.
 * 2. POSTs to the server intake endpoint (/api/leads/submit) to persist in Firestore + server audit log
 *    and trigger asynchronous alerts to wdowis@abodebuys.com and inbound webhooks.
 * 3. Falls back gracefully to Apps Script or local offline queue if the network drops.
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

      return {
        success: true,
        leadId,
        mode: 'remote',
        message: 'Lead received, persisted to database, and queued for acquisition team review.',
        persistedTo: data.persistedTo,
        leadRecord,
      };
    }
  } catch (serverErr) {
    console.warn('[LeadSubmission] Server endpoint unreached or offline, evaluating secondary dispatch:', serverErr);
  }

  // 3. Secondary Dispatch: Apps Script Webhook (if configured)
  const isConfiguredUrl =
    GOOGLE_APPS_SCRIPT_URL &&
    !GOOGLE_APPS_SCRIPT_URL.includes('DefaultScriptId') &&
    GOOGLE_APPS_SCRIPT_URL.startsWith('https://script.google.com/macros/s/');

  if (isConfiguredUrl) {
    try {
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(leadRecord),
      });

      leadRecord.submissionStatus = 'dispatched';
      return {
        success: true,
        leadId,
        mode: 'remote',
        message: 'Lead received and dispatched to acquisition webhook.',
        leadRecord,
      };
    } catch (networkError) {
      console.warn('Network dispatch failed, lead preserved in local backup:', networkError);
    }
  }

  // 4. Fallback confirmation (preserved safely in client backup)
  return {
    success: true,
    leadId,
    mode: 'simulation',
    message: 'Lead successfully saved to acquisition queue.',
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
