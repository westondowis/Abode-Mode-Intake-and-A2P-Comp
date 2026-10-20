import React, { useState, useEffect } from 'react';
import { FormStepWrapper } from '../components/FormStepWrapper';
import { InteractiveMap } from '../components/InteractiveMap';
import { BuyLead } from '../types';
import { saveLead } from '../services/leadsStorage';
import { syncLeadToGoogleWorkspace } from '../services/googleWorkspace';
import {
  CheckCircle2,
  DollarSign,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  CheckSquare,
  Users,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Search,
  X,
  Filter,
  Check,
  Tag,
  Compass,
} from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { googleSignIn } from '../services/firebaseAuth';
import { BrokerAvatar } from '../components/brand/BrokerAvatar';
import { AbodeWordmark } from '../components/brand/AbodeWordmark';
import {
  AvailablePropertyListing,
  getAllAvailableListings,
} from '../data/availableListings';
import { resolveLocationQuery } from '../utils/zipGeocode';

interface BuyLandPageProps {
  onNavigate: (route: string) => void;
  onOpenReview: (leadId: string) => void;
  accessToken: string | null;
  onAuthSuccess: (token: string) => void;
}

const US_STATES = [
  'Texas',
  'Colorado',
  'Arizona',
  'New Mexico',
  'Florida',
  'Tennessee',
  'North Carolina',
  'Georgia',
  'Nevada',
  'Wyoming',
  'Montana',
  'Washington',
  'California',
  'Idaho',
  'Arkansas',
  'Missouri',
];

const ZONING_OPTIONS = [
  'Rural Residential / Single Family',
  'Agricultural / Ranch / Farm',
  'Recreational / Hunting / Off-Grid',
  'Unrestricted (No HOA / CC&Rs)',
  'Commercial / Light Industrial',
  'Mobile / Manufactured Home Allowed',
  'Tiny Home / RV Camping Allowed',
];

const FEATURE_OPTIONS = [
  'Direct Paved Road Access',
  'Power / Electric Line at Street',
  'Municipal Water or Existing Well',
  'Mature Trees / Forest Cover',
  'Mountain or Elevated Views',
  'Creek / River / Lake Frontage',
  'Flat / 100% Buildable Topography',
  'Mineral & Water Rights Included',
];

const BUDGET_OPTIONS = [
  'Under $25,000',
  '$25,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000 - $250,000',
  '$250,000 - $500,000',
  '$500,000+',
];

export const BuyLandPage: React.FC<BuyLandPageProps> = ({
  onNavigate,
  onOpenReview,
  accessToken,
  onAuthSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<BuyLead | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    taskSuccess: boolean;
    contactSuccess: boolean;
    taskError?: string | null;
    contactError?: string | null;
  } | null>(null);

  // Form State
  const [targetStates, setTargetStates] = useState<string[]>(['Colorado', 'New Mexico']);
  const [targetCounties, setTargetCounties] = useState('');
  const [minAcreage, setMinAcreage] = useState<string>('2');
  const [maxAcreage, setMaxAcreage] = useState<string>('20');
  const [budgetRange, setBudgetRange] = useState<string>('$50,000 - $100,000');
  const [targetZoning, setTargetZoning] = useState<string[]>([
    'Rural Residential / Single Family',
    'Recreational / Hunting / Off-Grid',
  ]);
  const [mustHaveFeatures, setMustHaveFeatures] = useState<string[]>([
    'Direct Paved Road Access',
    'Mountain or Elevated Views',
  ]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(
    { lat: 37.4912, lng: -105.2931 }
  );
  const [targetLocationName, setTargetLocationName] = useState<string>(
    'Costilla County, CO (Sangre de Cristo Foothills)'
  );

  // Property Search & Dynamic Mapping State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStateFilter, setActiveStateFilter] = useState('ALL');
  const [availableListings, setAvailableListings] = useState<AvailablePropertyListing[]>([]);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>('prop-co-81133');

  // Load available listings on mount
  useEffect(() => {
    const listings = getAllAvailableListings();
    setAvailableListings(listings);
  }, []);

  // Filter available listings dynamically by zip code, state, or county
  const filteredListings = availableListings.filter((parcel) => {
    const query = searchQuery.trim().toLowerCase();
    const stateMatches =
      activeStateFilter === 'ALL' || parcel.stateCode.toUpperCase() === activeStateFilter.toUpperCase();

    if (!query) return stateMatches;

    const matchesZip = parcel.zipCode.toLowerCase().includes(query);
    const matchesState =
      parcel.state.toLowerCase().includes(query) ||
      parcel.stateCode.toLowerCase() === query;
    const matchesCounty = parcel.county.toLowerCase().includes(query);
    const matchesTitle = parcel.title.toLowerCase().includes(query);
    const matchesApn = parcel.apn.toLowerCase().includes(query);

    return (matchesZip || matchesState || matchesCounty || matchesTitle || matchesApn) && stateMatches;
  });

  // Handle Search Input Change with dynamic geocoding
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    // Resolve location to coordinates for dynamic map update
    const resolved = resolveLocationQuery(value);
    if (resolved) {
      setSelectedCoordinates({ lat: resolved.lat, lng: resolved.lng });
      setTargetLocationName(resolved.label);

      // Auto-update criteria state if resolved to a recognized state
      if (resolved.state && !targetStates.includes(resolved.state)) {
        setTargetStates((prev) => [resolved.state, ...prev.filter((s) => s !== resolved.state)]);
      }
      if (resolved.county && !resolved.county.includes('Assessor')) {
        setTargetCounties(resolved.county);
      }
    }
  };

  // Handle selecting an available parcel listing card
  const handleSelectParcel = (parcel: AvailablePropertyListing) => {
    setSelectedParcelId(parcel.id);
    setSelectedCoordinates({ lat: parcel.lat, lng: parcel.lng });
    setTargetLocationName(`${parcel.address} (${parcel.zipCode})`);

    // Synchronize form criteria
    if (!targetStates.includes(parcel.state)) {
      setTargetStates((prev) => [parcel.state, ...prev.filter((s) => s !== parcel.state)]);
    }
    setTargetCounties(parcel.county);
    setMinAcreage(Math.max(1, Math.floor(parcel.acreage * 0.8)).toString());
    setMaxAcreage(Math.ceil(parcel.acreage * 1.5).toString());
  };

  // Step 2 State
  const [purchasingTimeline, setPurchasingTimeline] = useState('Immediately (< 30 days)');
  const [fundingSource, setFundingSource] = useState('Cash (Liquid Funds Ready)');
  const [plannedUse, setPlannedUse] = useState('Homestead / Off-Grid Cabin');
  const [specialRequests, setSpecialRequests] = useState('');

  // Step 3 State
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'phone' | 'email' | 'text'>('email');
  const [isRealEstateProfessional, setIsRealEstateProfessional] = useState(false);

  const toggleState = (stateName: string) => {
    setTargetStates((prev) =>
      prev.includes(stateName) ? prev.filter((s) => s !== stateName) : [...prev, stateName]
    );
  };

  const toggleZoning = (item: string) => {
    setTargetZoning((prev) =>
      prev.includes(item) ? prev.filter((z) => z !== item) : [...prev, item]
    );
  };

  const toggleFeature = (item: string) => {
    setMustHaveFeatures((prev) =>
      prev.includes(item) ? prev.filter((f) => f !== item) : [...prev, item]
    );
  };

  const handleMapLocationSelect = (loc: {
    lat: number;
    lng: number;
    address?: string;
    county?: string;
    state?: string;
  }) => {
    setSelectedCoordinates({ lat: loc.lat, lng: loc.lng });
    if (loc.address) {
      setTargetLocationName(loc.address);
    }
    if (loc.county && !targetCounties) {
      setTargetCounties(loc.county);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const leadId = `lead-b-${Date.now().toString().slice(-5)}`;
    const newLead: BuyLead = {
      id: leadId,
      type: 'buy',
      status: 'new',
      createdAt: new Date().toISOString(),
      targetStates,
      targetCounties,
      minAcreage,
      maxAcreage,
      budgetRange,
      targetZoning,
      mustHaveFeatures,
      coordinates: selectedCoordinates || undefined,
      targetLocationName,
      purchasingTimeline,
      fundingSource,
      plannedUse,
      specialRequests,
      buyerName: buyerName.trim() || 'Valued Land Buyer',
      buyerPhone: buyerPhone.trim() || '(Unlisted)',
      buyerEmail: buyerEmail.trim() || 'buyer@example.com',
      preferredContactMethod,
      isRealEstateProfessional,
    };

    saveLead(newLead);
    setSubmittedLead(newLead);

    // Automatic Google Workspace Integration (Tasks & Contacts)
    if (accessToken) {
      try {
        const syncResult = await syncLeadToGoogleWorkspace(newLead, accessToken);
        setSyncStatus({
          taskSuccess: !!syncResult.taskResult,
          contactSuccess: !!syncResult.contactResult,
          taskError: syncResult.taskError,
          contactError: syncResult.contactError,
        });
      } catch (err: unknown) {
        console.error('Workspace automatic sync error', err);
      }
    }

    setIsSubmitting(false);
  };

  // Step Names for Indicator
  const stepNames = ['Target & Map', 'Terms & Use', 'Buyer Contact'];

  // Completed State View
  if (submittedLead) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#00171C] border-2 border-[#F2C864]/50 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <BrokerAvatar size="lg" variant="circle" className="ring-2 ring-[#F2C864] shadow-2xl" />
          </div>

          <div>
            <span className="text-xs font-mono text-[#F2C864] uppercase tracking-widest font-bold">
              Criteria Registered • ID #{submittedLead.id}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2 font-['Plus_Jakarta_Sans']">
              Your Land Match Profile is Active
            </h1>
            <p className="mt-3 text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
              We have indexed your criteria across our private acquisition pipeline at ABODE-MODE LLC. Whenever an off-market parcel matching your specs is contracted, you will receive first notification.
            </p>
          </div>

          {/* Google Workspace Integration Notification Card */}
          <div className="p-5 rounded-2xl bg-[#0c141d] border border-slate-700/80 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" /> Google Workspace Automation
              </span>
              <span className="text-[11px] text-slate-400">Live API</span>
            </div>

            {accessToken ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/30">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-teal-400" />
                    <span className="text-slate-200">
                      <strong>Google Task:</strong> Review task automatically created in your Google Tasks!
                    </span>
                  </div>
                  <span className="text-teal-400 font-semibold text-[11px]">Synced</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-200">
                      <strong>Google Contacts:</strong> {submittedLead.buyerName} saved as a new contact in People API!
                    </span>
                  </div>
                  <span className="text-sky-400 font-semibold text-[11px]">Saved</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Connect your Google account to auto-generate review tasks and save this buyer into your Contacts:
                </span>
                <GoogleSignInButton
                  text="Connect Google"
                  onClick={async () => {
                    const res = await googleSignIn();
                    if (res?.accessToken) {
                      onAuthSuccess(res.accessToken);
                      await syncLeadToGoogleWorkspace(submittedLead, res.accessToken);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenReview(submittedLead.id)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>View Submitted Criteria Record</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormStepWrapper
      currentStep={currentStep}
      totalSteps={3}
      stepNames={stepNames}
      title={
        currentStep === 1
          ? 'What land are you looking for?'
          : currentStep === 2
          ? 'Timeline & Acquisition Terms'
          : 'Buyer Contact & Verification'
      }
      subtitle={
        currentStep === 1
          ? 'Tell us your target area and must-haves. Select multiple where it applies.'
          : currentStep === 2
          ? 'Specify your timeframe, purchasing structure, and intended property use.'
          : 'Provide your contact details so our disposition team can match you with incoming parcels.'
      }
      onNext={
        currentStep < 3
          ? () => setCurrentStep((s) => s + 1)
          : handleSubmit
      }
      onBack={currentStep > 1 ? () => setCurrentStep((s) => s - 1) : undefined}
      nextLabel={currentStep === 3 ? 'Submit Buying Criteria' : 'Next Step'}
      isSubmitting={isSubmitting}
      isNextDisabled={
        currentStep === 3 && (!buyerName.trim() || !buyerEmail.trim())
      }
    >
      {/* STEP 1: Map + Land Criteria */}
      {currentStep === 1 && (
        <div className="space-y-8">
          {/* Property Listing Search Bar Filter (by Zip Code or State) */}
          <div className="p-5 rounded-2xl bg-[#00171C] border border-[#0A4251] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#F2C864] flex items-center gap-2">
                <Search className="w-4 h-4 text-[#F2C864]" />
                <span>Search Available Land Listings by Zip Code or State</span>
              </label>
              <span className="text-[11px] text-[#88BBD8] font-mono">
                {filteredListings.length} of {availableListings.length} Parcels Matched
              </span>
            </div>

            {/* Input with Instant Live Geocoding */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#88BBD8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Enter Zip Code (e.g. 81133, 87002, 75751, 86413) or State (e.g. Colorado, TX, NM, Arizona)..."
                className="w-full bg-[#00171C] text-sm text-slate-100 placeholder:text-slate-500 rounded-xl pl-10 pr-10 py-3 border border-[#0A4251] focus:outline-none focus:border-[#F2C864] focus:ring-1 focus:ring-[#F2C864]/40 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#0A4251]/50 transition-colors"
                  title="Clear search filter"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick State Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-slate-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#F2C864]" /> Quick State:
              </span>
              {[
                { code: 'ALL', label: 'All Inventory' },
                { code: 'CO', label: 'Colorado (CO)' },
                { code: 'TX', label: 'Texas (TX)' },
                { code: 'NM', label: 'New Mexico (NM)' },
                { code: 'AZ', label: 'Arizona (AZ)' },
                { code: 'FL', label: 'Florida (FL)' },
                { code: 'NV', label: 'Nevada (NV)' },
                { code: 'WY', label: 'Wyoming (WY)' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setActiveStateFilter(item.code)}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap border text-xs font-semibold transition-all ${
                    activeStateFilter === item.code
                      ? 'bg-[#0A4251] border-[#F2C864] text-[#F2C864] shadow-md'
                      : 'bg-[#00171C] border-[#0A4251]/70 text-slate-400 hover:border-[#0A4251] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Interactive Parcel Mapping View */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#F2C864]">
                Dynamic Parcel GIS Mapping View
              </label>
              <span className="text-[11px] text-slate-400">
                Click pins on the map or property cards below to focus
              </span>
            </div>
            <InteractiveMap
              mode="buy"
              selectedCoordinates={selectedCoordinates}
              onLocationSelect={handleMapLocationSelect}
              availableParcels={filteredListings}
              selectedParcelId={selectedParcelId}
              onSelectParcel={handleSelectParcel}
              searchFilterText={searchQuery}
            />
          </div>

          {/* Available Property Listings Cards Grid (Filtered Dynamically) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#F2C864]" />
                <span>Available Land Listings ({filteredListings.length})</span>
              </h3>
              {selectedParcelId && (
                <span className="text-xs text-[#88BBD8]">
                  Selected parcel pinned on map
                </span>
              )}
            </div>

            {filteredListings.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#00171C] border border-[#0A4251] text-center space-y-2">
                <Compass className="w-8 h-8 text-[#88BBD8] mx-auto opacity-70" />
                <p className="text-sm font-semibold text-white">
                  No property listings directly match "{searchQuery}"
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  The parcel map above has been dynamically centered on your queried area. You can still submit your buying criteria below to acquire custom off-market land in this location!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveStateFilter('ALL');
                  }}
                  className="mt-2 px-4 py-1.5 rounded-xl bg-[#0A4251] hover:bg-[#0e5264] border border-[#F2C864]/40 text-[#F2C864] text-xs font-bold transition-colors"
                >
                  Reset Search Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map((parcel) => {
                  const isSelected = selectedParcelId === parcel.id;
                  return (
                    <div
                      key={parcel.id}
                      onClick={() => handleSelectParcel(parcel)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-[#0A4251]/40 border-[#F2C864] shadow-xl ring-1 ring-[#F2C864]/50'
                          : 'bg-[#00171C] border-[#0A4251] hover:border-[#F2C864]/50 hover:bg-[#0A4251]/20'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top row: Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#F2C864]/15 border border-[#F2C864]/40 text-[#F2C864] text-[10px] font-bold uppercase font-mono">
                              Zip: {parcel.zipCode}
                            </span>
                            <span className="text-xs font-semibold text-[#88BBD8]">
                              {parcel.county} Co, {parcel.stateCode}
                            </span>
                          </div>
                          <span className="text-sm font-mono font-extrabold text-emerald-400">
                            {parcel.askingPrice}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-[#F2C864] transition-colors">
                            {parcel.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {parcel.description}
                          </p>
                        </div>

                        {/* Specs Pill Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-[#00171C] border border-[#0A4251] text-slate-200">
                            <strong>{parcel.acreage}</strong> Acres
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#00171C] border border-[#0A4251] text-slate-300">
                            {parcel.zoning}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#00171C] border border-[#0A4251] text-slate-400">
                            APN: <span className="font-mono">{parcel.apn}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="mt-3 pt-3 border-t border-[#0A4251]/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Road: {parcel.roadAccess}
                        </span>
                        <span
                          className={`font-semibold text-xs flex items-center gap-1 transition-colors ${
                            isSelected ? 'text-[#F2C864]' : 'text-slate-400 group-hover:text-white'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Pinned to Map</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3.5 h-3.5 text-[#F2C864]" />
                              <span>Select & Map</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Target States Multi-select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Target State(s) <span className="text-slate-500 font-normal">(Select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {US_STATES.map((state) => {
                const selected = targetStates.includes(state);
                return (
                  <button
                    key={state}
                    type="button"
                    onClick={() => toggleState(state)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-teal-950/80 border-teal-500 text-teal-200 font-semibold shadow-sm'
                        : 'bg-[#121c27] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {state} {selected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Counties & Acreage in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Specific Counties or Regions (Optional)
              </label>
              <input
                type="text"
                value={targetCounties}
                onChange={(e) => setTargetCounties(e.target.value)}
                placeholder="e.g. Costilla, Henderson, Valencia, Mohave"
                className="w-full bg-[#121c27] text-sm text-slate-100 placeholder:text-slate-500 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Desired Acreage Range
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0.25"
                  step="0.5"
                  value={minAcreage}
                  onChange={(e) => setMinAcreage(e.target.value)}
                  placeholder="Min Acres"
                  className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
                />
                <span className="text-slate-500 font-medium text-sm">to</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={maxAcreage}
                  onChange={(e) => setMaxAcreage(e.target.value)}
                  placeholder="Max Acres"
                  className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Budget Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Target Budget Allocation
            </label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0f1722] text-slate-100">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Zoning Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Preferred Zoning & Permitted Uses (Select Multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ZONING_OPTIONS.map((item) => {
                const checked = targetZoning.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-teal-950/40 border-teal-500/70 text-teal-200'
                        : 'bg-[#121c27] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleZoning(item)}
                      className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-500/30 bg-[#0c141d]"
                    />
                    <span className="text-xs font-medium">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Must Have Features Checkboxes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Must-Have Land Features (Select Multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FEATURE_OPTIONS.map((item) => {
                const checked = mustHaveFeatures.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-cyan-950/40 border-cyan-500/70 text-cyan-200'
                        : 'bg-[#121c27] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleFeature(item)}
                      className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500/30 bg-[#0c141d]"
                    />
                    <span className="text-xs font-medium">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Timeline & Financing */}
      {currentStep === 2 && (
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Purchasing Timeframe
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Immediately (< 30 days)',
                '1 to 3 Months',
                '3 to 6 Months',
                'Just exploring / opportunistic buyer',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPurchasingTimeline(opt)}
                  className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                    purchasingTimeline === opt
                      ? 'bg-teal-950/50 border-teal-500 text-teal-300 shadow-md'
                      : 'bg-[#121c27] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {purchasingTimeline === opt && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Preferred Funding Source
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                'Cash (Liquid Funds Ready)',
                'Owner / Seller Financing Desired',
                'Conventional Bank / Land Loan',
              ].map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setFundingSource(src)}
                  className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                    fundingSource === src
                      ? 'bg-cyan-950/50 border-cyan-500 text-cyan-300 shadow-md'
                      : 'bg-[#121c27] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Intended Property Use
            </label>
            <input
              type="text"
              value={plannedUse}
              onChange={(e) => setPlannedUse(e.target.value)}
              placeholder="e.g. Weekend retreat, solar homestead, long term hold, hunting camp"
              className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Special Requests or APN References (Optional)
            </label>
            <textarea
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any specific subdivisions, acreage configurations, or topography preferences..."
              className="w-full bg-[#121c27] text-sm text-slate-100 placeholder:text-slate-500 rounded-xl p-4 border border-slate-700/80 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}

      {/* STEP 3: Contact & Verification */}
      {currentStep === 3 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Full Name <span className="text-teal-400">*</span>
              </label>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Email Address <span className="text-teal-400">*</span>
              </label>
              <input
                type="email"
                required
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="e.g. john@example.com"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="e.g. (555) 234-5678"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Preferred Notification Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['email', 'phone', 'text'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPreferredContactMethod(method)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      preferredContactMethod === method
                        ? 'bg-teal-950/60 border-teal-500 text-teal-300'
                        : 'bg-[#121c27] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 p-4 rounded-xl bg-[#121c27] border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isRealEstateProfessional}
              onChange={(e) => setIsRealEstateProfessional(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-teal-500 bg-[#0c141d]"
            />
            <span className="text-xs text-slate-300">
              I am a licensed real estate broker, investor, or land fund representative.
            </span>
          </label>

          {/* Criteria Summary Card */}
          <div className="p-5 rounded-2xl bg-[#0d1622] border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-teal-400 font-bold uppercase tracking-wider">
                Summary of Your Criteria
              </span>
              <span className="text-slate-400">Step 1 & 2 Inputs</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-300">
              <div>
                <span className="text-slate-500 block">States:</span>
                <span className="font-semibold text-white">{targetStates.join(', ') || 'Any'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Acreage:</span>
                <span className="font-semibold text-teal-300">{minAcreage} - {maxAcreage} Acres</span>
              </div>
              <div>
                <span className="text-slate-500 block">Budget:</span>
                <span className="font-semibold text-emerald-400">{budgetRange}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormStepWrapper>
  );
};
