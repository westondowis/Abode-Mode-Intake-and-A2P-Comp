import React, { useState, useCallback, useMemo } from 'react';
import {
  X,
  MapPin,
  Search,
  Crosshair,
  Compass,
  Layers,
  ChevronRight,
  DollarSign,
  Maximize2,
  ExternalLink,
  Trees,
  Sparkles,
} from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';

export interface FeaturedParcel {
  id: string;
  title: string;
  county: string;
  state: string;
  acreage: number;
  priceFormatted: string;
  zoning: string;
  roadAccess: string;
  waterStatus: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
}

export const FEATURED_LAND_PARCELS: FeaturedParcel[] = [
  {
    id: 'tx-presidio-40ac',
    title: 'High Desert Acreage & Mountain Vistas',
    county: 'Presidio County',
    state: 'TX',
    acreage: 40.0,
    priceFormatted: '$28,500',
    zoning: 'Rural Open / Agricultural',
    roadAccess: 'County Graded Easement',
    waterStatus: 'Private Well Required',
    coordinates: { lat: 30.1245, lng: -104.2891 },
    highlights: ['Unrestricted RV & Camping', 'Panoramic Chinati Mountain Views', 'Zero Back Taxes'],
  },
  {
    id: 'az-mohave-10ac',
    title: 'Panoramic Desert Parcel near Kingman',
    county: 'Mohave County',
    state: 'AZ',
    acreage: 10.2,
    priceFormatted: '$14,900',
    zoning: 'Agricultural / Residential (AR)',
    roadAccess: 'Maintained Dirt Road',
    waterStatus: 'Water Haul or Well',
    coordinates: { lat: 35.2184, lng: -114.0537 },
    highlights: ['Power Poles 300ft Away', 'Level Building Pad', 'Mountain Backdrop'],
  },
  {
    id: 'co-costilla-5ac',
    title: 'Sangre de Cristo Foothills Acreage',
    county: 'Costilla County',
    state: 'CO',
    acreage: 5.0,
    priceFormatted: '$11,500',
    zoning: 'Estate Residential',
    roadAccess: 'County Road Frontage',
    waterStatus: 'Household Well Permitted',
    coordinates: { lat: 37.3872, lng: -105.4219 },
    highlights: ['Near Mountain Springs Reservoir', 'Pine & Piñon Trees', 'Year-Round Access'],
  },
  {
    id: 'fl-polk-2ac',
    title: 'Central Florida Pine Woodlands',
    county: 'Polk County',
    state: 'FL',
    acreage: 2.5,
    priceFormatted: '$36,000',
    zoning: 'Rural Suburban (RS)',
    roadAccess: 'Paved County Road',
    waterStatus: 'City Water at Street',
    coordinates: { lat: 27.8924, lng: -81.7248 },
    highlights: ['Power at Street', 'High & Dry Non-Flood', 'Fast Commute to Orlando/Tampa'],
  },
  {
    id: 'nv-elko-20ac',
    title: 'Ruby Valley Off-Grid Cattle & Recreation',
    county: 'Elko County',
    state: 'NV',
    acreage: 20.0,
    priceFormatted: '$19,800',
    zoning: 'Open Space / Ag',
    roadAccess: 'BLM 4WD Trail',
    waterStatus: 'Well Permitted',
    coordinates: { lat: 40.8324, lng: -115.7631 },
    highlights: ['Borders Public Lands', 'Pristine Dark Sky Stargazing', 'Seasonal Creek Access'],
  },
  {
    id: 'nm-valencia-5ac',
    title: 'Rio Grande Valley Homestead Lot',
    county: 'Valencia County',
    state: 'NM',
    acreage: 5.1,
    priceFormatted: '$9,200',
    zoning: 'Rural Residential',
    roadAccess: 'Platted Road Easement',
    waterStatus: 'Private Well Required',
    coordinates: { lat: 34.7219, lng: -106.7412 },
    highlights: ['30 Mins to Albuquerque', 'Electricity Nearby', 'Flat Topography'],
  },
  {
    id: 'or-klamath-10ac',
    title: 'Ponderosa Pine Timberland Tract',
    county: 'Klamath County',
    state: 'OR',
    acreage: 10.0,
    priceFormatted: '$24,500',
    zoning: 'Forestry / Recreation',
    roadAccess: 'Forest Service Road',
    waterStatus: 'Well or Cistern',
    coordinates: { lat: 42.4518, lng: -121.5621 },
    highlights: ['Mature Evergreen Trees', 'Near Sprague River', 'Hunting & Cabin Retreat'],
  },
];

interface InteractiveLandMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectParcelForOffer?: (parcel: FeaturedParcel) => void;
}

export const InteractiveLandMapModal: React.FC<InteractiveLandMapModalProps> = ({
  isOpen,
  onClose,
  onSelectParcelForOffer,
}) => {
  const [selectedParcel, setSelectedParcel] = useState<FeaturedParcel | null>(null);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [mapTypeId, setMapTypeId] = useState<string>('hybrid');
  const [searchQuery, setSearchQuery] = useState('');
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 36.5,
    lng: -102.5,
  });
  const [zoom, setZoom] = useState<number>(5);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Filter parcels by state and query
  const filteredParcels = useMemo(() => {
    return FEATURED_LAND_PARCELS.filter((p) => {
      const matchState = selectedState === 'ALL' || p.state === selectedState;
      const matchQuery =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchQuery;
    });
  }, [selectedState, searchQuery]);

  const handleSelectParcel = (parcel: FeaturedParcel) => {
    setSelectedParcel(parcel);
    setCenter(parcel.coordinates);
    setZoom(13);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-white dark:bg-[#06141a] border border-slate-200 dark:border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* HEADER BAR */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-cyan-950/80 bg-slate-50/90 dark:bg-[#030d12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-teal-500/20 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold cinzel-text text-slate-900 dark:text-white">
                  Nationwide Land Map &amp; Parcel Explorer
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                  Google Maps Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore rural acreage, active inventory, and recent cash acquisitions powered by high-resolution satellite mapping
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close parcel explorer map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOOLBAR: STATE FILTER, SEARCH & MAP CONTROLS */}
        <div className="p-3 bg-slate-100/90 dark:bg-[#040e13] border-b border-slate-200 dark:border-cyan-950/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          <div className="flex items-center flex-wrap gap-2">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter county or keywords..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* State Filter Buttons */}
            <div className="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
              {['ALL', 'TX', 'AZ', 'CO', 'FL', 'NV', 'NM', 'OR'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedState(st)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedState === st
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Map Type Switcher */}
          <div className="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMapTypeId('hybrid')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                mapTypeId === 'hybrid'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapTypeId('roadmap')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                mapTypeId === 'roadmap'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => setMapTypeId('terrain')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                mapTypeId === 'terrain'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
              }`}
            >
              Terrain
            </button>
          </div>

        </div>

        {/* MAIN BODY: SPLIT VIEW WITH SIDEBAR & GOOGLE MAP */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT LISTING DRAWER */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-cyan-950/60 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#030d12]">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>{filteredParcels.length} Featured Acreage Tracts</span>
              <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">Nationwide</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1.5">
              {filteredParcels.map((parcel) => (
                <div
                  key={parcel.id}
                  onClick={() => handleSelectParcel(parcel)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    selectedParcel?.id === parcel.id
                      ? 'bg-amber-50/80 dark:bg-cyan-950/80 border-amber-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-mono">
                      {parcel.acreage} ACRES
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">
                      {parcel.priceFormatted}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {parcel.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    {parcel.county}, {parcel.state}
                  </p>

                  <div className="flex flex-wrap gap-1 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {parcel.zoning}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300">
                      {parcel.waterStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT MAP CANVAS */}
          <div className="flex-1 relative w-full h-full min-h-[350px] bg-slate-900 overflow-hidden">
            {apiKey ? (
              <APIProvider apiKey={apiKey} libraries={['places', 'marker']}>
                <Map
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  center={center}
                  zoom={zoom}
                  mapTypeId={mapTypeId}
                  onCenterChanged={(e) => setCenter(e.detail.center)}
                  onZoomChanged={(e) => setZoom(e.detail.zoom)}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  zoomControl={true}
                  scaleControl={true}
                  className="w-full h-full"
                  style={{ width: '100%', height: '100%' }}
                >
                  {filteredParcels.map((parcel) => (
                    <AdvancedMarker
                      key={parcel.id}
                      position={parcel.coordinates}
                      onClick={() => setSelectedParcel(parcel)}
                      title={`${parcel.title} (${parcel.acreage} ac)`}
                    >
                      <Pin
                        background={selectedParcel?.id === parcel.id ? '#10B981' : '#F59E0B'}
                        glyphColor="#00171C"
                        borderColor="#FFFFFF"
                        scale={selectedParcel?.id === parcel.id ? 1.3 : 1.1}
                      />
                    </AdvancedMarker>
                  ))}

                  {selectedParcel && (
                    <InfoWindow
                      position={selectedParcel.coordinates}
                      onCloseClick={() => setSelectedParcel(null)}
                      pixelOffset={[0, -32]}
                    >
                      <div className="p-1 max-w-xs text-slate-900 font-sans">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            {selectedParcel.acreage} ACRES
                          </span>
                          <span className="font-bold text-xs text-emerald-700 font-mono">
                            {selectedParcel.priceFormatted}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold leading-snug mb-1">
                          {selectedParcel.title}
                        </h4>

                        <p className="text-[11px] text-slate-600 mb-2">
                          {selectedParcel.county}, {selectedParcel.state}
                        </p>

                        <div className="text-[10px] space-y-0.5 text-slate-600 border-t border-slate-200 pt-1.5 mb-2">
                          <div>• Access: {selectedParcel.roadAccess}</div>
                          <div>• Water: {selectedParcel.waterStatus}</div>
                        </div>

                        {onSelectParcelForOffer && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectParcelForOffer(selectedParcel);
                              onClose();
                            }}
                            className="w-full py-1.5 bg-[#00171C] text-white text-[11px] font-bold uppercase rounded hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Inquire or Submit Similar Land
                          </button>
                        )}
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <MapPin className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-200">
                  Google Maps API Key Required
                </p>
                <p className="text-xs text-slate-400 max-w-md mt-1">
                  Configure VITE_GOOGLE_MAPS_API_KEY to load high-resolution terrain tiles.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
