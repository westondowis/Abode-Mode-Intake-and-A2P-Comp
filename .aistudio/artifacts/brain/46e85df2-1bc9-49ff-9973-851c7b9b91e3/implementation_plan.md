# Google Sheets Integration: 40-Column Master Ledger & Dynamic Flow Routing (Revised)

An architectural update to `server/leadService.ts` to connect the Abode Mode intake pipeline to the new master Google Sheets ledger, route submissions dynamically between dedicated **Buyer Intake** and **Seller Intake** tabs, and map the complete 40-column payload matching the ledger's frozen headers.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> This revised plan incorporates your two latest adjustments:
> 1. **Boolean Guard for `hasProbateDocumentation` (Index [25])**:
>    Explicitly checks against `null` and `undefined` so that `false` is preserved as `"false"`:
>    ```ts
>    lead.hasProbateDocumentation !== undefined && lead.hasProbateDocumentation !== null ? String(lead.hasProbateDocumentation) : ''
>    ```
> 2. **Type-Safe Lead Logging**:
>    Avoids strict type compilation issues when logging the lead identifier:
>    ```ts
>    console.log(`[LeadService] Lead ${(lead as any).id || lead.fullName || 'submission'} successfully appended to ${targetRange} (HTTP ${response.status})`);
>    ```
> 3. **Preserved Ledger Directives**:
>    - Quoted range names: `lead.flow === 'buy' ? "'Buyer Intake'!A:AN" : "'Seller Intake'!A:AN"`
>    - Value input option: `valueInputOption: 'USER_ENTERED'`
>    - All 40 column mappings in strict ordinal sequence with empty string fallbacks for null/undefined values.

---

### 1. Overview & Data Flow

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                       Public & Client Intake Submissions                       │
│             (CashOfferForm.tsx, SellLandPage.tsx, IntakePipeline.tsx)          │
└───────────────────────────────────────┬────────────────────────────────────────┘
                                        │ POST /api/leads or /api/leads/submit
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────┐
│                       Express Server: server/leadService.ts                    │
│                                                                                │
│   ┌────────────────────────────────────────────────────────────────────────┐   │
│   │ 1. Immutable Audit Log (leads_audit.jsonl)                             │   │
│   │ 2. Cloud Firestore Document Persistence                                │   │
│   │ 3. Automated Underwriting Task Creation (24h business SLA)             │   │
│   │ 4. Asynchronous Alerts (Resend/SMTP Email + Zapier/Make Webhook)       │   │
│   └───────────────────────────────────┬────────────────────────────────────┘   │
│                                       │                                        │
│                                       ▼                                        │
│   ┌────────────────────────────────────────────────────────────────────────┐   │
│   │ 5. Google Sheets v4 Master Ledger Appender (appendLeadToSheet)         │   │
│   │    - Spreadsheet ID: 1QYduEY1P6OL6vOPUkEZCCOUB8jgSBn6xYmW4FaHIB0w     │   │
│   │    - Target Range:                                                     │   │
│   │        • 'buy'  ──► "'Buyer Intake'!A:AN"                              │   │
│   │        • 'sell' ──► "'Seller Intake'!A:AN"                             │   │
│   │    - valueInputOption: 'USER_ENTERED'                                  │   │
│   │    - 40 columns strictly in order [0] to [39]                          │   │
│   │    - Type-safe execution and logging                                   │   │
│   └────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Complete 40-Column Ledger Mapping Specification

The appended row will contain exactly 40 indexed values corresponding to spreadsheet columns `A` through `AN`:

| Col | Field Name | Index | Extraction & Formatting Logic |
|---|---|---|---|
| A | `flow` | 0 | `String(lead.flow \|\| 'sell')` |
| B | `fullName` | 1 | `String(lead.fullName \|\| '')` |
| C | `phone` | 2 | `String(lead.phone \|\| '')` |
| D | `email` | 3 | `String(lead.email \|\| '')` |
| E | `propertyAddress` | 4 | `String(lead.propertyAddress \|\| '')` |
| F | `parcelOrAddress` | 5 | `String(lead.parcelOrAddress \|\| lead.propertyAddress \|\| '')` |
| G | `parcelNumber` | 6 | `String(lead.parcelNumber \|\| '')` |
| H | `county` | 7 | `String(lead.county \|\| '')` |
| I | `state` | 8 | `String(lead.state \|\| '')` |
| J | `city` | 9 | `String(lead.city \|\| '')` |
| K | `zipCode` | 10 | `String(lead.zipCode \|\| '')` |
| L | `acreage` | 11 | `String(lead.acreage \|\| '')` |
| M | `lotSizeUnit` | 12 | `String(lead.lotSizeUnit \|\| '')` |
| N | `lotSizeRawValue` | 13 | `String(lead.lotSizeRawValue \|\| '')` |
| O | `unknownAddress` | 14 | `lead.unknownAddress !== undefined && lead.unknownAddress !== null ? String(lead.unknownAddress) : ""` |
| P | `gpsCoordinates` | 15 | `lead.gpsCoordinates && lead.gpsCoordinates.lat != null && lead.gpsCoordinates.lng != null ? `${lead.gpsCoordinates.lat}, ${lead.gpsCoordinates.lng}` : (lead.gpsCoordinates?.formatted \|\| "")` |
| Q | `documentAttachment` | 16 | `lead.documentAttachment ? (lead.documentAttachment.name \|\| lead.documentAttachment.fileName \|\| "") : ""` |
| R | `utilityWater` | 17 | `String(lead.utilityWater \|\| '')` |
| S | `utilitySewer` | 18 | `String(lead.utilitySewer \|\| '')` |
| T | `utilityElectric` | 19 | `String(lead.utilityElectric \|\| '')` |
| U | `utilityHeatingGas` | 20 | `String(lead.utilityHeatingGas \|\| '')` |
| V | `utilityInternet` | 21 | `String(lead.utilityInternet \|\| '')` |
| W | `utilityDrainage` | 22 | `String(lead.utilityDrainage \|\| '')` |
| X | `ownershipStatus` | 23 | `String(lead.ownershipStatus \|\| '')` |
| Y | `probateDocumentationStatus` | 24 | `String(lead.probateDocumentationStatus \|\| '')` |
| Z | `hasProbateDocumentation` | 25 | `lead.hasProbateDocumentation !== undefined && lead.hasProbateDocumentation !== null ? String(lead.hasProbateDocumentation) : ""` |
| AA | `askingPrice` | 26 | `String(lead.askingPrice \|\| '')` |
| AB | `motivation` | 27 | `String(lead.motivation \|\| '')` |
| AC | `timeline` | 28 | `String(lead.timeline \|\| '')` |
| AD | `occupancyCondition` | 29 | `String(lead.occupancyCondition \|\| '')` |
| AE | `notes` | 30 | `String(lead.notes \|\| '')` |
| AF | `smsTransactionalConsent` | 31 | `lead.smsTransactionalConsent !== undefined && lead.smsTransactionalConsent !== null ? String(lead.smsTransactionalConsent) : ""` |
| AG | `smsMarketingConsent` | 32 | `lead.smsMarketingConsent !== undefined && lead.smsMarketingConsent !== null ? String(lead.smsMarketingConsent) : ""` |
| AH | `consentTimestamp` | 33 | `String(lead.consentTimestamp \|\| '')` |
| AI | `consentIpHint` | 34 | `String(lead.consentIpHint \|\| '')` |
| AJ | `userAgent` | 35 | `String(lead.userAgent \|\| '')` |
| AK | `disclosureVersion` | 36 | `String(lead.disclosureVersion \|\| '')` |
| AL | `nonSharingCovenantAccepted` | 37 | `lead.nonSharingCovenantAccepted !== undefined && lead.nonSharingCovenantAccepted !== null ? String(lead.nonSharingCovenantAccepted) : ""` |
| AM | `exactConsentDisclosureText` | 38 | `String(lead.exactConsentDisclosureText \|\| '')` |
| AN | `additionalData` | 39 | `lead.additionalData ? JSON.stringify(lead.additionalData) : ""` |

---

### 3. Implementation Code Target (`server/leadService.ts`)

```ts
// Central Google Sheets Ledger Configuration
const GOOGLE_SHEETS_SPREADSHEET_ID = '1QYduEY1P6OL6vOPUkEZCCOUB8jgSBn6xYmW4FaHIB0w';

/**
 * Appends an incoming lead directly to the central Google Sheets master ledger.
 * Routes dynamically to 'Buyer Intake'!A:AN or 'Seller Intake'!A:AN with 40 mapped columns.
 */
export async function appendLeadToSheet(lead: LeadSubmissionData): Promise<boolean> {
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Target Range with quoted sheet names containing spaces
    const targetRange = lead.flow === 'buy' ? "'Buyer Intake'!A:AN" : "'Seller Intake'!A:AN";

    // Format GPS coordinates safely without "undefined, undefined"
    const gpsCoordValue =
      lead.gpsCoordinates && lead.gpsCoordinates.lat != null && lead.gpsCoordinates.lng != null
        ? `${lead.gpsCoordinates.lat}, ${lead.gpsCoordinates.lng}`
        : (lead.gpsCoordinates?.formatted || "");

    // Format Document Attachment safely
    const docAttachmentValue =
      lead.documentAttachment
        ? (lead.documentAttachment.name || lead.documentAttachment.fileName || "")
        : "";

    // 40 columns strictly in order
    const rowValues: string[] = [
      lead.flow ? String(lead.flow) : 'sell',                                                 // [0]  flow
      lead.fullName ? String(lead.fullName) : '',                                             // [1]  fullName
      lead.phone ? String(lead.phone) : '',                                                   // [2]  phone
      lead.email ? String(lead.email) : '',                                                   // [3]  email
      lead.propertyAddress ? String(lead.propertyAddress) : '',                               // [4]  propertyAddress
      lead.parcelOrAddress ? String(lead.parcelOrAddress) : (lead.propertyAddress || ''),     // [5]  parcelOrAddress
      lead.parcelNumber ? String(lead.parcelNumber) : '',                                     // [6]  parcelNumber
      lead.county ? String(lead.county) : '',                                                 // [7]  county
      lead.state ? String(lead.state) : '',                                                   // [8]  state
      lead.city ? String(lead.city) : '',                                                     // [9]  city
      lead.zipCode ? String(lead.zipCode) : '',                                               // [10] zipCode
      lead.acreage ? String(lead.acreage) : '',                                               // [11] acreage
      lead.lotSizeUnit ? String(lead.lotSizeUnit) : '',                                       // [12] lotSizeUnit
      lead.lotSizeRawValue ? String(lead.lotSizeRawValue) : '',                               // [13] lotSizeRawValue
      lead.unknownAddress !== undefined && lead.unknownAddress !== null ? String(lead.unknownAddress) : '', // [14] unknownAddress
      gpsCoordValue,                                                                          // [15] gpsCoordinates
      docAttachmentValue,                                                                     // [16] documentAttachment
      lead.utilityWater ? String(lead.utilityWater) : '',                                     // [17] utilityWater
      lead.utilitySewer ? String(lead.utilitySewer) : '',                                     // [18] utilitySewer
      lead.utilityElectric ? String(lead.utilityElectric) : '',                               // [19] utilityElectric
      lead.utilityHeatingGas ? String(lead.utilityHeatingGas) : '',                           // [20] utilityHeatingGas
      lead.utilityInternet ? String(lead.utilityInternet) : '',                               // [21] utilityInternet
      lead.utilityDrainage ? String(lead.utilityDrainage) : '',                               // [22] utilityDrainage
      lead.ownershipStatus ? String(lead.ownershipStatus) : '',                               // [23] ownershipStatus
      lead.probateDocumentationStatus ? String(lead.probateDocumentationStatus) : '',         // [24] probateDocumentationStatus
      lead.hasProbateDocumentation !== undefined && lead.hasProbateDocumentation !== null ? String(lead.hasProbateDocumentation) : '', // [25] hasProbateDocumentation
      lead.askingPrice ? String(lead.askingPrice) : '',                                       // [26] askingPrice
      lead.motivation ? String(lead.motivation) : '',                                         // [27] motivation
      lead.timeline ? String(lead.timeline) : '',                                             // [28] timeline
      lead.occupancyCondition ? String(lead.occupancyCondition) : '',                         // [29] occupancyCondition
      lead.notes ? String(lead.notes) : '',                                                   // [30] notes
      lead.smsTransactionalConsent !== undefined && lead.smsTransactionalConsent !== null ? String(lead.smsTransactionalConsent) : '', // [31] smsTransactionalConsent
      lead.smsMarketingConsent !== undefined && lead.smsMarketingConsent !== null ? String(lead.smsMarketingConsent) : '',             // [32] smsMarketingConsent
      lead.consentTimestamp ? String(lead.consentTimestamp) : '',                             // [33] consentTimestamp
      lead.consentIpHint ? String(lead.consentIpHint) : '',                                   // [34] consentIpHint
      lead.userAgent ? String(lead.userAgent) : '',                                           // [35] userAgent
      lead.disclosureVersion ? String(lead.disclosureVersion) : '',                           // [36] disclosureVersion
      lead.nonSharingCovenantAccepted !== undefined && lead.nonSharingCovenantAccepted !== null ? String(lead.nonSharingCovenantAccepted) : '', // [37] nonSharingCovenantAccepted
      lead.exactConsentDisclosureText ? String(lead.exactConsentDisclosureText) : '',         // [38] exactConsentDisclosureText
      lead.additionalData ? JSON.stringify(lead.additionalData) : '',                         // [39] additionalData
    ];

    // Sanitize any residual nulls or undefined values to empty string
    const sanitizedRowValues = rowValues.map((val) => (val === undefined || val === null ? '' : String(val)));

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: targetRange,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [sanitizedRowValues],
      },
    });

    console.log(`[LeadService] Lead ${(lead as any).id || lead.fullName || 'submission'} successfully appended to ${targetRange} (HTTP ${response.status})`);
    return true;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('[LeadService] Google Sheets append notice (non-blocking):', errorMsg);
    return false;
  }
}
```

---

### 4. Verification Plan

1. **Array Length & Alignment**:
   - Assert `sanitizedRowValues.length === 40` strictly matching columns `A` through `AN`.
2. **Type Checking & Linting**:
   - Run `lint_applet` (`tsc --noEmit`) to verify zero compile or type errors.
3. **Build Compilation**:
   - Run `compile_applet` to confirm successful production build.
