# Architecture Overhaul & Security Lockdown: Abode Mode Land Intake Pipeline

An end-to-end architectural overhaul and security lockdown of the Abode Mode land acquisition pipeline (`src/components/IntakePipeline.tsx`, `src/components/Header.tsx`, `ParcelPinDropModal.tsx`, `server.ts`, and associated lead services). This update addresses critical UI validation and security boundaries, standardizes direct contact actions, isolates public lead confirmation from internal admin tools, and deploys the complete 4-step seller intake pipeline.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> This revised plan incorporates all requirements from your specification, partitioned into two unified phases:
>
> **Part 1: Critical UI, Validation & Security Fixes**
> - **Step 4 Strict Validation**: Full Name, Phone Number, and Email Address are all mandatory before submission. The SMS A2P compliance checkboxes remain 100% optional and default unchecked.
> - **Header Pre-populated Quick Actions**: Dedicated click-to-contact links for Phone (`tel:7206490734`), SMS Text (`sms:7206490734?body=...`), and Email (`mailto:wdowis@abode-mode.com?subject=...`) with pre-populated inquiry templates.
> - **Theme Switcher Mobile & Desktop Fix**: Touch-action and pointer-event safe toggle on `<html>` root with persistent `localStorage` synchronization.
> - **Strict Frontend UI Separation**: Complete elimination of admin-facing badges, Drive authentication modals, and raw backend views on public form completion. Visitors only see a clean, reassuring "Thank You" confirmation screen.
> - **Silent Server-Side Notification Logging**: Robust server-side error logging for `ACQUISITION_NOTIFICATION_EMAIL`, `LEAD_WEBHOOK_URL`, and `RESEND_API_KEY` without exposing internal error stacks to the public client.
>
> **Part 2: Intake Pipeline Architecture Overhaul**
> - **Step 1**: Google Maps Places address autocomplete + "Unknown Address" toggle with document drag-and-drop upload & `ParcelPinDropModal.tsx` (6-decimal coordinate capture) + Acres vs. Sq Ft unit conversion.
> - **Step 2**: 6 dedicated dropdown sections for Vacant Land Utilities (Water, Sewer, Electric, Heating/Gas, Internet, Drainage) with exact industry-standard options.
> - **Step 3**: Enriched unique features guidance + conditional Probate/Trust title inquiry + Asking Price completely removed.
> - **Step 4**: Animated spotlight hero card for `ASKING PRICE:` with currency formatting, followed by required contact details and CTIA/A2P compliance disclosures.

---

### 1. Overview & System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Abode Mode Client App                           │
│                                                                        │
│  ┌───────────────────────┐          ┌───────────────────────────────┐  │
│  │   Header Contact Bar  │          │   ParcelPinDropModal (NEW)    │  │
│  │   - Phone: tel:       │          │   - Interactive Map Pin-Drop  │  │
│  │   - SMS: sms:?body=   │          │   - 6-decimal Lat/Lng output  │  │
│  │   - Email: mailto:    │          └───────────────┬───────────────┘  │
│  │   - Robust Theme Sw.  │                          │                  │
│  └──────────┬────────────┘                          ▼                  │
│             │                       ┌───────────────────────────────┐  │
│             │                       │      IntakePipeline.tsx       │  │
│             │                       │  Step 1: Places Search, Doc   │  │
│             │                       │          Upload, Acre/SqFt    │  │
│             │                       │  Step 2: 6 Utility Dropdowns  │  │
│             │                       │  Step 3: Notes & Probate Info │  │
│             │                       │  Step 4: Asking Price Hero    │  │
│             │                       │          + Strict Contact Val │  │
│             │                       └───────────────┬───────────────┘  │
│             │                                       │                  │
│             ▼                                       ▼                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Public Submission Result Screen: Pure "Thank You" Confirmation   │  │
│  │ (No Admin Badges, No Drive Auth Popups, No Data Inspection Views)│  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ├──► [POST /api/leads/submit]
                                      │         │
                                      │         ├──► Immutable Local Audit Log
                                      │         ├──► Firestore Document Storage
                                      │         ├──► Asynchronous Resend/SMTP Email
                                      │         └──► Inbound Webhook Dispatch
                                      │              (With server-side error logs)
                                      ▼
                        [Google Drive Diligence Vault]
                        (Automated file upload on submit)
```

---

### 2. User Experience & Visual Design

#### Header & Contact Actions
- **Click-to-Contact Bar**:
  - **Phone Icon & Label**: `tel:7206490734`
  - **SMS Text Icon & Label**: `sms:7206490734?body=Hello%20I%20am%20interested%20in%20selling%20my%20plot%20of%20land%3A%0A%0AName%3A%0AAddress%2FParcel%20%23%3A%0ANotes%20about%20property%3A`
  - **Email Icon & Label**: `mailto:wdowis@abode-mode.com?subject=Land%20Sale%20Inquiry&body=Hello%20I%20am%20interested%20in%20selling%20my%20plot%20of%20land%3A%0A%0AName%3A%0AAddress%2FParcel%20%23%3A%0ANotes%20about%20property%3A`
- **Theme Switcher**:
  - Accessible on desktop and mobile (`onTouchEnd` and `onClick` handlers with `touch-action: manipulation`).
  - Ensures clean synchronous class manipulation on `document.documentElement` (`light` vs. `dark`) with zero delay or touch bounce.

#### Intake Pipeline: Step-by-Step UI

##### Step 1: Parcel Identity, Location & Lot Sizing
1. **Google Places Search**:
   - High-contrast search input with magnifying glass icon and instant predictive address suggestions.
   - Selecting a suggestion automatically populates: Street Address, City, County, State, and Zip Code.
2. **"I do not know the physical address" Toggle**:
   - Prominent checkbox styled cleanly below the search bar.
   - When checked, collapses street address inputs and immediately reveals two intuitive fallback options:
     - **Option A (Document Drag & Drop)**: Dropzone for deed PDFs, property tax payment receipts, parcel surveys, or plats. Includes file type validation, size indicator, real-time preview thumbnail/icon, and remove option. Staged for automatic sync to Google Drive diligence vault.
     - **Option B (Pin-Drop Interactive Map)**: Distinct button launching `ParcelPinDropModal.tsx`. Displays an interactive map view allowing the user to zoom into their land and click to place a target pin. Extracts and locks coordinates to 6 decimal places (e.g. `37.284912, -105.419204`).
3. **Lot Size Unit Selector**:
   - Segmented dropdown: **Acres** vs. **Square Feet**.
   - Direct numerical input. If Square Feet is selected (e.g. `43,560`), an inline dynamic helper immediately displays: `Equivalent: 1.00 Acre` (`value / 43560`).

##### Step 2: Vacant Land Utility Intake
Structured into 6 clean, accessible select dropdowns with explicit option descriptions:
1. **Access to Water**:
   - City / County Water at the Street
   - City / County Water Nearby (Extension Required)
   - Existing Private Well on Site
   - Private Well Needed
   - Unknown
2. **Sewer & Wastewater**:
   - City / County Sewer at the Street
   - City / County Sewer Nearby (Extension Required)
   - Existing Septic System on Site
   - Septic System Needed (Passed Perc Test)
   - Septic System Needed (No Perc Test on Record)
   - Unknown
3. **Electric Service**:
   - Power at the Property Line
   - Power Nearby (Poles Required)
   - Existing Electric Meter / Service Drop on Site
   - Off-Grid Only
   - Unknown
4. **Heating & Gas**:
   - Natural Gas at the Street
   - Propane Required (Bulk Tank)
   - All-Electric
   - Unknown
5. **Internet & Telecommunications**:
   - Cable / Fiber at the Street
   - DSL / Telephone Wire Only
   - Wireless / Satellite Only
   - Unknown
6. **Surface Drainage & Stormwater**:
   - Dry Lot with Roadside Drainage
   - Low-Lying / Seasonal Standing Water
   - Mapped Floodplain or Wetland Present
   - Unknown

##### Step 3: Parcel Notes & Title Standings
1. **Standout Parcel Notes**:
   - Textarea with guided placeholder:
     *"Highlight unique features (e.g., year-round creek, river running through property, mountain views, mature timber, backing to National Forest / BLM land, established trail access, perimeter fencing, cleared building pad)..."*
2. **Ownership & Conditional Probate Inquiry**:
   - Retains ownership type selector (`Sole Owner`, `Joint / Tenants in Common`, `Inherited`, `Probate`, `Held in Trust`, `Tax Lien / Delinquent`, `Other`).
   - If `Inherited`, `Probate`, or `Held in Trust` is chosen, an inquiry card smoothly expands:
     - Prompt: *"Do you have probated documentation or verified will information entitling you the rightful owner?"*
     - Radio choices:
       - *Yes, probate completed & documentation on file*
       - *In probate proceedings currently*
       - *Will / trust documents available but not probated*
       - *No formal probate opened yet*
       - *Other / Custom details (reveals text note)*
3. **Asking Price Removed**:
   - Completely excised from Step 3.

##### Step 4: Asking Price Spotlight & Submission
1. **Hero Spotlight Card**:
   - Positioned at the very top of Step 4.
   - Styled with a subtle radiant gold border, pulsing glow animation, and high-visibility typography:
     - Header: **`ASKING PRICE:`**
     - Large formatted currency input (`$`) with thousands comma separation.
     - Subtitle: *"What cash price would you be thrilled to accept to close quickly?"*
2. **Strict Contact Validation**:
   - **Full Name**: Required.
   - **Phone Number**: Required (`type="tel"`).
   - **Email Address**: Required (`type="email"`).
   - Clear, friendly inline error alerts if any of these three fields are missing when submitting.
3. **A2P 10DLC SMS Disclosures**:
   - Preserved exactly as required: Two separate, unbundled, **unchecked by default**, and **optional** checkboxes for transactional and promotional texts.
   - Submission proceeds smoothly whether the checkboxes are checked or left unchecked.
4. **Public "Thank You" Screen**:
   - When submitted, the form transitions to an elegant, client-facing confirmation:
     - Confirmation checkmark and client name.
     - Unique Lead Reference ID.
     - Clear expectation message: *"Our acquisitions desk is reviewing county records and GIS data. We will reach out to you within 24 business hours."*
     - Direct button to submit another parcel or contact the desk.
     - **Strictly No Admin Tools**: No "Drive Vault" buttons, no "Sheets Sync" buttons, and no raw CRM debug payloads on this public page. (Admin tools remain securely available via dedicated admin entry points).

---

### 3. Technical Implementation & Data Strategy

#### Component Responsibilities
- `src/components/Header.tsx`:
  - Updated contact links with pre-populated phone, SMS, and mailto hrefs.
  - Multi-platform theme switcher with touch optimization.
- `src/components/ParcelPinDropModal.tsx` *(New Component)*:
  - Full-screen modal with map viewport, pin cursor, search/center tools, and precise coordinate readout (`latitude.toFixed(6)`, `longitude.toFixed(6)`).
  - Confirms selection and passes coordinates back to parent form.
- `src/components/IntakePipeline.tsx`:
  - 4-step pipeline implementation incorporating Google Places search, "Unknown Address" fallbacks, acreage unit conversions, 6-section utility dropdowns, conditional probate inquiry, Step 4 Asking Price hero card, strict Phone/Email validation, and clean public confirmation screen.
- `src/services/leadSubmission.ts`:
  - Typed payload extensions for utilities (`utilityWater`, `utilitySewer`, etc.), probate status, uploaded file metadata, and GPS coordinates.
- `server.ts` & `server/leadService.ts`:
  - Robust server-side logging for `ACQUISITION_NOTIFICATION_EMAIL`, `LEAD_WEBHOOK_URL`, and `RESEND_API_KEY`.
  - Non-blocking asynchronous notifications with comprehensive `try/catch` error telemetry logged to server console.

---

### 4. Verification Plan

1. **Build & Lint Verification**:
   - Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
2. **Header Action Verification**:
   - Test Phone link (`tel:7206490734`).
   - Test SMS link with pre-populated body.
   - Test Email link with subject and body template.
   - Test Theme Switcher on mobile touch emulation and desktop clicks.
3. **Pipeline Verification**:
   - **Step 1**: Test address autocomplete suggestion and auto-population; test "I do not know address" toggle with file upload preview and `ParcelPinDropModal` coordinate capture; test Acres vs. Sq Ft conversion.
   - **Step 2**: Verify all 6 utility dropdowns render the exact options and descriptions.
   - **Step 3**: Verify unique features placeholder; verify conditional probate question triggers only on Inherited/Probate/Trust; verify Asking Price is absent.
   - **Step 4**: Verify animated Asking Price spotlight card; test submission without Phone or Email to ensure validation triggers; test submission with Phone + Email and unchecked SMS box to verify submission succeeds.
   - **Confirmation**: Verify the public confirmation screen is 100% clean of admin widgets.
4. **Backend Notification Verification**:
   - Verify server log output for lead persistence, audit file append, and email/webhook dispatch.
