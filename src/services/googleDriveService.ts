import { Lead, SellLead, BuyLead } from '../types';

export interface DriveOwner {
  displayName?: string;
  emailAddress?: string;
  photoLink?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  owners?: DriveOwner[];
  trashed?: boolean;
}

export interface StorageQuota {
  limit?: string;
  usage: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface DriveAbout {
  user: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
  storageQuota?: StorageQuota;
}

export type DriveFilterCategory = 'all' | 'folders' | 'documents' | 'spreadsheets' | 'images' | 'deeds';

export interface ListFilesOptions {
  pageSize?: number;
  pageToken?: string;
  folderId?: string | null;
  searchTerm?: string;
  category?: DriveFilterCategory;
}

/**
 * Formats byte size into human readable string (KB, MB, GB)
 */
export function formatBytes(bytesStr?: string | number): string {
  if (!bytesStr) return '—';
  const bytes = typeof bytesStr === 'string' ? parseInt(bytesStr, 10) : bytesStr;
  if (isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Returns user-friendly category, label, and Tailwind color styling for a MIME type
 */
export function getMimeDetails(mimeType: string) {
  if (mimeType === 'application/vnd.google-apps.folder') {
    return { label: 'Folder', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
  }
  if (mimeType === 'application/pdf') {
    return { label: 'PDF Diligence', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' };
  }
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text/')) {
    return { label: 'Document / Deed', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' };
  }
  if (mimeType.includes('spreadsheet') || mimeType.includes('sheet') || mimeType.includes('excel')) {
    return { label: 'Spreadsheet / Comp', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
  }
  if (mimeType.startsWith('image/')) {
    return { label: 'Plat / Aerial Photo', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' };
  }
  return { label: 'File', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
}

/**
 * Fetch Google Drive User & Storage Quota
 */
export async function fetchDriveAbout(accessToken: string): Promise<DriveAbout> {
  const url = 'https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress,photoLink),storageQuota';
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Drive API returned HTTP ${response.status}`;
    try {
      const errJson = JSON.parse(errorText);
      message = errJson.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * List or search files within Google Drive
 */
export async function listDriveFiles(
  accessToken: string,
  options: ListFilesOptions = {}
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const {
    pageSize = 30,
    pageToken,
    folderId = null,
    searchTerm = '',
    category = 'all',
  } = options;

  const queryParts: string[] = ['trashed = false'];

  if (folderId) {
    queryParts.push(`'${folderId}' in parents`);
  }

  if (searchTerm && searchTerm.trim()) {
    const escaped = searchTerm.trim().replace(/'/g, "\\'");
    queryParts.push(`(name contains '${escaped}' or fullText contains '${escaped}')`);
  }

  // Category filtering
  if (category === 'folders') {
    queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
  } else if (category === 'documents') {
    queryParts.push(
      "(mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType contains 'msword' or mimeType contains 'officedocument.wordprocessingml')"
    );
  } else if (category === 'spreadsheets') {
    queryParts.push(
      "(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType contains 'spreadsheet' or mimeType contains 'excel')"
    );
  } else if (category === 'images') {
    queryParts.push("mimeType contains 'image/'");
  } else if (category === 'deeds') {
    queryParts.push(
      "(name contains 'deed' or name contains 'Deed' or name contains 'plat' or name contains 'title' or name contains 'survey' or name contains 'contract' or name contains 'APN')"
    );
  }

  const q = queryParts.join(' and ');
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    fields: 'nextPageToken,files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,iconLink,thumbnailLink,parents,owners,trashed)',
    orderBy: 'folder,modifiedTime desc',
    q,
  });

  if (pageToken) {
    params.set('pageToken', pageToken);
  }

  const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Google Drive error (${response.status})`;
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
    files: data.files || [],
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Create a new folder in Google Drive (e.g. for a land parcel or diligence archive)
 */
export async function createDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string | null
): Promise<DriveFile> {
  const metadata: Record<string, unknown> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to create folder in Drive (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Upload a document, deed, survey map, or aerial photo into Google Drive
 */
export async function uploadDriveFile(
  accessToken: string,
  file: File,
  parentFolderId?: string | null
): Promise<DriveFile> {
  const metadata: Record<string, unknown> = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', file);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to upload file to Google Drive (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Save an Abode Mode lead inquiry dossier directly to Google Drive
 */
export async function saveLeadDossierToDrive(
  accessToken: string,
  lead: Lead,
  parentFolderId?: string | null
): Promise<DriveFile> {
  const isSell = lead.type === 'sell';
  let fileName = '';
  let dossierContent = '';

  const timestamp = new Date(lead.createdAt).toISOString().split('T')[0];

  if (isSell) {
    const s = lead as SellLead;
    const parcel = s.parcelNumber ? `APN_${s.parcelNumber}` : 'Unassigned_APN';
    fileName = `AbodeMode_SellerDossier_${s.state}_${s.county}_${parcel}_${timestamp}.txt`;
    
    dossierContent = `================================================================================
ABODE MODE (ABODE-MODE LLC) - ACQUISITIONS DOSSIER
================================================================================
Generated: ${new Date(lead.createdAt).toLocaleString()}
Lead Reference ID: ${s.id}
File Type: Seller Property Acquisition Intake & Preliminary Valuation

1. PROPERTY IDENTIFICATION
--------------------------------------------------------------------------------
Parcel Number (APN): ${s.parcelNumber || 'Pending County Verification'}
Street Address:      ${s.address || 'Vacant / Unaddressed Parcel'}
County & State:      ${s.county || 'N/A'}, ${s.state || 'N/A'}
Acreage:             ${s.acreage || 'N/A'} acres
Zoning Category:     ${s.zoningType || 'Unspecified'}
Road Access:         ${s.roadAccess || 'Unspecified'}
Topography:          ${Array.isArray(s.topography) ? s.topography.join(', ') : 'Standard'}
Ownership / Taxes:   ${s.ownershipType || 'Individual'} | Taxes: ${s.backTaxesOwed || 'Current'}

2. SELLER VALUATION & TIMELINE
--------------------------------------------------------------------------------
Asking / Expectation: ${s.askingPriceExpectation || 'Direct Cash Offer Requested'}
Selling Timeline:     ${s.sellingTimeline || 'Standard (7-14 Days)'}
Reason For Selling:   ${s.reasonForSelling || 'Direct Acquisition'}
Notes / Descriptions: ${s.additionalComments || s.notes || 'None provided'}

3. SELLER IDENTITY & TELEPHONY COMPLIANCE
--------------------------------------------------------------------------------
Seller Name:              ${s.sellerName}
Direct Phone:             ${s.sellerPhone}
Email:                    ${s.sellerEmail}
Preferred Contact:        ${s.preferredContactMethod}

4. INSTITUTIONAL ESCROW & CLOSING TERMS
--------------------------------------------------------------------------------
Closing Agent: First American Title / Fidelity National Title Escrow
Closing Timeline: 7 - 14 Business Days
Liabilities: Buyer covers 100% of customary closing costs, back taxes subject to title search.
Contact Desk: ABODE-MODE LLC | 720-649-0734 | kbowis@Abode-Mode.com
================================================================================
`;
  } else {
    const b = lead as BuyLead;
    fileName = `AbodeMode_BuyerCriteria_${b.buyerName.replace(/\s+/g, '_')}_${timestamp}.txt`;

    dossierContent = `================================================================================
ABODE MODE (ABODE-MODE LLC) - BUYER DISPOSITION CRITERIA
================================================================================
Generated: ${new Date(lead.createdAt).toLocaleString()}
Lead Reference ID: ${b.id}
File Type: Land Buyer Acquisition Criteria & Matching Profile

1. ACQUISITION PREFERENCES
--------------------------------------------------------------------------------
Target States:        ${b.targetStates.join(', ') || 'Nationwide'}
Target Counties:      ${b.targetCounties || 'Any'}
Acreage Requirement:  ${b.minAcreage || '0'} to ${b.maxAcreage || 'Unlimited'} acres
Budget Range:         ${b.budgetRange}
Purchasing Timeline:  ${b.purchasingTimeline}
Planned Land Use:     ${b.plannedUse}
Must-Have Features:   ${b.mustHaveFeatures && b.mustHaveFeatures.length > 0 ? b.mustHaveFeatures.join(', ') : 'Flexible'}
Funding Source:       ${b.fundingSource || 'Cash purchase with title insurance'}

2. BUYER CONTACT & COMPLIANCE
--------------------------------------------------------------------------------
Buyer Name:               ${b.buyerName}
Direct Phone:             ${b.buyerPhone}
Email:                    ${b.buyerEmail}
Preferred Contact:        ${b.preferredContactMethod}

3. DISPOSITION DESK COORDINATION
--------------------------------------------------------------------------------
ABODE-MODE LLC | 720-649-0734 | kbowis@Abode-Mode.com
Inventory: Nationwide Institutional Off-Market Land
================================================================================
`;
  }

  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType: 'text/plain',
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append(
    'file',
    new Blob([dossierContent], { type: 'text/plain;charset=utf-8' })
  );

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to create lead dossier in Drive (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Move file to Google Drive trash
 * IMPORTANT: Calling code must enforce user confirmation before invoking.
 */
export async function trashDriveFile(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: true }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let message = `Failed to move file to trash (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }
}

/**
 * Permanently delete file from Google Drive
 * IMPORTANT: Calling code must enforce user confirmation before invoking.
 */
export async function permanentlyDeleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errText = await response.text();
    let message = `Failed to delete file from Google Drive (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }
}
