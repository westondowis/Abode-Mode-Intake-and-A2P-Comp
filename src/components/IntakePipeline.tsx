import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Trees, 
  Compass, 
  Zap, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Upload,
  FileText,
  X,
  Droplets,
  Flame,
  Wifi,
  Waves,
  Sparkles,
  HelpCircle,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { submitLead, LeadPayload } from '../services/leadSubmission';
import { ENTITY_DETAILS } from '../data/policyData';
import { ParcelPinDropModal } from './ParcelPinDropModal';

interface IntakePipelineProps {
  initialFlow?: 'sell' | 'buy';
  activeFlow?: 'sell' | 'buy';
  onFlowChange?: (flow: 'sell' | 'buy') => void;
  onOpenPrivacyPolicy: (sectionId?: string) => void;
  onOpenTerms?: () => void;
  onOpenDriveVault?: () => void;
  onOpenSheetsHub?: () => void;
}

export const IntakePipeline: React.FC<IntakePipelineProps> = ({
  initialFlow = 'sell',
  activeFlow: controlledFlow,
  onFlowChange,
  onOpenPrivacyPolicy,
  onOpenTerms,
}) => {
  const [activeFlow, setActiveFlow] = useState<'sell' | 'buy'>(controlledFlow || initialFlow);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  React.useEffect(() => {
    if (controlledFlow && controlledFlow !== activeFlow) {
      setActiveFlow(controlledFlow);
      setCurrentStep(1);
      setSubmittedLeadId(null);
      setFormError(null);
    }
  }, [controlledFlow]);

  // Common Contact Fields (Phone & Email strictly required on Step 4)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Technical Requirement: Two distinct, UNCHECKED by default, OPTIONAL checkboxes
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentTransactional, setConsentTransactional] = useState(false);

  // Flow A: Sell Land - Step 1: Location & Acreage
  const [sellState, setSellState] = useState('TX');
  const [sellCounty, setSellCounty] = useState('');
  const [sellCity, setSellCity] = useState('');
  const [sellZip, setSellZip] = useState('');
  const [sellParcelOrAddress, setSellParcelOrAddress] = useState('');
  const [unknownAddress, setUnknownAddress] = useState(false);
  
  // Lot size unit selector (Acres vs. Sq Ft)
  const [lotSizeUnit, setLotSizeUnit] = useState<'acres' | 'sqft'>('acres');
  const [lotSizeRawValue, setLotSizeRawValue] = useState('');
  
  // File upload for deeds / tax documentation
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pin-Drop Map Modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinnedCoordinates, setPinnedCoordinates] = useState<{
    lat: number;
    lng: number;
    formatted: string;
  } | null>(null);

  // Google Places Autocomplete ref
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteInstanceRef = useRef<any>(null);

  // Flow A: Sell Land - Step 2: 6 Dedicated Vacant Land Utilities
  const [utilityWater, setUtilityWater] = useState('City / County Water at the Street');
  const [utilitySewer, setUtilitySewer] = useState('City / County Sewer at the Street');
  const [utilityElectric, setUtilityElectric] = useState('Power at the Property Line');
  const [utilityHeatingGas, setUtilityHeatingGas] = useState('Natural Gas at the Street');
  const [utilityInternet, setUtilityInternet] = useState('Cable / Fiber at the Street');
  const [utilityDrainage, setUtilityDrainage] = useState('Dry Lot with Roadside Drainage');
  const [sellAccessType, setSellAccessType] = useState('Paved Public Road');
  const [sellTopography, setSellTopography] = useState('Level to Gentle Slope');

  // Flow A: Sell Land - Step 3: Title Standings & Unique Features
  const [sellOwnershipStatus, setSellOwnershipStatus] = useState('Sole Owner on Title');
  const [probateDocumentationStatus, setProbateDocumentationStatus] = useState(
    'Yes, probate completed & documentation on file'
  );
  const [probateCustomNotes, setProbateCustomNotes] = useState('');
  const [sellTaxesOrLiens, setSellTaxesOrLiens] = useState('Taxes Current / No Liens');
  const [sellNotes, setSellNotes] = useState('');

  // Flow A: Sell Land - Step 4: Asking Price (Moved from Step 3)
  const [sellTargetPrice, setSellTargetPrice] = useState('');
  const [sellTimeline, setSellTimeline] = useState('As soon as title clears (7-14 days)');

  // Flow B: Buy Land Fields
  const [buyTargetStates, setBuyTargetStates] = useState('Nationwide / Any State (Open to Deals)');
  const [buyTargetCounties, setBuyTargetCounties] = useState('');
  const [buyAcreageRange, setBuyAcreageRange] = useState('5 to 20 Acres');
  const [buyIntendedUse, setBuyIntendedUse] = useState('Homesite / Off-Grid Cabin');
  const [buyPaymentStrategy, setBuyPaymentStrategy] = useState('Cash Buyer (Funds Ready)');
  const [buyBudgetRange, setBuyBudgetRange] = useState('$50,000 - $150,000');
  const [buyNotes, setBuyNotes] = useState('');

  // Setup Google Places Autocomplete if API Key is loaded
  useEffect(() => {
    if (currentStep !== 1 || activeFlow !== 'sell' || unknownAddress) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_KEY_HERE') return;

    const initAutocomplete = () => {
      const google = (window as any).google;
      if (!google || !google.maps || !google.maps.places || !addressInputRef.current) return;

      try {
        const autocomplete = new google.maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place || !place.address_components) return;

          let streetNumber = '';
          let route = '';
          let city = '';
          let county = '';
          let state = '';
          let zip = '';

          for (const comp of place.address_components) {
            if (comp.types.includes('street_number')) streetNumber = comp.long_name;
            if (comp.types.includes('route')) route = comp.long_name;
            if (comp.types.includes('locality')) city = comp.long_name;
            if (comp.types.includes('sublocality_level_1') && !city) city = comp.long_name;
            if (comp.types.includes('administrative_area_level_2')) {
              county = comp.long_name.replace(/ County$/i, '');
            }
            if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
            if (comp.types.includes('postal_code')) zip = comp.long_name;
          }

          const fullStreet = [streetNumber, route].filter(Boolean).join(' ');
          if (fullStreet) setSellParcelOrAddress(fullStreet);
          else if (place.name) setSellParcelOrAddress(place.name);
          else if (place.formatted_address) setSellParcelOrAddress(place.formatted_address);

          if (county) setSellCounty(county);
          if (state) setSellState(state);
          if (city) setSellCity(city);
          if (zip) setSellZip(zip);

          if (place.geometry && place.geometry.location) {
            setPinnedCoordinates({
              lat: Number(place.geometry.location.lat().toFixed(6)),
              lng: Number(place.geometry.location.lng().toFixed(6)),
              formatted: `${place.geometry.location.lat().toFixed(6)}, ${place.geometry.location.lng().toFixed(6)}`,
            });
          }
        });

        autocompleteInstanceRef.current = autocomplete;
      } catch (err) {
        console.warn('Google Places Autocomplete init notice:', err);
      }
    };

    if ((window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
      initAutocomplete();
    } else {
      const scriptId = 'google-places-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initAutocomplete;
        document.head.appendChild(script);
      }
    }
  }, [currentStep, activeFlow, unknownAddress]);

  // Handle file drop & upload
  const handleProcessFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: typeof reader.result === 'string' ? reader.result : undefined,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Currency formatting for Asking Price
  const handlePriceChange = (val: string) => {
    const numericOnly = val.replace(/[^0-9]/g, '');
    if (!numericOnly) {
      setSellTargetPrice('');
      return;
    }
    const formatted = Number(numericOnly).toLocaleString();
    setSellTargetPrice(`$${formatted}`);
  };

  // Reset form when switching flows
  const handleFlowSwitch = (flow: 'sell' | 'buy') => {
    setActiveFlow(flow);
    if (onFlowChange) onFlowChange(flow);
    setCurrentStep(1);
    setSubmittedLeadId(null);
    setFormError(null);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation per step
    if (activeFlow === 'sell') {
      if (currentStep === 1) {
        if (!unknownAddress) {
          if (!sellParcelOrAddress.trim() || !sellCounty.trim()) {
            setFormError('Please provide both the County and Property Address or APN Parcel Number.');
            return;
          }
        } else {
          // In unknown address mode, user must provide at least a county OR drop a pin OR upload a document
          if (!sellCounty.trim() && !pinnedCoordinates && !uploadedFile) {
            setFormError('Please specify the County, upload parcel documentation, or drop a map pin so our team can locate your land.');
            return;
          }
        }
      }
    } else {
      if (currentStep === 1) {
        if (!buyTargetStates.trim()) {
          setFormError('Please specify your target state or region.');
          return;
        }
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setFormError(null);
  };

  // Step 4 Final Submission with STRICT PHONE & EMAIL VALIDATION
  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Part 1: Strict Contact Validation
    if (!fullName.trim()) {
      setFormError('Please provide your full legal name.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Phone number is strictly required so our acquisitions desk can contact you.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('A valid email address is strictly required to deliver your written cash offer.');
      return;
    }

    setSubmitting(true);

    const isSell = activeFlow === 'sell';
    const anyConsent = consentMarketing || consentTransactional;

    // Standardized acreage calculation
    let standardizedAcreage = lotSizeRawValue.trim();
    if (isSell && lotSizeUnit === 'sqft') {
      const numSqft = parseFloat(lotSizeRawValue.replace(/,/g, ''));
      if (!isNaN(numSqft) && numSqft > 0) {
        standardizedAcreage = `${(numSqft / 43560).toFixed(2)} Acres (${numSqft.toLocaleString()} Sq Ft)`;
      }
    } else if (isSell && lotSizeRawValue.trim()) {
      standardizedAcreage = `${lotSizeRawValue.trim()} Acres`;
    }

    // Consolidated property address string
    let resolvedAddress = isSell ? sellParcelOrAddress.trim() : (buyTargetCounties ? `${buyTargetCounties}, ${buyTargetStates}` : buyTargetStates);
    if (isSell && unknownAddress) {
      if (pinnedCoordinates) {
        resolvedAddress = `Unknown Street Address (GPS Pinned: ${pinnedCoordinates.formatted})`;
      } else if (uploadedFile) {
        resolvedAddress = `Unknown Street Address (Document Uploaded: ${uploadedFile.name})`;
      } else {
        resolvedAddress = `Unknown Physical Address (${sellCounty} County, ${sellState})`;
      }
    }

    // Consolidated utilities description for notes
    const utilitiesSummary = isSell
      ? `Water: ${utilityWater} | Sewer: ${utilitySewer} | Power: ${utilityElectric} | Gas: ${utilityHeatingGas} | Internet: ${utilityInternet} | Drainage: ${utilityDrainage}`
      : 'N/A';

    const payload: LeadPayload = {
      flow: activeFlow,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      propertyAddress: resolvedAddress,
      parcelOrAddress: resolvedAddress,
      parcelNumber: isSell ? sellParcelOrAddress.trim() : '',
      state: isSell ? sellState : buyTargetStates,
      county: isSell ? sellCounty.trim() : buyTargetCounties.trim(),
      city: isSell ? sellCity.trim() : undefined,
      zipCode: isSell ? sellZip.trim() : undefined,
      acreage: isSell ? (standardizedAcreage || 'Not specified') : buyAcreageRange,
      lotSizeUnit,
      lotSizeRawValue,
      unknownAddress,
      gpsCoordinates: pinnedCoordinates,
      documentAttachment: uploadedFile,
      utilityWater: isSell ? utilityWater : undefined,
      utilitySewer: isSell ? utilitySewer : undefined,
      utilityElectric: isSell ? utilityElectric : undefined,
      utilityHeatingGas: isSell ? utilityHeatingGas : undefined,
      utilityInternet: isSell ? utilityInternet : undefined,
      utilityDrainage: isSell ? utilityDrainage : undefined,
      ownershipStatus: isSell ? sellOwnershipStatus : undefined,
      probateDocumentationStatus:
        isSell && ['Inherited', 'Probate', 'Held in Trust'].includes(sellOwnershipStatus)
          ? `${probateDocumentationStatus}${probateCustomNotes ? ` (${probateCustomNotes})` : ''}`
          : undefined,
      askingPrice: isSell ? (sellTargetPrice.trim() || 'Make Cash Offer') : buyBudgetRange,
      motivation: isSell ? (sellNotes.trim() || 'Direct Land Sale Cash Offer Intake') : buyIntendedUse,
      timeline: isSell ? sellTimeline : buyPaymentStrategy,
      occupancyCondition: isSell
        ? `Ownership: ${sellOwnershipStatus} | Road: ${sellAccessType} | Topo: ${sellTopography}`
        : `Strategy: ${buyPaymentStrategy}`,
      notes: isSell
        ? `Utilities: ${utilitiesSummary} | Topo: ${sellTopography} | Taxes/Liens: ${sellTaxesOrLiens} | Notes: ${sellNotes}`
        : `Use: ${buyIntendedUse} | Terms: ${buyPaymentStrategy} | Budget: ${buyBudgetRange} | Criteria: ${buyNotes}`,
      smsTransactionalConsent: consentTransactional,
      smsMarketingConsent: consentMarketing,
      smsConsentTransactional: consentTransactional,
      smsConsentMarketing: consentMarketing,
      smsConsent: anyConsent,
      consentTimestamp: anyConsent ? new Date().toISOString() : null,
      disclosureVersion: 'CTIA_2026_V1',
      nonSharingCovenantAccepted: true,
      exactConsentDisclosureText: anyConsent
        ? 'I agree to receive transactional and informational text messages from Abode Mode at the phone number provided regarding my land property inquiry, valuation assessments, cash offer status, and closing coordination. Message and data rates may apply. Reply STOP to cancel at any time, HELP for assistance.'
        : '',
    };

    try {
      const result = await submitLead(payload);
      setSubmittedLeadId(result.leadId);
    } catch (err) {
      console.error('Submission error:', err);
      setSubmittedLeadId(`ABODE-${Date.now().toString(36).toUpperCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedLeadId(null);
    setCurrentStep(1);
    setFormError(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setConsentMarketing(false);
    setConsentTransactional(false);
    setSellParcelOrAddress('');
    setSellCounty('');
    setSellCity('');
    setSellZip('');
    setSellNotes('');
    setSellTargetPrice('');
    setUploadedFile(null);
    setPinnedCoordinates(null);
    setUnknownAddress(false);
    setLotSizeRawValue('');
    setBuyNotes('');
  };

  // Helper for dynamic Sq Ft to Acre conversion display
  const sqftNumeric = parseFloat(lotSizeRawValue.replace(/,/g, ''));
  const equivalentAcresDisplay =
    lotSizeUnit === 'sqft' && !isNaN(sqftNumeric) && sqftNumeric > 0
      ? (sqftNumeric / 43560).toFixed(2)
      : null;

  return (
    <section id="form-container" className="scroll-mt-24 py-16 bg-slate-100 text-slate-900 dark:bg-[#061116] dark:text-white transition-colors duration-200">
      <div id="intake-pipeline" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dual Flow Choice Tabs */}
        {!submittedLeadId && (
          <div className="flex rounded-xl bg-slate-200 dark:bg-[#0A4251] p-1.5 border border-slate-300 dark:border-[#F2C864]/30 mb-8 max-w-md mx-auto shadow-sm">
            <button
              type="button"
              onClick={() => handleFlowSwitch('sell')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFlow === 'sell'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-md'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              I Want to Sell Land
            </button>
            <button
              type="button"
              onClick={() => handleFlowSwitch('buy')}
              className={`flex-1 py-3 px-4 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFlow === 'buy'
                  ? 'bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-400 text-slate-950 shadow-md'
                  : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              I Want to Buy Land
            </button>
          </div>
        )}

        {/* Clean, Professional Public "Thank You" Screen (Strictly no admin modals or inspection popups) */}
        {submittedLeadId ? (
          <div className="bg-white dark:bg-[#00171C] rounded-2xl border border-slate-200 dark:border-[#0A4251] p-8 sm:p-12 shadow-2xl text-slate-800 dark:text-slate-100 animate-in fade-in duration-200 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-amber-400 block">
                Acquisition Intake Recorded
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-950 dark:text-white">
                Thank You, {fullName || 'Valued Landowner'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                Your {activeFlow === 'sell' ? 'property details have' : 'land acquisition criteria has'} been received by our acquisitions desk.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-slate-50 dark:bg-[#061116] p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-w-sm mx-auto text-xs space-y-1 font-mono">
              <div className="text-slate-500 dark:text-slate-400">Your Inquiry Reference ID:</div>
              <div className="text-base font-bold text-slate-900 dark:text-white tracking-wide">{submittedLeadId}</div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-slate-50 dark:bg-[#0A4251]/20 p-5 rounded-xl border border-slate-200 dark:border-[#0A4251]/40 max-w-lg mx-auto text-xs text-left space-y-3">
              <div className="font-bold text-slate-900 dark:text-white font-serif text-sm">
                What Happens Next:
              </div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed list-disc pl-4">
                <li>
                  <strong>GIS &amp; Title Verification:</strong> Our land analysts examine county records, road frontage, aerial topography, and recent market comps.
                </li>
                <li>
                  <strong>Direct Follow-Up:</strong> We will reach out to you directly at <span className="font-mono text-slate-900 dark:text-white">{phone || 'your phone'}</span> and <span className="font-mono text-slate-900 dark:text-white">{email || 'your email'}</span> within <strong>24 business hours</strong> with initial feedback or a written cash contract.
                </li>
              </ul>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 font-mono text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <span>Direct Desk: (720) 649-0734</span>
                <span>wdowis@abode-mode.com</span>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:7206490734"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Acquisition Desk</span>
              </a>

              <a
                href="sms:7206490734?body=Hello%2C%20following%20up%20on%20my%20land%20submission."
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Text Desk</span>
              </a>

              <button
                onClick={handleReset}
                type="button"
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Submit Another Property
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Intake Form */
          <div className="bg-white dark:bg-[#00171C] rounded-2xl border border-slate-200 dark:border-[#0A4251] shadow-xl p-6 sm:p-10 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            
            {/* Form Header & Progress */}
            <div className="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-[#F2C864]">
                  {activeFlow === 'sell' ? 'Seller Acquisition Intake' : 'Buyer / Investor Buy Box'}
                </span>
                <h3 className="text-2xl font-serif font-bold text-slate-950 dark:text-white">
                  {activeFlow === 'sell'
                    ? 'Submit Your Land for an As-Is Cash Offer'
                    : 'Submit Your Target Land Acquisition Criteria'}
                </h3>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400 shrink-0">
                <span className="font-bold text-slate-900 dark:text-slate-200">Step {currentStep}</span>
                <span>/</span>
                <span>4</span>
              </div>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* FORM BODY */}
            <form onSubmit={currentStep === 4 ? handleSubmitFinal : handleNextStep} className="space-y-6">
              
              {/* FLOW A: SELL LAND STEPS */}
              {activeFlow === 'sell' && (
                <>
                  {/* Step 1: Parcel Identity, Location, Unknown Address & Lot Sizing */}
                  {currentStep === 1 && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                        Step 1: Parcel Identity &amp; Location
                      </div>

                      {/* Google Maps Places Searchable Autocomplete */}
                      {!unknownAddress && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Search Address or Location (Google Maps Autocomplete) <span className="text-rose-600">*</span>
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                            <input
                              ref={addressInputRef}
                              type="text"
                              required={!unknownAddress}
                              value={sellParcelOrAddress}
                              onChange={(e) => setSellParcelOrAddress(e.target.value)}
                              placeholder="Start typing street address, city, or parcel..."
                              className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Typing your address will automatically populate the County, State, City, and Zip code.
                          </p>
                        </div>
                      )}

                      {/* "I do not know the physical address" Checkbox */}
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={unknownAddress}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUnknownAddress(checked);
                              if (checked) {
                                setSellParcelOrAddress('');
                              }
                            }}
                            className="w-4 h-4 text-[#0A4251] border-slate-300 rounded focus:ring-[#0A4251] cursor-pointer mt-0.5"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              I do not know the physical street address of the parcel
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Vacant land often lacks a physical mailbox number. Check this box to locate your parcel via document upload or interactive satellite pin-drop.
                            </span>
                          </div>
                        </label>

                        {/* REVEALED FALLBACK OPTIONS WHEN ADDRESS IS UNKNOWN */}
                        {unknownAddress && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/60 space-y-4 animate-in fade-in duration-200">
                            
                            {/* Option 1: File / Document Upload Dropzone */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                                Option A: Upload Deed, Tax Statement, or Survey Document
                              </label>
                              
                              <div
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setIsDraggingFile(true);
                                }}
                                onDragLeave={() => setIsDraggingFile(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                                  isDraggingFile
                                    ? 'border-amber-400 bg-amber-500/10'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-amber-400 bg-white dark:bg-slate-900/40'
                                }`}
                              >
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg,.heic,.tiff,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleProcessFile(e.target.files[0]);
                                    }
                                  }}
                                />

                                {uploadedFile ? (
                                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-left">
                                    <div className="flex items-center space-x-2.5 overflow-hidden">
                                      <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      <div className="truncate">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                          {uploadedFile.name}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-mono">
                                          {(uploadedFile.size / 1024).toFixed(1)} KB · Ready to sync
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadedFile(null);
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                      title="Remove document"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <Upload className="w-7 h-7 text-amber-500 mx-auto" />
                                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                      Click or drag &amp; drop deed, property tax receipt, plat or survey
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      Supports PDF, PNG, JPG, HEIC, TIFF (Max 15MB)
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Option 2: Pin-Drop Interactive Map Trigger */}
                            <div className="space-y-1.5">
                              <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                                Option B: Interactive Map Pin-Drop
                              </label>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <div>
                                  {pinnedCoordinates ? (
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                                      <span>Pinned GPS: {pinnedCoordinates.formatted}</span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      Zoom into your land and drop a pin on the satellite landscape
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsPinModalOpen(true)}
                                  className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                                >
                                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{pinnedCoordinates ? 'Change Pinned Location' : 'Open Pin-Drop Map'}</span>
                                </button>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>

                      {/* State and County Inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            State <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={sellState}
                            onChange={(e) => setSellState(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="AL">Alabama</option>
                            <option value="AK">Alaska</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            <option value="CA">California</option>
                            <option value="CO">Colorado</option>
                            <option value="CT">Connecticut</option>
                            <option value="DE">Delaware</option>
                            <option value="FL">Florida</option>
                            <option value="GA">Georgia</option>
                            <option value="HI">Hawaii</option>
                            <option value="ID">Idaho</option>
                            <option value="IL">Illinois</option>
                            <option value="IN">Indiana</option>
                            <option value="IA">Iowa</option>
                            <option value="KS">Kansas</option>
                            <option value="KY">Kentucky</option>
                            <option value="LA">Louisiana</option>
                            <option value="ME">Maine</option>
                            <option value="MD">Maryland</option>
                            <option value="MA">Massachusetts</option>
                            <option value="MI">Michigan</option>
                            <option value="MN">Minnesota</option>
                            <option value="MS">Mississippi</option>
                            <option value="MO">Missouri</option>
                            <option value="MT">Montana</option>
                            <option value="NE">Nebraska</option>
                            <option value="NV">Nevada</option>
                            <option value="NH">New Hampshire</option>
                            <option value="NJ">New Jersey</option>
                            <option value="NM">New Mexico</option>
                            <option value="NY">New York</option>
                            <option value="NC">North Carolina</option>
                            <option value="ND">North Dakota</option>
                            <option value="OH">Ohio</option>
                            <option value="OK">Oklahoma</option>
                            <option value="OR">Oregon</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="RI">Rhode Island</option>
                            <option value="SC">South Carolina</option>
                            <option value="SD">South Dakota</option>
                            <option value="TN">Tennessee</option>
                            <option value="TX">Texas</option>
                            <option value="UT">Utah</option>
                            <option value="VT">Vermont</option>
                            <option value="VA">Virginia</option>
                            <option value="WA">Washington</option>
                            <option value="WV">West Virginia</option>
                            <option value="WI">Wisconsin</option>
                            <option value="WY">Wyoming</option>
                          </select>
                        </div>

                        <div className="md:col-span-8 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            County Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={sellCounty}
                            onChange={(e) => setSellCounty(e.target.value)}
                            placeholder="e.g. Costilla, Mohave, El Paso, Hudspeth, Teller"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Acreage & Lot Size Unit Selector */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                        <div className="md:col-span-4 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Lot Size Unit
                          </label>
                          <select
                            value={lotSizeUnit}
                            onChange={(e) => setLotSizeUnit(e.target.value as 'acres' | 'sqft')}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="acres">Acres</option>
                            <option value="sqft">Square Feet (Sq Ft)</option>
                          </select>
                        </div>

                        <div className="md:col-span-8 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            {lotSizeUnit === 'acres' ? 'Estimated Acreage' : 'Estimated Square Footage'}
                          </label>
                          <input
                            type="text"
                            value={lotSizeRawValue}
                            onChange={(e) => setLotSizeRawValue(e.target.value)}
                            placeholder={lotSizeUnit === 'acres' ? 'e.g. 5.25 or 40' : 'e.g. 43,560'}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                          {equivalentAcresDisplay && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-mono font-semibold pt-1">
                              Equivalent: {equivalentAcresDisplay} Acres (1 Acre = 43,560 sq ft)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Vacant Land Utility Intake (6 Robust Dropdowns) */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                          Step 2: Vacant Land Utility Intake
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Specify current utility availability or infrastructure requirements for the property.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* 1. Access to Water */}
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200">
                            <Droplets className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                            <span>1. Access to Water</span>
                          </label>
                          <select
                            value={utilityWater}
                            onChange={(e) => setUtilityWater(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="City / County Water at the Street">City / County Water at the Street (Municipal main along road frontage)</option>
                            <option value="City / County Water Nearby (Extension Required)">City / County Water Nearby (Extension Required)</option>
                            <option value="Existing Private Well on Site">Existing Private Well on Site (Drilled well & equipment installed)</option>
                            <option value="Private Well Needed">Private Well Needed (No public water; new well required)</option>
                            <option value="Unknown">Unknown (Needs verification with county / local utility)</option>
                          </select>
                        </div>

                        {/* 2. Sewer & Wastewater */}
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200">
                            <Waves className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>2. Sewer &amp; Wastewater</span>
                          </label>
                          <select
                            value={utilitySewer}
                            onChange={(e) => setUtilitySewer(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="City / County Sewer at the Street">City / County Sewer at the Street (Public sewer main in front)</option>
                            <option value="City / County Sewer Nearby (Extension Required)">City / County Sewer Nearby (Extension Required)</option>
                            <option value="Existing Septic System on Site">Existing Septic System on Site (Tank & drainfield installed)</option>
                            <option value="Septic System Needed (Passed Perc Test)">Septic System Needed (Passed Perc Test & soil approved)</option>
                            <option value="Septic System Needed (No Perc Test on Record)">Septic System Needed (No Perc Test on Record)</option>
                            <option value="Unknown">Unknown (Needs verification with local health dept)</option>
                          </select>
                        </div>

                        {/* 3. Electric Service */}
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>3. Electric Service</span>
                          </label>
                          <select
                            value={utilityElectric}
                            onChange={(e) => setUtilityElectric(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Power at the Property Line">Power at the Property Line (Poles/lines run along road frontage)</option>
                            <option value="Power Nearby (Poles Required)">Power Nearby (Poles Required to extend down road)</option>
                            <option value="Existing Electric Meter / Service Drop on Site">Existing Electric Meter / Service Drop on Site</option>
                            <option value="Off-Grid Only">Off-Grid Only (Requires solar, wind, or generator)</option>
                            <option value="Unknown">Unknown (Needs verification with electric cooperative)</option>
                          </select>
                        </div>

                        {/* 4. Heating & Gas */}
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200">
                            <Flame className="w-3.5 h-3.5 text-rose-500" />
                            <span>4. Heating &amp; Gas</span>
                          </label>
                          <select
                            value={utilityHeatingGas}
                            onChange={(e) => setUtilityHeatingGas(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Natural Gas at the Street">Natural Gas at the Street (Piped main ready for meter)</option>
                            <option value="Propane Required (Bulk Tank)">Propane Required (Bulk Tank leased or on-site)</option>
                            <option value="All-Electric">All-Electric (Electric heating & appliances exclusively)</option>
                            <option value="Unknown">Unknown (Fuel availability not determined)</option>
                          </select>
                        </div>

                        {/* 5. Internet & Telecommunications */}
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200">
                            <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                            <span>5. Internet &amp; Telecommunications</span>
                          </label>
                          <select
                            value={utilityInternet}
                            onChange={(e) => setUtilityInternet(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Cable / Fiber at the Street">Cable / Fiber at the Street (High-speed wired broadband)</option>
                            <option value="DSL / Telephone Wire Only">DSL / Telephone Wire Only (Copper voice & basic DSL)</option>
                            <option value="Wireless / Satellite Only">Wireless / Satellite Only (Starlink, satellite, cellular)</option>
                            <option value="Unknown">Unknown (Carriers not checked)</option>
                          </select>
                        </div>

                        {/* 6. Surface Drainage & Stormwater */}
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800">
                          <label className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200">
                            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>6. Surface Drainage &amp; Stormwater</span>
                          </label>
                          <select
                            value={utilityDrainage}
                            onChange={(e) => setUtilityDrainage(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Dry Lot with Roadside Drainage">Dry Lot with Roadside Drainage (High & dry; drains into ditch/swale)</option>
                            <option value="Low-Lying / Seasonal Standing Water">Low-Lying / Seasonal Standing Water (Soggy in rainy periods)</option>
                            <option value="Mapped Floodplain or Wetland Present">Mapped Floodplain or Wetland Present (FEMA flood zone / creek)</option>
                            <option value="Unknown">Unknown (Drainage & flood zone unverified)</option>
                          </select>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Step 3: Standout Features & Ownership Title Standings (Asking price removed) */}
                  {currentStep === 3 && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                          Step 3: Ownership Situation &amp; Standout Features
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Tell us about title standings and unique features that make the land special.
                        </p>
                      </div>

                      {/* Ownership & Title Standings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Ownership &amp; Title Standing <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={sellOwnershipStatus}
                            onChange={(e) => setSellOwnershipStatus(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Sole Owner on Title">Sole Owner on Title</option>
                            <option value="Joint / Tenants in Common">Joint / Tenants in Common</option>
                            <option value="Inherited">Inherited</option>
                            <option value="Probate">Probate</option>
                            <option value="Held in Trust">Held in Trust</option>
                            <option value="Tax Lien / Delinquent">Tax Lien / Delinquent</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Property Taxes &amp; Liens
                          </label>
                          <select
                            value={sellTaxesOrLiens}
                            onChange={(e) => setSellTaxesOrLiens(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Taxes Current / No Liens">Taxes Paid &amp; Current (No Liens)</option>
                            <option value="Back Taxes Owed (We pay at close)">Back Taxes Owed (Deducted or paid at closing)</option>
                            <option value="HOA Dues Owed">HOA / POA Dues Owed</option>
                            <option value="Not Sure">Not Sure / Check Title</option>
                          </select>
                        </div>
                      </div>

                      {/* CONDITIONAL PROBATE / TRUST INQUIRY CARD */}
                      {['Inherited', 'Probate', 'Held in Trust'].includes(sellOwnershipStatus) && (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3 animate-in fade-in duration-150">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300 font-serif">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Inheritance &amp; Estate Verification (Optional Clarification)</span>
                          </div>
                          <label className="block text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            Do you have probated documentation or verified will information entitling you the rightful owner?
                          </label>
                          <select
                            value={probateDocumentationStatus}
                            onChange={(e) => setProbateDocumentationStatus(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-amber-400/40 dark:border-amber-400/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                          >
                            <option value="Yes, probate completed & documentation on file">Yes, probate completed &amp; documentation on file</option>
                            <option value="In probate proceedings currently">In probate proceedings currently</option>
                            <option value="Will / trust documents available but not probated">Will / trust documents available but not probated</option>
                            <option value="No formal probate opened yet">No formal probate opened yet</option>
                            <option value="Other / Custom details">Other / Custom details</option>
                          </select>
                          {probateDocumentationStatus === 'Other / Custom details' && (
                            <input
                              type="text"
                              value={probateCustomNotes}
                              onChange={(e) => setProbateCustomNotes(e.target.value)}
                              placeholder="Please describe your estate/will status..."
                              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                            />
                          )}
                        </div>
                      )}

                      {/* Standout Features & Additional Notes */}
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                          Unique Features &amp; Additional Parcel Notes
                        </label>
                        <textarea
                          rows={3}
                          value={sellNotes}
                          onChange={(e) => setSellNotes(e.target.value)}
                          placeholder="Highlight unique features (e.g., year-round creek, river running through property, mountain views, mature timber, backing to National Forest / BLM land, established trail access, perimeter fencing, cleared building pad)..."
                          className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Asking Price Hero Card & Contact Info */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      
                      {/* PROMINENT ANIMATED SPOTLIGHT HERO CARD FOR ASKING PRICE */}
                      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 dark:border-amber-400/80 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-teal-500/10 p-6 sm:p-7 shadow-xl shadow-amber-500/10 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <label className="text-sm font-mono font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
                            <span>ASKING PRICE:</span>
                          </label>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            Cash Offer Target
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                          What cash price would you be thrilled to accept to close quickly?
                        </p>

                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            $
                          </span>
                          <input
                            type="text"
                            value={sellTargetPrice.replace(/^\$/, '')}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            placeholder="e.g. 35,000"
                            className="w-full pl-10 pr-4 py-3.5 text-2xl font-bold font-mono tracking-wide bg-white dark:bg-slate-950 border-2 border-amber-400/80 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-400/30 text-slate-950 dark:text-white shadow-inner"
                          />
                        </div>

                        {/* Quick Shortcut Suggestions */}
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                          <span className="text-[11px] text-slate-500 font-mono">Quick Options:</span>
                          {['$15,000', '$25,000', '$50,000', '$100,000'].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setSellTargetPrice(amt)}
                              className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-mono text-xs transition-colors cursor-pointer"
                            >
                              {amt}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setSellTargetPrice('Make Me an Offer')}
                            className="px-2.5 py-1 rounded-md bg-white/80 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 font-mono text-xs transition-colors cursor-pointer"
                          >
                            Open to Any Cash Offer
                          </button>
                        </div>
                      </div>

                      {/* Desired Closing Timeline */}
                      <div className="space-y-1">
                        <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                          Preferred Closing Timeline
                        </label>
                        <select
                          value={sellTimeline}
                          onChange={(e) => setSellTimeline(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                        >
                          <option value="As soon as title clears (7-14 days)">Expedited: As soon as title clears (7–14 days)</option>
                          <option value="Standard 30 Days">Standard: Within 30 days</option>
                          <option value="Flexible (60+ days)">Flexible: 60+ days</option>
                        </select>
                      </div>

                      {/* Contact Fields with STRICT VALIDATION */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
                        <div className="md:col-span-12 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Full Legal Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Johnathan Miller"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-6 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Telephone / Mobile Number <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(720) 555-0192"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-6 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Email Address <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* STATUTORY CARRIER DATA PRIVACY COVENANT */}
                      <div className="p-3.5 bg-[#00171C] rounded-xl border border-[#0A4251] text-xs text-slate-300 leading-relaxed shadow-sm">
                        <div className="flex items-center gap-1.5 text-[#F9C54B] font-mono text-[11px] font-bold uppercase tracking-wide mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>🔒 CARRIER DATA PRIVACY COVENANT:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances.
                        </p>
                      </div>

                      {/* TWO SEPARATE, UNBUNDLED, OPTIONAL CHECKBOXES */}
                      <div className="space-y-3 pt-1">
                        {/* Checkbox 1: Transactional / Valuation Updates */}
                        <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-[#D5DDE0] dark:border-slate-700 hover:border-[#0A4251] transition-colors">
                          <div className="pt-0.5">
                            <input
                              id="sms-consent-transactional"
                              type="checkbox"
                              checked={consentTransactional}
                              onChange={(e) => setConsentTransactional(e.target.checked)}
                              className="w-4 h-4 text-[#0A4251] border-slate-300 rounded focus:ring-[#0A4251] cursor-pointer"
                            />
                          </div>
                          <label
                            htmlFor="sms-consent-transactional"
                            className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer select-none"
                          >
                            I agree to receive transactional and informational text messages from <strong className="text-slate-900 dark:text-white">Abode Mode</strong> at the phone number provided regarding my land property inquiry, valuation assessments, cash offer status, and closing coordination. Message and data rates may apply. Message frequency varies. Reply <strong className="text-slate-900 dark:text-white">STOP</strong> to cancel at any time, or reply <strong className="text-slate-900 dark:text-white">HELP</strong> for assistance. Consent is optional and not a condition of submitting an inquiry or receiving an offer. View our{' '}
                            <a
                              href="/privacy.html"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0A4251] dark:text-cyan-400 underline font-semibold hover:text-[#00171C]"
                            >
                              Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a
                              href="/terms.html"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0A4251] dark:text-cyan-400 underline font-semibold hover:text-[#00171C]"
                            >
                              Terms of Service
                            </a>
                            .
                          </label>
                        </div>

                        {/* Checkbox 2: Marketing / Inventory Programs */}
                        <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-[#D5DDE0] dark:border-slate-700 hover:border-[#0A4251] transition-colors">
                          <div className="pt-0.5">
                            <input
                              id="sms-consent-marketing"
                              type="checkbox"
                              checked={consentMarketing}
                              onChange={(e) => setConsentMarketing(e.target.checked)}
                              className="w-4 h-4 text-[#0A4251] border-slate-300 rounded focus:ring-[#0A4251] cursor-pointer"
                            />
                          </div>
                          <label
                            htmlFor="sms-consent-marketing"
                            className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer select-none"
                          >
                            I agree to receive promotional and marketing text messages from <strong className="text-slate-900 dark:text-white">Abode Mode</strong> at the phone number provided regarding new land inventory, special cash buying programs, and investment updates. Message and data rates may apply. Message frequency varies. Reply <strong className="text-slate-900 dark:text-white">STOP</strong> to opt out, <strong className="text-slate-900 dark:text-white">HELP</strong> for help. Consent is not a condition of purchase or sale. View our{' '}
                            <a
                              href="/privacy.html"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0A4251] dark:text-cyan-400 underline font-semibold hover:text-[#00171C]"
                            >
                              Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a
                              href="/terms.html"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0A4251] dark:text-cyan-400 underline font-semibold hover:text-[#00171C]"
                            >
                              Terms of Service
                            </a>
                            .
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* FLOW B: BUY LAND STEPS */}
              {activeFlow === 'buy' && (
                <>
                  {/* Step 1: Target Geography */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                        Step 1: Target Geography &amp; Corridors
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Preferred States <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={buyTargetStates}
                            onChange={(e) => setBuyTargetStates(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Nationwide / Open to All 50 States">Nationwide / Open to All 50 States</option>
                            <option value="Western US (CO, WY, UT, NM, AZ, NV, MT, ID)">Western US (CO, WY, UT, NM, AZ, NV, MT, ID)</option>
                            <option value="Southern US (TX, FL, GA, NC, TN, AL)">Southern US (TX, FL, GA, NC, TN, AL)</option>
                            <option value="Midwest & Plains (KS, MO, OK, AR, NE, IA)">Midwest &amp; Plains (KS, MO, OK, AR, NE, IA)</option>
                            <option value="Eastern & Coastal States">Eastern &amp; Coastal States</option>
                            <option value="Specific State (Specify in Notes)">Specific State (Specify in Notes)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Specific Counties or Metro Areas (Optional)
                          </label>
                          <input
                            type="text"
                            value={buyTargetCounties}
                            onChange={(e) => setBuyTargetCounties(e.target.value)}
                            placeholder="e.g. Teller, El Paso, Costilla, Mohave"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Criteria & Use */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                        Step 2: Acreage &amp; Intended Use
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Target Acreage Range
                          </label>
                          <select
                            value={buyAcreageRange}
                            onChange={(e) => setBuyAcreageRange(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Under 1 Acre (Infill / Subdivided)">Under 1 Acre (Infill / Subdivided)</option>
                            <option value="1 to 5 Acres">1 to 5 Acres</option>
                            <option value="5 to 20 Acres">5 to 20 Acres</option>
                            <option value="20 to 100 Acres">20 to 100 Acres</option>
                            <option value="100+ Acres (Ranch / Timber / Development)">100+ Acres (Ranch / Timber / Development)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Primary Intended Use
                          </label>
                          <select
                            value={buyIntendedUse}
                            onChange={(e) => setBuyIntendedUse(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Homesite / Off-Grid Cabin">Homesite / Off-Grid Cabin</option>
                            <option value="Recreational / Hunting / Camping">Recreational / Hunting / Camping</option>
                            <option value="Long-Term Land Banking / Speculation">Long-Term Land Banking / Speculation</option>
                            <option value="Subdivision / Development">Subdivision / Development</option>
                            <option value="Agricultural / Livestock">Agricultural / Livestock</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Budget & Terms */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                        Step 3: Purchasing Capital &amp; Timeline
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Target Budget Range
                          </label>
                          <select
                            value={buyBudgetRange}
                            onChange={(e) => setBuyBudgetRange(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Under $25,000">Under $25,000</option>
                            <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                            <option value="$50,000 - $150,000">$50,000 - $150,000</option>
                            <option value="$150,000 - $500,000">$150,000 - $500,000</option>
                            <option value="$500,000+">$500,000+</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Purchasing Strategy
                          </label>
                          <select
                            value={buyPaymentStrategy}
                            onChange={(e) => setBuyPaymentStrategy(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          >
                            <option value="Cash Buyer (Funds Ready)">Cash Buyer (Funds Ready)</option>
                            <option value="Owner Financing Preferred">Owner Financing / Terms Preferred</option>
                            <option value="1031 Exchange (Time Sensitive)">1031 Exchange (Time Sensitive)</option>
                            <option value="Self-Directed IRA / 401(k)">Self-Directed IRA / 401(k)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Special Purchase Criteria or Feature Requirements
                          </label>
                          <textarea
                            rows={2}
                            value={buyNotes}
                            onChange={(e) => setBuyNotes(e.target.value)}
                            placeholder="Need road access, specific zoning, water rights, power nearby, mountain views..."
                            className="w-full px-3 py-2 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Buyer Contact */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                        Step 4: Contact &amp; Deal Delivery Coordinates
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-12 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Full Legal Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Robert Vance"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-6 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Telephone / Mobile Number <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(720) 555-0192"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-6 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700 dark:text-slate-300">
                            Email Address <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="robert@example.com"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] dark:bg-slate-900 border border-[#D5DDE0] dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* STATUTORY CARRIER DATA PRIVACY COVENANT */}
                      <div className="p-3.5 bg-[#00171C] rounded-xl border border-[#0A4251] text-xs text-slate-300 leading-relaxed shadow-sm">
                        <div className="flex items-center gap-1.5 text-[#F9C54B] font-mono text-[11px] font-bold uppercase tracking-wide mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>🔒 CARRIER DATA PRIVACY COVENANT:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances.
                        </p>
                      </div>

                      {/* TWO SEPARATE, UNBUNDLED, OPTIONAL CHECKBOXES */}
                      <div className="space-y-3 pt-1">
                        <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-[#D5DDE0] dark:border-slate-700 hover:border-[#0A4251] transition-colors">
                          <div className="pt-0.5">
                            <input
                              id="sms-consent-transactional-buy"
                              type="checkbox"
                              checked={consentTransactional}
                              onChange={(e) => setConsentTransactional(e.target.checked)}
                              className="w-4 h-4 text-[#0A4251] border-slate-300 rounded focus:ring-[#0A4251] cursor-pointer"
                            />
                          </div>
                          <label
                            htmlFor="sms-consent-transactional-buy"
                            className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer select-none"
                          >
                            I agree to receive transactional and informational text messages from <strong className="text-slate-900 dark:text-white">Abode Mode</strong> at the phone number provided regarding off-market land matches and closing coordination. Message frequency varies. Message and data rates may apply. Reply <strong className="text-slate-900 dark:text-white">STOP</strong> to cancel, <strong className="text-slate-900 dark:text-white">HELP</strong> for help. Consent is optional. View our{' '}
                            <a
                              href="/privacy.html"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0A4251] dark:text-cyan-400 underline font-semibold hover:text-[#00171C]"
                            >
                              Privacy Policy
                            </a>{' '}
                            and{' '}
                            <a
                              href="/terms.html"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0A4251] dark:text-cyan-400 underline font-semibold hover:text-[#00171C]"
                            >
                              Terms of Service
                            </a>
                            .
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex items-center justify-between pt-6 border-t border-[#D5DDE0] dark:border-slate-800">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0A4251] hover:bg-[#00171C] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer font-serif"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#00171C] border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to Desk...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit {activeFlow === 'sell' ? 'Property for Cash Offer' : 'Buyer Criteria'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </form>

          </div>
        )}

      </div>

      {/* Parcel Pin-Drop Modal */}
      <ParcelPinDropModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        initialCoordinates={pinnedCoordinates}
        initialSearchQuery={sellCounty ? `${sellCounty} County, ${sellState}` : ''}
        onConfirm={(coords) => {
          setPinnedCoordinates(coords);
          if (unknownAddress) {
            setSellParcelOrAddress(`GPS Coordinates: ${coords.formatted}`);
          }
        }}
      />
    </section>
  );
};
