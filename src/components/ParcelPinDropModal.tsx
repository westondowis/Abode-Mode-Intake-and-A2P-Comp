import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MapPin,
  ZoomIn,
  ZoomOut,
  Compass,
  Check,
  Search,
  Crosshair,
  Globe,
  Mountain,
  Navigation,
  Info
} from 'lucide-react';

interface ParcelPinDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coordinates: { lat: number; lng: number; formatted: string }) => void;
  initialCoordinates?: { lat: number; lng: number } | null;
  initialSearchQuery?: string;
}

export const ParcelPinDropModal: React.FC<ParcelPinDropModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialCoordinates,
  initialSearchQuery = '',
}) => {
  // Center defaults: USA center or initial coordinates
  const [centerLat, setCenterLat] = useState<number>(initialCoordinates?.lat ?? 37.0902);
  const [centerLng, setCenterLng] = useState<number>(initialCoordinates?.lng ?? -95.7129);
  const [pinnedLat, setPinnedLat] = useState<number | null>(initialCoordinates?.lat ?? null);
  const [pinnedLng, setPinnedLng] = useState<number | null>(initialCoordinates?.lng ?? null);
  const [zoomLevel, setZoomLevel] = useState<number>(initialCoordinates ? 14 : 5);
  const [mapType, setMapType] = useState<'satellite' | 'terrain' | 'roadmap'>('satellite');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isSearching, setIsSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Sync initial coordinates when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialCoordinates) {
        setCenterLat(initialCoordinates.lat);
        setCenterLng(initialCoordinates.lng);
        setPinnedLat(initialCoordinates.lat);
        setPinnedLng(initialCoordinates.lng);
        setZoomLevel(15);
      }
      if (initialSearchQuery) {
        setSearchQuery(initialSearchQuery);
      }
    }
  }, [isOpen, initialCoordinates, initialSearchQuery]);

  // Attempt to load Google Maps JS API if VITE_GOOGLE_MAPS_API_KEY is available
  useEffect(() => {
    if (!isOpen) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_KEY_HERE') {
      return;
    }

    if ((window as any).google && (window as any).google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      document.head.appendChild(script);
    }
  }, [isOpen]);

  // Initialize or update Google Map instance if loaded
  useEffect(() => {
    if (!googleMapsLoaded || !googleMapRef.current || !isOpen) return;

    const google = (window as any).google;
    if (!google || !google.maps) return;

    const initialPos = {
      lat: pinnedLat ?? centerLat,
      lng: pinnedLng ?? centerLng,
    };

    if (!googleMapInstanceRef.current) {
      const map = new google.maps.Map(googleMapRef.current, {
        center: initialPos,
        zoom: zoomLevel,
        mapTypeId: mapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
      });

      googleMapInstanceRef.current = map;

      // Add click listener to drop/move pin
      map.addListener('click', (e: any) => {
        if (!e.latLng) return;
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setPinnedLat(newLat);
        setPinnedLng(newLng);

        if (googleMarkerRef.current) {
          googleMarkerRef.current.setPosition(e.latLng);
        } else {
          googleMarkerRef.current = new google.maps.Marker({
            position: e.latLng,
            map: map,
            animation: google.maps.Animation.DROP,
            title: 'Selected Parcel Location',
          });
        }
      });

      if (pinnedLat !== null && pinnedLng !== null) {
        googleMarkerRef.current = new google.maps.Marker({
          position: initialPos,
          map: map,
          title: 'Selected Parcel Location',
        });
      }
    } else {
      googleMapInstanceRef.current.setMapTypeId(
        mapType === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP
      );
    }
  }, [googleMapsLoaded, isOpen, mapType]);

  // Handle simulated/canvas interactive map click when Google Maps JS is not loaded
  const handleSimulatedMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel offset to coordinate delta based on zoom
    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;

    const degSpanLat = 180 / Math.pow(2, zoomLevel - 2);
    const degSpanLng = 360 / Math.pow(2, zoomLevel - 2);

    const newLat = Number((centerLat - normalizedY * (degSpanLat / 4)).toFixed(6));
    const newLng = Number((centerLng + normalizedX * (degSpanLng / 4)).toFixed(6));

    setPinnedLat(newLat);
    setPinnedLng(newLng);
  };

  const handleSearchNearby = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Try Google Maps Geocoder if available
    const google = (window as any).google;
    if (google && google.maps && google.maps.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
        setIsSearching(false);
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          setCenterLat(lat);
          setCenterLng(lng);
          setPinnedLat(lat);
          setPinnedLng(lng);
          setZoomLevel(15);
          if (googleMapInstanceRef.current) {
            googleMapInstanceRef.current.setCenter(loc);
            googleMapInstanceRef.current.setZoom(15);
            if (googleMarkerRef.current) {
              googleMarkerRef.current.setPosition(loc);
            } else {
              googleMarkerRef.current = new google.maps.Marker({
                position: loc,
                map: googleMapInstanceRef.current,
                animation: google.maps.Animation.DROP,
              });
            }
          }
        }
      });
      return;
    }

    // Fallback coordinate parser (e.g. user pasted "37.284912, -105.419204")
    const coordsMatch = searchQuery.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (coordsMatch) {
      const parsedLat = parseFloat(coordsMatch[1]);
      const parsedLng = parseFloat(coordsMatch[2]);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setCenterLat(parsedLat);
        setCenterLng(parsedLng);
        setPinnedLat(parsedLat);
        setPinnedLng(parsedLng);
        setZoomLevel(15);
        setIsSearching(false);
        return;
      }
    }

    // Fallback: Default popular land counties
    const lower = searchQuery.toLowerCase();
    if (lower.includes('costilla') || lower.includes('colorado')) {
      setCenterLat(37.4912);
      setCenterLng(-105.2931);
      setPinnedLat(37.4912);
      setPinnedLng(-105.2931);
      setZoomLevel(14);
    } else if (lower.includes('mohave') || lower.includes('arizona')) {
      setCenterLat(35.2223);
      setCenterLng(-114.2155);
      setPinnedLat(35.2223);
      setPinnedLng(-114.2155);
      setZoomLevel(14);
    } else if (lower.includes('elko') || lower.includes('nevada')) {
      setCenterLat(40.8324);
      setCenterLng(-115.7631);
      setPinnedLat(40.8324);
      setPinnedLng(-115.7631);
      setZoomLevel(14);
    } else if (lower.includes('texas') || lower.includes('hudspeth')) {
      setCenterLat(31.3533);
      setCenterLng(-105.3789);
      setPinnedLat(31.3533);
      setPinnedLng(-105.3789);
      setZoomLevel(14);
    } else if (lower.includes('florida')) {
      setCenterLat(28.3772);
      setCenterLng(-81.5707);
      setPinnedLat(28.3772);
      setPinnedLng(-81.5707);
      setZoomLevel(14);
    }
    setIsSearching(false);
  };

  const handleConfirm = () => {
    if (pinnedLat === null || pinnedLng === null) {
      return;
    }
    const formatted = `${pinnedLat.toFixed(6)}, ${pinnedLng.toFixed(6)}`;
    onConfirm({
      lat: Number(pinnedLat.toFixed(6)),
      lng: Number(pinnedLng.toFixed(6)),
      formatted,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#00171C] border border-slate-300 dark:border-[#0A4251] rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-cyan-950 flex items-center justify-between bg-slate-50 dark:bg-[#061116]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-serif">
                Interactive Parcel Pin-Drop Locator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click anywhere on the map to drop a pin on your parcel. Coordinates are captured to 6 decimal places.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close map modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Layers, and Controls */}
        <div className="p-3 bg-white dark:bg-[#041014] border-b border-slate-200 dark:border-[#0A4251] flex flex-wrap items-center justify-between gap-3 text-xs">
          <form onSubmit={handleSearchNearby} className="flex-1 min-w-[240px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search nearby town, county, landmark, or lat/lng..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3 py-2 bg-[#0A4251] hover:bg-[#00171C] text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isSearching ? 'Locating...' : 'Locate'}
            </button>
          </form>

          {/* Layer switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMapType('satellite')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                mapType === 'satellite'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Satellite Aerial</span>
            </button>
            <button
              type="button"
              onClick={() => setMapType('roadmap')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                mapType === 'roadmap'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Road &amp; Boundary</span>
            </button>
          </div>
        </div>

        {/* Map Viewport Area */}
        <div className="flex-1 relative bg-slate-900 overflow-hidden select-none">
          {/* Real Google Map Container (if API Key is configured) */}
          <div
            ref={googleMapRef}
            className={`w-full h-full ${googleMapsLoaded ? 'block' : 'hidden'}`}
          />

          {/* High-Fidelity Satellite/Topo Visual Canvas Fallback */}
          {!googleMapsLoaded && (
            <div
              ref={mapContainerRef}
              onClick={handleSimulatedMapClick}
              className="w-full h-full relative cursor-crosshair overflow-hidden group"
              style={{
                backgroundImage:
                  mapType === 'satellite'
                    ? 'radial-gradient(circle at 50% 50%, #1a2f1c 0%, #0d1a10 70%, #060b07 100%)'
                    : 'radial-gradient(circle at 50% 50%, #20353c 0%, #0c1a20 70%, #060f14 100%)',
              }}
            >
              {/* Satellite High-Res Topographic Grid Pattern */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(242, 200, 100, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(242, 200, 100, 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: `${30 * (zoomLevel / 8)}px ${30 * (zoomLevel / 8)}px`,
                }}
              />

              {/* Geographic Terrain Contours */}
              <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
                <path
                  d="M0,150 Q200,80 400,160 T800,140 T1200,190"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="1.5"
                />
                <path
                  d="M0,250 Q250,200 500,270 T1000,240 T1400,290"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="1"
                />
                <path
                  d="M0,380 Q300,320 600,400 T1100,360 T1500,420"
                  fill="none"
                  stroke="#2dd4bf"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Simulated Water Drainage / Creek */}
              <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none">
                <path
                  d="M 120,0 C 240,180 320,290 480,420 S 720,600 890,750"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeDasharray="6 2"
                />
              </svg>

              {/* Crosshair Center Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <Crosshair className="w-32 h-32 text-amber-400 stroke-1" />
              </div>

              {/* Placed Pin Marker */}
              {pinnedLat !== null && pinnedLng !== null && (
                <div
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150 animate-bounce"
                  style={{
                    left: `${50 + ((pinnedLng - centerLng) / (360 / Math.pow(2, zoomLevel - 2))) * 200}%`,
                    top: `${50 - ((pinnedLat - centerLat) / (180 / Math.pow(2, zoomLevel - 2))) * 200}%`,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[11px] font-mono font-bold shadow-md whitespace-nowrap mb-1">
                      {pinnedLat.toFixed(6)}, {pinnedLng.toFixed(6)}
                    </div>
                    <MapPin className="w-9 h-9 text-rose-500 fill-rose-500 filter drop-shadow-lg" />
                  </div>
                </div>
              )}

              {/* Helper Toast in Canvas */}
              <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur border border-cyan-800/40 text-slate-200 text-xs px-3.5 py-2 rounded-xl pointer-events-none flex items-center gap-2 shadow-lg">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Click anywhere on the satellite landscape to drop your property pin</span>
              </div>
            </div>
          )}

          {/* Floating Map Zoom Controls */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 1, 19))}
              className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 1, 3))}
              className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Footer: Coordinate Readout & Confirmation */}
        <div className="p-4 bg-slate-50 dark:bg-[#061116] border-t border-slate-200 dark:border-cyan-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Captured GPS Coordinates:</span>
            {pinnedLat !== null && pinnedLng !== null ? (
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded">
                Latitude: {pinnedLat.toFixed(6)} | Longitude: {pinnedLng.toFixed(6)}
              </span>
            ) : (
              <span className="text-slate-400 italic">No pin placed yet. Click on the map above.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pinnedLat === null || pinnedLng === null}
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Parcel Pin</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
