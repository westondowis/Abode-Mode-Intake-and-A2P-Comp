import React, { useState, useEffect, useCallback } from 'react';
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
  Layers,
  Info,
  AlertTriangle,
} from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';

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
  // Center defaults: USA geographic center or provided initial coordinates
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: initialCoordinates?.lat ?? 31.9686, // Default Texas/Southern land corridor
    lng: initialCoordinates?.lng ?? -99.9018,
  });
  const [pinnedPosition, setPinnedPosition] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates ?? null
  );
  const [zoom, setZoom] = useState<number>(initialCoordinates ? 15 : 6);
  const [mapTypeId, setMapTypeId] = useState<string>('hybrid');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      if (initialCoordinates) {
        setCenter(initialCoordinates);
        setPinnedPosition(initialCoordinates);
        setZoom(16);
      }
      if (initialSearchQuery) {
        setSearchQuery(initialSearchQuery);
      }
      setErrorMessage(null);
    }
  }, [isOpen, initialCoordinates, initialSearchQuery]);

  // Handle map click to drop or move pin
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    if (e.detail?.latLng) {
      const newPos = {
        lat: Number(e.detail.latLng.lat.toFixed(6)),
        lng: Number(e.detail.latLng.lng.toFixed(6)),
      };
      setPinnedPosition(newPos);
      setErrorMessage(null);
    }
  }, []);

  // Handle marker drag end
  const handleMarkerDragEnd = useCallback((e: any) => {
    if (e.latLng) {
      const newPos = {
        lat: Number(e.latLng.lat().toFixed(6)),
        lng: Number(e.latLng.lng().toFixed(6)),
      };
      setPinnedPosition(newPos);
      setErrorMessage(null);
    }
  }, []);

  // Search address, county, or APN description using Google Geocoding API REST client-safe wrapper
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !apiKey) return;

    setIsGeocoding(true);
    setErrorMessage(null);

    try {
      // Use Google Geocoding API via client fetch or window.google.maps.Geocoder
      if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
          setIsGeocoding(false);
          if (status === 'OK' && results && results[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            const newCenter = {
              lat: Number(loc.lat().toFixed(6)),
              lng: Number(loc.lng().toFixed(6)),
            };
            setCenter(newCenter);
            setPinnedPosition(newCenter);
            setZoom(14);
          } else {
            setErrorMessage(`Could not find "${searchQuery}". Please refine county, city, or state.`);
          }
        });
      } else {
        // Direct REST fallback
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            searchQuery
          )}&key=${apiKey}`
        );
        const data = await res.json();
        setIsGeocoding(false);
        if (data.status === 'OK' && data.results && data.results[0]?.geometry?.location) {
          const loc = data.results[0].geometry.location;
          const newCenter = {
            lat: Number(loc.lat.toFixed(6)),
            lng: Number(loc.lng.toFixed(6)),
          };
          setCenter(newCenter);
          setPinnedPosition(newCenter);
          setZoom(14);
        } else {
          setErrorMessage(`Location not found. Try searching by County & State.`);
        }
      }
    } catch (err) {
      setIsGeocoding(false);
      setErrorMessage('Search error. You can manually pan the map and click to pin.');
    }
  };

  // Center on current device location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGeocoding(false);
        const userLoc = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        setCenter(userLoc);
        setPinnedPosition(userLoc);
        setZoom(16);
      },
      (err) => {
        setIsGeocoding(false);
        setErrorMessage('Location permission denied or unavailable.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleConfirm = () => {
    if (!pinnedPosition) {
      setErrorMessage('Please click on the map to drop a pin on your parcel.');
      return;
    }

    const formatted = `${pinnedPosition.lat.toFixed(6)}, ${pinnedPosition.lng.toFixed(6)}`;
    onConfirm({
      lat: pinnedPosition.lat,
      lng: pinnedPosition.lng,
      formatted,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[800px] bg-white dark:bg-[#06141a] border border-slate-200 dark:border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* HEADER BAR */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-cyan-950/80 bg-slate-50/80 dark:bg-[#030d12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-teal-500/20 border border-amber-500/40 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold cinzel-text text-slate-900 dark:text-white">
                  Interactive Parcel Pin-Drop
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                  Google Maps Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click anywhere on the satellite view to drop or drag your parcel pin to output exact GPS coordinates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close pin-drop modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH & CONTROLS TOOLBAR */}
        <div className="p-3 bg-slate-100/90 dark:bg-[#040e13] border-b border-slate-200 dark:border-cyan-950/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          {/* Address / County Search Input */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[260px] flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search County, State, or nearest street..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={isGeocoding}
              className="px-3 py-1.5 bg-[#0A4251] hover:bg-[#00171C] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              {isGeocoding ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Fly to Area</span>
              )}
            </button>
          </form>

          {/* Map Controls */}
          <div className="flex items-center gap-1.5">
            {/* Map Type Toggle */}
            <div className="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMapTypeId('hybrid')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  mapTypeId === 'hybrid'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950'
                }`}
                title="Satellite Hybrid View"
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
                title="Roadmap View"
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
                title="Topographical Terrain View"
              >
                Terrain
              </button>
            </div>

            {/* Locate Me Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isGeocoding}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              title="Center on my current GPS location"
            >
              <Crosshair className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
            </button>
          </div>

        </div>

        {/* ERROR / NOTICE BANNER */}
        {errorMessage && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-bold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* MAP CANVAS VIEWPORT */}
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
                onClick={handleMapClick}
                gestureHandling="greedy"
                disableDefaultUI={false}
                zoomControl={true}
                scaleControl={true}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              >
                {pinnedPosition && (
                  <AdvancedMarker
                    position={pinnedPosition}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
                    title="Target Land Parcel"
                  >
                    <Pin
                      background="#F59E0B"
                      glyphColor="#00171C"
                      borderColor="#FFFFFF"
                      scale={1.2}
                    />
                  </AdvancedMarker>
                )}
              </Map>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Globe className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-200">
                Google Maps Platform API Key Required
              </p>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Please ensure VITE_GOOGLE_MAPS_API_KEY is configured in your environment to load the high-resolution satellite imagery.
              </p>
            </div>
          )}

          {/* Floating Instructions Helper Overlay */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none hidden sm:block">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-white px-3 py-2 rounded-xl text-[11px] shadow-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Click anywhere on the terrain to place or drag your parcel pin</span>
            </div>
          </div>
        </div>

        {/* FOOTER BAR WITH COORDINATES AND CONFIRM BUTTON */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-cyan-950/80 bg-slate-50/90 dark:bg-[#030d12] flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Coordinates Display */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Pinned GPS Coordinates:
            </span>
            {pinnedPosition ? (
              <span className="font-mono font-bold text-slate-900 dark:text-amber-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                {pinnedPosition.lat.toFixed(6)}, {pinnedPosition.lng.toFixed(6)}
              </span>
            ) : (
              <span className="text-slate-400 italic">No pin placed yet</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!pinnedPosition}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer font-serif"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Parcel Coordinates</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
