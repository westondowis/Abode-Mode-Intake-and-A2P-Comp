/**
 * Google Docs Service for Abode Mode Land Platform
 * Handles creating purchase agreement documents and reading document titles/content.
 *
 * MANDATORY: Updating or creating documents requires user confirmation.
 */

export interface GoogleDocResult {
  documentId: string;
  title: string;
  revisionId?: string;
  documentUrl?: string;
}

export interface PurchaseAgreementParams {
  sellerName: string;
  propertyAddress: string;
  parcelNumber: string;
  county: string;
  state: string;
  acreage: string;
  offerAmount: string;
}

/**
 * Creates a formal Land Purchase Agreement Google Doc with deal terms
 */
export async function createPurchaseAgreementDoc(
  accessToken: string,
  params: PurchaseAgreementParams,
  userConfirmed: boolean
): Promise<GoogleDocResult> {
  if (!userConfirmed) {
    throw new Error(
      'MANDATORY CONFIRMATION: An explicit user confirmation dialog is required before creating Google Docs.'
    );
  }

  const title = `Land Purchase Agreement - APN ${params.parcelNumber || 'TBD'} (${params.county}, ${params.state})`;

  // 1. Create the blank document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      title,
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Google Docs Create API returned HTTP ${createRes.status}: ${errText}`);
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Insert formatted agreement text into the document
  const agreementContent = [
    `ABODE MODE LLC — OFFICIAL LAND PURCHASE AGREEMENT`,
    `--------------------------------------------------`,
    `Date: ${new Date().toLocaleDateString()}`,
    `Seller Name: ${params.sellerName}`,
    `Property Address / APN: ${params.propertyAddress || 'N/A'} (APN: ${params.parcelNumber || 'Pending'})`,
    `County & State: ${params.county}, ${params.state}`,
    `Acreage: ${params.acreage} Acres`,
    ``,
    `PURCHASE TERMS & CONDITIONS:`,
    `1. Purchase Price: ${params.offerAmount} (All-Cash, Net to Seller)`,
    `2. Closing Costs: Abode Mode LLC pays 100% of standard title and escrow closing fees.`,
    `3. Earnest Money Deposit: $1,000 deposited with title/escrow upon contract execution.`,
    `4. Closing Timeline: 14-21 days or on Seller's selected date.`,
    `5. Contingencies: Zero financing or appraisal contingencies.`,
    ``,
    `ACKNOWLEDGED AND AGREED:`,
    `Buyer: Abode Mode LLC`,
    `Seller: ${params.sellerName}`,
  ].join('\n');

  const batchUpdateRes = await fetch(
    `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              text: agreementContent,
              location: {
                index: 1,
              },
            },
          },
        ],
      }),
    }
  );

  if (!batchUpdateRes.ok) {
    console.warn('Document created but failed to populate text:', await batchUpdateRes.text());
  }

  return {
    documentId,
    title,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

/**
 * Reads document title and body text
 */
export async function getGoogleDocDetails(
  accessToken: string,
  documentId: string
): Promise<{ title: string; bodyText: string }> {
  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Docs Get API returned HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const title = data.title || 'Untitled Document';
  
  let bodyText = '';
  if (data.body?.content) {
    for (const element of data.body.content) {
      if (element.paragraph?.elements) {
        for (const pe of element.paragraph.elements) {
          if (pe.textRun?.content) {
            bodyText += pe.textRun.content;
          }
        }
      }
    }
  }

  return { title, bodyText };
}
