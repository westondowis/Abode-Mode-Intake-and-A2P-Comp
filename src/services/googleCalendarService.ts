import { Lead, SellLead, BuyLead } from '../types';

export interface CalendarEventResult {
  id: string;
  summary: string;
  description?: string;
  htmlLink?: string;
  meetLink?: string;
  start: string;
  end: string;
}

/**
 * Schedules a land closing, diligence review, or seller consultation call
 * on the user's primary Google Calendar with an integrated Google Meet conference link.
 */
export async function scheduleLandDiligenceEvent(
  lead: Lead,
  startDateTime: Date,
  durationMinutes = 30,
  accessToken: string,
  appBaseUrl?: string
): Promise<CalendarEventResult> {
  const isSell = lead.type === 'sell';
  const name = isSell ? (lead as SellLead).sellerName : (lead as BuyLead).buyerName;
  const phone = isSell ? (lead as SellLead).sellerPhone : (lead as BuyLead).buyerPhone;
  const email = isSell ? (lead as SellLead).sellerEmail : (lead as BuyLead).buyerEmail;
  const propertyTitle = isSell
    ? `${(lead as SellLead).county || 'Land'}, ${(lead as SellLead).state || 'US'} (APN: ${(lead as SellLead).parcelNumber || 'TBD'})`
    : `Buyer Criteria: ${(lead as BuyLead).targetStates.join(', ')}`;

  const baseUrl = appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://abodebuys.com');
  const reviewUrl = `${baseUrl}/#review-${lead.id}`;

  const summary = `Abode Mode: Diligence & Valuation Call with ${name} [${lead.id}]`;
  const description = [
    `📅 ABODE MODE - LAND CONSULTATION & DILIGENCE REVIEW`,
    `Lead ID: ${lead.id}`,
    `Client: ${name}`,
    `Contact: Phone ${phone || 'N/A'} | Email ${email || 'N/A'}`,
    `Property/Criteria: ${propertyTitle}`,
    `----------------------------------------------------`,
    `Notes: Initial consultation call regarding title, parcel review, or written cash offer terms.`,
    `Review Lead Dossier: ${reviewUrl}`,
  ].join('\n');

  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  const eventPayload = {
    summary,
    description,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Denver',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Denver',
    },
    attendees: email ? [{ email, displayName: name }] : [],
    conferenceData: {
      createRequest: {
        requestId: `meet-${lead.id}-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
  };

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    let message = `Calendar API error (HTTP ${response.status})`;
    try {
      const errJson = JSON.parse(errText);
      message = errJson.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  const data = await response.json();
  const meetLink =
    data.conferenceData?.entryPoints?.find((ep: { entryPointType: string }) => ep.entryPointType === 'video')?.uri ||
    data.hangoutLink;

  return {
    id: data.id,
    summary: data.summary,
    description: data.description,
    htmlLink: data.htmlLink,
    meetLink,
    start: data.start?.dateTime || data.start?.date,
    end: data.end?.dateTime || data.end?.date,
  };
}

/**
 * Lists upcoming diligence events from primary Google Calendar
 */
export async function listUpcomingDiligenceEvents(
  accessToken: string,
  maxResults = 10
): Promise<CalendarEventResult[]> {
  const timeMin = new Date().toISOString();
  const params = new URLSearchParams({
    timeMin,
    maxResults: String(maxResults),
    singleEvents: 'true',
    orderBy: 'startTime',
    q: 'Abode Mode',
  });

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    let message = `Calendar API error (${response.status})`;
    try {
      const err = JSON.parse(errText);
      message = err.error?.message || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary,
    description: item.description,
    htmlLink: item.htmlLink,
    meetLink:
      item.conferenceData?.entryPoints?.find((ep: { entryPointType: string }) => ep.entryPointType === 'video')?.uri ||
      item.hangoutLink,
    start: item.start?.dateTime || item.start?.date,
    end: item.end?.dateTime || item.end?.date,
  }));
}
