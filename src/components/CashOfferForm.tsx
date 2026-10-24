import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Wrench, 
  DollarSign, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  AlertCircle,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import { ENTITY_DETAILS } from '../data/policyData';

export interface PropertySubmission {
  id: string;
  timestamp: string;
  address: string;
  propertyType: 'single-family' | 'vacant-land' | 'multi-unit' | 'rural-acreage';
  condition: 'turnkey' | 'cosmetic' | 'moderate' | 'major-rehab' | 'raw-land';
  timeline: '7-14-days' | '30-days' | 'flexible';
  estimatedSize: string;
  askingPriceExpectation: string;
  ownerName: string;
  email: string;
  phone: string;
  smsConsent: boolean;
  notes?: string;
  estimatedOfferBracket: {
    low: number;
    high: number;
  };
  assignedDesk: {
    region: 'Colorado' | 'Texas' | 'National';
    phone: string;
    director: string;
  };
}

interface CashOfferFormProps {
  onOpenPrivacyPolicy: (sectionId?: string) => void;
  onOpenAuditModal: () => void;
}

export const CashOfferForm: React.FC<CashOfferFormProps> = ({
  onOpenPrivacyPolicy,
  onOpenAuditModal,
}) => {
  // Form fields
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<'single-family' | 'vacant-land' | 'multi-unit' | 'rural-acreage'>('single-family');
  const [condition, setCondition] = useState<'turnkey' | 'cosmetic' | 'moderate' | 'major-rehab' | 'raw-land'>('cosmetic');
  const [timeline, setTimeline] = useState<'7-14-days' | '30-days' | 'flexible'>('7-14-days');
  const [estimatedSize, setEstimatedSize] = useState('');
  const [askingPriceExpectation, setAskingPriceExpectation] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // CTIA Requirement 1: UNCHECKED BY DEFAULT
  const [smsConsent, setSmsConsent] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<PropertySubmission | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate preliminary valuation bracket
  const calculateOfferBracket = () => {
    let base = 250000;
    const lowerAddress = address.toLowerCase();

    // Regional baseline adjustments
    if (lowerAddress.includes('co') || lowerAddress.includes('colorado') || lowerAddress.includes('springs') || lowerAddress.includes('el paso')) {
      base = 380000;
    } else if (lowerAddress.includes('tx') || lowerAddress.includes('texas') || lowerAddress.includes('fort worth') || lowerAddress.includes('tarrant') || lowerAddress.includes('dallas')) {
      base = 320000;
    }

    if (propertyType === 'vacant-land' || propertyType === 'rural-acreage') {
      base = 125000;
    } else if (propertyType === 'multi-unit') {
      base = 450000;
    }

    // Condition multiplier
    let conditionFactor = 0.85;
    if (condition === 'turnkey') conditionFactor = 0.95;
    if (condition === 'cosmetic') conditionFactor = 0.88;
    if (condition === 'moderate') conditionFactor = 0.80;
    if (condition === 'major-rehab') conditionFactor = 0.68;
    if (condition === 'raw-land') conditionFactor = 0.85;

    // Timeline factor
    let timelineFactor = 1.0;
    if (timeline === '7-14-days') timelineFactor = 0.96; // rapid close discount

    const mid = Math.round(base * conditionFactor * timelineFactor / 1000) * 1000;
    const low = Math.round(mid * 0.92 / 1000) * 1000;
    const high = Math.round(mid * 1.08 / 1000) * 1000;

    return { low, high };
  };

  const determineAssignedDesk = () => {
    const lower = address.toLowerCase();
    if (lower.includes('tx') || lower.includes('texas') || lower.includes('fort worth') || lower.includes('dfw') || lower.includes('dallas')) {
      return {
        region: 'Texas' as const,
        phone: ENTITY_DETAILS.secondaryPhone,
        director: 'Texas Acquisition Desk · ABODE-MODE LLC',
      };
    }
    return {
      region: 'Colorado' as const,
      phone: ENTITY_DETAILS.primaryPhone,
      director: 'Colorado Principal Desk · ABODE-MODE LLC',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!address.trim()) {
      setFormError('Please enter a valid property street address or parcel number.');
      return;
    }
    if (!ownerName.trim()) {
      setFormError('Please enter the property owner or primary contact name.');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setFormError('Please provide at least one contact channel (email address or telephone).');
      return;
    }

    setSubmitting(true);

    const offerBracket = calculateOfferBracket();
    const desk = determineAssignedDesk();

    const newSubmission: PropertySubmission = {
      id: `ABODE-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      address,
      propertyType,
      condition,
      timeline,
      estimatedSize,
      askingPriceExpectation,
      ownerName,
      email,
      phone,
      smsConsent,
      notes,
      estimatedOfferBracket: offerBracket,
      assignedDesk: desk,
    };

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newSubmission.id,
          flow: 'sell',
          fullName: ownerName,
          phone,
          email,
          propertyAddress: address,
          askingPrice: askingPriceExpectation || '$25,000 Cash',
          motivation: notes || `Condition: ${condition}`,
          timeline,
          occupancyCondition: condition,
          propertyType,
          smsTransactionalConsent: smsConsent,
          smsConsent: smsConsent,
          submittedAt: newSubmission.timestamp,
        }),
      });
    } catch (err) {
      console.warn('[CashOfferForm] Backend dispatch warning:', err);
    }

    setSubmittedData(newSubmission);
    setSubmitting(false);
    window.scrollTo({ top: document.getElementById('cash-offer-section')?.offsetTop || 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    setAddress('');
    setOwnerName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setSmsConsent(false);
  };

  return (
    <section id="cash-offer-section" className="scroll-mt-24 py-12 md:py-16 bg-[#00171C] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4251] border border-[#F2C864]/40 rounded text-xs font-mono tracking-wider text-[#F2C864] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Commercial Acquisition Desk · Colorado &amp; Texas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white">
            Request an As-Is Written Cash Offer
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            Direct institutional acquisition of residential houses and raw land parcels. No realtor commissions, no staging inspections, and title-backed cash closing on your timeline.
          </p>
        </div>

        {/* If Form is Submitted: Show Assessment Certificate */}
        {submittedData ? (
          <div className="max-w-3xl mx-auto bg-white rounded-lg border-2 border-[#0A4251] p-6 sm:p-10 shadow-2xl text-slate-800 animate-in fade-in duration-300 print-surface">
            
            {/* Certificate Header */}
            <div className="border-b-2 border-[#0A4251] pb-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251] block">
                  Official Acquisition Assessment
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#00171C]">
                  Preliminary Cash Offer Bracket
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Reference File ID: <span className="font-bold text-slate-800">{submittedData.id}</span> · Submitted: {new Date(submittedData.timestamp).toLocaleDateString()}
                </p>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs font-semibold text-[#0A4251] bg-[#f3f5f6] hover:bg-[#0A4251] hover:text-white rounded border border-[#d5dde0] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Offer</span>
                </button>
                <button
                  onClick={handleResetForm}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
                >
                  New Property
                </button>
              </div>
            </div>

            {/* High-Impact Estimated Bracket */}
            <div className="bg-[#0A4251] text-white p-6 rounded-lg border border-[#F2C864]/40 shadow-sm mb-6 text-center space-y-2">
              <span className="text-xs font-mono tracking-widest text-[#88BBD8] uppercase block">
                Estimated As-Is Cash Valuation Range
              </span>
              <div className="text-3xl sm:text-5xl font-serif font-bold text-[#F2C864] tracking-tight">
                ${submittedData.estimatedOfferBracket.low.toLocaleString()} — ${submittedData.estimatedOfferBracket.high.toLocaleString()}
              </div>
              <p className="text-xs text-slate-200 font-light max-w-lg mx-auto pt-1">
                Net cash to seller. Zero broker commissions (save 6%), no repair credits required, and Abode Mode pays standard seller closing costs.
              </p>
            </div>

            {/* Property Underwriting Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-6">
              <div className="bg-[#f8fafc] p-4 rounded border border-[#d5dde0] space-y-1">
                <span className="text-slate-500 font-mono block">Property Address</span>
                <span className="font-bold text-slate-900 text-sm block">{submittedData.address}</span>
                <span className="text-slate-500">
                  Type: <strong className="capitalize">{submittedData.propertyType.replace('-', ' ')}</strong> · Condition: <strong className="capitalize">{submittedData.condition.replace('-', ' ')}</strong>
                </span>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded border border-[#d5dde0] space-y-1">
                <span className="text-slate-500 font-mono block">Target Closing Horizon</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {submittedData.timeline === '7-14-days' ? 'Expedited 7–14 Days Cash Close' : submittedData.timeline === '30-days' ? 'Standard 30 Days Title Close' : 'Flexible Owner Timeline'}
                </span>
                <span className="text-slate-500">
                  Seller Contact: <strong>{submittedData.ownerName}</strong>
                </span>
              </div>
            </div>

            {/* Designated Acquisition Desk & Assigned Principal */}
            <div className="border border-[#0A4251]/20 bg-[#0A4251]/5 rounded-lg p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0A4251]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251]">
                    Assigned Acquisition Desk
                  </span>
                </div>
                <span className="text-xs font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                  Desk Active
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
                <div>
                  <div className="text-sm font-bold text-slate-900">{submittedData.assignedDesk.director}</div>
                  <div className="text-slate-600">Assigned Direct Line: <a href={`tel:${submittedData.assignedDesk.phone.replace(/\D/g, '')}`} className="font-mono font-bold text-[#0A4251] hover:underline">{submittedData.assignedDesk.phone}</a></div>
                </div>
                <div className="text-slate-500 text-[11px] sm:text-right">
                  Written Purchase Agreement dispatched within <strong className="text-slate-900">24 Business Hours</strong>
                </div>
              </div>
            </div>

            {/* Telecommunications Consent Audit Record */}
            <div className="border-t border-[#d5dde0] pt-4 text-xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-700">A2P 10DLC Consent Status:</span>
                <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                  submittedData.smsConsent 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-slate-100 text-slate-700 border border-slate-300'
                }`}>
                  {submittedData.smsConsent ? 'SMS Consent Opt-In Logged' : 'SMS Unenrolled (Voice & Email Only)'}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {submittedData.smsConsent ? (
                  <>
                    Logged affirmative opt-in for updates to <strong>{submittedData.phone}</strong>. You may reply <strong>STOP</strong> at any time to cancel, or <strong>HELP</strong> for care. CTIA non-negotiable clause enforced: mobile records are never shared with third parties.
                  </>
                ) : (
                  <>
                    No SMS opt-in was selected. Communications regarding this property will be conducted via email (<strong>{submittedData.email}</strong>) and direct phone consultation.
                  </>
                )}
              </p>
            </div>

          </div>
        ) : (
          /* Intake Form */
          <div className="max-w-4xl mx-auto bg-white rounded-lg border border-[#d5dde0] shadow-2xl p-6 sm:p-10 text-slate-800">
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1: Real Property Coordinates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#d5dde0] pb-3">
                  <span className="w-6 h-6 rounded-full bg-[#0A4251] text-white flex items-center justify-center font-mono text-xs font-bold">
                    1
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#00171C]">
                    Property Location &amp; Parcel Coordinates
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-12 space-y-1">
                    <label htmlFor="property-address" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Property Street Address or County &amp; APN Parcel Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="property-address"
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 1420 Mesa View Dr, Colorado Springs, CO 80904 or Tarrant County APN #048291"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 placeholder-slate-400"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Property Type Selector */}
                  <div className="md:col-span-6 space-y-1">
                    <label htmlFor="property-type" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Property Category
                    </label>
                    <div className="relative">
                      <select
                        id="property-type"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                      >
                        <option value="single-family">Single Family Residential Home</option>
                        <option value="vacant-land">Vacant Residential / Commercial Land</option>
                        <option value="multi-unit">Multi-Unit / Duplex / Fourplex</option>
                        <option value="rural-acreage">Rural Acreage / Mountain Parcel</option>
                      </select>
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Physical Condition */}
                  <div className="md:col-span-6 space-y-1">
                    <label htmlFor="property-condition" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Current Property Condition
                    </label>
                    <div className="relative">
                      <select
                        id="property-condition"
                        value={condition}
                        onChange={(e) => setCondition(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                      >
                        <option value="turnkey">Pristine / Turnkey Move-In Condition</option>
                        <option value="cosmetic">Minor Cosmetic Updates (Paint/Carpet)</option>
                        <option value="moderate">Moderate Repairs Needed (Roof/HVAC/Kitchen)</option>
                        <option value="major-rehab">Major Rehab / Structural / Probate / Fire</option>
                        <option value="raw-land">Raw Undeveloped Acreage / No Structures</option>
                      </select>
                      <Wrench className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Square footage or acreage */}
                  <div className="md:col-span-6 space-y-1">
                    <label htmlFor="property-size" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Estimated Size (Sq Ft or Acres)
                    </label>
                    <input
                      id="property-size"
                      type="text"
                      value={estimatedSize}
                      onChange={(e) => setEstimatedSize(e.target.value)}
                      placeholder="e.g. 2,150 sqft or 5.2 acres"
                      className="w-full px-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 placeholder-slate-400"
                    />
                  </div>

                  {/* Asking expectation / timeline */}
                  <div className="md:col-span-6 space-y-1">
                    <label htmlFor="property-timeline" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Desired Closing Timeline
                    </label>
                    <div className="relative">
                      <select
                        id="property-timeline"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900"
                      >
                        <option value="7-14-days">Expedited: 7–14 Days Direct Title Close</option>
                        <option value="30-days">Standard: 30 Days Title Escrow</option>
                        <option value="flexible">Flexible: 60+ Days (Owner Decides Date)</option>
                      </select>
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Owner Contact Coordinates */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#d5dde0] pb-3">
                  <span className="w-6 h-6 rounded-full bg-[#0A4251] text-white flex items-center justify-center font-mono text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#00171C]">
                    Seller Verification &amp; Valuation Delivery Channel
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4 space-y-1">
                    <label htmlFor="owner-name" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Owner Full Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="owner-name"
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Legal Owner or Trustee"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 placeholder-slate-400"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label htmlFor="owner-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Email Address <span className="text-slate-400 font-normal">(For Written Offer PDF)</span>
                    </label>
                    <div className="relative">
                      <input
                        id="owner-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 placeholder-slate-400"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-1">
                    <label htmlFor="owner-phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Telephone / Mobile <span className="text-slate-400 font-normal">(For Acquisitions Desk)</span>
                    </label>
                    <div className="relative">
                      <input
                        id="owner-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(719) 555-0192"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 placeholder-slate-400"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Optional notes */}
                  <div className="md:col-span-12 space-y-1">
                    <label htmlFor="owner-notes" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                      Property Particulars, Back Taxes, or Mortgage Notes (Optional)
                    </label>
                    <textarea
                      id="owner-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Inherited in probate, needs new roof, looking to close by the 25th, or vacant land without power."
                      className="w-full px-3 py-2 text-sm bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: MANDATORY A2P 10DLC & CTIA COMPLIANCE CONTAINER */}
              <div className="bg-[#f8fafb] p-5 sm:p-6 rounded-lg border-2 border-[#0A4251]/40 space-y-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#0A4251]" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251]">
                    Carrier-Compliant Telephony &amp; SMS Protocol (CTIA / 10DLC)
                  </h4>
                </div>

                {/* Requirement 1: UNCHECKED BY DEFAULT CHECKBOX with Exact Mandatory Language */}
                <div className="flex items-start gap-3 bg-white p-4 rounded border border-[#d5dde0]">
                  <div className="pt-0.5">
                    <input
                      id="sms-consent-checkbox"
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="w-4 h-4 text-[#0A4251] border-slate-300 rounded focus:ring-[#0A4251] cursor-pointer"
                    />
                  </div>
                  <label htmlFor="sms-consent-checkbox" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
                    By providing your phone number and checking this box, you agree to receive SMS communications from{' '}
                    <strong className="text-slate-900">ABODE-MODE LLC</strong> (d/b/a <strong className="text-slate-900">Abode Mode</strong>) regarding property valuations, written offers, and closing milestones. Message &amp; data rates may apply. Message frequency varies. Reply <strong className="text-slate-900 font-mono">STOP</strong> to cancel at any time, reply <strong className="text-slate-900 font-mono">HELP</strong> for assistance. Consent is not a condition of purchase. View our{' '}
                    <button
                      type="button"
                      onClick={() => onOpenPrivacyPolicy('mobile-sms-privacy')}
                      className="text-[#0A4251] font-semibold underline hover:text-[#00171C] cursor-pointer"
                    >
                      Privacy Policy (#mobile-sms-privacy)
                    </button>{' '}
                    and Terms of Service.
                  </label>
                </div>

                {/* Requirement 4: PROMINENTLY DISPLAY THE NON-NEGOTIABLE CARRIER CLAUSE */}
                <div className="bg-[#00171C] text-white p-4 rounded border border-[#0A4251] text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-[#F2C864] font-mono text-[11px] font-bold uppercase">
                    <ShieldCheck className="w-4 h-4 text-[#F2C864]" />
                    <span>Non-Negotiable Carrier Data Safeguard</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-[11.5px] font-sans">
                    &ldquo;No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances.&rdquo;
                  </p>
                </div>

                {/* CTIA Requirement 2 notice */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>* Form submission does NOT require SMS opt-in for general property evaluation.</span>
                  <button
                    type="button"
                    onClick={onOpenAuditModal}
                    className="text-[#0A4251] hover:underline font-semibold cursor-pointer"
                  >
                    View 8-Point Vetting Matrix
                  </button>
                </div>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-slate-500 font-mono">
                  Colorado Desk: (719) 502-7119 · Texas Desk: (817) 756-9550
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] font-bold text-sm tracking-wide uppercase rounded transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#00171C] border-t-transparent rounded-full animate-spin" />
                      <span>Generating Preliminary Valuation...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Written Cash Offer</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        )}

      </div>
    </section>
  );
};
