import { Lead, SellLead } from '../types';
import { getStoredLeads } from '../services/leadsStorage';

export interface AvailablePropertyListing {
  id: string;
  title: string;
  county: string;
  state: string;
  stateCode: string;
  zipCode: string;
  acreage: number;
  askingPrice: string;
  priceNum: number;
  zoning: string;
  apn: string;
  address: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  topography: string;
  roadAccess: string;
  features: string[];
  description: string;
  isFromLeadSubmission?: boolean;
}

// Verified available inventory of land properties
export const INVENTORY_LISTINGS: AvailablePropertyListing[] = [
  {
    id: 'prop-co-81133',
    title: 'Sangre de Cristo Mountain Foothills Acreage',
    county: 'Costilla',
    state: 'Colorado',
    stateCode: 'CO',
    zipCode: '81133',
    acreage: 2.8,
    askingPrice: '$24,000',
    priceNum: 24000,
    zoning: 'Estate Residential (R-1)',
    apn: '702-19-440',
    address: 'Forbes Park Unit K2, Lot 18, Fort Garland, CO 81133',
    lat: 37.4912,
    lng: -105.2931,
    topography: 'Gentle slope, Aspen & Pine trees',
    roadAccess: 'Gravel HOA maintained road',
    features: ['Mountain Views', 'Pine & Aspen Forest', 'Electric Nearby', 'Near Mountain Creek'],
    description: 'Breathtaking 2.8-acre parcel in private Forbes Park with Mount Blanca views and road access.',
  },
  {
    id: 'prop-nm-87002',
    title: 'Rio Grande Valley Desert Homestead Parcel',
    county: 'Valencia',
    state: 'New Mexico',
    stateCode: 'NM',
    zipCode: '87002',
    acreage: 5.25,
    askingPrice: '$18,500',
    priceNum: 18500,
    zoning: 'Rural Residential / Agricultural',
    apn: '1-008-032-155-210',
    address: 'Rio Grande Estates Unit 4, Belen, NM 87002',
    lat: 34.6628,
    lng: -106.7761,
    topography: 'Flat, high desert plateau',
    roadAccess: 'County maintained dirt road',
    features: ['Power at Road', '100% Flat Buildable', 'No HOA Restrictions', 'Manzano Mountain Views'],
    description: 'Level 5.25-acre off-grid parcel just 35 minutes south of Albuquerque with clear mountain views.',
  },
  {
    id: 'prop-tx-75751',
    title: 'East Texas Piney Woods Ranch Acreage',
    county: 'Henderson',
    state: 'Texas',
    stateCode: 'TX',
    zipCode: '75751',
    acreage: 12.5,
    askingPrice: '$89,000',
    priceNum: 89000,
    zoning: 'Unrestricted / Agricultural',
    apn: 'R-00049210',
    address: 'County Road 2404, Athens, TX 75751',
    lat: 32.1954,
    lng: -95.8569,
    topography: 'Rolling pasture with mature hardwood clusters',
    roadAccess: 'County paved road frontage',
    features: ['Paved Road Access', 'Mature Oak & Pine Trees', 'Pond Site Available', 'Ag-Exempt Eligible'],
    description: 'Prime 12.5-acre unrestricted tract ideal for homestead, cattle, or private country estate near Cedar Creek Lake.',
  },
  {
    id: 'prop-az-86413',
    title: 'Golden Valley Panoramic Mesa Parcel',
    county: 'Mohave',
    state: 'Arizona',
    stateCode: 'AZ',
    zipCode: '86413',
    acreage: 2.35,
    askingPrice: '$14,900',
    priceNum: 14900,
    zoning: 'Agricultural-Residential (A-R)',
    apn: '215-08-112A',
    address: 'Highway 68 Corridor, Golden Valley, AZ 86413',
    lat: 35.2223,
    lng: -114.2155,
    topography: 'Level desert plateau with native yucca',
    roadAccess: 'Dedicated dirt road access',
    features: ['Black Mountain Views', 'Power 500ft', 'Manufactured Homes Allowed', '30 Min to Laughlin'],
    description: 'Convenient 2.35-acre building site between Kingman and Bullhead City with direct highway proximity.',
  },
  {
    id: 'prop-nv-89801',
    title: 'Meadow Valley Open Range Acreage',
    county: 'Elko',
    state: 'Nevada',
    stateCode: 'NV',
    zipCode: '89801',
    acreage: 10.0,
    askingPrice: '$16,500',
    priceNum: 16500,
    zoning: 'Open Space / Rural Agricultural',
    apn: '011-004-023',
    address: 'Meadow Valley Ranchos, Elko, NV 89801',
    lat: 40.8324,
    lng: -115.7631,
    topography: 'Expansive flat valley with sagebrush',
    roadAccess: 'Platted dirt two-track easement',
    features: ['Ruby Mountain Backdrop', 'Off-Grid Freedom', 'Hunting & Camping Paradise', 'Low Annual Taxes'],
    description: 'Sprawling 10-acre recreational parcel offering complete privacy and uninhibited western mountain horizons.',
  },
  {
    id: 'prop-fl-34436',
    title: 'Withlacoochee Forest Equestrian Tract',
    county: 'Citrus',
    state: 'Florida',
    stateCode: 'FL',
    zipCode: '34436',
    acreage: 3.1,
    askingPrice: '$39,000',
    priceNum: 39000,
    zoning: 'Rural Residential (RUR)',
    apn: '18E-19S-04-0010',
    address: 'W Stage Coach Trail, Floral City, FL 34436',
    lat: 28.8953,
    lng: -82.4611,
    topography: 'High and dry pine scrub & oaks',
    roadAccess: 'Paved county road',
    features: ['Power at Street', 'High & Dry Non-Flood', 'Horse Friendly', 'Minutes to Lake Tsala Apopka'],
    description: 'Clean, buildable 3.1-acre homesite in Citrus County surrounded by state forest trails and lakes.',
  },
  {
    id: 'prop-wy-82001',
    title: 'Medicine Bow Foothills Ranch Section',
    county: 'Albany',
    state: 'Wyoming',
    stateCode: 'WY',
    zipCode: '82001',
    acreage: 35.0,
    askingPrice: '$68,000',
    priceNum: 68000,
    zoning: 'Agricultural / Rural Residential',
    apn: 'WY-02-4410-09',
    address: 'Foothills Ranch Road, Laramie, WY 82001',
    lat: 41.3114,
    lng: -105.5911,
    topography: 'Rolling prairie grasslands',
    roadAccess: 'Maintained gravel ranch road',
    features: ['35-Acre Large Tract', 'Snowy Range Views', 'Wildlife Corridor (Elk & Antelope)', 'Well Permitted Area'],
    description: 'Substantial 35-acre Wyoming ranch tract with panoramic mountain views and low property taxes.',
  },
  {
    id: 'prop-az-86046',
    title: 'Grand Canyon Junction High Country Timber',
    county: 'Coconino',
    state: 'Arizona',
    stateCode: 'AZ',
    zipCode: '86046',
    acreage: 10.0,
    askingPrice: '$32,000',
    priceNum: 32000,
    zoning: 'General (10-Acre Minimum)',
    apn: '501-12-004B',
    address: 'Valle Junction Road, Williams, AZ 86046',
    lat: 35.6558,
    lng: -112.1465,
    topography: 'Piñon pine and juniper rolling woodland',
    roadAccess: 'County maintained gravel',
    features: ['Piñon-Juniper Forest', 'Cool High-Altitude Summer', 'Near Grand Canyon South Rim', 'Starry Dark Skies'],
    description: 'Beautiful 10-acre wooded retreat situated between historic Route 66 and the Grand Canyon.',
  },
];

/**
 * Returns all available property listings merged with any active seller leads
 */
export function getAllAvailableListings(): AvailablePropertyListing[] {
  const listings = [...INVENTORY_LISTINGS];

  try {
    const leads = getStoredLeads();
    const sellLeads = leads.filter((l): l is SellLead => l.type === 'sell');

    sellLeads.forEach((lead) => {
      // Avoid duplicate APN or ID
      const existing = listings.find(
        (item) => item.apn.toLowerCase() === lead.parcelNumber.toLowerCase() || item.id === lead.id
      );
      if (!existing && lead.coordinates) {
        const acreageNum = typeof lead.acreage === 'number' ? lead.acreage : parseFloat(lead.acreage) || 5.0;
        const stateName = lead.state.length === 2 ? getStateFullName(lead.state) : lead.state;
        const stateCode = lead.state.length === 2 ? lead.state.toUpperCase() : getStateCode(lead.state);

        listings.unshift({
          id: lead.id,
          title: `${lead.county || 'Rural'} County ${acreageNum} Acre Parcel`,
          county: lead.county || 'County District',
          state: stateName,
          stateCode: stateCode,
          zipCode: lead.zipCode || '81133',
          acreage: acreageNum,
          askingPrice: lead.askingPriceExpectation || 'Market Value',
          priceNum: parseFloat(lead.askingPriceExpectation?.replace(/[^0-9.]/g, '') || '25000') || 25000,
          zoning: lead.zoningType || 'Rural Residential',
          apn: lead.parcelNumber,
          address: lead.address,
          lat: lead.coordinates.lat,
          lng: lead.coordinates.lng,
          imageUrl: lead.imageUrl,
          topography: lead.topography?.join(', ') || 'Rolling parcel',
          roadAccess: lead.roadAccess || 'Recorded Road Access',
          features: lead.improvements || ['Surveyed Boundary', 'Title Insured'],
          description: `Direct acquisition parcel in ${lead.county}, ${lead.state}. Road access: ${lead.roadAccess}.`,
          isFromLeadSubmission: true,
        });
      }
    });
  } catch (e) {
    console.error('Error combining leads with inventory:', e);
  }

  return listings;
}

// State abbreviations helper
export const STATE_LOOKUP: Record<string, { code: string; name: string; lat: number; lng: number }> = {
  colorado: { code: 'CO', name: 'Colorado', lat: 39.5501, lng: -105.7821 },
  co: { code: 'CO', name: 'Colorado', lat: 39.5501, lng: -105.7821 },
  texas: { code: 'TX', name: 'Texas', lat: 31.9686, lng: -99.9018 },
  tx: { code: 'TX', name: 'Texas', lat: 31.9686, lng: -99.9018 },
  'new mexico': { code: 'NM', name: 'New Mexico', lat: 34.5199, lng: -105.8701 },
  newmexico: { code: 'NM', name: 'New Mexico', lat: 34.5199, lng: -105.8701 },
  nm: { code: 'NM', name: 'New Mexico', lat: 34.5199, lng: -105.8701 },
  arizona: { code: 'AZ', name: 'Arizona', lat: 34.0489, lng: -111.0937 },
  az: { code: 'AZ', name: 'Arizona', lat: 34.0489, lng: -111.0937 },
  nevada: { code: 'NV', name: 'Nevada', lat: 38.8026, lng: -116.4194 },
  nv: { code: 'NV', name: 'Nevada', lat: 38.8026, lng: -116.4194 },
  florida: { code: 'FL', name: 'Florida', lat: 27.6648, lng: -81.5158 },
  fl: { code: 'FL', name: 'Florida', lat: 27.6648, lng: -81.5158 },
  wyoming: { code: 'WY', name: 'Wyoming', lat: 43.0759, lng: -107.2903 },
  wy: { code: 'WY', name: 'Wyoming', lat: 43.0759, lng: -107.2903 },
  montana: { code: 'MT', name: 'Montana', lat: 46.8797, lng: -110.3626 },
  mt: { code: 'MT', name: 'Montana', lat: 46.8797, lng: -110.3626 },
  idaho: { code: 'ID', name: 'Idaho', lat: 44.0682, lng: -114.7420 },
  id: { code: 'ID', name: 'Idaho', lat: 44.0682, lng: -114.7420 },
  utah: { code: 'UT', name: 'Utah', lat: 39.3210, lng: -111.0937 },
  ut: { code: 'UT', name: 'Utah', lat: 39.3210, lng: -111.0937 },
  tennessee: { code: 'TN', name: 'Tennessee', lat: 35.5175, lng: -86.5804 },
  tn: { code: 'TN', name: 'Tennessee', lat: 35.5175, lng: -86.5804 },
  california: { code: 'CA', name: 'California', lat: 36.7783, lng: -119.4179 },
  ca: { code: 'CA', name: 'California', lat: 36.7783, lng: -119.4179 },
  washington: { code: 'WA', name: 'Washington', lat: 47.7511, lng: -120.7401 },
  wa: { code: 'WA', name: 'Washington', lat: 47.7511, lng: -120.7401 },
  oregon: { code: 'OR', name: 'Oregon', lat: 43.8041, lng: -120.5542 },
  or: { code: 'OR', name: 'Oregon', lat: 43.8041, lng: -120.5542 },
  georgia: { code: 'GA', name: 'Georgia', lat: 32.1656, lng: -82.9001 },
  ga: { code: 'GA', name: 'Georgia', lat: 32.1656, lng: -82.9001 },
  'north carolina': { code: 'NC', name: 'North Carolina', lat: 35.7596, lng: -79.0193 },
  nc: { code: 'NC', name: 'North Carolina', lat: 35.7596, lng: -79.0193 },
  arkansas: { code: 'AR', name: 'Arkansas', lat: 35.2010, lng: -91.8318 },
  ar: { code: 'AR', name: 'Arkansas', lat: 35.2010, lng: -91.8318 },
  missouri: { code: 'MO', name: 'Missouri', lat: 37.9643, lng: -91.8318 },
  mo: { code: 'MO', name: 'Missouri', lat: 37.9643, lng: -91.8318 },
};

export function getStateFullName(code: string): string {
  const match = Object.values(STATE_LOOKUP).find((s) => s.code.toLowerCase() === code.toLowerCase());
  return match ? match.name : code;
}

export function getStateCode(name: string): string {
  const clean = name.toLowerCase().trim();
  const match = STATE_LOOKUP[clean];
  return match ? match.code : name.slice(0, 2).toUpperCase();
}
