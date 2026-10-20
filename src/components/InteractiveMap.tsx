import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Navigation,
  Search,
  CheckCircle2,
  DollarSign,
  Maximize2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Check,
  Mountain,
  Globe,
  Grid,
  Info,
} from 'lucide-react';
import { AvailablePropertyListing } from '../data/availableListings';

export type MapLayerView = 'topographic' | 'satellite' | 'zoning';

interface InteractiveMapProps {
  onLocationSelect?: (location: {
    lat: number;
    lng: number;
    address?: string;
    county?: string;
    state?: string;
    apn?: string;
    acreage?: number;
  }) => void;
  selectedCoordinates?: { lat: number; lng: number } | null;
  mode?: 'sell' | 'buy';
  initialAddress?: string;
  initialApn?: string;
  availableParcels?: AvailablePropertyListing[];
  selectedParcelId?: string | null;
  onSelectParcel?: (parcel: AvailablePropertyListing) => void;
  searchFilterText?: string;
}

export interface MapLayerOption {
  id: MapLayerView;
  name: string;
  badge: string;
  icon: React.ElementType;
  description: string;
  accentColor: string;
}

export const MAP_LAYERS: MapLayerOption[] = [
  {
    id: 'topographic',
    name: 'Topographic',
    badge: 'Elevation Contours',
    icon: Mountain,
    description: 'Elevation contours (50ft intervals), mountain relief shading, drainage paths & terrain slope grading.',
    accentColor: '#2dd4bf',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    badge: 'Aerial Imagery',
    icon: Globe,
    description: 'High-resolution aerial satellite photography displaying natural tree canopy, cleared pastures & road access.',
    accentColor: '#F2C864',
  },
  {
    id: 'zoning',
    name: 'Zoning',
    badge: 'County Land-Use',
    icon: Grid,
    description: 'Cadastral tax parcel boundaries, municipal zoning classifications (R-1, AG, REC, UNR) & property setback lines.',
    accentColor: '#c084fc',
  },
];

// Preset verified parcel regions across popular land investment states
const PRESET_PARCELS = [
  {
    name: 'Costilla County, CO (Sangre de Cristo)',
    lat: 37.4912,
    lng: -105.2931,
    county: 'Costilla',
    state: 'CO',
    apn: '702-19-440',
    acreage: 2.8,
    address: 'Forbes Park Lot 18, Fort Garland, CO 81133',
  },
  {
    name: 'Mohave County, AZ (Golden Valley)',
    lat: 35.2223,
    lng: -114.2155,
    county: 'Mohave',
    state: 'AZ',
    apn: '215-08-112A',
    acreage: 2.35,
    address: 'Highway 68 Corridor, Golden Valley, AZ 86413',
  },
  {
    name: 'Elko County, NV (Meadow Valley)',
    lat: 40.8324,
    lng: -115.7631,
    county: 'Elko',
    state: 'NV',
    apn: '011-004-023',
    acreage: 10.0,
    address: 'Meadow Valley Ranchos, Elko, NV 89801',
  },
  {
    name: 'Henderson County, TX (Cedar Creek Lake)',
    lat: 32.1954,
    lng: -95.8569,
    county: 'Henderson',
    state: 'TX',
    apn: 'R-00049210',
    acreage: 12.5,
    address: 'County Road 2404, Athens, TX 75751',
  },
  {
    name: 'Valencia County, NM (Rio Grande Estates)',
    lat: 34.6628,
    lng: -106.7761,
    county: 'Valencia',
    state: 'NM',
    apn: '1-008-032-155-210',
    acreage: 5.25,
    address: 'Unit 4, Block 12, Belen, NM 87002',
  },
  {
    name: 'Citrus County, FL (Withlacoochee)',
    lat: 28.8953,
    lng: -82.4611,
    county: 'Citrus',
    state: 'FL',
    apn: '18E-19S-04-0010',
    acreage: 3.1,
    address: 'W Stage Coach Trail, Floral City, FL 34436',
  },
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onLocationSelect,
  selectedCoordinates,
  mode = 'sell',
  initialAddress = '',
  initialApn = '',
  availableParcels = [],
  selectedParcelId,
  onSelectParcel,
  searchFilterText = '',
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeLayer, setActiveLayer] = useState<MapLayerView>('satellite');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const layerMenuRef = useRef<HTMLDivElement>(null);

  const [pinPosition, setPinPosition] = useState<{ lat: number; lng: number } | null>(
    selectedCoordinates || { lat: 37.4912, lng: -105.2931 }
  );
  const [searchQuery, setSearchQuery] = useState(initialAddress || initialApn || '');
  const [activePreset, setActivePreset] = useState<string | null>(PRESET_PARCELS[0].name);

  // Close layer menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(e.target as Node)) {
        setIsLayerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync when selectedCoordinates change externally
  useEffect(() => {
    if (selectedCoordinates) {
      setPinPosition(selectedCoordinates);
    }
  }, [selectedCoordinates]);

  // When a parcel is selected in parent, update pin position
  useEffect(() => {
    if (selectedParcelId && availableParcels.length > 0) {
      const match = availableParcels.find((p) => p.id === selectedParcelId);
      if (match) {
        setPinPosition({ lat: match.lat, lng: match.lng });
      }
    }
  }, [selectedParcelId, availableParcels]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert click coordinates to simulated latitude & longitude
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    // US bounding box approx: Lat 24.5 to 49.3, Lng -124.7 to -66.9
    const calculatedLng = -124.7 + normalizedX * (124.7 - 66.9);
    const calculatedLat = 49.3 - normalizedY * (49.3 - 24.5);

    const newCoords = {
      lat: Number(calculatedLat.toFixed(4)),
      lng: Number(calculatedLng.toFixed(4)),
    };

    setPinPosition(newCoords);
    setActivePreset(null);

    if (onLocationSelect) {
      onLocationSelect({
        ...newCoords,
        address: searchQuery || `Parcel coordinate: ${newCoords.lat}° N, ${Math.abs(newCoords.lng)}° W`,
        county: 'Assessor District',
        state: newCoords.lng < -100 ? 'Western Region' : 'Eastern Region',
        apn: `APN-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        acreage: Number((Math.random() * 15 + 1).toFixed(2)),
      });
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_PARCELS)[0]) => {
    setPinPosition({ lat: preset.lat, lng: preset.lng });
    setActivePreset(preset.name);
    setSearchQuery(preset.address);
    if (onLocationSelect) {
      onLocationSelect({
        lat: preset.lat,
        lng: preset.lng,
        address: preset.address,
        county: preset.county,
        state: preset.state,
        apn: preset.apn,
        acreage: preset.acreage,
      });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = PRESET_PARCELS.find(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.apn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase() === searchQuery.toLowerCase()
    );

    if (found) {
      handleSelectPreset(found);
    } else {
      const randomOffsetLat = (Math.random() - 0.5) * 6;
      const randomOffsetLng = (Math.random() - 0.5) * 12;
      const coords = {
        lat: Number((37.5 + randomOffsetLat).toFixed(4)),
        lng: Number((-98.0 + randomOffsetLng).toFixed(4)),
      };
      setPinPosition(coords);
      setActivePreset(null);
      if (onLocationSelect) {
        onLocationSelect({
          ...coords,
          address: searchQuery,
          county: 'Identified County',
          state: 'US',
          apn: `APN-${Math.floor(Math.random() * 800 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          acreage: 5.0,
        });
      }
    }
  };

  // Convert lat/lng to percentage coordinates on the map view
  const getCoordinatesPercent = (lat: number, lng: number) => {
    const xPct = Math.max(8, Math.min(92, ((lng + 124.7) / (124.7 - 66.9)) * 100));
    const yPct = Math.max(12, Math.min(88, ((49.3 - lat) / (49.3 - 24.5)) * 100));
    return { xPct, yPct };
  };

  const activeSelectedParcel = availableParcels.find((p) => p.id === selectedParcelId);
  const currentLayerConfig = MAP_LAYERS.find((l) => l.id === activeLayer) || MAP_LAYERS[0];
  const CurrentLayerIcon = currentLayerConfig.icon;

  return (
    <div className="w-full rounded-2xl border border-[#0A4251] bg-[#00171C] overflow-hidden shadow-2xl transition-all">
      {/* Top Map Header & Controls */}
      <div className="p-3 sm:p-4 border-b border-[#0A4251] bg-[#0A4251]/30 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between relative z-30">
        {mode === 'sell' ? (
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F2C864]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search street address, APN parcel number, county, or coordinates..."
              className="w-full bg-[#00171C] text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 rounded-xl pl-10 pr-4 py-2 border border-[#0A4251] focus:outline-none focus:border-[#F2C864]"
            />
          </form>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F2C864] animate-pulse" />
            <span className="text-white font-semibold">
              Live Parcel GIS Layer • {availableParcels.length} Available Listings
            </span>
            {searchFilterText && (
              <span className="px-2 py-0.5 rounded-full bg-[#0A4251] text-[#F2C864] text-[10px] font-mono border border-[#F2C864]/40">
                Filtered: "{searchFilterText}"
              </span>
            )}
          </div>
        )}

        {/* Map Layer Switcher & Zoom */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          {/* Zoom Buttons */}
          <div className="flex bg-[#00171C] p-0.5 rounded-xl border border-[#0A4251]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(z - 0.25, 0.75))}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Segmented Tabs for 'Topographic', 'Satellite', 'Zoning' */}
          <div className="hidden sm:flex bg-[#00171C] p-0.5 rounded-xl border border-[#0A4251] text-xs font-semibold">
            {MAP_LAYERS.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayer(layer.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#0A4251] text-[#F2C864] border border-[#F2C864]/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{layer.name}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Layer Control Menu (Dropdown with Detailed Layer Descriptions) */}
          <div className="relative" ref={layerMenuRef}>
            <button
              type="button"
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00171C] hover:bg-[#0A4251]/40 border border-[#0A4251] hover:border-[#F2C864]/50 text-xs font-bold text-slate-200 transition-all shadow-md active:scale-95"
              title="Toggle map visualization layers"
            >
              <Layers className="w-3.5 h-3.5 text-[#F2C864]" />
              <span className="text-slate-400 font-normal">Layer:</span>
              <span className="text-[#F2C864] capitalize">{currentLayerConfig.name}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isLayerMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Layer Control Dropdown Menu */}
            {isLayerMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#00171C] border border-[#0A4251] shadow-2xl p-2.5 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 space-y-1.5">
                <div className="px-3 py-2 border-b border-[#0A4251]/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F2C864]" /> Map Layer Control
                  </span>
                  <span className="text-[10px] text-[#88BBD8] font-mono">3 Views Available</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {MAP_LAYERS.map((layer) => {
                    const Icon = layer.icon;
                    const isSelected = activeLayer === layer.id;
                    return (
                      <button
                        key={layer.id}
                        type="button"
                        onClick={() => {
                          setActiveLayer(layer.id);
                          setIsLayerMenuOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 group ${
                          isSelected
                            ? 'bg-[#0A4251]/50 border-[#F2C864] text-white shadow-md'
                            : 'bg-[#00171C] border-[#0A4251]/70 hover:border-[#0A4251] hover:bg-[#0A4251]/20 text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#0A4251] border-[#F2C864] text-[#F2C864]'
                              : 'bg-[#0A4251]/30 border-[#0A4251] text-slate-400 group-hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-bold transition-colors ${
                                isSelected ? 'text-[#F2C864]' : 'text-white group-hover:text-[#F2C864]'
                              }`}
                            >
                              {layer.name} Map
                            </span>
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold"
                              style={{
                                color: layer.accentColor,
                                backgroundColor: `${layer.accentColor}18`,
                                border: `1px solid ${layer.accentColor}40`,
                              }}
                            >
                              {layer.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {layer.description}
                          </p>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-[#F2C864] flex-shrink-0 mt-0.5 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-2 pt-2 border-t border-[#0A4251]/50 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-[#88BBD8]" />
                  <span>Toggle anytime to inspect parcel elevation or zoning rules.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preset Quick Badges (when mode is sell) */}
      {mode === 'sell' && (
        <div className="px-3 sm:px-4 py-2 border-b border-[#0A4251]/60 bg-[#00171C] flex items-center gap-2 overflow-x-auto text-xs text-slate-400 scrollbar-none">
          <span className="text-[#F2C864] font-medium whitespace-nowrap flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Sample Parcels:
          </span>
          {PRESET_PARCELS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg border transition-all ${
                activePreset === p.name
                  ? 'bg-[#0A4251] border-[#F2C864] text-[#F2C864] font-semibold'
                  : 'bg-[#00171C] border-[#0A4251] text-slate-300 hover:border-[#F2C864]/50 hover:text-white'
              }`}
            >
              {p.county}, {p.state} ({p.acreage} ac)
            </button>
          ))}
        </div>
      )}

      {/* Interactive Map Canvas Container */}
      <div
        onClick={handleMapClick}
        className="relative w-full h-80 sm:h-96 cursor-crosshair select-none overflow-hidden"
        style={{
          backgroundColor:
            activeLayer === 'topographic'
              ? '#071f1e'
              : activeLayer === 'zoning'
              ? '#081726'
              : '#00171C',
          backgroundImage:
            activeLayer === 'topographic'
              ? 'repeating-radial-gradient(circle at 50% 50%, #0d3837 0, #0d3837 10px, #071f1e 10px, #071f1e 22px)'
              : activeLayer === 'zoning'
              ? 'linear-gradient(to right, #0d2842 1px, transparent 1px), linear-gradient(to bottom, #0d2842 1px, transparent 1px)'
              : 'radial-gradient(#0A4251 1px, transparent 1px), radial-gradient(#082e38 1.5px, #00171C 100%)',
          backgroundSize: activeLayer === 'zoning' ? '45px 45px' : 'auto',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out, background-color 0.3s ease',
        }}
      >
        {/* SVG GIS Layer Renderings for Topographic, Satellite, and Zoning */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="cadastralGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(242, 200, 100, 0.1)" strokeWidth="1" />
            </pattern>
            <pattern id="topoHatch" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0 8 L8 0" stroke="rgba(45, 212, 191, 0.15)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* LAYER 1: TOPOGRAPHIC VIEW SPECIFICS */}
          {activeLayer === 'topographic' && (
            <g className="animate-in fade-in duration-300">
              {/* Hillshade Contours & Elevation Lines */}
              <path
                d="M -50 120 Q 220 40 450 140 T 950 100 T 1300 80"
                fill="none"
                stroke="rgba(45, 212, 191, 0.45)"
                strokeWidth="1.8"
              />
              <path
                d="M -50 160 Q 240 80 480 180 T 980 140 T 1300 120"
                fill="none"
                stroke="rgba(45, 212, 191, 0.25)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <path
                d="M -50 200 Q 260 120 510 220 T 1010 180 T 1300 160"
                fill="none"
                stroke="rgba(45, 212, 191, 0.45)"
                strokeWidth="1.8"
              />
              <path
                d="M -50 240 Q 280 160 540 260 T 1040 220 T 1300 200"
                fill="none"
                stroke="rgba(45, 212, 191, 0.25)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <path
                d="M -50 280 Q 300 200 570 300 T 1070 260 T 1300 240"
                fill="none"
                stroke="rgba(45, 212, 191, 0.45)"
                strokeWidth="1.8"
              />
              <path
                d="M -50 320 Q 320 240 600 340 T 1100 300 T 1300 280"
                fill="none"
                stroke="rgba(45, 212, 191, 0.25)"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Natural Mountain Ridgeline & Drainage Arroyo */}
              <path
                d="M 100 40 Q 320 180 520 160 T 900 260"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="6 3"
                opacity="0.7"
              />

              {/* Topographic Elevation Index Callouts */}
              <text x="210" y="88" fill="#2dd4bf" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.85">
                8,250' MSL
              </text>
              <text x="440" y="190" fill="#2dd4bf" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.85">
                8,100' MSL [Index]
              </text>
              <text x="680" y="270" fill="#2dd4bf" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.85">
                7,950' MSL
              </text>
              <text x="920" y="230" fill="#2dd4bf" fontSize="9" fontFamily="monospace" fontWeight="bold" opacity="0.85">
                7,800' Valley
              </text>

              {/* Peak Marker */}
              <g transform="translate(180, 45)">
                <polygon points="0,-8 6,4 -6,4" fill="#F2C864" />
                <text x="10" y="3" fill="#F2C864" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  ▲ Benchmark 8,420'
                </text>
              </g>

              {/* Drainage Waterway Label */}
              <text x="540" y="175" fill="#38bdf8" fontSize="9" fontFamily="monospace" opacity="0.8">
                ≋ Seasonal Arroyo / Drainage (Gentle 4% Slope)
              </text>
            </g>
          )}

          {/* LAYER 2: SATELLITE VIEW SPECIFICS */}
          {activeLayer === 'satellite' && (
            <g className="animate-in fade-in duration-300">
              <rect width="100%" height="100%" fill="url(#cadastralGrid)" />

              {/* Road Corridors & Survey Easements */}
              <path
                d="M 0 190 Q 300 140 600 210 T 1200 170"
                fill="none"
                stroke="#88BBD8"
                strokeWidth="3"
                opacity="0.6"
              />
              <path
                d="M 380 0 L 395 400"
                fill="none"
                stroke="#88BBD8"
                strokeWidth="2"
                strokeDasharray="4 2"
                opacity="0.5"
              />

              {/* Boundary Polygons with Gold Field Border */}
              <polygon
                points="395,110 540,95 560,225 400,240"
                fill="rgba(10, 66, 81, 0.25)"
                stroke="#F2C864"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
              <polygon
                points="560,95 710,80 730,210 560,225"
                fill="rgba(136, 187, 216, 0.1)"
                stroke="rgba(136, 187, 216, 0.6)"
                strokeWidth="1.5"
              />

              <text x="420" y="170" fill="#F2C864" fontSize="10" fontWeight="bold" fontFamily="monospace">
                Surveyed Boundary
              </text>
              <text x="15" y="180" fill="#88BBD8" fontSize="9" fontFamily="monospace">
                County Maintained Road Frontage
              </text>
            </g>
          )}

          {/* LAYER 3: ZONING VIEW SPECIFICS (Municipal & County Cadastral Zones) */}
          {activeLayer === 'zoning' && (
            <g className="animate-in fade-in duration-300">
              {/* Zone A: Agricultural / Ranch (AG-20) */}
              <polygon
                points="20,20 370,10 385,240 10,250"
                fill="rgba(16, 185, 129, 0.12)"
                stroke="#10b981"
                strokeWidth="2"
              />
              <text x="40" y="55" fill="#34d399" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE AG-20 (Agricultural / Farm / Ranch)
              </text>
              <text x="40" y="75" fill="#a7f3d0" fontSize="9" fontFamily="monospace">
                Min Lot: 20-Ac • Permitted: Livestock, Barns, Homestead, Ag-Exempt
              </text>

              {/* Zone B: Rural Residential (R-1) */}
              <polygon
                points="385,10 740,5 760,235 390,240"
                fill="rgba(242, 200, 100, 0.14)"
                stroke="#F2C864"
                strokeWidth="2"
              />
              <text x="410" y="55" fill="#F2C864" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE R-1 (Estate Residential / Single Family)
              </text>
              <text x="410" y="75" fill="#fde68a" fontSize="9" fontFamily="monospace">
                Permitted: Single Family, Cabin, Well & Septic, 30' Front Setback
              </text>

              {/* Zone C: Recreational / Off-Grid (REC-OFF) */}
              <polygon
                points="760,5 1180,0 1190,230 765,235"
                fill="rgba(56, 189, 248, 0.12)"
                stroke="#38bdf8"
                strokeWidth="2"
              />
              <text x="780" y="55" fill="#38bdf8" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE REC-OFF (Recreational / Timber)
              </text>
              <text x="780" y="75" fill="#bae6fd" fontSize="9" fontFamily="monospace">
                Permitted: Off-Grid, Camping, Cabin, Hunting, Solar Power
              </text>

              {/* Zone D: Unrestricted (UNR) */}
              <polygon
                points="10,255 600,245 610,390 0,395"
                fill="rgba(192, 132, 252, 0.14)"
                stroke="#c084fc"
                strokeWidth="2"
              />
              <text x="30" y="300" fill="#c084fc" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ZONE UNR (Unrestricted / No CC&Rs / No HOA)
              </text>
              <text x="30" y="320" fill="#e9d5ff" fontSize="9" fontFamily="monospace">
                Permitted: Tiny Homes, Mobile Homes, RVs, Barndominiums, Workshops
              </text>

              {/* Setback dashed markers */}
              <line x1="400" y1="130" x2="740" y2="125" stroke="#F2C864" strokeWidth="1" strokeDasharray="4 2" />
              <text x="510" y="122" fill="#F2C864" fontSize="8" fontFamily="monospace">
                --- 30' Front Building Setback Line ---
              </text>
            </g>
          )}
        </svg>

        {/* Dynamic Pins for Available Property Listings */}
        {mode === 'buy' &&
          availableParcels.map((parcel) => {
            const isSelected = selectedParcelId === parcel.id;
            const { xPct, yPct } = getCoordinatesPercent(parcel.lat, parcel.lng);

            return (
              <div
                key={parcel.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectParcel) onSelectParcel(parcel);
                }}
                className={`absolute -translate-x-1/2 -translate-y-full transition-all duration-300 cursor-pointer group z-20 ${
                  isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                }`}
                style={{ left: `${xPct}%`, top: `${yPct}%` }}
              >
                {/* Pin Pulsing Halo */}
                {isSelected && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F2C864]/30 animate-ping" />
                )}

                {/* Pin Chip / Badge */}
                <div
                  className={`mb-1 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-xl border flex items-center gap-1.5 whitespace-nowrap backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-[#00171C] border-[#F2C864] text-[#F2C864] ring-2 ring-[#F2C864]/40'
                      : 'bg-[#00171C]/90 border-[#0A4251] text-slate-200 group-hover:border-[#F2C864]/70 group-hover:text-white'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F2C864]' : 'text-[#88BBD8]'}`} />
                  <span>
                    {parcel.stateCode} • {parcel.acreage} ac
                  </span>
                  <span className={`font-mono ${isSelected ? 'text-white' : 'text-[#88BBD8]'}`}>
                    {parcel.askingPrice}
                  </span>
                  {activeLayer === 'zoning' && (
                    <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-purple-950/70 border border-purple-500/40 text-purple-300 font-mono">
                      {parcel.zoning.split('/')[0].trim()}
                    </span>
                  )}
                </div>

                {/* Pin Tip Arrow */}
                <div className="w-2.5 h-2.5 bg-[#F2C864] rotate-45 mx-auto -mt-2 shadow-md border-r border-b border-[#00171C]" />
              </div>
            );
          })}

        {/* Selected Pin & Parcel Highlight (General Pin in Sell Mode or Fallback) */}
        {mode === 'sell' && pinPosition && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none z-20"
            style={{
              left: `${Math.max(15, Math.min(85, ((pinPosition.lng + 124.7) / (124.7 - 66.9)) * 100))}%`,
              top: `${Math.max(20, Math.min(80, ((49.3 - pinPosition.lat) / (49.3 - 24.5)) * 100))}%`,
            }}
          >
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F2C864]/20 animate-ping" />
            <div className="mb-1 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00171C]/95 border border-[#F2C864] text-[#F2C864] text-xs font-semibold shadow-xl backdrop-blur-md whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-[#F2C864] inline-block animate-pulse" />
              <span>Target Coordinates Plotted</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0A4251] to-[#F2C864] border-2 border-[#00171C] flex items-center justify-center text-[#00171C] shadow-2xl mx-auto">
              <MapPin className="w-4 h-4 fill-current" />
            </div>
            <div className="w-1.5 h-1.5 bg-[#F2C864] rounded-full mx-auto -mt-0.5" />
          </div>
        )}

        {/* Dynamic Contextual Layer Legend Overlay (Topographic, Satellite, or Zoning) */}
        <div className="absolute bottom-3 left-3 max-w-[280px] px-3 py-2 rounded-xl bg-[#00171C]/90 border border-[#0A4251] backdrop-blur-md text-[11px] text-slate-300 space-y-1.5 pointer-events-none shadow-xl">
          <div className="flex items-center justify-between border-b border-[#0A4251]/60 pb-1">
            <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CurrentLayerIcon className="w-3 h-3" style={{ color: currentLayerConfig.accentColor }} />
              {currentLayerConfig.name} Layer
            </span>
            <span
              className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase"
              style={{
                color: currentLayerConfig.accentColor,
                backgroundColor: `${currentLayerConfig.accentColor}20`,
              }}
            >
              Active
            </span>
          </div>

          {activeLayer === 'topographic' && (
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-[#2dd4bf]" />
                <span>50ft Index Contours (USGS)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 border-t border-dashed border-[#2dd4bf]/70" />
                <span>Intermediate 10ft Contours</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#38bdf8]">≋</span>
                <span>Arroyo / Natural Drainage Channel</span>
              </div>
            </div>
          )}

          {activeLayer === 'satellite' && (
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F2C864]/30 border border-[#F2C864]" />
                <span>Surveyed Parcel Plats (APN)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#88BBD8]" />
                <span>Dedicated Road Access Corridor</span>
              </div>
            </div>
          )}

          {activeLayer === 'zoning' && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-emerald-500" />
                <span className="text-emerald-300">AG: Agricultural</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#F2C864]" />
                <span className="text-amber-300">R-1: Residential</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-sky-400" />
                <span className="text-sky-300">REC: Off-Grid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-purple-400" />
                <span className="text-purple-300">UNR: Unrestricted</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Coordinates Display */}
        {pinPosition && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-[#00171C]/90 border border-[#0A4251] backdrop-blur-md text-[11px] font-mono text-[#88BBD8] pointer-events-none flex items-center gap-1.5 shadow-xl">
            <Navigation className="w-3 h-3 text-[#F2C864]" />
            <span>
              {pinPosition.lat.toFixed(4)}° N, {Math.abs(pinPosition.lng).toFixed(4)}° W
            </span>
          </div>
        )}
      </div>

      {/* Selected Parcel Expanded Banner (showing layer-specific insights) */}
      {mode === 'buy' && activeSelectedParcel && (
        <div className="p-3 sm:p-4 bg-[#0A4251]/40 border-t border-[#0A4251] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0A4251] border border-[#F2C864]/40 flex items-center justify-center text-[#F2C864] flex-shrink-0">
              <CurrentLayerIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{activeSelectedParcel.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#F2C864]/20 border border-[#F2C864]/40 text-[#F2C864] text-[10px] font-mono font-bold">
                  APN: {activeSelectedParcel.apn}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold"
                  style={{
                    color: currentLayerConfig.accentColor,
                    backgroundColor: `${currentLayerConfig.accentColor}20`,
                  }}
                >
                  {currentLayerConfig.name} Layer Active
                </span>
              </div>

              {/* Layer-Specific Contextual Info */}
              <p className="text-slate-300 text-[11px] mt-0.5">
                {activeLayer === 'topographic' ? (
                  <>
                    <strong className="text-[#2dd4bf]">Topography:</strong> {activeSelectedParcel.topography} •{' '}
                    <strong className="text-white">Elevation Zone:</strong> ~7,900' MSL • Slope: Gentle 3-6% Buildable
                  </>
                ) : activeLayer === 'zoning' ? (
                  <>
                    <strong className="text-[#c084fc]">Zoning District:</strong> {activeSelectedParcel.zoning} •{' '}
                    <strong className="text-white">Setbacks:</strong> 30' Front / 20' Sides • Permitted for Homestead & Recreation
                  </>
                ) : (
                  <>
                    {activeSelectedParcel.county} County, {activeSelectedParcel.state} • Zip:{' '}
                    <strong className="text-[#F2C864]">{activeSelectedParcel.zipCode}</strong> •{' '}
                    {activeSelectedParcel.acreage} Acres • Asking:{' '}
                    <strong className="text-emerald-400 font-mono">{activeSelectedParcel.askingPrice}</strong>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[11px] text-[#88BBD8] hidden md:inline">
              Locked into acquisition criteria
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mapped</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
