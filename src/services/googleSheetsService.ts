import { Lead, SellLead, BuyLead } from '../types';
import { StoredLeadRecord } from './leadSubmission';

export interface GoogleSpreadsheetSummary {
  id: string;
  name: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface SheetTabInfo {
  sheetId: number;
  title: string;
  rowCount?: number;
  columnCount?: number;
}

export interface SpreadsheetDetails {
  spreadsheetId: string;
  title: string;
  webViewLink?: string;
  sheets: SheetTabInfo[];
}

export interface SheetValuesResult {
  range: string;
  majorDimension: string;
  values: string[][];
}

const SELLER_HEADERS = [
  'Lead ID',
  'Date Received (UTC)',
  'Seller Name',
  'Mobile Phone',
  'Email',
  'APN / Parcel ID',
  'Street Address',
  'County',
  'State',
  'Acreage',
  'Asking / Expectation',
  'Zoning Type',
  'Road Access',
  'Timeline',
  'SMS Tx Consent',
  'SMS Mkt Consent',
  'Consent Timestamp',
  'Notes / Special Requests',
];

const BUYER_HEADERS = [
  'Lead ID',
  'Date Received (UTC)',
  'Buyer Name',
  'Mobile Phone',
  'Email',
  'Target States',
  'Target Counties',
  'Min Acreage',
  'Max Acreage',
  'Budget Range',
  'Planned Use',
  'Purchasing Timeline',
  'Funding Source',
  'SMS Tx Consent',
  'SMS Mkt Consent',
  'Consent Timestamp',
  'Special Requests / Notes',
];

/**
 * Searches and lists Google Sheets spreadsheets belonging to the authenticated user
 */
export async function listGoogleSpreadsheets(
  accessToken: string,
  pageSize = 25
): Promise<GoogleSpreadsheetSummary[]> {
  const query = "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false";
  const params = new URLSearchParams({
    q: query,
    pageSize: String(pageSize),
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,modifiedTime,webViewLink,iconLink)',
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Drive API error (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Fetches metadata and tab info for a specific Google Spreadsheet
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<SpreadsheetDetails> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,sheets(properties(sheetId,title,gridProperties))`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Google Sheets API error (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  const data = await response.json();
  const sheets: SheetTabInfo[] = (data.sheets || []).map((s: any) => ({
    sheetId: s.properties?.sheetId ?? 0,
    title: s.properties?.title || 'Sheet1',
    rowCount: s.properties?.gridProperties?.rowCount,
    columnCount: s.properties?.gridProperties?.columnCount,
  }));

  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    webViewLink: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets,
  };
}

/**
 * Reads a range of values from a Google Spreadsheet
 */
export async function readSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<SheetValuesResult> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to read sheet data (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    range: data.range || range,
    majorDimension: data.majorDimension || 'ROWS',
    values: data.values || [],
  };
}

/**
 * Creates an institutional Master Land Acquisitions & Dispositions spreadsheet
 * with styled headers, frozen top row, and separate tabs for Sellers and Buyers.
 */
export async function createMasterLandSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<SpreadsheetDetails> {
  const title = customTitle || `Abode Mode - Land Deal & Acquisitions Ledger (${new Date().getFullYear()})`;

  const createPayload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          sheetId: 0,
          title: 'Seller Leads & Inquiries',
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 500,
            columnCount: SELLER_HEADERS.length,
          },
        },
      },
      {
        properties: {
          sheetId: 1,
          title: 'Buyer Dispositions & Criteria',
          gridProperties: {
            frozenRowCount: 1,
            rowCount: 500,
            columnCount: BUYER_HEADERS.length,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to create Google Spreadsheet (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  const createdSpreadsheet = await response.json();
  const spreadsheetId = createdSpreadsheet.spreadsheetId;

  // Insert headers and apply styling via batchUpdate & values.append
  try {
    // 1. Write header rows
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Seller Leads & Inquiries!A1:${String.fromCharCode(64 + SELLER_HEADERS.length)}1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `Seller Leads & Inquiries!A1:${String.fromCharCode(64 + SELLER_HEADERS.length)}1`,
          majorDimension: 'ROWS',
          values: [SELLER_HEADERS],
        }),
      }
    );

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Buyer Dispositions & Criteria!A1:${String.fromCharCode(64 + BUYER_HEADERS.length)}1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `Buyer Dispositions & Criteria!A1:${String.fromCharCode(64 + BUYER_HEADERS.length)}1`,
          majorDimension: 'ROWS',
          values: [BUYER_HEADERS],
        }),
      }
    );

    // 2. Format Header Styling (Dark Slate Background #00171C, Gold Text #F9C54B, Bold)
    const styleRequests = [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.0, green: 0.09, blue: 0.11 }, // #00171C
              textFormat: {
                foregroundColor: { red: 0.98, green: 0.77, blue: 0.29 }, // #F9C54B
                bold: true,
                fontSize: 10,
              },
              horizontalAlignment: 'CENTER',
              wrapStrategy: 'WRAP',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 1,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.04, green: 0.26, blue: 0.32 }, // #0A4251
              textFormat: {
                foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                bold: true,
                fontSize: 10,
              },
              horizontalAlignment: 'CENTER',
              wrapStrategy: 'WRAP',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,wrapStrategy)',
        },
      },
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests: styleRequests }),
    });
  } catch (styleErr) {
    console.warn('Formatting spreadsheet headers encountered a non-fatal error:', styleErr);
  }

  return {
    spreadsheetId,
    title,
    webViewLink: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    sheets: [
      { sheetId: 0, title: 'Seller Leads & Inquiries' },
      { sheetId: 1, title: 'Buyer Dispositions & Criteria' },
    ],
  };
}

/**
 * Normalizes any lead format (Lead interface or StoredLeadRecord) into tabular columns
 */
export function formatLeadRow(lead: Lead | StoredLeadRecord, type: 'sell' | 'buy'): string[] {
  const isSell = type === 'sell';

  if (isSell) {
    const s = lead as any;
    const leadId = s.id || 'N/A';
    const dateStr = s.submittedAt || s.createdAt || new Date().toISOString();
    const name = s.fullName || s.sellerName || 'Anonymous Seller';
    const phone = s.phone || s.sellerPhone || 'N/A';
    const email = s.email || s.sellerEmail || 'N/A';
    const apn = s.parcelNumber || s.parcelOrAddress || 'Pending APN';
    const addr = s.address || s.propertyAddress || 'Vacant / Unaddressed Parcel';
    const county = s.county || 'N/A';
    const state = s.state || 'N/A';
    const acreage = s.acreage !== undefined ? String(s.acreage) : 'N/A';
    const price = s.askingPriceExpectation || 'Cash Offer Requested';
    const zoning = s.zoningType || 'Unspecified';
    const access = s.roadAccess || 'Unspecified';
    const timeline = s.sellingTimeline || 'Immediate';
    const smsTx = s.smsTransactionalConsent ? 'YES (Transactional)' : 'NO';
    const smsMkt = s.smsMarketingConsent ? 'YES (Marketing)' : 'NO';
    const consentTime = s.consentTimestamp || 'Not Consented';
    const notes = s.additionalComments || s.notes || '';

    return [
      leadId,
      dateStr,
      name,
      phone,
      email,
      apn,
      addr,
      county,
      state,
      acreage,
      price,
      zoning,
      access,
      timeline,
      smsTx,
      smsMkt,
      consentTime,
      notes,
    ];
  } else {
    const b = lead as any;
    const leadId = b.id || 'N/A';
    const dateStr = b.submittedAt || b.createdAt || new Date().toISOString();
    const name = b.fullName || b.buyerName || 'Anonymous Buyer';
    const phone = b.phone || b.buyerPhone || 'N/A';
    const email = b.email || b.buyerEmail || 'N/A';
    const states = Array.isArray(b.targetStates) ? b.targetStates.join(', ') : (b.state || 'Nationwide');
    const counties = b.targetCounties || b.county || 'Any';
    const minAcre = b.minAcreage !== undefined ? String(b.minAcreage) : '0';
    const maxAcre = b.maxAcreage !== undefined ? String(b.maxAcreage) : 'Any';
    const budget = b.budgetRange || 'Open';
    const use = b.plannedUse || 'Recreational / Investment';
    const timeline = b.purchasingTimeline || 'Exploring';
    const funding = b.fundingSource || 'Cash';
    const smsTx = b.smsTransactionalConsent ? 'YES (Transactional)' : 'NO';
    const smsMkt = b.smsMarketingConsent ? 'YES (Marketing)' : 'NO';
    const consentTime = b.consentTimestamp || 'Not Consented';
    const specialReq = b.specialRequests || b.notes || (Array.isArray(b.mustHaveFeatures) ? b.mustHaveFeatures.join('; ') : '');

    return [
      leadId,
      dateStr,
      name,
      phone,
      email,
      states,
      counties,
      minAcre,
      maxAcre,
      budget,
      use,
      timeline,
      funding,
      smsTx,
      smsMkt,
      consentTime,
      specialReq,
    ];
  }
}

/**
 * Appends a lead to the appropriate tab in a Google Spreadsheet
 */
export async function appendLeadToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  lead: Lead | StoredLeadRecord,
  targetTabName?: string
): Promise<{ updatedRange: string; rowCount: number }> {
  const isSell = (lead as any).type === 'sell' || (lead as any).flow === 'sell';
  const defaultTab = isSell ? 'Seller Leads & Inquiries' : 'Buyer Dispositions & Criteria';
  const tabName = targetTabName || defaultTab;
  const rowValues = formatLeadRow(lead, isSell ? 'sell' : 'buy');

  const range = `${tabName}!A:A`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [rowValues],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to append lead to Google Sheet (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  const data = await response.json();
  return {
    updatedRange: data.updates?.updatedRange || `${tabName}!A:Z`,
    rowCount: data.updates?.updatedRows || 1,
  };
}

/**
 * Syncs multiple leads to a designated Google Spreadsheet
 */
export async function syncLeadsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  leads: (Lead | StoredLeadRecord)[]
): Promise<{ syncedCount: number; errors: string[] }> {
  let syncedCount = 0;
  const errors: string[] = [];

  for (const lead of leads) {
    try {
      await appendLeadToSpreadsheet(accessToken, spreadsheetId, lead);
      syncedCount++;
    } catch (err: any) {
      errors.push(`Lead ${lead.id}: ${err.message || 'Sync failed'}`);
    }
  }

  return { syncedCount, errors };
}

/**
 * Clear a sheet range (Requires explicit user confirmation before caller invokes)
 */
export async function clearSheetRange(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to clear sheet range (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }
}
