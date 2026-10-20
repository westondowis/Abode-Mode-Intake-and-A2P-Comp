export type LeadType = 'sell' | 'buy';

export type LeadStatus = 'new' | 'reviewing' | 'contacted' | 'offer_sent' | 'under_contract' | 'closed' | 'archived';

export interface BaseLead {
  id: string;
  type: LeadType;
  createdAt: string;
  status: LeadStatus;
  notes?: string;
  googleTaskId?: string;
  googleContactId?: string;
  googleSyncedAt?: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface SellLead extends BaseLead {
  type: 'sell';
  // Step 1: Location
  address: string;
  parcelNumber: string; // APN
  county: string;
  state: string;
  city?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
  
  // Step 2: Property Details
  acreage: number | string;
  zoningType: string;
  topography: string[];
  roadAccess: string;
  
  // Step 3: Utilities & Improvements
  electricity: string;
  waterSource: string;
  sewer: string;
  improvements: string[];
  
  // Step 4: Ownership
  ownershipType: string;
  yearsOwned: string;
  backTaxesOwed: string;
  backTaxesAmount?: string;
  hasLiensOrMortgages: string;
  
  // Step 5: Timeline & Price
  sellingTimeline: string;
  askingPriceExpectation: string;
  reasonForSelling: string;
  
  // Step 6: Contact
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  mailingAddress?: string;
  preferredContactMethod: 'phone' | 'email' | 'text';
  additionalComments?: string;
}

export interface BuyLead extends BaseLead {
  type: 'buy';
  // Step 1: Criteria & Location
  targetStates: string[];
  targetCounties?: string;
  minAcreage: number | string;
  maxAcreage: number | string;
  budgetRange: string;
  targetZoning: string[];
  mustHaveFeatures: string[];
  coordinates?: { lat: number; lng: number };
  targetLocationName?: string;
  
  // Step 2: Timeline & Financing
  purchasingTimeline: string;
  fundingSource: string;
  plannedUse: string;
  specialRequests?: string;
  
  // Step 3: Contact
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  preferredContactMethod: 'phone' | 'email' | 'text';
  isRealEstateProfessional: boolean;
}

export type Lead = SellLead | BuyLead;

export interface WorkspaceAuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
