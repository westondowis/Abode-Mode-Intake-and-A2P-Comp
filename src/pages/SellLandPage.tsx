import React, { useState } from 'react';
import { FormStepWrapper } from '../components/FormStepWrapper';
import { InteractiveMap } from '../components/InteractiveMap';
import { SellLead } from '../types';
import { saveLead } from '../services/leadsStorage';
import { syncLeadToGoogleWorkspace } from '../services/googleWorkspace';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { googleSignIn } from '../services/firebaseAuth';
import { BrokerAvatar } from '../components/brand/BrokerAvatar';
import {
  CheckCircle2,
  DollarSign,
  MapPin,
  Clock,
  Sparkles,
  CheckSquare,
  Users,
  ExternalLink,
  ShieldCheck,
  Building,
  HelpCircle,
} from 'lucide-react';

interface SellLandPageProps {
  onNavigate: (route: string) => void;
  onOpenReview: (leadId: string) => void;
  accessToken: string | null;
  onAuthSuccess: (token: string) => void;
}

const TOPOGRAPHY_OPTIONS = [
  'Flat / Level Plateau',
  'Gentle Rolling Slopes',
  'Steep / Mountainous',
  'Dense Forest / Timberland',
  'Cleared / Pastureland',
  'Desert / Scrubland',
  'Wetland / Floodplain',
];

const UTILITY_ELECTRIC = [
  'Power lines at street / property line',
  'Power pole within 500 feet',
  'Solar only / Off-grid required',
  'No electrical / unknown',
];

const UTILITY_WATER = [
  'City / Municipal water line connected',
  'Private domestic well already installed',
  'Well required (standard for area)',
  'Cistern / Haul-in water',
  'Unknown',
];

const UTILITY_SEWER = [
  'Public municipal sewer available',
  'Septic tank already installed & permitted',
  'Septic needed (requires soil perc test)',
  'Alternative / Composting toilet',
  'Unknown',
];

const ROAD_ACCESS_OPTIONS = [
  'Paved County / State Highway',
  'County-maintained Gravel / Dirt Road',
  'Private Recorded Easement',
  'Unimproved 2-track trail (4x4 required)',
  'Landlocked / No deeded access',
];

export const SellLandPage: React.FC<SellLandPageProps> = ({
  onNavigate,
  onOpenReview,
  accessToken,
  onAuthSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<SellLead | null>(null);

  // STEP 1: Property Location
  const [address, setAddress] = useState('Forbes Park Lot 18');
  const [parcelNumber, setParcelNumber] = useState('702-19-440');
  const [county, setCounty] = useState('Costilla');
  const [state, setState] = useState('CO');
  const [city, setCity] = useState('Fort Garland');
  const [zipCode, setZipCode] = useState('81133');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 37.4912,
    lng: -105.2931,
  });

  // STEP 2: Property Characteristics
  const [acreage, setAcreage] = useState<string | number>('5.0');
  const [zoningType, setZoningType] = useState('Rural Residential / Estate');
  const [topography, setTopography] = useState<string[]>(['Gentle Rolling Slopes', 'Dense Forest / Timberland']);
  const [roadAccess, setRoadAccess] = useState(ROAD_ACCESS_OPTIONS[1]);

  // STEP 3: Utilities & Improvements
  const [electricity, setElectricity] = useState(UTILITY_ELECTRIC[1]);
  const [waterSource, setWaterSource] = useState(UTILITY_WATER[2]);
  const [sewer, setSewer] = useState(UTILITY_SEWER[2]);
  const [improvements, setImprovements] = useState<string[]>(['Survey markers present']);

  // STEP 4: Ownership & Title
  const [ownershipType, setOwnershipType] = useState('Sole Owner (Name on Deed)');
  const [yearsOwned, setYearsOwned] = useState('5 to 10 years');
  const [backTaxesOwed, setBackTaxesOwed] = useState('No back taxes owed (Current)');
  const [backTaxesAmount, setBackTaxesAmount] = useState('');
  const [hasLiensOrMortgages, setHasLiensOrMortgages] = useState('Free and clear (No mortgage or liens)');

  // STEP 5: Timeline & Pricing Expectation
  const [sellingTimeline, setSellingTimeline] = useState('Fast cash closing (< 14 days)');
  const [askingPriceExpectation, setAskingPriceExpectation] = useState('$22,000 cash offer');
  const [reasonForSelling, setReasonForSelling] = useState('Liquidating investment asset');

  // STEP 6: Seller Contact
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'phone' | 'email' | 'text'>('phone');
  const [additionalComments, setAdditionalComments] = useState('');

  const toggleTopography = (item: string) => {
    setTopography((prev) =>
      prev.includes(item) ? prev.filter((t) => t !== item) : [...prev, item]
    );
  };

  const handleMapLocationSelect = (loc: {
    lat: number;
    lng: number;
    address?: string;
    county?: string;
    state?: string;
    apn?: string;
    acreage?: number;
  }) => {
    setCoordinates({ lat: loc.lat, lng: loc.lng });
    if (loc.address) setAddress(loc.address);
    if (loc.county) setCounty(loc.county);
    if (loc.state) setState(loc.state);
    if (loc.apn) setParcelNumber(loc.apn);
    if (loc.acreage) setAcreage(loc.acreage);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const leadId = `lead-s-${Date.now().toString().slice(-5)}`;
    const newLead: SellLead = {
      id: leadId,
      type: 'sell',
      status: 'new',
      createdAt: new Date().toISOString(),
      address,
      parcelNumber,
      county,
      state,
      city,
      zipCode,
      coordinates,
      acreage,
      zoningType,
      topography,
      roadAccess,
      electricity,
      waterSource,
      sewer,
      improvements,
      ownershipType,
      yearsOwned,
      backTaxesOwed,
      backTaxesAmount: backTaxesAmount || undefined,
      hasLiensOrMortgages,
      sellingTimeline,
      askingPriceExpectation,
      reasonForSelling,
      sellerName: sellerName.trim() || 'Land Owner',
      sellerPhone: sellerPhone.trim() || '(Unlisted)',
      sellerEmail: sellerEmail.trim() || 'owner@example.com',
      mailingAddress: mailingAddress.trim() || undefined,
      preferredContactMethod,
      additionalComments,
    };

    saveLead(newLead);
    setSubmittedLead(newLead);

    // Automatic Google Workspace Integration (Tasks & Contacts)
    if (accessToken) {
      try {
        await syncLeadToGoogleWorkspace(newLead, accessToken);
      } catch (err: unknown) {
        console.error('Workspace automatic sync error', err);
      }
    }

    setIsSubmitting(false);
  };

  const stepNames = [
    'Property GIS',
    'Characteristics',
    'Utilities',
    'Title & Ownership',
    'Timeline & Price',
    'Seller Review',
  ];

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
              Parcel Intake Confirmed • Submission #{submittedLead.id}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-2 font-['Plus_Jakarta_Sans']">
              Property Under Review for Cash Offer
            </h1>
            <p className="mt-3 text-slate-300 max-w-lg mx-auto text-sm leading-relaxed">
              Our underwriting specialists at ABODE-MODE LLC are analyzing county GIS records, recent comparable land sales, and access easements for {submittedLead.county}, {submittedLead.state}. Expect an offer proposal within 24 to 48 hours.
            </p>
          </div>

          {/* Google Workspace Integration Notification Card */}
          <div className="p-5 rounded-2xl bg-[#0c141d] border border-slate-700/80 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" /> Google Workspace Automation
              </span>
              <span className="text-[11px] text-slate-400">Integrated Flow</span>
            </div>

            {accessToken ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/30">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-teal-400" />
                    <span className="text-slate-200">
                      <strong>Google Tasks:</strong> Automatic review task created with form summary & direct link!
                    </span>
                  </div>
                  <span className="text-teal-400 font-semibold text-[11px]">Created</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span className="text-slate-200">
                      <strong>Google Contacts:</strong> {submittedLead.sellerName} saved as a new contact in People API!
                    </span>
                  </div>
                  <span className="text-sky-400 font-semibold text-[11px]">Saved</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Connect your Google account to auto-create follow-up tasks and save this seller into Google Contacts:
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
              <span>View Filled Out Form Review</span>
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
      totalSteps={6}
      stepNames={stepNames}
      title={
        currentStep === 1
          ? 'Locate your property'
          : currentStep === 2
          ? 'Property Details & Characteristics'
          : currentStep === 3
          ? 'Utilities & Improvements'
          : currentStep === 4
          ? 'Ownership & Title Status'
          : currentStep === 5
          ? 'Timeline & Pricing Expectation'
          : 'Seller Contact & Review'
      }
      subtitle={
        currentStep === 1
          ? 'Search by street address, parcel number (APN), county, city, state, or ZIP code — or click directly on the map.'
          : currentStep === 2
          ? 'Specify acreage, topography, and legal road access for underwriting accuracy.'
          : currentStep === 3
          ? 'Indicate the presence of electricity, water, sewer, and any structures.'
          : currentStep === 4
          ? 'Clarify deed title status, back taxes, and whether any mortgages exist.'
          : currentStep === 5
          ? 'Tell us how quickly you wish to close and your ideal cash payout expectation.'
          : 'Review your submission summary and enter your contact details to receive your formal offer.'
      }
      onNext={
        currentStep < 6
          ? () => setCurrentStep((s) => s + 1)
          : handleSubmit
      }
      onBack={currentStep > 1 ? () => setCurrentStep((s) => s - 1) : undefined}
      nextLabel={currentStep === 6 ? 'Submit Property for Cash Offer' : 'Next Step'}
      isSubmitting={isSubmitting}
      isNextDisabled={
        currentStep === 6 && (!sellerName.trim() || !sellerEmail.trim())
      }
    >
      {/* STEP 1: Locate Property */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <InteractiveMap
            mode="sell"
            initialAddress={address}
            initialApn={parcelNumber}
            selectedCoordinates={coordinates}
            onLocationSelect={handleMapLocationSelect}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                County
              </label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="e.g. Costilla"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. CO"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Parcel ID (APN)
              </label>
              <input
                type="text"
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
                placeholder="e.g. 702-19-440"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2 border border-slate-700/80 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Estimated Acreage
              </label>
              <input
                type="number"
                step="0.1"
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                placeholder="e.g. 5.0"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2 border border-slate-700/80 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Characteristics & Topography */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Zoning Classification (If Known)
              </label>
              <input
                type="text"
                value={zoningType}
                onChange={(e) => setZoningType(e.target.value)}
                placeholder="e.g. Agricultural, Rural Residential, Open Space"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Legal Road Access
              </label>
              <select
                value={roadAccess}
                onChange={(e) => setRoadAccess(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                {ROAD_ACCESS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0f1722]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Terrain & Topography (Select all that describe the parcel)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TOPOGRAPHY_OPTIONS.map((item) => {
                const checked = topography.includes(item);
                return (
                  <label
                    key={item}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-teal-950/40 border-teal-500/80 text-teal-200'
                        : 'bg-[#121c27] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTopography(item)}
                      className="w-4 h-4 rounded border-slate-700 text-teal-500 bg-[#0c141d]"
                    />
                    <span className="text-xs font-medium">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Utilities */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Electric Utility Status
            </label>
            <select
              value={electricity}
              onChange={(e) => setElectricity(e.target.value)}
              className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
            >
              {UTILITY_ELECTRIC.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0f1722]">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Water Source
              </label>
              <select
                value={waterSource}
                onChange={(e) => setWaterSource(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                {UTILITY_WATER.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0f1722]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Sewer / Wastewater
              </label>
              <select
                value={sewer}
                onChange={(e) => setSewer(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                {UTILITY_SEWER.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#0f1722]">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Title & Ownership */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Ownership Structure
              </label>
              <select
                value={ownershipType}
                onChange={(e) => setOwnershipType(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                <option value="Sole Owner (Name on Deed)">Sole Owner (Name on Deed)</option>
                <option value="Joint Owner (With Spouse/Partner)">Joint Owner (With Spouse/Partner)</option>
                <option value="Inherited Property / In Probate">Inherited Property / In Probate</option>
                <option value="Held in Trust or LLC">Held in Trust or LLC</option>
                <option value="Multiple Heirs / Shared Title">Multiple Heirs / Shared Title</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                How Long Have You Owned It?
              </label>
              <select
                value={yearsOwned}
                onChange={(e) => setYearsOwned(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1 to 5 years">1 to 5 years</option>
                <option value="5 to 10 years">5 to 10 years</option>
                <option value="10 to 20+ years">10 to 20+ years</option>
                <option value="Recently Inherited">Recently Inherited</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Are Back Taxes Owed?
              </label>
              <select
                value={backTaxesOwed}
                onChange={(e) => setBackTaxesOwed(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                <option value="No back taxes owed (Current)">No back taxes owed (Current)</option>
                <option value="Yes - Under $1,000">Yes - Under $1,000</option>
                <option value="Yes - $1,000 to $5,000">Yes - $1,000 to $5,000</option>
                <option value="Yes - Over $5,000">Yes - Over $5,000</option>
                <option value="Not sure / Need assistance">Not sure / Need assistance</option>
              </select>
              <p className="text-[11px] text-teal-400/80 mt-1">
                Note: We frequently pay off delinquent back taxes on behalf of sellers at escrow closing!
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Mortgages or Encumbrances
              </label>
              <select
                value={hasLiensOrMortgages}
                onChange={(e) => setHasLiensOrMortgages(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                <option value="Free and clear (No mortgage or liens)">Free and clear (No mortgage or liens)</option>
                <option value="Active land loan / mortgage balance">Active land loan / mortgage balance</option>
                <option value="HOA dues past due">HOA dues past due</option>
                <option value="Unsure">Unsure</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Timeline & Pricing */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Target Selling Timeframe
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Fast cash closing (< 14 days)',
                'Within 30 to 60 days',
                'Next 3 to 6 months',
                'Flexible / Just want to know what it is worth',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSellingTimeline(opt)}
                  className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all ${
                    sellingTimeline === opt
                      ? 'bg-teal-950/50 border-teal-500 text-teal-300 shadow-md'
                      : 'bg-[#121c27] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {sellingTimeline === opt && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Ideal Asking Price / Expectation
              </label>
              <input
                type="text"
                value={askingPriceExpectation}
                onChange={(e) => setAskingPriceExpectation(e.target.value)}
                placeholder="e.g. $18,000 (or leave 'Make me an offer')"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Primary Reason for Selling
              </label>
              <select
                value={reasonForSelling}
                onChange={(e) => setReasonForSelling(e.target.value)}
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              >
                <option value="Liquidating investment asset">Liquidating investment asset</option>
                <option value="Inherited unwanted land">Inherited unwanted land</option>
                <option value="Tired of paying annual property taxes">Tired of paying annual property taxes</option>
                <option value="Need liquid cash for other venture">Need liquid cash for other venture</option>
                <option value="Plans to build changed">Plans to build changed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Seller Contact & Review */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Full Legal Name <span className="text-teal-400">*</span>
              </label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Sarah Miller"
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
                value={sellerEmail}
                onChange={(e) => setSellerEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
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
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="e.g. (555) 345-6789"
                className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl px-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Preferred Contact Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['phone', 'email', 'text'] as const).map((method) => (
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Additional Property Notes or Comments
            </label>
            <textarea
              rows={2}
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              placeholder="Any recent surveys, gate codes, or special terms..."
              className="w-full bg-[#121c27] text-sm text-slate-100 rounded-xl p-3 border border-slate-700/80 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Quick Review Card */}
          <div className="p-4 rounded-2xl bg-[#0c141e] border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-teal-400 uppercase tracking-wider">
              Intake Summary
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
              <div>
                <span className="text-slate-500 block">Location:</span>
                <span>{county}, {state}</span>
              </div>
              <div>
                <span className="text-slate-500 block">APN:</span>
                <span className="font-mono text-teal-300">{parcelNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Acreage:</span>
                <span>{acreage} ac</span>
              </div>
              <div>
                <span className="text-slate-500 block">Asking:</span>
                <span className="text-emerald-400 font-semibold">{askingPriceExpectation}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </FormStepWrapper>
  );
};
