import { Lead, SellLead, BuyLead } from '../types';

const LEADS_STORAGE_KEY = 'abode_mode_leads_v1';

const SEED_LEADS: Lead[] = [
  {
    id: 'lead-s-1001',
    type: 'sell',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    address: 'Rio Grande Estates, Belen',
    parcelNumber: '1-008-032-155-210',
    county: 'Valencia',
    state: 'NM',
    city: 'Belen',
    zipCode: '87002',
    coordinates: { lat: 34.6628, lng: -106.7761 },
    acreage: 5.25,
    zoningType: 'Rural Residential / Agricultural',
    topography: ['Flat', 'Desert Plains'],
    roadAccess: 'County maintained dirt road',
    electricity: 'Power poles at street (approx 150ft)',
    waterSource: 'Well needed (neighbor depth 120ft)',
    sewer: 'Septic required',
    improvements: ['Survey stakes visible'],
    ownershipType: 'Sole owner (Clear Title)',
    yearsOwned: '6 years',
    backTaxesOwed: 'No ($0.00 current)',
    hasLiensOrMortgages: 'None (Owned free and clear)',
    sellingTimeline: 'Within 30 days',
    askingPriceExpectation: '$18,500 cash offer',
    reasonForSelling: 'Liquidating portfolio assets',
    sellerName: 'Marcus Vance',
    sellerPhone: '(505) 438-9210',
    sellerEmail: 'mvance.properties@gmail.com',
    mailingAddress: '1420 Desert Willow Way, Albuquerque, NM',
    preferredContactMethod: 'phone',
    additionalComments: 'Ready to sign purchase agreement this week if numbers make sense.',
  },
  {
    id: 'lead-b-2001',
    type: 'buy',
    status: 'reviewing',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    targetStates: ['Texas', 'Tennessee'],
    targetCounties: 'Henderson, Smith, Anderson',
    minAcreage: 10,
    maxAcreage: 35,
    budgetRange: '$75,000 - $160,000',
    targetZoning: ['Unrestricted', 'Agricultural', 'Recreational / Homestead'],
    mustHaveFeatures: ['Paved or all-weather road access', 'Mature hardwood timber', 'Electric meter or utility pole onsite'],
    coordinates: { lat: 32.1954, lng: -95.8569 },
    targetLocationName: 'East Texas Piney Woods',
    purchasingTimeline: 'Immediately (Cash in hand)',
    fundingSource: 'Cash (Liquid bank funds)',
    plannedUse: 'Family weekend cabin & future homestead',
    specialRequests: 'Prefer parcels with no active HOA or architectural restrictions.',
    buyerName: 'Elena Rostova',
    buyerPhone: '(903) 512-8843',
    buyerEmail: 'elena.rostova@outlook.com',
    preferredContactMethod: 'email',
    isRealEstateProfessional: false,
  },
  {
    id: 'lead-s-1002',
    type: 'sell',
    status: 'contacted',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    address: 'Forbes Park Unit K2, Lot 18',
    parcelNumber: '702-19-440',
    county: 'Costilla',
    state: 'CO',
    city: 'Fort Garland',
    zipCode: '81133',
    coordinates: { lat: 37.4912, lng: -105.2931 },
    acreage: 2.8,
    zoningType: 'Estate Residential (R-1)',
    topography: ['Gentle slope', 'Aspen & Pine trees'],
    roadAccess: 'Gravel HOA maintained road',
    electricity: 'Underground power adjacent',
    waterSource: 'Domestic well required',
    sewer: 'Engineered septic needed',
    improvements: ['Driveway cut-in partially started'],
    ownershipType: 'Joint tenants with rights of survivorship',
    yearsOwned: '12 years',
    backTaxesOwed: 'No',
    hasLiensOrMortgages: 'None',
    sellingTimeline: 'Fast cash closing (< 14 days)',
    askingPriceExpectation: '$24,000',
    reasonForSelling: 'Relocated out of state',
    sellerName: 'David & Sarah Chen',
    sellerPhone: '(719) 395-6119',
    sellerEmail: 'chen.family.land@gmail.com',
    preferredContactMethod: 'text',
    additionalComments: 'Mountain views looking toward Mt. Blanca.',
  }
];

export function getStoredLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(SEED_LEADS));
      return SEED_LEADS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading leads from localStorage', e);
    return SEED_LEADS;
  }
}

export async function saveLead(lead: Lead): Promise<Lead> {
  const current = getStoredLeads();
  const index = current.findIndex((l) => l.id === lead.id);
  let updated: Lead[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = lead;
  } else {
    updated = [lead, ...current];
  }
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(updated));

  const isSell = lead.type === 'sell';
  const fullName = isSell ? (lead as SellLead).sellerName : (lead as BuyLead).buyerName;
  const phone = isSell ? (lead as SellLead).sellerPhone : (lead as BuyLead).buyerPhone;
  const email = isSell ? (lead as SellLead).sellerEmail : (lead as BuyLead).buyerEmail;
  const propertyAddress = isSell ? (lead as SellLead).address : (lead as BuyLead).targetLocationName;
  const askingPrice = isSell ? (lead as SellLead).askingPriceExpectation : (lead as BuyLead).budgetRange;
  const motivation = isSell ? (lead as SellLead).reasonForSelling : (lead as BuyLead).plannedUse;
  const timeline = isSell ? (lead as SellLead).sellingTimeline : (lead as BuyLead).purchasingTimeline;

  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead,
        fullName: fullName || 'Valued Client',
        phone: phone || '',
        email: email || '',
        propertyAddress: propertyAddress || '',
        askingPrice: askingPrice || '',
        motivation: motivation || '',
        timeline: timeline || '',
      }),
    });
  } catch (err) {
    console.warn('[leadsStorage] Backend sync warning:', err);
  }

  return lead;
}

export function getLeadById(id: string): Lead | undefined {
  const all = getStoredLeads();
  return all.find((l) => l.id === id);
}

export function updateLeadStatus(id: string, status: Lead['status']): Lead | null {
  const current = getStoredLeads();
  const index = current.findIndex((l) => l.id === id);
  if (index === -1) return null;
  current[index].status = status;
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(current));
  return current[index];
}

export function deleteLeadById(id: string): boolean {
  const current = getStoredLeads();
  const filtered = current.filter((l) => l.id !== id);
  if (filtered.length === current.length) return false;
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function updateLeadGoogleSync(
  id: string,
  taskId?: string,
  contactId?: string
): Lead | null {
  const current = getStoredLeads();
  const index = current.findIndex((l) => l.id === id);
  if (index === -1) return null;
  if (taskId) current[index].googleTaskId = taskId;
  if (contactId) current[index].googleContactId = contactId;
  current[index].googleSyncedAt = new Date().toISOString();
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(current));
  return current[index];
}

export function updateLeadImage(
  id: string,
  imageUrl: string,
  imagePrompt?: string
): Lead | null {
  const current = getStoredLeads();
  const index = current.findIndex((l) => l.id === id);
  if (index === -1) return null;
  current[index].imageUrl = imageUrl;
  if (imagePrompt) current[index].imagePrompt = imagePrompt;
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(current));
  return current[index];
}
