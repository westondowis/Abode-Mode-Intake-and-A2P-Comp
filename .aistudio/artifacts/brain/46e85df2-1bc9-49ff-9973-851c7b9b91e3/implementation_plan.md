# A2P 10DLC & CTIA Compliant Land Intake Consent Architecture

Implement cellular carrier-grade (A2P 10DLC / CTIA / TCR) consent mechanisms across Abode Mode's Land Acquisition and Cash Offer intake pipelines. The update introduces dedicated, unchecked-by-default, optional SMS consent checkboxes with verbatim carrier disclosures, mandatory non-sharing covenants, live legal links, and audit-ready timestamped payload dispatching to the Google Apps Script webhook and local storage.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences and carrier compliance constraints govern this implementation:

- **Confirmed Decision 1 (Form Placement)**: Integrate the compliance architecture directly into the active inquiry pipeline for both Selling and Buying land flows (prior to final submission), featuring distinct optional checkboxes for transactional and marketing communications with the exact verbatim A2P/CTIA disclosure language.
- **Confirmed Decision 2 (Data Dispatch & Audit)**: Wire form submissions into `submitLead` (`src/services/leadSubmission.ts`) dispatching to the Google Apps Script Web App URL (`mode: 'no-cors'`), storing timestamped consent (`consentTimestamp`, `smsMarketingConsent`, `smsTransactionalConsent`, `consentIp`, `userAgent`), and persisting an immediate encrypted local backup.
- **Confirmed Decision 3 (Standalone Component)**: Package and export the user's `LandInquiryForm` component alongside the main pipeline so it can also be utilized as a dedicated express modal or standalone embed without regressions.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades all seller and buyer intake surfaces to achieve 100% compliance with AT&T, Verizon, T-Mobile, and CTIA carrier guidelines. Landowners submitting acreage details or parcel IDs can request evaluation and offers without being coerced into SMS subscriptions, while opting-in leads have their explicit consent timestamped for compliance audits.
- **Target Audience / Persona**: Landowners selling rural, residential, or commercial acreage nationwide; retail/institutional land buyers seeking property corridors; telecom carrier compliance auditors reviewing 10DLC registration campaign landing pages.
- **Key Value**: Guarantees zero campaign rejection by carrier compliance algorithms (The Campaign Registry / Twilio / Bandwidth / Sinch), preserves landowner trust through strict non-sharing data covenants, and guarantees uninterrupted lead delivery.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Seller or Buyer Step Progression**: The landowner enters property details (APN, address, acreage, condition) through Steps 1–3 in the high-contrast slate-and-gold interface.
2. **Step 4: Contact & Verification Review**:
   - The user enters their Full Legal Name, Email, and Mobile Phone Number.
   - Immediately below the phone field, a highlighted statutory banner displays the mandatory Carrier Data Privacy Covenant.
   - Directly beneath the covenant, two distinct, unbundled, unchecked checkboxes appear:
     - **Checkbox 1 (Informational / Valuation Updates)**: Optional consent for property valuation, offer review, and closing milestones.
     - **Checkbox 2 (Inventory & Cash Programs)**: Optional consent for promotional alerts and new land inventory.
   - Both checkboxes feature live clickable links to the **Privacy Policy** and **Terms of Service** modals.
   - The user can leave both unchecked and click **"Request Cash Offer"** / **"Submit Land Inquiry"** without hindrance.
3. **Audit Dispatch & Success State**:
   - On submission, the pipeline records the exact timestamp, consent state (`boolean`), client IP hint, and user agent.
   - A success dossier is displayed with confirmation details and instant Google Drive Vault archiving.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        STEP 4: CONTACT & VERIFICATION                  │
├────────────────────────────────────────────────────────────────────────┤
│  Full Legal Name: [ Johnathan Miller                                 ] │
│  Email Address:   [ john@example.com                                 ] │
│  Mobile Phone:    [ (720) 649-0734                                   ] │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🔒 CARRIER DATA PRIVACY COVENANT                                 │  │
│  │ "No mobile information will be shared with third parties or      │  │
│  │ affiliates for marketing or promotional purposes. All the above  │  │
│  │ categories exclude text messaging originator opt-in data and     │  │
│  │ consent; this information will not be shared with or sold to     │  │
│  │ any third parties under any circumstances."                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [ ] I agree to receive recurring informational and transactional    │
│      text messages from Abode Mode at the phone number provided...     │
│      Reply STOP to unsubscribe, HELP for help. View Privacy & Terms.   │
│                                                                        │
│  [ ] I agree to receive marketing updates on new inventory...          │
│                                                                        │
│  [  ← BACK  ]                                [ GET CASH OFFER → ]      │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Color Tokens**: Rich deep navy slate (`#00171C`), forest teal (`#0A4251`), soft amber/gold accents (`#F9C54B` / `#F2C864`), slate borders (`#D5DDE0`), and high-contrast dark text.
- **Typography & Layout**: Clean typography, bold mono labels (`font-mono text-xs font-bold uppercase`), unboxed metadata, and high-readability consent text ($12\text{px}$ text with $1.5$ line-height).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Separate Transactional & Marketing Consents**
  - *Chosen Approach*: Provide two dedicated checkboxes (one for informational valuation updates, one for marketing inventory) both defaulted to `false`.
  - *Why*: Carrier review boards strictly reject single "catch-all" checkboxes or forms where submitting an inquiry forces marketing subscription.
  - *Alternatives Considered*: Single combined checkbox. Rejected due to recent CTIA carrier audit failure rates.

- **Decision 2: Unbundled Legal Links vs Inline Agreement**
  - *Chosen Approach*: Legal terms (Privacy Policy and Terms of Service) are referenced as live clickable modal triggers rather than bundling acceptance of terms with SMS consent.
  - *Why*: A2P 10DLC prohibits bundling SMS opt-in with general Terms of Service agreements.

- **Decision 3: Fail-Safe Asynchronous Dispatching**
  - *Chosen Approach*: Send payload to Google Apps Script using `mode: 'no-cors'`, store instantaneous backup in `localStorage` (`abode_leads_backup`), and generate downloadable Drive dossiers.
  - *Why*: Ensures zero lost leads even if ad blockers or network CORS policies interfere with the Google script endpoint.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│             Land Inquiry / Intake Surfaces             │
│   • IntakePipeline.tsx (Step 4 Contact)               │
│   • LandInquiryForm.tsx (Dedicated Express Embed)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Consent Audit Normalizer                   │
│   • fullName, phone, propertyAddress / APN             │
│   • smsConsent: boolean (default false)                │
│   • consentTimestamp: ISO String or null               │
│   • legalDisclosureVerbatim: string                    │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌───────────────────────────┐
│ Google Apps Script      │ │ Browser Local Backup      │
│ Webhook (no-cors)       │ │ localStorage Key:         │
│ import.meta.env.        │ │ 'abode_leads_backup'      │
│ VITE_APPS_SCRIPT_URL    │ └───────────────────────────┘
└─────────────────────────┘
```

### State & Payload Specifications

```typescript
export interface A2P10DLCConsentData {
  smsConsent: boolean;
  smsMarketingConsent: boolean;
  smsTransactionalConsent: boolean;
  consentTimestamp: string | null;
  nonSharingCovenantAccepted: boolean;
  disclosureVersion: string;
}
```

---

## Verification Plan

### Automated Build Verification
1. Run `npm run lint` to ensure zero TypeScript errors or missing imports.
2. Run `compile_applet` to verify compilation.

### Compliance Manual Verification
1. Verify checkboxes load unchecked by default (`checked === false`).
2. Verify submitting the form with checkboxes left unchecked succeeds and submits without validation errors.
3. Verify links to "Privacy Policy" and "Terms of Service" open the respective modals.
4. Verify non-sharing disclosure verbatim text matches carrier requirements exactly.
