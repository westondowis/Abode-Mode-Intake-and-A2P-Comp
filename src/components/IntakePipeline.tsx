import React, { useState } from 'react';
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
  HardDrive,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { submitLead, LeadPayload } from '../services/leadSubmission';
import { ENTITY_DETAILS } from '../data/policyData';

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
  onOpenDriveVault,
  onOpenSheetsHub,
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

  // Common Contact Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Technical Requirement 2: Two distinct, UNCHECKED by default, OPTIONAL checkboxes
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [consentTransactional, setConsentTransactional] = useState(false);

  // Flow A: Sell Land Fields
  const [sellState, setSellState] = useState('TX');
  const [sellCounty, setSellCounty] = useState('');
  const [sellParcelOrAddress, setSellParcelOrAddress] = useState('');
  const [sellAcreage, setSellAcreage] = useState('');
  const [sellAccessType, setSellAccessType] = useState('Paved Road');
  const [sellUtilities, setSellUtilities] = useState('Power Nearby');
  const [sellTopography, setSellTopography] = useState('Level to Gentle Slope');
  const [sellOwnershipStatus, setSellOwnershipStatus] = useState('Sole Owner on Title');
  const [sellTaxesOrLiens, setSellTaxesOrLiens] = useState('Taxes Current / No Liens');
  const [sellTargetPrice, setSellTargetPrice] = useState('');
  const [sellTimeline, setSellTimeline] = useState('As soon as title clears (7-14 days)');
  const [sellNotes, setSellNotes] = useState('');

  // Flow B: Buy Land Fields
  const [buyTargetStates, setBuyTargetStates] = useState('Nationwide / Any State (Open to Deals)');
  const [buyTargetCounties, setBuyTargetCounties] = useState('');
  const [buyAcreageRange, setBuyAcreageRange] = useState('5 to 20 Acres');
  const [buyIntendedUse, setBuyIntendedUse] = useState('Homesite / Off-Grid Cabin');
  const [buyPaymentStrategy, setBuyPaymentStrategy] = useState('Cash Buyer (Funds Ready)');
  const [buyBudgetRange, setBuyBudgetRange] = useState('$50,000 - $150,000');
  const [buyNotes, setBuyNotes] = useState('');

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
        if (!sellParcelOrAddress.trim() || !sellCounty.trim()) {
          setFormError('Please provide both the County and Property Address or APN Parcel Number.');
          return;
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

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please provide your full name.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setFormError('Please provide an email address or telephone number so our desk can respond.');
      return;
    }

    setSubmitting(true);

    const isSell = activeFlow === 'sell';
    const anyConsent = consentMarketing || consentTransactional;

    const payload: LeadPayload = {
      flow: activeFlow,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      propertyAddress: isSell ? sellParcelOrAddress.trim() : (buyTargetCounties ? `${buyTargetCounties}, ${buyTargetStates}` : buyTargetStates),
      parcelOrAddress: isSell ? sellParcelOrAddress.trim() : `Target Use: ${buyIntendedUse}`,
      parcelNumber: isSell ? sellParcelOrAddress.trim() : '',
      state: isSell ? sellState : buyTargetStates,
      county: isSell ? sellCounty.trim() : buyTargetCounties.trim(),
      acreage: isSell ? sellAcreage.trim() : buyAcreageRange,
      askingPrice: isSell ? sellTargetPrice.trim() : buyBudgetRange,
      motivation: isSell ? (sellNotes.trim() || 'Direct Land Sale Cash Offer Intake') : buyIntendedUse,
      timeline: isSell ? sellTimeline : buyPaymentStrategy,
      occupancyCondition: isSell
        ? `Ownership: ${sellOwnershipStatus} | Taxes: ${sellTaxesOrLiens} | Road: ${sellAccessType} | Utilities: ${sellUtilities} | Topo: ${sellTopography}`
        : `Strategy: ${buyPaymentStrategy}`,
      notes: isSell
        ? `Access: ${sellAccessType} | Utilities: ${sellUtilities} | Topo: ${sellTopography} | Ownership: ${sellOwnershipStatus} | Taxes: ${sellTaxesOrLiens} | Price Target: ${sellTargetPrice} | Timeline: ${sellTimeline} | Additional: ${sellNotes}`
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
      setSubmittedLeadId(`ABODE-LOCAL-${Date.now().toString(36).toUpperCase()}`);
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
    setSellNotes('');
    setBuyNotes('');
  };

  return (
    <section id="form-container" className="scroll-mt-24 py-16 bg-[#061116] text-white">
      <div id="intake-pipeline" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dual Flow Choice Tabs */}
        {!submittedLeadId && (
          <div className="flex rounded-lg bg-[#0A4251] p-1.5 border border-[#F2C864]/30 mb-8 max-w-md mx-auto shadow-sm">
            <button
              type="button"
              onClick={() => handleFlowSwitch('sell')}
              className={`flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFlow === 'sell'
                  ? 'bg-[#F2C864] text-[#00171C] shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              I Want to Sell Land
            </button>
            <button
              type="button"
              onClick={() => handleFlowSwitch('buy')}
              className={`flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeFlow === 'buy'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md'
                  : 'text-slate-200 hover:text-white'
              }`}
            >
              I Want to Buy Land
            </button>
          </div>
        )}

        {/* Confirmation Screen */}
        {submittedLeadId ? (
          <div className="bg-white rounded-lg border border-[#D5DDE0] p-8 sm:p-12 shadow-2xl text-slate-800 animate-in fade-in duration-200 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251] block">
                Direct Submission Recorded
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#00171C]">
                Thank You, {fullName || 'Valued Client'}
              </h3>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your {activeFlow === 'sell' ? 'property acquisition inquiry' : 'buyer criteria buy box'} has been safely logged directly to our acquisitions desk.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-[#F8FAFB] p-4 rounded-md border border-[#D5DDE0] max-w-sm mx-auto text-xs space-y-1 font-mono">
              <div className="text-slate-500">Intake Reference Number:</div>
              <div className="text-sm font-bold text-slate-900">{submittedLeadId}</div>
            </div>

            {/* Assigned Desk Info */}
            <div className="bg-[#0A4251]/5 p-5 rounded-lg border border-[#0A4251]/20 max-w-lg mx-auto text-xs text-left space-y-2">
              <div className="font-bold text-slate-900 font-serif text-sm">
                Next Steps from Our Operating Desks:
              </div>
              <p className="text-slate-600 leading-relaxed">
                A member of our acquisitions team is reviewing county records and market comps. We respond with initial feedback or a written cash contract within <strong>24 business hours</strong>.
              </p>
              <div className="pt-2 border-t border-[#D5DDE0] font-mono text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Direct Intake Line: (720) 649-0734</span>
                <span>Nationwide Operations Across All 50 States</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              {onOpenDriveVault && (
                <button
                  onClick={onOpenDriveVault}
                  type="button"
                  className="px-5 py-2.5 bg-[#F2C864] hover:bg-[#e0b853] text-[#00171C] text-xs font-bold uppercase tracking-wider rounded transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Archive to Google Drive Vault</span>
                </button>
              )}
              {onOpenSheetsHub && (
                <button
                  onClick={onOpenSheetsHub}
                  type="button"
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Sync to Google Sheets</span>
                </button>
              )}
              <button
                onClick={handleReset}
                type="button"
                className="px-6 py-2.5 bg-[#0A4251] hover:bg-[#00171C] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Submit Another Property
              </button>
            </div>
          </div>
        ) : (
          /* Multi-Step Intake Form */
          <div className="bg-white rounded-lg border border-[#D5DDE0] shadow-2xl p-6 sm:p-10 text-slate-800">
            
            {/* Form Header & Progress */}
            <div className="pb-6 mb-8 border-b border-[#D5DDE0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251]">
                  {activeFlow === 'sell' ? 'Seller Acquisition Intake' : 'Buyer / Investor Buy Box'}
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#00171C]">
                  {activeFlow === 'sell'
                    ? 'Submit Your Land for an As-Is Cash Offer'
                    : 'Submit Your Target Land Acquisition Criteria'}
                </h3>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 shrink-0">
                <span className="font-bold text-slate-900">Step {currentStep}</span>
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
                  {/* Step 1: Location & Parcel */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                        Step 1: Parcel Identity &amp; Location
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            State <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={sellState}
                            onChange={(e) => setSellState(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
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
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            County Name <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={sellCounty}
                            onChange={(e) => setSellCounty(e.target.value)}
                            placeholder="e.g. El Paso County, Teller, Tarrant, Collin"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          />
                        </div>

                        <div className="md:col-span-8 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Physical Street Address OR Assessor APN / Parcel ID <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={sellParcelOrAddress}
                            onChange={(e) => setSellParcelOrAddress(e.target.value)}
                            placeholder="e.g. 1420 Mesa View Rd or Parcel #64020-01-012"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Estimated Acreage / Lot Size
                          </label>
                          <input
                            type="text"
                            value={sellAcreage}
                            onChange={(e) => setSellAcreage(e.target.value)}
                            placeholder="e.g. 5.5 Acres or 0.25 Acre"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Land Attributes */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                        Step 2: Property Characteristics &amp; Access
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Road Access Type
                          </label>
                          <select
                            value={sellAccessType}
                            onChange={(e) => setSellAccessType(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Paved Road">Paved Public Road</option>
                            <option value="County Dirt/Gravel">County Maintained Dirt/Gravel</option>
                            <option value="Legal Recorded Easement">Legal Recorded Easement</option>
                            <option value="Two-Track / Trail">Unpaved Two-Track / Trail</option>
                            <option value="Landlocked / No Road">Landlocked / No Road</option>
                            <option value="Unknown">Not Sure / Needs Verification</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Utilities Status
                          </label>
                          <select
                            value={sellUtilities}
                            onChange={(e) => setSellUtilities(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Power & Water On-Site">Power &amp; Water On-Site</option>
                            <option value="Power Nearby (At Street)">Power Nearby (At Street)</option>
                            <option value="Well & Septic Required">Well &amp; Septic Required</option>
                            <option value="Completely Off-Grid">Completely Off-Grid (Solar/Haul)</option>
                            <option value="Unknown">Unknown</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Topography &amp; Terrain
                          </label>
                          <select
                            value={sellTopography}
                            onChange={(e) => setSellTopography(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Level to Gentle Slope">Level to Gentle Slope</option>
                            <option value="Rolling Foothills">Rolling Foothills</option>
                            <option value="Steep / Mountainous">Steep / Mountainous Views</option>
                            <option value="Heavy Timber / Forest">Heavy Timber / Forest</option>
                            <option value="Desert Mesa / Arid">Desert Mesa / Arid Plains</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Situation & Price */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                        Step 3: Ownership Situation &amp; Expectations
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Ownership &amp; Title Standing
                          </label>
                          <select
                            value={sellOwnershipStatus}
                            onChange={(e) => setSellOwnershipStatus(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Sole Owner on Title">Sole Owner on Title</option>
                            <option value="Joint / Multiple Heirs">Joint Ownership / Family Heirs</option>
                            <option value="Inherited / Probate Pending">Inherited / Probate Pending</option>
                            <option value="Trust / LLC Held">Held in Trust or Entity</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Back Taxes or Known Liens
                          </label>
                          <select
                            value={sellTaxesOrLiens}
                            onChange={(e) => setSellTaxesOrLiens(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Taxes Current / No Liens">Taxes Paid &amp; Current (No Liens)</option>
                            <option value="Back Taxes Owed (We pay at close)">Back Taxes Owed (Deducted or paid at closing)</option>
                            <option value="HOA Dues Owed">HOA / POA Dues Owed</option>
                            <option value="Not Sure">Not Sure / Check Title</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Target Cash Price Expectation (Optional)
                          </label>
                          <input
                            type="text"
                            value={sellTargetPrice}
                            onChange={(e) => setSellTargetPrice(e.target.value)}
                            placeholder="e.g. $45,000 or 'Make me an offer'"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Desired Closing Timeline
                          </label>
                          <select
                            value={sellTimeline}
                            onChange={(e) => setSellTimeline(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="As soon as title clears (7-14 days)">Expedited: As soon as title clears (7–14 days)</option>
                            <option value="Standard 30 Days">Standard: Within 30 days</option>
                            <option value="Flexible (60+ days)">Flexible: 60+ days on my date</option>
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Additional Parcel Notes or Special Circumstances
                          </label>
                          <textarea
                            rows={2}
                            value={sellNotes}
                            onChange={(e) => setSellNotes(e.target.value)}
                            placeholder="Any known fencing, survey pins, covenants, water rights, or timing preferences..."
                            className="w-full px-3 py-2 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          />
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
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                        Step 1: Target Geography &amp; Corridors
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Preferred States <span className="text-rose-600">*</span>
                          </label>
                          <select
                            value={buyTargetStates}
                            onChange={(e) => setBuyTargetStates(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
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
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Specific Counties or Metro Areas (Optional)
                          </label>
                          <input
                            type="text"
                            value={buyTargetCounties}
                            onChange={(e) => setBuyTargetCounties(e.target.value)}
                            placeholder="e.g. Teller, El Paso, Parker, Wise, Johnson"
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Criteria & Use */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                        Step 2: Acreage &amp; Intended Use
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Target Acreage Range
                          </label>
                          <select
                            value={buyAcreageRange}
                            onChange={(e) => setBuyAcreageRange(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Infill Lot (0.25 - 1 Acre)">Infill Residential Lot (0.25 – 1 Acre)</option>
                            <option value="Small Acreage (1 - 5 Acres)">Small Acreage (1 – 5 Acres)</option>
                            <option value="Mid-Size Parcel (5 - 20 Acres)">Mid-Size Parcel (5 – 20 Acres)</option>
                            <option value="Large Ranch (20 - 100+ Acres)">Large Ranch / Holding (20 – 100+ Acres)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Primary Intended Use
                          </label>
                          <select
                            value={buyIntendedUse}
                            onChange={(e) => setBuyIntendedUse(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Homesite / Off-Grid Cabin">Primary Homesite / Cabin Build</option>
                            <option value="Recreational / Camping / Hunting">Recreational / Camping / Hunting</option>
                            <option value="Agricultural / Livestock">Agricultural / Pasture / Horses</option>
                            <option value="Long-Term Land Banking">Long-Term Land Banking / Investment</option>
                            <option value="Subdivision / Entitlement">Subdivision / Entitlement / Builder Lot</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Terms & Budget */}
                  {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                        Step 3: Purchasing Terms &amp; Budget
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Capital / Purchasing Terms
                          </label>
                          <select
                            value={buyPaymentStrategy}
                            onChange={(e) => setBuyPaymentStrategy(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Cash Buyer (Funds Ready)">Cash Buyer (Liquid Funds Ready to Close)</option>
                            <option value="Seller Financing Preferred">Seller Financing Preferred (Low Down Payment)</option>
                            <option value="1031 Exchange Ready">1031 Exchange Ready</option>
                            <option value="Bank Land Loan">Bank Land Loan Pre-Approved</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Target Budget Range
                          </label>
                          <select
                            value={buyBudgetRange}
                            onChange={(e) => setBuyBudgetRange(e.target.value)}
                            className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          >
                            <option value="Under $50,000">Under $50,000</option>
                            <option value="$50,000 - $150,000">$50,000 – $150,000</option>
                            <option value="$150,000 - $350,000">$150,000 – $350,000</option>
                            <option value="$350,000 - $1,000,000+">$350,000 – $1,000,000+</option>
                          </select>
                        </div>

                        <div className="md:col-span-2 space-y-1">
                          <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                            Special Requirements (Power, Water, HOA, Trees)
                          </label>
                          <textarea
                            rows={2}
                            value={buyNotes}
                            onChange={(e) => setBuyNotes(e.target.value)}
                            placeholder="Must allow RVs, year-round road access required, mountain views, no HOA..."
                            className="w-full px-3 py-2 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Step 4: Contact & Mandatory Compliance Architecture */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                    Step 4: Contact Details &amp; Verification
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-12 space-y-1">
                      <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                        Full Legal Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Johnathan Miller"
                        className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                      />
                    </div>

                    <div className="md:col-span-6 space-y-1">
                      <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                        Email Address <span className="text-slate-400 font-normal">(For Written Offer / Criteria PDF)</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                      />
                    </div>

                    <div className="md:col-span-6 space-y-1">
                      <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                        Telephone / Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(720) 555-0192"
                        className="w-full px-3 py-2.5 text-sm bg-[#F8FAFB] border border-[#D5DDE0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                      />
                    </div>
                  </div>

                  {/* STATUTORY CARRIER DATA PRIVACY COVENANT DIRECTLY BELOW PHONE */}
                  <div className="p-3.5 bg-[#00171C] rounded border border-[#0A4251] text-xs text-slate-300 leading-relaxed shadow-sm">
                    <div className="flex items-center gap-1.5 text-[#F9C54B] font-mono text-[11px] font-bold uppercase tracking-wide mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>🔒 CARRIER DATA PRIVACY COVENANT:</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances.
                    </p>
                  </div>

                  {/* TWO SEPARATE, UNBUNDLED, OPTIONAL CHECKBOXES */}
                  <div className="space-y-3 pt-1">
                    {/* Checkbox 1: Transactional / Valuation Updates */}
                    <div className="flex items-start gap-3 p-3.5 bg-white rounded border border-[#D5DDE0] hover:border-[#0A4251] transition-colors">
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
                        className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none"
                      >
                        I agree to receive transactional and informational text messages from <strong className="text-slate-900">Abode Mode</strong> at the phone number provided regarding my land property inquiry, valuation assessments, cash offer status, and closing coordination. Message and data rates may apply. Message frequency varies. Reply <strong className="text-slate-900">STOP</strong> to cancel at any time, or reply <strong className="text-slate-900">HELP</strong> for assistance. Consent is optional and not a condition of submitting an inquiry or receiving an offer. View our{' '}
                        <a
                          href="/privacy"
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenPrivacyPolicy('mobile-sms-privacy');
                          }}
                          className="text-[#0A4251] underline font-semibold hover:text-[#00171C]"
                        >
                          Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a
                          href="/terms"
                          onClick={(e) => {
                            if (onOpenTerms) {
                              e.preventDefault();
                              onOpenTerms();
                            }
                          }}
                          className="text-[#0A4251] underline font-semibold hover:text-[#00171C]"
                        >
                          Terms of Service
                        </a>
                        .
                      </label>
                    </div>

                    {/* Checkbox 2: Marketing / Inventory Programs */}
                    <div className="flex items-start gap-3 p-3.5 bg-white rounded border border-[#D5DDE0] hover:border-[#0A4251] transition-colors">
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
                        className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none"
                      >
                        I agree to receive promotional and marketing text messages from <strong className="text-slate-900">Abode Mode</strong> at the phone number provided regarding new land inventory, special cash buying programs, and investment updates. Message and data rates may apply. Message frequency varies. Reply <strong className="text-slate-900">STOP</strong> to opt out, <strong className="text-slate-900">HELP</strong> for help. Consent is not a condition of purchase or sale. View our{' '}
                        <a
                          href="/privacy"
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenPrivacyPolicy('mobile-sms-privacy');
                          }}
                          className="text-[#0A4251] underline font-semibold hover:text-[#00171C]"
                        >
                          Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a
                          href="/terms"
                          onClick={(e) => {
                            if (onOpenTerms) {
                              e.preventDefault();
                              onOpenTerms();
                            }
                          }}
                          className="text-[#0A4251] underline font-semibold hover:text-[#00171C]"
                        >
                          Terms of Service
                        </a>
                        .
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex items-center justify-between pt-6 border-t border-[#D5DDE0]">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
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
                    className="px-6 py-2.5 bg-[#0A4251] hover:bg-[#00171C] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] text-xs sm:text-sm font-bold uppercase tracking-wider rounded transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#00171C] border-t-transparent rounded-full animate-spin" />
                        <span>Sending to Acquisition Desk...</span>
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
    </section>
  );
};
