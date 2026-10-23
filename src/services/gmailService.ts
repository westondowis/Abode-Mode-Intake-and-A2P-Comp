/**
 * Gmail Service for Abode Mode Land Platform
 * Handles client-side integration with Gmail API (read messages, compose, drafts, send).
 *
 * NOTE: Destructive or outgoing operations (sending email, modifying labels)
 * strictly require explicit user confirmation per Google Workspace skill guidelines.
 */

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: {
    size: number;
    data?: string;
    attachmentId?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  internalDate: string;
  labelIds: string[];
  isUnread: boolean;
  bodyText?: string;
  bodyHtml?: string;
}

export interface GmailUserProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  cc?: string;
  bcc?: string;
  inReplyTo?: string;
  references?: string;
  threadId?: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  category: 'Offer' | 'Diligence' | 'Closing' | 'Inquiry';
  subject: string;
  body: string;
}

/**
 * Standard templates tailored for land acquisitions and underwriting
 */
export const ACQUISITION_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'cash-offer',
    title: 'Formal Cash Offer & Terms',
    category: 'Offer',
    subject: 'Abode Mode Cash Offer for Your Parcel in [County], [State] (APN: [APN])',
    body: `Dear [Seller Name],

Thank you for providing the details regarding your land parcel in [County], [State]. 

Our underwriting team has reviewed the property attributes, zoning, access, and recent comparable sales. We are pleased to present you with a direct, all-cash offer:

---------------------------------------------------------
ACQUISITION OFFER SUMMARY
• Property APN / Address: [APN / Address]
• Estimated Acreage: [Acreage] Acres
• Proposed Purchase Price: $[Offer Amount] (Net to Seller)
• Earnest Money Deposit: $[EMD Amount] (Held with Title/Escrow)
• Due Diligence Period: 14 Business Days
• Closing Timeline: 10-21 Days or on Seller's Chosen Schedule
• Closing Costs: Abode Mode pays 100% of standard seller escrow and title closing fees
---------------------------------------------------------

With our cash purchase, there are zero realtor commissions, no appraisal contingencies, and no hidden fees. We handle all deed preparations and coordinate closing with a local reputable title company or mobile notary.

Please review this offer and let us know if these terms work for you. If you would like to proceed or discuss adjustments, reply directly to this email or call our desk at (720) 649-0734.

Sincerely,

William Dowis
Acquisitions Lead | Abode Mode LLC
Phone: (720) 649-0734
Email: wdowis@abode-mode.com
Web: https://abodebuys.com`,
  },
  {
    id: 'diligence-inquiry',
    title: 'Due Diligence & Title Verification',
    category: 'Diligence',
    subject: 'Property Due Diligence Verification - APN: [APN], [County] County',
    body: `Hello [Seller Name],

We are currently reviewing your parcel submission for APN [APN] in [County], [State]. 

To finalize our underwriting valuation, could you please provide or verify the following details when convenient?

1. Road Access: Is there dedicated county road frontage, a paved road, dirt easement, or is it unmaintained/off-grid?
2. Utilities: Can you confirm the status of electricity at the lot line, or if a well/septic was ever evaluated?
3. Title Status: Are there any back taxes, HOA/POA liens, or deed restrictions we should account for?
4. Documentation: Do you have a prior survey, deed copy, or recent property tax bill available to share?

You can reply directly to this email with any answers or attach any paperwork you have on file. We appreciate your assistance!

Best regards,

Acquisitions Team | Abode Mode LLC
Phone: (720) 649-0734
Email: wdowis@abode-mode.com`,
  },
  {
    id: 'closing-coordination',
    title: 'Closing Coordination & Escrow Setup',
    category: 'Closing',
    subject: 'Closing Coordination & Mobile Notary Details: [Property Address / APN]',
    body: `Dear [Seller Name],

Congratulations on moving forward with the sale of your land parcel in [County], [State]!

Our title & escrow partner has opened escrow for this transaction. Here is what to expect for closing:

1. Title Search: The escrow officer will pull the title commitment and verify clean legal conveyance.
2. Settlement Statement: You will receive an official settlement statement verifying that zero closing fees or commissions are deducted from your proceeds.
3. Mobile Notary: A licensed mobile notary can meet you at your home, office, or a local bank at a time convenient for you to notarize the deed transfer.
4. Payout: Funds will be sent directly to you via bank wire or title company cashier's check upon document verification.

If you have a preferred title company or special payout instructions, please let us know immediately.

Warm regards,

William Dowis | Abode Mode LLC
Direct: (720) 649-0734
Email: wdowis@abode-mode.com`,
  },
  {
    id: 'general-inquiry',
    title: 'Seller Inquiry & Introduction',
    category: 'Inquiry',
    subject: 'Inquiry Regarding Your Vacant Land Parcel in [County] County',
    body: `Hi [Seller Name],

My name is William Dowis with Abode Mode. We buy and invest in rural acreage and vacant land across [State].

We received your inquiry regarding your parcel in [County] County. We would love to learn more about the property to determine if it is a fit for our immediate cash acquisition program.

Are you available for a quick 5-minute call today or tomorrow? You can reach me directly at (720) 649-0734 or simply reply to this email with your ideal selling timeline and asking price range.

Looking forward to speaking with you!

Best regards,

William Dowis
Abode Mode LLC
(720) 649-0734
wdowis@abode-mode.com`,
  },
];

/**
 * Base64 URL Safe Encoder
 */
function toBase64Url(str: string): string {
  // UTF-8 friendly encoding for standard and non-ASCII characters
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes base64url encoded string from Gmail API response
 */
function fromBase64Url(base64Url: string): string {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (err) {
    console.warn('Failed to decode base64url string:', err);
    return '';
  }
}

/**
 * Builds RFC 2822 compliant MIME message string
 */
function buildMimeMessage(params: SendEmailParams, fromEmail?: string): string {
  const lines: string[] = [];

  if (fromEmail) {
    lines.push(`From: ${fromEmail}`);
  }
  lines.push(`To: ${params.to}`);

  if (params.cc) {
    lines.push(`Cc: ${params.cc}`);
  }
  if (params.bcc) {
    lines.push(`Bcc: ${params.bcc}`);
  }

  // RFC 2047 encoded subject to support special characters
  const subjectEncoded = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
  lines.push(`Subject: ${subjectEncoded}`);

  if (params.inReplyTo) {
    lines.push(`In-Reply-To: ${params.inReplyTo}`);
  }
  if (params.references) {
    lines.push(`References: ${params.references}`);
  }

  lines.push('MIME-Version: 1.0');
  lines.push(
    params.isHtml
      ? 'Content-Type: text/html; charset=UTF-8'
      : 'Content-Type: text/plain; charset=UTF-8'
  );
  lines.push('Content-Transfer-Encoding: 7bit');
  lines.push('');
  lines.push(params.body);

  return lines.join('\r\n');
}

/**
 * Extracts plain text and HTML bodies recursively from message payload parts
 */
function extractBodyFromPayload(payload?: GmailMessagePart): { text?: string; html?: string } {
  if (!payload) return {};

  let text: string | undefined;
  let html: string | undefined;

  const inspectPart = (part: GmailMessagePart) => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      text = fromBase64Url(part.body.data);
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      html = fromBase64Url(part.body.data);
    } else if (part.parts && part.parts.length > 0) {
      for (const subPart of part.parts) {
        inspectPart(subPart);
      }
    }
  };

  inspectPart(payload);
  return { text, html };
}

/**
 * Fetch authenticated user's Gmail profile
 */
export async function getGmailProfile(accessToken: string): Promise<GmailUserProfile> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail Profile API returned HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Lists messages matching optional search query or labels
 */
export async function listGmailMessages(
  accessToken: string,
  options: {
    maxResults?: number;
    pageToken?: string;
    q?: string;
    labelIds?: string[];
  } = {}
): Promise<{
  messages: GmailMessageSummary[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}> {
  const params = new URLSearchParams();
  params.set('maxResults', String(options.maxResults || 20));

  if (options.pageToken) {
    params.set('pageToken', options.pageToken);
  }
  if (options.q) {
    params.set('q', options.q);
  }
  if (options.labelIds && options.labelIds.length > 0) {
    options.labelIds.forEach((id) => params.append('labelIds', id));
  }

  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`;
  const response = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail List API returned HTTP ${response.status}: ${errorText}`);
  }

  const listData: {
    messages?: Array<{ id: string; threadId: string }>;
    nextPageToken?: string;
    resultSizeEstimate?: number;
  } = await response.json();

  if (!listData.messages || listData.messages.length === 0) {
    return {
      messages: [],
      nextPageToken: listData.nextPageToken,
      resultSizeEstimate: listData.resultSizeEstimate,
    };
  }

  // Fetch summaries for each message (concurrency controlled to 10 at a time)
  const summaries: GmailMessageSummary[] = [];
  const messageRefs = listData.messages.slice(0, options.maxResults || 20);

  // Fetch in batches of 5 to avoid browser network throttling
  const batchSize = 5;
  for (let i = 0; i < messageRefs.length; i += batchSize) {
    const batch = messageRefs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (msgRef) => {
        try {
          return await getGmailMessage(accessToken, msgRef.id);
        } catch (err) {
          console.warn(`Could not load details for message ${msgRef.id}:`, err);
          return null;
        }
      })
    );
    for (const res of batchResults) {
      if (res) summaries.push(res);
    }
  }

  return {
    messages: summaries,
    nextPageToken: listData.nextPageToken,
    resultSizeEstimate: listData.resultSizeEstimate,
  };
}

/**
 * Fetches single message details by ID
 */
export async function getGmailMessage(
  accessToken: string,
  messageId: string
): Promise<GmailMessageSummary> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(
    messageId
  )}?format=full`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail Message API returned HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const headers: GmailHeader[] = data.payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

  const subject = getHeader('Subject') || '(No Subject)';
  const from = getHeader('From') || 'Unknown Sender';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || new Date().toISOString();
  const labelIds: string[] = data.labelIds || [];
  const isUnread = labelIds.includes('UNREAD');

  const { text: bodyText, html: bodyHtml } = extractBodyFromPayload(data.payload);

  return {
    id: data.id,
    threadId: data.threadId,
    snippet: data.snippet || '',
    subject,
    from,
    to,
    date,
    internalDate: data.internalDate || '',
    labelIds,
    isUnread,
    bodyText: bodyText || data.snippet,
    bodyHtml,
  };
}

/**
 * Send an email through the user's Gmail account.
 * MANDATORY: Requires userConfirmed === true before firing the request.
 */
export async function sendGmailMessage(
  accessToken: string,
  params: SendEmailParams,
  userConfirmed: boolean,
  senderEmail?: string
): Promise<{ id: string; threadId: string; labelIds?: string[] }> {
  if (!userConfirmed) {
    throw new Error(
      'MANDATORY CONFIRMATION: An explicit user confirmation dialog is required before dispatching emails via Gmail.'
    );
  }

  if (!params.to || !params.to.trim()) {
    throw new Error('Recipient email address is required.');
  }

  if (!params.subject || !params.subject.trim()) {
    throw new Error('Email subject is required.');
  }

  const rawMime = buildMimeMessage(params, senderEmail);
  const rawBase64Url = toBase64Url(rawMime);

  const payload: { raw: string; threadId?: string } = {
    raw: rawBase64Url,
  };

  if (params.threadId) {
    payload.threadId = params.threadId;
  }

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Gmail Send API returned HTTP ${response.status}`;
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
 * Creates a draft in the user's Gmail account
 */
export async function createGmailDraft(
  accessToken: string,
  params: SendEmailParams,
  senderEmail?: string
): Promise<{ id: string; message: { id: string; threadId: string } }> {
  const rawMime = buildMimeMessage(params, senderEmail);
  const rawBase64Url = toBase64Url(rawMime);

  const payload = {
    message: {
      raw: rawBase64Url,
      threadId: params.threadId,
    },
  };

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Gmail Drafts API returned HTTP ${response.status}`;
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
 * Modifies labels on a message (e.g. Mark as Read or Unread)
 */
export async function modifyMessageLabels(
  accessToken: string,
  messageId: string,
  addLabelIds: string[] = [],
  removeLabelIds: string[] = []
): Promise<void> {
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(
      messageId
    )}/modify`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        addLabelIds,
        removeLabelIds,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail Modify API returned HTTP ${response.status}: ${errText}`);
  }
}
