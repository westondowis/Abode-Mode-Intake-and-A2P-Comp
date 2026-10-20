import { Lead, SellLead, BuyLead } from '../types';

export interface GoogleTaskResult {
  id: string;
  title: string;
  notes?: string;
  webViewLink?: string;
}

export interface GoogleContactResult {
  resourceName: string;
  etag?: string;
  displayName?: string;
}

export interface SyncLeadResult {
  taskResult?: GoogleTaskResult | null;
  contactResult?: GoogleContactResult | null;
  taskError?: string | null;
  contactError?: string | null;
}

/**
 * Creates a Google Task to review the submitted lead form
 * Includes a summary of information and direct link to the filled-out form
 */
export async function createLeadReviewTask(
  lead: Lead,
  accessToken: string,
  appBaseUrl?: string
): Promise<GoogleTaskResult> {
  const isSell = lead.type === 'sell';
  const baseUrl = appBaseUrl || window.location.origin;
  const reviewUrl = `${baseUrl}/#review-${lead.id}`;

  let title = '';
  let notes = '';

  if (isSell) {
    const s = lead as SellLead;
    title = `Review Seller Submission: ${s.sellerName} (${s.county || 'Land'}, ${s.state || 'US'})`;
    notes = [
      `📋 ABODE MODE - NEW SELLER INQUIRY`,
      `Lead ID: ${s.id}`,
      `Date: ${new Date(s.createdAt).toLocaleString()}`,
      `----------------------------------------`,
      `PROPERTY DETAILS:`,
      `• Address/APN: ${s.address || 'N/A'} (APN: ${s.parcelNumber || 'Pending'})`,
      `• County & State: ${s.county || 'N/A'}, ${s.state || 'N/A'}`,
      `• Estimated Acreage: ${s.acreage || 'N/A'} acres`,
      `• Zoning / Access: ${s.zoningType || 'N/A'} | Access: ${s.roadAccess || 'N/A'}`,
      `• Asking/Expectation: ${s.askingPriceExpectation || 'Make me an offer'}`,
      `• Timeline: ${s.sellingTimeline || 'Standard'}`,
      `----------------------------------------`,
      `SELLER CONTACT:`,
      `• Name: ${s.sellerName}`,
      `• Phone: ${s.sellerPhone}`,
      `• Email: ${s.sellerEmail}`,
      `• Preferred Contact: ${s.preferredContactMethod}`,
      `----------------------------------------`,
      `🔗 DIRECT LINK TO FILLED OUT FORM:`,
      `${reviewUrl}`,
    ].join('\n');
  } else {
    const b = lead as BuyLead;
    title = `Review Buyer Criteria: ${b.buyerName} (${b.targetStates.join(', ') || 'Anywhere'})`;
    notes = [
      `📋 ABODE MODE - NEW BUYER CRITERIA`,
      `Lead ID: ${b.id}`,
      `Date: ${new Date(b.createdAt).toLocaleString()}`,
      `----------------------------------------`,
      `BUYING PREFERENCES:`,
      `• Target Areas: ${b.targetStates.join(', ') || 'Nationwide'} (${b.targetCounties || 'Any county'})`,
      `• Acreage Range: ${b.minAcreage || '0'} to ${b.maxAcreage || 'Any'} acres`,
      `• Budget: ${b.budgetRange || 'Open'}`,
      `• Desired Use: ${b.plannedUse || 'General Land'}`,
      `• Must-Haves: ${b.mustHaveFeatures.length > 0 ? b.mustHaveFeatures.join(', ') : 'Flexible'}`,
      `• Purchasing Timeline: ${b.purchasingTimeline || 'Exploring'}`,
      `----------------------------------------`,
      `BUYER CONTACT:`,
      `• Name: ${b.buyerName}`,
      `• Phone: ${b.buyerPhone}`,
      `• Email: ${b.buyerEmail}`,
      `• Preferred Contact: ${b.preferredContactMethod}`,
      `----------------------------------------`,
      `🔗 DIRECT LINK TO FILLED OUT FORM:`,
      `${reviewUrl}`,
    ].join('\n');
  }

  // Calculate default due date: 2 business days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 2);
  const dueRFC3339 = dueDate.toISOString();

  const response = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      notes,
      due: dueRFC3339,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Google Tasks API returned HTTP ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      message = errJson.error?.message || message;
    } catch {
      // use default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    id: data.id,
    title: data.title,
    notes: data.notes,
    webViewLink: data.webViewLink,
  };
}

/**
 * Creates a Google Contact in People API for the lead
 */
export async function createLeadContact(
  lead: Lead,
  accessToken: string,
  appBaseUrl?: string
): Promise<GoogleContactResult> {
  const isSell = lead.type === 'sell';
  const name = isSell ? (lead as SellLead).sellerName : (lead as BuyLead).buyerName;
  const email = isSell ? (lead as SellLead).sellerEmail : (lead as BuyLead).buyerEmail;
  const phone = isSell ? (lead as SellLead).sellerPhone : (lead as BuyLead).buyerPhone;
  const baseUrl = appBaseUrl || window.location.origin;
  const reviewUrl = `${baseUrl}/#review-${lead.id}`;

  const nameParts = name.trim().split(' ');
  const givenName = nameParts[0] || 'Lead';
  const familyName = nameParts.slice(1).join(' ') || '';

  const summary = isSell
    ? `Abode Mode Seller Lead - APN: ${(lead as SellLead).parcelNumber || 'TBD'} in ${(lead as SellLead).county || ''}, ${(lead as SellLead).state || ''} (${(lead as SellLead).acreage || ''}ac). Review: ${reviewUrl}`
    : `Abode Mode Buyer Lead - Looking for ${(lead as BuyLead).budgetRange} in ${(lead as BuyLead).targetStates.join(', ')}. Review: ${reviewUrl}`;

  const contactPayload: Record<string, unknown> = {
    names: [
      {
        givenName,
        familyName,
        unstructuredName: name,
      },
    ],
    emailAddresses: email
      ? [
          {
            value: email,
            type: 'work',
          },
        ]
      : [],
    phoneNumbers: phone
      ? [
          {
            value: phone,
            type: 'mobile',
          },
        ]
      : [],
    biographies: [
      {
        value: summary,
        contentType: 'TEXT_PLAIN',
      },
    ],
    userDefined: [
      {
        key: 'Source',
        value: 'Abode Mode Land Platform',
      },
      {
        key: 'LeadType',
        value: isSell ? 'Land Seller' : 'Land Buyer',
      },
      {
        key: 'LeadId',
        value: lead.id,
      },
    ],
  };

  const response = await fetch('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactPayload),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Google People API returned HTTP ${response.status}`;
    try {
      const errJson = JSON.parse(errText);
      message = errJson.error?.message || message;
    } catch {
      // use default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    resourceName: data.resourceName,
    etag: data.etag,
    displayName: name,
  };
}

/**
 * Convenience orchestrator to sync both Task and Contact when a form is submitted
 */
export async function syncLeadToGoogleWorkspace(
  lead: Lead,
  accessToken: string,
  appBaseUrl?: string
): Promise<SyncLeadResult> {
  const result: SyncLeadResult = {
    taskResult: null,
    contactResult: null,
    taskError: null,
    contactError: null,
  };

  try {
    result.taskResult = await createLeadReviewTask(lead, accessToken, appBaseUrl);
  } catch (err: unknown) {
    result.taskError = err instanceof Error ? err.message : 'Failed to create Google Task';
  }

  try {
    result.contactResult = await createLeadContact(lead, accessToken, appBaseUrl);
  } catch (err: unknown) {
    result.contactError = err instanceof Error ? err.message : 'Failed to create Google Contact';
  }

  return result;
}
