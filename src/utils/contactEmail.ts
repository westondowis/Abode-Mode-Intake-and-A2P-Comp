/**
 * Centralized Acquisition Email & Mailto Redirection Configuration
 * Target: wdowis@abode-mode.com
 */

export const ACQUISITION_EMAIL = 'wdowis@abode-mode.com';
export const ACQUISITION_EMAIL_SUBJECT = 'I am interested in learning more.';

export const ACQUISITION_EMAIL_BODY = `name: 
property address: 
best phone number: 

* WARNING: If the above fields are not completed before sending, our acquisition team cannot get in contact with you or evaluate your property.`;

/**
 * Returns a fully encoded mailto URL with pre-filled subject and body form.
 */
export function getAcquisitionMailtoHref(customDetails?: {
  name?: string;
  address?: string;
  phone?: string;
}): string {
  let body = ACQUISITION_EMAIL_BODY;
  if (customDetails) {
    body = `name: ${customDetails.name || ''}
property address: ${customDetails.address || ''}
best phone number: ${customDetails.phone || ''}

* WARNING: If the above fields are not completed before sending, our acquisition team cannot get in contact with you or evaluate your property.`;
  }

  const encodedSubject = encodeURIComponent(ACQUISITION_EMAIL_SUBJECT);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${ACQUISITION_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
}

/**
 * Opens the user's default email client with the acquisition inquiry form pre-filled.
 */
export function openAcquisitionEmail(customDetails?: {
  name?: string;
  address?: string;
  phone?: string;
}): void {
  const href = getAcquisitionMailtoHref(customDetails);
  window.location.href = href;
}
