# Abode Mode - Commercial Real Estate Platform & Intake Engine

A high-trust, commercial real estate acquisition and investor platform for **Abode Mode** (ABODE-MODE LLC), providing zero-login land intake pipelines ("Sell Land" & "Buy Land"), direct Google Apps Script / Google Sheets synchronization with `no-cors` mode, one-click sharing, and an isolated A2P 10DLC carrier-compliant Privacy Policy overlay.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following 3 mandatory technical adjustments have been incorporated into this revised plan:

1. **Web Form CORS & Dispatch (`src/services/leadSubmission.ts`)**:
   - Web submissions use `mode: 'no-cors'` via `fetch` to post the JSON string to the Google Apps Script Web App URL so browser CORS preflights never block submission.
   - Every submission automatically saves an immediate backup copy in `localStorage` (`abode_leads_backup`) to guarantee zero data loss.
2. **A2P 10DLC Consent Architecture**:
   - The two SMS checkboxes (**Marketing** and **Transactional / Order Updates**) are **UNCHECKED by default** and **STRICTLY OPTIONAL**. Form submission is never blocked if a seller or buyer chooses not to opt in to text messages, ensuring full compliance with carrier non-conditional consent standards.
   - The exact statutory non-sharing disclaimer is rendered directly below the phone input field:
     *"No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances."*
3. **Endpoint Security**:
   - The Google Apps Script Web App URL is loaded securely from an environment variable (`import.meta.env.VITE_APPS_SCRIPT_URL`) or internal configuration constant (`DEFAULT_APPS_SCRIPT_URL`). It is never exposed as an editable public input. If not configured, the app seamlessly defaults to a mock simulation with local storage recording.

---

### 1. Overview & Core Concept

- **What It Does**: Refactors the site into an institutional, consumer-facing commercial real estate landing page. Eliminates all developer audit matrices, verification checklists, and compliance ribbons from the main page.
- **Target Audience**: Residential property and vacant land owners in Colorado and Texas seeking as-is cash sales with zero commissions, as well as land buyers/investors submitting purchase criteria.
- **Key Value**: Zero authentication friction (no Google login popups or account creation), guaranteed carrier A2P 10DLC compliance running cleanly in the background, instant private Google Sheet row appending with email notifications, and swift one-click sharing.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Header & Hero*: Clean header with illustrated Broker mark, direct phone lines for Colorado ((719) 502-7119) and Texas ((817) 756-9550), nav anchors, and "Share Platform" button. Hero presents institutional value proposition with dual choice cards: **"I Want to Sell Land"** and **"I Want to Buy Land"**.
  2. *Interactive Intake Pipelines*:
     - **Flow A ("Sell Land")**: Step 1 (Parcel Location & APN/Acreage) &rarr; Step 2 (Characteristics: Access, Utilities, Topography) &rarr; Step 3 (Situation, Timeline, Target Cash Price) &rarr; Step 4 (Owner Contact, Phone with non-sharing disclaimer, and 2 optional unchecked A2P checkboxes).
     - **Flow B ("Buy Land")**: Step 1 (Target Geography) &rarr; Step 2 (Acreage & Intended Use) &rarr; Step 3 (Capital Terms & Budget) &rarr; Step 4 (Buyer Contact with non-sharing disclaimer and 2 optional unchecked A2P checkboxes).
  3. *Submission Confirmation*: Dispatches unauthenticated `no-cors` POST to Google Apps Script, records to `localStorage`, and presents an elegant confirmation card with reference ID, assigned desk, and next steps.
  4. *How It Works (3-Step Overview)*: 1. Parcel Analysis & Valuation &rarr; 2. Transparent Written Offer &rarr; 3. Closing & Wire Disbursement via licensed title company.
  5. *About Abode Mode*: High-trust corporate background on ABODE-MODE LLC and our direct principal acquisition criteria.
  6. *Dedicated Privacy Policy Overlay*: Opened via footer link, cookie banner, or form hyperlink as a full-screen clean overlay with an X button, containing all 8 carrier clauses with zero audit clutter.

- **Visual Identity & Theme**:
  - *Palette*: Night (`#00171C`) primary canvas, Field Teal (`#0A4251`) cards and navbar, Mist (`#88BBD8`) subtle accents and dividers, Warm Gold (`#F2C864`) primary action buttons.
  - *Typography*: Plus Jakarta Sans for UI/forms paired with Source Serif 4 for headlines.
  - *Brand Asset*: Official illustrated Broker handshake mark (`abode_mode_broker_1792084803928.jpg` / `abode_broker_1790971379949.jpg`) in header and footer.
  - *Zero-Pill Discipline*: Unboxed text with subtle typographic separators (`·`, `/`); no fake status tickers, code comments (`//`), or pulsing dots.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: `mode: 'no-cors'` for Apps Script Web App**
  - *Chosen Approach*: Standard browser `fetch` using `mode: 'no-cors'` and `Content-Type: 'text/plain'` with JSON stringified payload.
  - *Why*: Google Apps Script redirects (`302 Moved Temporarily`) from `script.google.com` to `script.googleusercontent.com` on POST, causing standard CORS preflight failures in browser SPAs. `no-cors` allows the submission to reach the Apps Script endpoint reliably.
- **Decision 2: Optional, Unchecked A2P 10DLC Checkboxes**
  - *Chosen Approach*: The two checkboxes (Marketing & Transactional) are independent, unchecked by default, and optional.
  - *Why*: The CTIA and TCR strictly prohibit making SMS consent a mandatory condition of inquiry or purchase. If unchecked, the user can still submit and receive follow-up via email or direct phone call.
- **Decision 3: Config Constant / Environment Variable for Endpoint**
  - *Chosen Approach*: Configured via `import.meta.env.VITE_APPS_SCRIPT_URL` with a fallback constant and automatic mock simulator if unconfigured.
  - *Why*: Prevents tampering and ensures clean out-of-the-box operation while allowing the owner to link their private script anytime.

---

### 4. Technical Architecture & Component Mapping

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Abode Mode Client App                          │
├──────────────────────┬───────────────────────┬────────────────────────┤
│     Header & Nav     │   Acquisitions Hero   │  One-Click Share Tool  │
│ (Broker Mark + Desks)│  (Dual Choice Cards)  │(navigator.share/toast) │
├──────────────────────┴───────────────────────┴────────────────────────┤
│                 Interactive Multi-Step Lead Intake                    │
│   ┌───────────────────────────────┐   ┌───────────────────────────┐   │
│   │ Flow A: "I Want to Sell Land" │   │Flow B: "I Want to Buy Land"│  │
│   │ • Location & APN              │   │ • Target Geography        │   │
│   │ • Access & Utilities          │   │ • Acreage & Use Type      │   │
│   │ • Situation & Target Price    │   │ • Capital & Budget        │   │
│   │ • Contact + 2 Optional Checks │   │ • Buyer Info + 2 Checks   │   │
│   └──────────────┬────────────────┘   └─────────────┬─────────────┘   │
│                  └──────────────────┬───────────────┘                 │
│                                     ▼                                 │
│                        Submission Orchestrator                        │
│            ┌────────────────────────┴────────────────────────┐        │
│            ▼                                                 ▼        │
│   localStorage Backup                          Google Apps Script     │
│   (Instant Offline Redundancy)                 URL (no-cors fetch)    │
└──────────────────────────────────────────────────────────────┬────────┘
                                                               │ (JSON)
                                                               ▼
                                                  ┌─────────────────────┐
                                                  │ Private Google Sheet│
                                                  │ + MailApp Email to  │
                                                  │ WDowis@Abode-Mode   │
                                                  └─────────────────────┘
```

#### Files to Create & Update:
1. `src/services/leadSubmission.ts`: Submission service supporting `mode: 'no-cors'` dispatch to `VITE_APPS_SCRIPT_URL`, `localStorage` backup logging, and mock fallback.
2. `src/components/Header.tsx`: Clean commercial header with Broker mark, wordmark, Colorado and Texas desk numbers, and "Share Platform" button.
3. `src/components/HeroSection.tsx`: Straightforward land acquisition hero with dual interactive choice cards ("I Want to Sell Land" & "I Want to Buy Land").
4. `src/components/IntakePipeline.tsx`: High-trust step-by-step intake forms for Sell and Buy flows with the two optional unchecked A2P checkboxes and carrier non-sharing notice.
5. `src/components/HowItWorks.tsx`: 3-step transparent overview for sellers (Analysis &rarr; Written Offer &rarr; Title Escrow Closing).
6. `src/components/AboutUs.tsx`: Professional corporate profile of ABODE-MODE LLC.
7. `src/components/PrivacyPolicyOverlay.tsx`: Isolated full-page overlay with X button rendering the full 8 carrier-mandated clauses.
8. `src/components/ShareModal.tsx`: Native Web Share API + clipboard fallback.
9. `src/components/CookieBanner.tsx`: Clean, unobtrusive bottom cookie notice.
10. `src/components/Footer.tsx`: Brand wordmark, Colorado & Texas desks, legal attribution, and Privacy/Terms links.
11. `src/App.tsx`: Unified single-page view orchestrating all components.
