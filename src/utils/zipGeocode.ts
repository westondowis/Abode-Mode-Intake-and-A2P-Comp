import { STATE_LOOKUP } from '../data/availableListings';

export interface LocationGeoResult {
  lat: number;
  lng: number;
  city?: string;
  county?: string;
  state: string;
  stateCode: string;
  zipCode?: string;
  label: string;
}

// Known zip codes across land markets
export const KNOWN_ZIP_CODES: Record<string, LocationGeoResult> = {
  // Colorado
  '81133': { lat: 37.4912, lng: -105.2931, city: 'Fort Garland', county: 'Costilla', state: 'Colorado', stateCode: 'CO', label: 'Fort Garland, CO 81133 (Costilla Co)' },
  '81152': { lat: 37.2886, lng: -105.4214, city: 'San Luis', county: 'Costilla', state: 'Colorado', stateCode: 'CO', label: 'San Luis, CO 81152 (Costilla Co)' },
  '81123': { lat: 37.7550, lng: -105.4542, city: 'Blanca', county: 'Costilla', state: 'Colorado', stateCode: 'CO', label: 'Blanca, CO 81123 (Costilla Co)' },
  '81230': { lat: 38.5458, lng: -106.9253, city: 'Gunnison', county: 'Gunnison', state: 'Colorado', stateCode: 'CO', label: 'Gunnison, CO 81230' },
  '80487': { lat: 40.4850, lng: -106.8317, city: 'Steamboat Springs', county: 'Routt', state: 'Colorado', stateCode: 'CO', label: 'Steamboat Springs, CO 80487' },

  // New Mexico
  '87002': { lat: 34.6628, lng: -106.7761, city: 'Belen', county: 'Valencia', state: 'New Mexico', stateCode: 'NM', label: 'Belen, NM 87002 (Valencia Co)' },
  '87031': { lat: 34.8056, lng: -106.7328, city: 'Los Lunas', county: 'Valencia', state: 'New Mexico', stateCode: 'NM', label: 'Los Lunas, NM 87031' },
  '87571': { lat: 36.4072, lng: -105.5734, city: 'Taos', county: 'Taos', state: 'New Mexico', stateCode: 'NM', label: 'Taos, NM 87571 (Taos Co)' },
  '88310': { lat: 32.8995, lng: -105.9603, city: 'Alamogordo', county: 'Otero', state: 'New Mexico', stateCode: 'NM', label: 'Alamogordo, NM 88310' },

  // Texas
  '75751': { lat: 32.1954, lng: -95.8569, city: 'Athens', county: 'Henderson', state: 'Texas', stateCode: 'TX', label: 'Athens, TX 75751 (Henderson Co)' },
  '75770': { lat: 32.3274, lng: -95.5397, city: 'Mabank', county: 'Henderson', state: 'Texas', stateCode: 'TX', label: 'Mabank, TX 75770 (Cedar Creek Lake)' },
  '78624': { lat: 30.2752, lng: -98.8719, city: 'Fredericksburg', county: 'Gillespie', state: 'Texas', stateCode: 'TX', label: 'Fredericksburg, TX 78624 (Hill Country)' },
  '76825': { lat: 31.1352, lng: -99.3340, city: 'Brady', county: 'McCulloch', state: 'Texas', stateCode: 'TX', label: 'Brady, TX 76825 (Heart of Texas)' },
  '79735': { lat: 30.8713, lng: -102.8893, city: 'Fort Stockton', county: 'Pecos', state: 'Texas', stateCode: 'TX', label: 'Fort Stockton, TX 79735' },

  // Arizona
  '86413': { lat: 35.2223, lng: -114.2155, city: 'Golden Valley', county: 'Mohave', state: 'Arizona', stateCode: 'AZ', label: 'Golden Valley, AZ 86413 (Mohave Co)' },
  '86401': { lat: 35.1894, lng: -114.0530, city: 'Kingman', county: 'Mohave', state: 'Arizona', stateCode: 'AZ', label: 'Kingman, AZ 86401 (Mohave Co)' },
  '86046': { lat: 35.6558, lng: -112.1465, city: 'Williams / Valle', county: 'Coconino', state: 'Arizona', stateCode: 'AZ', label: 'Williams, AZ 86046 (Coconino Co)' },
  '85935': { lat: 34.2508, lng: -110.0298, city: 'Show Low', county: 'Navajo', state: 'Arizona', stateCode: 'AZ', label: 'Show Low, AZ 85935 (White Mountains)' },

  // Nevada
  '89801': { lat: 40.8324, lng: -115.7631, city: 'Elko', county: 'Elko', state: 'Nevada', stateCode: 'NV', label: 'Elko, NV 89801 (Elko Co)' },
  '89815': { lat: 40.7302, lng: -115.5492, city: 'Spring Creek', county: 'Elko', state: 'Nevada', stateCode: 'NV', label: 'Spring Creek, NV 89815 (Ruby Mtns)' },
  '89406': { lat: 39.4735, lng: -118.7774, city: 'Fallon', county: 'Churchill', state: 'Nevada', stateCode: 'NV', label: 'Fallon, NV 89406' },

  // Florida
  '34436': { lat: 28.8953, lng: -82.4611, city: 'Floral City', county: 'Citrus', state: 'Florida', stateCode: 'FL', label: 'Floral City, FL 34436 (Citrus Co)' },
  '34446': { lat: 28.7494, lng: -82.5186, city: 'Homosassa', county: 'Citrus', state: 'Florida', stateCode: 'FL', label: 'Homosassa, FL 34446' },
  '32091': { lat: 29.9889, lng: -82.1112, city: 'Starke', county: 'Bradford', state: 'Florida', stateCode: 'FL', label: 'Starke, FL 32091' },

  // Wyoming
  '82001': { lat: 41.3114, lng: -105.5911, city: 'Laramie', county: 'Albany', state: 'Wyoming', stateCode: 'WY', label: 'Laramie, WY 82001 (Albany Co)' },
  '82701': { lat: 43.8583, lng: -104.1950, city: 'Newcastle', county: 'Weston', state: 'Wyoming', stateCode: 'WY', label: 'Newcastle, WY 82701 (Black Hills)' },
};

/**
 * Parses user search query to detect zip code or state and returns geo coordinates
 */
export function resolveLocationQuery(query: string): LocationGeoResult | null {
  const clean = query.trim().toLowerCase();
  if (!clean) return null;

  // 1. Direct zip code match
  if (/^\d{5}$/.test(clean)) {
    if (KNOWN_ZIP_CODES[clean]) {
      return { ...KNOWN_ZIP_CODES[clean], zipCode: clean };
    }

    // Algorithmic regional interpolation based on US Postal prefix (0-9)
    const firstDigit = parseInt(clean[0], 10);
    const regionCenters: Record<number, { lat: number; lng: number; state: string; stateCode: string }> = {
      0: { lat: 42.4072, lng: -71.3824, state: 'Massachusetts', stateCode: 'MA' },
      1: { lat: 40.7128, lng: -74.0060, state: 'New York', stateCode: 'NY' },
      2: { lat: 37.5407, lng: -77.4360, state: 'Virginia', stateCode: 'VA' },
      3: { lat: 33.7490, lng: -84.3880, state: 'Georgia', stateCode: 'GA' },
      4: { lat: 41.8781, lng: -87.6298, state: 'Illinois', stateCode: 'IL' },
      5: { lat: 44.9778, lng: -93.2650, state: 'Minnesota', stateCode: 'MN' },
      6: { lat: 38.6270, lng: -90.1994, state: 'Missouri', stateCode: 'MO' },
      7: { lat: 31.9686, lng: -99.9018, state: 'Texas', stateCode: 'TX' },
      8: { lat: 39.5501, lng: -105.7821, state: 'Colorado', stateCode: 'CO' },
      9: { lat: 36.7783, lng: -119.4179, state: 'California', stateCode: 'CA' },
    };

    const fallback = regionCenters[firstDigit] || regionCenters[8];
    return {
      lat: fallback.lat,
      lng: fallback.lng,
      city: `Area Code ${clean.slice(0, 3)}xx`,
      county: 'Regional Assessor District',
      state: fallback.state,
      stateCode: fallback.stateCode,
      zipCode: clean,
      label: `US Zip Code ${clean} (${fallback.stateCode})`,
    };
  }

  // 2. Direct State lookup
  const stateMatch = STATE_LOOKUP[clean];
  if (stateMatch) {
    return {
      lat: stateMatch.lat,
      lng: stateMatch.lng,
      county: `${stateMatch.name} Land District`,
      state: stateMatch.name,
      stateCode: stateMatch.code,
      label: `${stateMatch.name} (${stateMatch.code}) Land Market`,
    };
  }

  // 3. Partial state match
  for (const [key, val] of Object.entries(STATE_LOOKUP)) {
    if (key.startsWith(clean) || val.name.toLowerCase().includes(clean)) {
      return {
        lat: val.lat,
        lng: val.lng,
        county: `${val.name} Land District`,
        state: val.name,
        stateCode: val.code,
        label: `${val.name} (${val.code}) Land Market`,
      };
    }
  }

  return null;
}
