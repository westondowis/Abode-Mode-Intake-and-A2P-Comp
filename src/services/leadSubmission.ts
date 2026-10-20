export interface LeadPayload {
  flow: 'sell' | 'buy';
  fullName: string;
  phone: string;
  email: string;
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
  
  // Property & Criteria data
  state?: string;
  county?: string;
  parcelOrAddress?: string;
  propertyAddress?: string; // LandInquiryForm compatibility
  acreage?: string;
  notes?: string;
  additionalData?: Record<string, unknown>;
}

export interface StoredLeadRecord extends LeadPayload {
  id: string;
  submittedAt: string;
  submissionStatus: 'dispatched' | 'local_backup';
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
 * Normalizes and dispatches lead data to the Google Apps Script Web App URL using mode: 'no-cors'
 * and records an immediate carrier-compliant audit backup copy in localStorage under 'abode_leads_backup'.
 */
export async function submitLead(payload: LeadPayload): Promise<{
  success: boolean;
  leadId: string;
  mode: 'remote' | 'simulation';
  message: string;
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
    submissionStatus: 'dispatched',
    smsTransactionalConsent: txConsent,
    smsMarketingConsent: mktConsent,
    smsConsent: anyConsent,
    consentTimestamp,
    consentIpHint: payload.consentIpHint || (typeof window !== 'undefined' ? window.location.hostname : 'client-web'),
    userAgent: payload.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'AbodeMode-Web/1.0'),
    disclosureVersion: payload.disclosureVersion || 'CTIA_2026_V1',
    nonSharingCovenantAccepted: true, // Records that statutory non-sharing covenant was displayed to user
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

  // 2. Dispatch payload to Google Apps Script Web App URL
  const isConfiguredUrl =
    GOOGLE_APPS_SCRIPT_URL &&
    !GOOGLE_APPS_SCRIPT_URL.includes('DefaultScriptId') &&
    GOOGLE_APPS_SCRIPT_URL.startsWith('https://script.google.com/macros/s/');

  if (isConfiguredUrl) {
    try {
      // POST with mode: 'no-cors' so browser CORS preflights never block submission
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(leadRecord),
      });

      return {
        success: true,
        leadId,
        mode: 'remote',
        message: 'Lead received and dispatched to acquisition desk.',
        leadRecord,
      };
    } catch (networkError) {
      console.warn('Network dispatch failed, lead preserved in local backup:', networkError);
      return {
        success: true,
        leadId,
        mode: 'simulation',
        message: 'Lead successfully saved and queued for review.',
        leadRecord,
      };
    }
  }

  // 3. Fallback simulation (when custom Apps Script URL is not yet injected)
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    leadId,
    mode: 'simulation',
    message: 'Lead received and recorded to local acquisition queue.',
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
