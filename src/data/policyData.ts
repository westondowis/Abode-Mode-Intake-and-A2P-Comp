export interface EntityDetails {
  legalName: string;
  dbaName: string;
  primaryPhone: string;
  primaryPhoneRaw: string;
  secondaryPhone: string;
  secondaryPhoneRaw: string;
  contactEmail: string;
  effectiveDate: string;
  headquarters: string;
  trademarkNotice: string;
  corridors: string[];
}

export const ENTITY_DETAILS: EntityDetails = {
  legalName: 'ABODE-MODE LLC',
  dbaName: 'Abode Mode',
  primaryPhone: '(720) 649-0734',
  primaryPhoneRaw: '7206490734',
  secondaryPhone: '(720) 649-0734',
  secondaryPhoneRaw: '7206490734',
  contactEmail: 'wdowis@abode-mode.com',
  effectiveDate: 'October 15, 2026',
  headquarters: 'Nationwide Land Acquisitions & Sales Desk',
  trademarkNotice: 'Abode Mode and the Broker are marks of ABODE-MODE LLC. All rights reserved.',
  corridors: [
    'Nationwide Land Acquisitions & Dispositions Across All 50 U.S. States',
  ],
};

export interface ComplianceCheckItem {
  id: string;
  requirement: string;
  standard: string;
  carrierNotice: string;
  sectionTarget: string;
  status: 'Compliant' | 'Verified';
}

export const COMPLIANCE_CHECKLIST: ComplianceCheckItem[] = [
  {
    id: 'req-1',
    requirement: 'Zero Third-Party Sharing',
    standard: 'CTIA & Tier-1 Carrier Rule',
    carrierNotice: 'Strict prohibition on selling, sharing, leasing, or renting mobile numbers and consumer data to any third parties or marketing affiliates.',
    sectionTarget: 'mobile-sms-privacy',
    status: 'Verified',
  },
  {
    id: 'req-2',
    requirement: 'Originator Consent Carve-Out',
    standard: 'A2P 10DLC Vetting Standard',
    carrierNotice: 'Mandatory non-negotiable clause explicitly excluding text messaging originator opt-in data from all third-party disclosure under any circumstances.',
    sectionTarget: 'mobile-sms-privacy',
    status: 'Verified',
  },
  {
    id: 'req-3',
    requirement: 'STOP Protocol Automation',
    standard: 'CTIA Section 5.1 & TCPA',
    carrierNotice: 'Immediate automated message termination upon receipt of STOP, CANCEL, QUIT, or UNSUBSCRIBE with confirmation receipt.',
    sectionTarget: 'consumer-rights-opt-out',
    status: 'Verified',
  },
  {
    id: 'req-4',
    requirement: 'HELP Protocol Disclosure',
    standard: 'CTIA Section 5.2',
    carrierNotice: 'Customer support intake line (720) 649-0734 and email wdowis@abode-mode.com returned immediately upon keyword HELP inquiry.',
    sectionTarget: 'consumer-rights-opt-out',
    status: 'Verified',
  },
  {
    id: 'req-5',
    requirement: 'Message & Data Rates Disclosure',
    standard: 'Carrier Disclosure Rule',
    carrierNotice: 'Clear upfront disclosure stating "Message and data rates may apply" displayed adjacent to every phone intake field.',
    sectionTarget: 'mobile-sms-privacy',
    status: 'Verified',
  },
  {
    id: 'req-6',
    requirement: 'Cadence & Frequency Disclosure',
    standard: 'TCR Registration Requirement',
    carrierNotice: 'Explicit notice stating "Message frequency varies based on transaction milestones and active property offers."',
    sectionTarget: 'mobile-sms-privacy',
    status: 'Verified',
  },
  {
    id: 'req-7',
    requirement: 'Purpose Alignment & Specificity',
    standard: 'A2P 10DLC Brand Vetting',
    carrierNotice: 'SMS communication is strictly confined to property valuations, written cash offers, inspection scheduling, and title closing milestones.',
    sectionTarget: 'purpose-of-use',
    status: 'Verified',
  },
  {
    id: 'req-8',
    requirement: 'Corporate Entity Verification',
    standard: 'TCR EIN / Entity Verification',
    carrierNotice: 'ABODE-MODE LLC verified operating entity with direct human acquisitions intake line (720) 649-0734 (WDowis@Abode-Mode.com).',
    sectionTarget: 'direct-contact',
    status: 'Verified',
  },
];

export interface PolicySubsection {
  subtitle?: string;
  paragraphs: string[];
  bulletPoints?: string[];
}

export interface PolicySection {
  id: string;
  number: number;
  title: string;
  highlightSummary?: string;
  subsections: PolicySubsection[];
}

export const POLICY_SECTIONS: PolicySection[] = [
  {
    id: 'scope-information-collected',
    number: 1,
    title: 'Scope of Policy & Factual Data Collection',
    highlightSummary:
      'Governs all communications with ABODE-MODE LLC regarding residential property and land acquisitions across all 50 U.S. states.',
    subsections: [
      {
        subtitle: '1.1 Identification of Operating Entity',
        paragraphs: [
          'This Privacy Policy applies to the commercial real estate operations of ABODE-MODE LLC, a limited liability company publicly conducting business as Abode Mode (herein referred to as "Abode Mode", "the Company", "we", "us", or "our"). In prose, we operate under the trade name Abode Mode, while our legal entity registration is ABODE-MODE LLC.',
          'We engage in direct acquisition of single-family residences, vacant land parcels, and acreage across all 50 states. We are direct principal buyers, not a retail brokerage or automated lead-aggregation mill.',
        ],
      },
      {
        subtitle: '1.2 Information Collected for Real Property Valuation',
        paragraphs: [
          'In order to evaluate prospective properties, prepare formal written cash offers, conduct title examination, and coordinate escrow closings, Abode Mode collects the following categories of information voluntarily submitted by property owners or authorized representatives:',
        ],
        bulletPoints: [
          'Property Physical Data: State, county, street address, Assessor Parcel Number (APN), legal description, boundaries, acreage, physical condition, zoning, road access, and utility connections.',
          'Property Financial & Title History: Encumbrances, mortgage balance status, HOA assessments, unpaid property taxes, probate status, and owner timeline requirements.',
          'Contact & Entity Data: Legal owner full name, mailing address, primary email address, and direct telephone / mobile numbers.',
          'Transactional Milestones: Purchase agreements, closing statements, escrow instructions, and payoff demands coordinated with licensed local title and escrow companies.',
        ],
      },
    ],
  },
  {
    id: 'mobile-sms-privacy',
    number: 2,
    title: 'Mobile Information & SMS Telephony Privacy (CTIA Clause)',
    highlightSummary:
      'Strict non-negotiable protection of mobile telephone numbers. Text messaging opt-in data is never sold, leased, or shared with third parties under any circumstances.',
    subsections: [
      {
        subtitle: '2.1 Absolute Prohibition on Third-Party Sharing of Mobile Data',
        paragraphs: [
          'ABODE-MODE LLC operates in rigorous compliance with CTIA messaging principles, Tier-1 carrier codes of conduct (AT&T, Verizon, T-Mobile), and The Campaign Registry (TCR) A2P 10DLC specifications.',
          'We maintain a permanent firewall between mobile telephone records and any outside marketing or promotional entities.',
        ],
      },
      {
        subtitle: '2.2 Mandatory Verbatim Carrier Clause',
        paragraphs: [
          'In satisfaction of federal carrier guidelines and CTIA audit criteria, the following covenant is irrevocably maintained:',
          'No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances.',
        ],
      },
      {
        subtitle: '2.3 Affirmative Consent & Voluntary Opt-In Protocol',
        paragraphs: [
          'Submission of a telephone number to Abode Mode for general acquisition inquiries does NOT automatically obligate you to receive marketing blasts. Mobile telephone numbers provided on our web intake forms require an affirmative, unchecked-by-default opt-in checkbox before any automated or commercial SMS communications may be transmitted.',
          'General real estate inquiries may be submitted with an email or telephone number without opting into SMS. Opting into SMS is entirely voluntary and is never a condition of receiving a cash valuation or executing a purchase contract.',
        ],
      },
      {
        subtitle: '2.4 Message Frequency, Nature & Rates',
        paragraphs: [
          'When opt-in consent is provided, SMS correspondence from Abode Mode is strictly conversational and transactional in nature. Messages relate exclusively to:',
        ],
        bulletPoints: [
          'Confirming receipt of property intake details.',
          'Delivering preliminary property valuations and written cash offers.',
          'Clarifying parcel boundaries, access easements, or property access coordination.',
          'Providing escrow and title closing status updates from our nationwide intake desk.',
          'Message frequency varies based on transaction status and property due diligence schedules.',
          'Standard message and data rates may apply as determined by your cellular carrier plan.',
        ],
      },
    ],
  },
  {
    id: 'purpose-of-use',
    number: 3,
    title: 'Purpose of Use & Strict Information Boundaries',
    highlightSummary:
      'Data collected is used exclusively for property underwriting, title verification, purchase contract execution, and direct transaction closing.',
    subsections: [
      {
        subtitle: '3.1 Core Commercial Purpose',
        paragraphs: [
          'Abode Mode collects and processes personal and real property data solely to evaluate, underwrite, negotiate, contract, and close direct real estate purchases. We do not sell consumer leads, do not engage in affiliate data syndication, and do not provide consumer profiles to third-party data brokers.',
        ],
      },
      {
        subtitle: '3.2 Permissible Operational Disclosures',
        paragraphs: [
          'Personal information (strictly excluding mobile SMS opt-in consent data) may only be transmitted to verified operational partners solely to finalize a mutual real estate closing:',
        ],
        bulletPoints: [
          'Licensed Title & Escrow Agents: Delivering contracts, earnest money deposits, and owner documentation to licensed title underwriters (e.g. First American, Fidelity National, Stewart Title, Land Title Guarantee) in the state where the property is located.',
          'County Recording Offices: Providing deed instruments and transfer affidavits required by county clerks and recorders for legal transfer.',
          'Legal Counsel & Financial Institutions: Coordinating wire disbursements and payoff demands directly associated with the agreed purchase contract.',
        ],
      },
    ],
  },
  {
    id: 'consumer-rights-opt-out',
    number: 4,
    title: 'CTIA Consumer Rights: STOP & HELP Protocols',
    highlightSummary:
      'Immediate automated opt-out via keyword STOP and instant live assistance via keyword HELP.',
    subsections: [
      {
        subtitle: '4.1 Universal STOP Revocation Protocol',
        paragraphs: [
          'Any property owner or consumer who has previously consented to receive SMS notifications from Abode Mode may immediately terminate all text message communications at any time by replying STOP to any text message received from our intake desk.',
          'Alternative supported cancellation keywords include: CANCEL, END, QUIT, UNSUBSCRIBE, and STOPALL. Upon receipt of any such keyword, our carrier gateway immediately ceases all outbound messaging and transmits an automated final confirmation confirming removal.',
        ],
      },
      {
        subtitle: '4.2 HELP & Direct Customer Support Protocol',
        paragraphs: [
          'For assistance, information on active property offers, or clarification on message origin, reply HELP to any SMS received from Abode Mode.',
          'You may also contact our direct intake line via telephone at (720) 649-0734 or email wdowis@abode-mode.com. Inquiries are addressed within 24 business hours.',
        ],
      },
      {
        subtitle: '4.3 Right to Access, Correct, or Delete Records',
        paragraphs: [
          'Property owners retain the right to inspect any personal contact records held by Abode Mode, request corrections to erroneous property data, or request permanent deletion of contact profiles for uncontracted properties. Inquiries should be directed to wdowis@abode-mode.com.',
        ],
      },
    ],
  },
  {
    id: 'data-security-storage',
    number: 5,
    title: 'Data Security, Encryption & Retention Standards',
    highlightSummary:
      'Bank-grade transport layer security (TLS), encrypted storage, and strict access controls for all property documents.',
    subsections: [
      {
        subtitle: '5.1 Technical Security Controls',
        paragraphs: [
          'Abode Mode enforces administrative, physical, and technical safeguards designed to protect personal and real property data from unauthorized access, disclosure, alteration, or destruction. All web transmission of intake forms occurs over 256-bit Transport Layer Security (TLS/HTTPS).',
          'Database systems containing seller records are encrypted at rest and access is restricted exclusively to authorized acquisitions personnel.',
        ],
      },
      {
        subtitle: '5.2 Data Retention Policies',
        paragraphs: [
          'Property inquiries that do not result in an executed purchase contract are archived and purged in accordance with our biennial data minimization protocol.',
          'Executed contracts, closing settlement statements, and title records are retained for statutory periods mandated by applicable state real estate guidelines (minimum 7 years for financial and conveyance records).',
        ],
      },
    ],
  },
  {
    id: 'direct-contact',
    number: 6,
    title: 'Direct Acquisitions Desk & Corporate Contacts',
    highlightSummary:
      'Direct human access to Abode Mode principals via our intake line at (720) 649-0734.',
    subsections: [
      {
        subtitle: '6.1 Corporate Entity Particulars',
        paragraphs: [
          'Commercial real estate transactions, contracts, and regulatory filings are executed under the legal entity:',
          'ABODE-MODE LLC (d/b/a Abode Mode)',
          'Director of Acquisitions: W. Dowis',
          'Direct Intake Line: (720) 649-0734',
          'Official Electronic Correspondence: wdowis@abode-mode.com',
        ],
      },
      {
        subtitle: '6.2 Direct Intake Desk',
        paragraphs: [
          'Property owners and buyers across all 50 states may contact our direct intake line:',
        ],
        bulletPoints: [
          'Direct Intake Line: (720) 649-0734 — Serving land sellers and buyers across all 50 states.',
          'Electronic Document Transmissions: wdowis@abode-mode.com',
        ],
      },
    ],
  },
  {
    id: 'state-disclosures',
    number: 7,
    title: 'State Disclosures: Principal Real Estate Notice',
    highlightSummary:
      'Direct principal disclosure for transactions across all states.',
    subsections: [
      {
        subtitle: '7.1 Principal Buyer Disclosure',
        paragraphs: [
          'In all transactions involving real property, ABODE-MODE LLC acts exclusively as a principal buyer purchasing real property for its own portfolio or investment account, and does not represent the seller as a real estate broker or agent.',
          'Sellers are encouraged to consult independent legal or real estate counsel of their choosing. All transactions utilize standard bilateral purchase contracts reviewed and closed through licensed title insurance companies or closing attorneys in the state where the property is located.',
        ],
      },
    ],
  },
  {
    id: 'governing-law',
    number: 8,
    title: 'Governing Law, Arbitration & Document Modifications',
    highlightSummary:
      'Legal jurisdiction, dispute resolution protocols, and periodic policy updates.',
    subsections: [
      {
        subtitle: '8.1 Governing Law & Venue',
        paragraphs: [
          'This Privacy Policy and all associated communications shall be governed by and construed in accordance with applicable federal telecommunications law and the laws of the jurisdiction in which the subject real property is situated.',
          'Any disputes arising from telecommunications or mobile messaging shall be resolved through binding individual arbitration pursuant to the Federal Arbitration Act and American Arbitration Association rules.',
        ],
      },
      {
        subtitle: '8.2 Policy Revisions & Effective Date',
        paragraphs: [
          'Abode Mode reserves the right to amend this Privacy Policy to reflect changes in carrier regulations, federal telecommunications statutes, or operational adjustments. The most current version is permanently published at this canonical URL with the effective date prominently posted.',
          'Effective Date of this publication: October 15, 2026.',
        ],
      },
    ],
  },
];
