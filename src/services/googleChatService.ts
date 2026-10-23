/**
 * Google Chat Service for Abode Mode Land Platform
 * Handles listing spaces and sending messages to Google Chat.
 *
 * MANDATORY: Sending messages or modifying data requires explicit user confirmation.
 */

export interface GoogleChatSpace {
  name: string;
  displayName?: string;
  type?: string;
}

export interface SendChatMessageParams {
  spaceName: string;
  text: string;
}

/**
 * List spaces user is a member of
 */
export async function listChatSpaces(accessToken: string): Promise<GoogleChatSpace[]> {
  const response = await fetch('https://chat.googleapis.com/v1/spaces', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Chat API returned HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.spaces || [];
}

/**
 * Send a message to a Google Chat space.
 * MANDATORY: Requires userConfirmed === true before sending.
 */
export async function sendChatMessage(
  accessToken: string,
  params: SendChatMessageParams,
  userConfirmed: boolean
): Promise<{ name: string; text: string }> {
  if (!userConfirmed) {
    throw new Error(
      'MANDATORY CONFIRMATION: An explicit user confirmation dialog is required before dispatching messages via Google Chat.'
    );
  }

  if (!params.spaceName) {
    throw new Error('Google Chat space name is required.');
  }
  if (!params.text || !params.text.trim()) {
    throw new Error('Message text cannot be empty.');
  }

  const response = await fetch(`https://chat.googleapis.com/v1/${params.spaceName}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text: params.text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = `Google Chat Send API returned HTTP ${response.status}`;
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
