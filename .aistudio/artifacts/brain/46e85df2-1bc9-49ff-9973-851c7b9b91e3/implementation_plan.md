# Abode Mode: Lead Intake Automation, Email Workflow & Light/Dark Theme

A comprehensive architectural upgrade connecting public inbound seller and buyer submissions to a zero-cost Google Workspace pipeline (Google Sheets, Gmail alerts, Google Tasks CRM action items), correcting acquisition email routing with structured mailto intake, and introducing a default-light theme with an accessible top-bar toggle.

### User Review & Critical Decisions

> [!IMPORTANT]
> Based on your answers to the clarifying questions, this plan is tailored around the lowest-cost, zero-maintenance Google Workspace architecture:

- **Confirmed Decision 1 (Storage & Persistence)**: 100% free Google Sheets webhook via Google Apps Script (accompanied by local browser backup and server-side immutable audit logging), eliminating paid database hosting fees while giving you direct spreadsheet access on mobile and desktop.
- **Confirmed Decision 2 (Alerts & Task Generation)**: Direct Gmail dispatch to `wdowis@abode-mode.com` plus automated Google Task creation with a deep link to the email and a ready-to-copy CRM dossier block.
- **Confirmed Decision 3 (CRM Format)**: Universal General CRM structure with standardized key-value pairs formatted for instant copy-pasting into any CRM (Follow Up Boss, HubSpot, Lofty, or spreadsheets).
- **Confirmed Decision 4 (Theming)**: Light theme as the crisp, professional default with an easily reachable sun/moon toggle switch pinned in the top navigation bar, preserving dark obsidian styling when toggled.
- **Confirmed Decision 5 (Email Redirection)**: Standardized acquisition email to `wdowis@abode-mode.com` across all links and buttons, opening a pre-formatted email draft with subject *"I am interested in learning more."*, inquiry fields (name, property address, phone), and an explicit warning asterisk informing the sender that missing fields prevent contact.

---

### 1. Overview & Core Concept

- **What It Does**: Upgrades Abode Mode from an isolated, client-only prototype into an end-to-end automated land acquisition and buyer intake platform. When a landowner or land buyer submits an inquiry, the system simultaneously stores their record in an immutable audit ledger, mirrors it into Google Sheets, dispatches a rich notification email to `wdowis@abode-mode.com`, and provisions a Google Task titled *"Input Lead [Name] into CRM"* with direct links and structured notes. Additionally, visitors who prefer email can click any acquisition contact point to launch a pre-populated inquiry template.
- **Target Audience / Persona**:
  - *Landowners & Sellers*: Seeking quick cash offers or land valuation without technical friction.
  - *Land Buyers & Investors*: Inquiring about inventory, recreational parcels, or builder acreage.
  - *William Dowis (Acquisitions Desk)*: Manages inbound inquiries across Gmail, Google Tasks, and CRM from laptop or mobile with zero data re-entry friction.
- **Key Value**: Guarantees zero lost leads with zero recurring infrastructure costs, immediate notifications within seconds of submission, and seamless transition from inquiry to CRM.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Public Web Lead Submission**:
   - Visitor fills out seller intake (APN, address, acreage, condition, asking price, contact info, and CTIA-compliant SMS consent checkboxes) or buyer criteria.
   - Form validates phone/email format in real time and disables double-submission.
   - Upon clicking *"Submit Property Details"*, an instantaneous loading state displays while the submission simultaneously writes to the Google Sheets webhook and server endpoints.
   - Visitor receives an instant confirmation screen with their unique Lead Reference ID, while William simultaneously receives a Gmail notification and a Google Task.
2. **Direct Mailto Ingestion Flow**:
   - Visitor clicks the acquisition email or direct contact button.
   - Default email client opens immediately addressed to `wdowis@abode-mode.com`.
   - Subject is set to: `I am interested in learning more.`
   - Body contains:
     ```text
     name: 
     property address: 
     best phone number: 

     * WARNING: If the above fields are not completed before sending, our acquisition team will not be able to get in contact with you or evaluate your property.
     ```
3. **Theme Switcher Experience**:
   - App loads in **Light Mode** by default: crisp architectural porcelain background, deep forest/slate typography, and warm amber accents.
   - A single-click switch with smooth icon transition (Sun / Moon) in the top bar allows toggling between Light and Dark mode.
   - The user's selection is stored in `localStorage` (`abode_theme: 'light' | 'dark'`) and respects system preferences on first visit if preferred.

#### Visual Identity & Theme
- **Light Theme (Default)**:
  - Background Canvas: Crisp porcelain / off-white (`#F8FAFC` to `#FFFFFF`).
  - Card & Container Surfaces: Pure white (`#FFFFFF`) with subtle hairline borders (`border-slate-200`) and soft, natural shadows (`shadow-sm`).
  - Typography: Deep midnight slate (`#0F172A`) for display headings, balanced slate (`#334155`) for readable body text, and muted slate (`#64748B`) for metadata.
  - Accent Tones: Warm earth gold / amber (`#D97706` / `#B45309`) for primary calls-to-action and deep teal / evergreen (`#0D9488` / `#0F766E`) for secondary trust accents.
- **Dark Theme (Toggleable)**:
  - Background Canvas: Deep obsidian slate (`#061116` to `#0B1920`).
  - Card Surfaces: Deep charcoal teal (`#00171C`) with hairline cyan/slate borders (`#0A4251`).
  - Typography: Pale platinum (`#F1F5F9`) and cyan-tinted muted text (`#94A3B8`).
  - Accents: Radiant amber (`#F2C864`) and electric cyan (`#22D3EE`).
- **Typography & Hierarchy**:
  - Brand & Hero Headings: `Cinzel` / `Plus Jakarta Sans` for institutional authority.
  - Navigation & Body: Clean, modern sans (`Plus Jakarta Sans` / `DM Sans`), 15–16px body measure with relaxed leading (1.6).
  - Data, Timestamps & Identifiers: Tabular monospace (`tabular-nums font-mono`).

#### Component Styling & Layout
- Top navigation bar complies with the strict 3-zone contract: Brand Wordmark (Zone 1) — Navigation Links (Zone 2) — Action & Theme Switcher (Zone 3).
- Forms use single-elevation cards with clean label typography, floating helper cues, and clear error outlines.
- No pill-badge clutter, no mechanical code prefixes, and no pulsing fake telemetry.

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Google Sheets Apps Script Webhook vs. Paid Third-Party Form Backend
- **Chosen Approach**: Standalone Google Apps Script endpoint triggered via HTTPS POST, saving rows directly to a private Google Sheet owned by the admin account.
- **Why**: 100% free, runs within Google Workspace quota without server provisioning or monthly SaaS fees (saves $20–$50/mo on Typeform/Zapier), and gives instant collaborative spreadsheet views on Google Drive and mobile Sheets app.
- **Alternatives Considered**: 
  - *Zapier/Make*: Requires monthly subscriptions once lead volume scales.
  - *Firestore-only*: Works well, but viewing leads requires accessing the GCP / Firebase console rather than an intuitive spreadsheet.

#### Decision 2: Direct Gmail Alert + Google Tasks CRM Integration
- **Chosen Approach**: Two-pronged notification:
  1. Instant email dispatch with formatted lead card sent to `wdowis@abode-mode.com`.
  2. Automated Google Task created in the user's Google Tasks list with title `[New Lead] <Name> - <Address>`, containing deep link to Gmail search for that lead ID and a copy-paste ready CRM intake block.
- **Why**: Allows William to review inquiries in his email inbox and mark them off in his daily task list once entered into the CRM, preventing dropped balls.
- **Alternatives Considered**: 
  - *Calendar events*: Clutters the calendar schedule with tentative tasks instead of real appointments.

#### Decision 3: Standardizing Acquisition Mailto Template with Validation Warning
- **Chosen Approach**: Update all direct acquisition links (`mailto:wdowis@abode-mode.com?...`) to include prefilled property inquiry fields and a prominent asterisk warning.
- **Why**: Minimizes back-and-forth by ensuring that sellers reaching out via email provide property address, phone number, and name on their very first message.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

#### System Architecture & Lead Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Abode Mode Client                             │
│                                                                        │
│  ┌───────────────────────┐          ┌───────────────────────────────┐  │
│  │   IntakePipeline.tsx   │          │      Direct Mailto Action     │  │
│  │ (Seller / Buyer Form) │          │  (wdowis@abode-mode.com)      │  │
│  └──────────┬────────────┘          └───────────────┬───────────────┘  │
│             │                                       │                  │
│             ▼                                       ▼                  │
│  ┌─────────────────────────────────┐   ┌────────────────────────────┐  │
│  │   leadSubmission.ts (Service)   │   │ Pre-filled Email with:     │  │
│  │  - Real-time Field Validation   │   │ - Name, Address, Phone     │  │
│  │  - CTIA / A2P 10DLC Timestamp   │   │ - Asterisk Omission Notice │  │
│  │  - LocalStorage Backup Mirror   │   └────────────────────────────┘  │
│  └──────────┬──────────────────────┘                                   │
└─────────────┼──────────────────────────────────────────────────────────┘
              │
              ├──► [POST /api/leads/submit] ──► Server Process:
              │     │                           - Appends to immutable leads_audit.jsonl
              │     │                           - Writes to Firestore collection 'leads'
              │     │                           - Dispatches email alert to wdowis@abode-mode.com
              │     │                           - Dispatches webhook (if configured)
              │     │
              └──► [Google Sheets Webhook]  ──► Google Apps Script:
                    (No-cost HTTP POST)         - Appends row to Lead Tracker Sheet
                                                - Creates Google Task: "Input [Lead] into CRM"
                                                  with CRM clipboard block & Gmail link
```

#### Data Model: Inbound Lead Record

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier (e.g., `ABODE-K92X-4912`) |
| `submittedAt` | `ISO 8601` | Submission timestamp |
| `flow` | `'sell' \| 'buy'` | Intake category |
| `fullName` | `string` | Seller or buyer name |
| `phone` | `string` | Direct contact phone |
| `email` | `string` | Contact email |
| `propertyAddress` | `string` | Street address, APN, or parcel location |
| `county` / `state` | `string` | Location details |
| `acreage` | `string` | Land size in acres |
| `askingPrice` | `string` | Desired cash offer or buyer budget |
| `motivation` | `string` | Reason for selling or buyer intended use |
| `timeline` | `string` | Target closing timeline (e.g. 14 days) |
| `occupancyCondition`| `string` | Title/ownership status |
| `notes` | `string` | Additional property highlights |
| `smsTransactionalConsent` | `boolean` | Explicit A2P 10DLC opt-in for transactional texts |
| `smsMarketingConsent` | `boolean` | Explicit opt-in for marketing texts |
| `consentTimestamp` | `ISO 8601` | Exact audit timestamp when consent box was checked |
| `exactConsentDisclosureText` | `string` | Verbatim disclosure text agreed to |

#### CRM Clipboard Block Structure (Stored in Google Task Notes)
```text
--- ABODE MODE INBOUND LEAD DOSSIER ---
Lead ID:         ABODE-L82F-1029
Source:          Abode Mode Public Ingestion (abode-mode.com)
Submitted:       2026-10-21 17:45 UTC

CONTACT:
Name:            John Doe
Phone:           (720) 555-0199
Email:           johndoe@example.com

PROPERTY:
Address / APN:   1400 Mountain Vista Trail, Costilla County, CO
Parcel Number:   APN-703-12-880
County & State:  Costilla County, CO
Acreage:         5.2 Acres
Asking Price:    $18,500 Cash
Motivation:      Inherited property, lives out of state, desires fast cash close
Timeline:        Immediate (< 30 days)
Condition:       Vacant, clear title, property taxes up to date

ACTION REQUIRED:
[ ] 1. Copy above details into CRM (Follow Up Boss / HubSpot / Lofty)
[ ] 2. Perform GIS / county parcel lookup
[ ] 3. Generate initial valuation offer range
[ ] 4. Call seller back within 2 business hours
```

#### Interactive Component & State Mapping
1. **Theme State (`ThemeContext.tsx` or `App.tsx`)**:
   - `theme`: `'light' | 'dark'` (initialized from `localStorage.getItem('abode_theme') || 'light'`).
   - `toggleTheme`: Switches root class `dark` on `document.documentElement` and persists to storage.
   - Header contains a compact, accessible toggle button with `aria-label="Toggle light and dark theme"`.
2. **Intake Form State (`LandInquiryForm.tsx` & `IntakePipeline.tsx`)**:
   - Submits to `submitLead(payload)`.
   - Manages `isSubmitting`, `submitError`, and `submissionResult` states cleanly.
   - When submitted, returns immediate UI feedback with reference number and automated copy-to-clipboard functionality.
3. **Acquisition Mailto Buttons (`Header.tsx`, `Footer.tsx`, `AboutUs.tsx`, `LegalModal.tsx`)**:
   - Updated link targets: `mailto:wdowis@abode-mode.com?subject=I%20am%20interested%20in%20learning%20more.&body=name%3A%0Aproperty%20address%3A%0Abest%20phone%20number%3A%0A%0A*%20WARNING%3A%20If%20the%20above%20fields%20are%20not%20completed%20before%20sending%2C%20our%20acquisition%20team%20cannot%20get%20in%20contact%20with%20you.`
4. **Google Sheets + Google Tasks Integration Script (`googleAppsScript.js`)**:
   - Bundled in repository as a ready-to-deploy script template for the user with 1-click deployment instructions.
   - Includes Google Apps Script code that hooks the sheet row insertion to `Tasks.Tasks.insert()` and `GmailApp.sendEmail()`.
