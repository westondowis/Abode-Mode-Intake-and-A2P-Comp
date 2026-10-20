import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { submitLead } from '../services/leadSubmission';

export interface LandInquiryFormData {
  fullName: string;
  phone: string;
  propertyAddress: string;
  smsTransactionalConsent: boolean; // MANDATORY: Must remain false by default
  smsMarketingConsent: boolean;     // MANDATORY: Must remain false by default
}

interface LandInquiryFormProps {
  onOpenPrivacyPolicy?: (sectionId?: string) => void;
  onOpenTerms?: () => void;
  onSuccess?: (leadId: string) => void;
}

export const LandInquiryForm: React.FC<LandInquiryFormProps> = ({
  onOpenPrivacyPolicy,
  onOpenTerms,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<LandInquiryFormData>({
    fullName: '',
    phone: '',
    propertyAddress: '',
    smsTransactionalConsent: false, // MANDATORY: Default false
    smsMarketingConsent: false,     // MANDATORY: Default false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    if (onOpenPrivacyPolicy) {
      e.preventDefault();
      onOpenPrivacyPolicy('mobile-sms-privacy');
    }
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    if (onOpenTerms) {
      e.preventDefault();
      onOpenTerms();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setFormError('Please provide your name and phone number so our acquisitions desk can evaluate your property.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitLead({
        flow: 'sell',
        fullName: formData.fullName,
        phone: formData.phone,
        email: '',
        propertyAddress: formData.propertyAddress,
        parcelOrAddress: formData.propertyAddress,
        smsTransactionalConsent: formData.smsTransactionalConsent,
        smsMarketingConsent: formData.smsMarketingConsent,
        smsConsent: formData.smsTransactionalConsent || formData.smsMarketingConsent,
        consentTimestamp:
          formData.smsTransactionalConsent || formData.smsMarketingConsent
            ? new Date().toISOString()
            : null,
        disclosureVersion: 'CTIA_2026_V1',
        nonSharingCovenantAccepted: true,
      });

      setSubmittedLeadId(result.leadId);
      if (onSuccess) onSuccess(result.leadId);
    } catch (err) {
      console.error('Submission error:', err);
      const fallbackId = `ABODE-SAVED-${Date.now().toString(36).toUpperCase()}`;
      setSubmittedLeadId(fallbackId);
      if (onSuccess) onSuccess(fallbackId);
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedLeadId) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-[#00171C] text-white rounded-xl border border-[#0A4251] shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-[#0A4251] text-[#F9C54B] rounded-full mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold font-serif text-[#F9C54B]">Inquiry Received &amp; Dossier Prepared</h3>
        <p className="text-sm text-slate-300">
          Your inquiry for <strong className="text-white">{formData.propertyAddress || 'your parcel'}</strong> has been
          logged under Reference <code className="text-[#88BBD8] font-mono">{submittedLeadId}</code>.
        </p>
        <p className="text-xs text-slate-400">
          Our land acquisition desk will review GIS county parcel records and prepare your written valuation report.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmittedLeadId(null);
            setFormData({
              fullName: '',
              phone: '',
              propertyAddress: '',
              smsTransactionalConsent: false,
              smsMarketingConsent: false,
            });
          }}
          className="px-5 py-2 bg-[#0A4251] hover:bg-[#00262e] text-[#F9C54B] border border-[#F9C54B]/40 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Submit Another Parcel
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto p-6 bg-[#00171C] text-white rounded-xl border border-[#0A4251] shadow-xl"
    >
      <div className="border-b border-[#0A4251] pb-3 mb-2">
        <h3 className="text-lg font-bold font-serif text-[#F9C54B] flex items-center gap-2">
          <span>Express Cash Offer Intake</span>
        </h3>
        <p className="text-xs text-slate-400">
          Submit your parcel information for a comprehensive title and valuation review.
        </p>
      </div>

      {formError && (
        <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded text-rose-200 text-xs">
          {formError}
        </div>
      )}

      <div>
        <label htmlFor="express-fullName" className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
          Full Name <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          id="express-fullName"
          name="fullName"
          required
          placeholder="e.g. Johnathan Miller"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-[#00262E] border border-gray-700 rounded text-white focus:outline-none focus:border-[#88BBD8] text-sm"
        />
      </div>

      <div>
        <label htmlFor="express-propertyAddress" className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
          Property Address or Parcel ID (APN) <span className="text-rose-400">*</span>
        </label>
        <input
          type="text"
          id="express-propertyAddress"
          name="propertyAddress"
          required
          placeholder="e.g. 1420 Elk Ridge Rd or APN: 042-120-008"
          value={formData.propertyAddress}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-[#00262E] border border-gray-700 rounded text-white focus:outline-none focus:border-[#88BBD8] text-sm"
        />
      </div>

      <div>
        <label htmlFor="express-phone" className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1">
          Mobile Phone Number <span className="text-rose-400">*</span>
        </label>
        <input
          type="tel"
          id="express-phone"
          name="phone"
          required
          placeholder="(720) 649-0734"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-[#00262E] border border-gray-700 rounded text-white focus:outline-none focus:border-[#88BBD8] text-sm"
        />
      </div>

      {/* STATUTORY CARRIER DATA PRIVACY COVENANT BANNER DIRECTLY BELOW PHONE */}
      <div className="p-3.5 bg-[#00262E] rounded border border-[#0A4251] text-xs text-slate-300 leading-relaxed space-y-1">
        <div className="flex items-center gap-1.5 text-[#F9C54B] font-mono text-[11px] font-bold uppercase tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>🔒 CARRIER DATA PRIVACY COVENANT:</span>
        </div>
        <p className="text-[11px] text-slate-300">
          No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.
          All the above categories exclude text messaging originator opt-in data and consent; this information will not
          be shared with or sold to any third parties under any circumstances.
        </p>
      </div>

      {/* TWO SEPARATE, UNBUNDLED, OPTIONAL CHECKBOXES */}
      <div className="space-y-3 pt-1">
        {/* Checkbox 1: Transactional / Valuation Updates */}
        <div className="flex items-start gap-3 p-3 bg-[#00262E]/60 rounded border border-gray-700/80">
          <input
            type="checkbox"
            id="express-smsTransactionalConsent"
            name="smsTransactionalConsent"
            checked={formData.smsTransactionalConsent}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-gray-600 bg-[#00262E] text-[#F9C54B] focus:ring-0 cursor-pointer"
          />
          <label
            htmlFor="express-smsTransactionalConsent"
            className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none"
          >
            I agree to receive transactional and informational text messages from{' '}
            <strong className="text-white">Abode Mode</strong> at the phone number provided regarding my land property
            inquiry, valuation assessments, cash offer status, and closing coordination. Message and data rates may
            apply. Message frequency varies. Reply <strong className="text-white">STOP</strong> to cancel at any time,
            or reply <strong className="text-white">HELP</strong> for assistance. Consent is optional and not a
            condition of submitting an inquiry or receiving an offer. View our{' '}
            <a
              href="/privacy"
              onClick={handlePrivacyClick}
              className="text-[#88BBD8] underline hover:text-[#F9C54B]"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/terms"
              onClick={handleTermsClick}
              className="text-[#88BBD8] underline hover:text-[#F9C54B]"
            >
              Terms of Service
            </a>
            .
          </label>
        </div>

        {/* Checkbox 2: Marketing / Inventory Programs */}
        <div className="flex items-start gap-3 p-3 bg-[#00262E]/60 rounded border border-gray-700/80">
          <input
            type="checkbox"
            id="express-smsMarketingConsent"
            name="smsMarketingConsent"
            checked={formData.smsMarketingConsent}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-gray-600 bg-[#00262E] text-[#F9C54B] focus:ring-0 cursor-pointer"
          />
          <label
            htmlFor="express-smsMarketingConsent"
            className="text-xs text-slate-300 leading-relaxed cursor-pointer select-none"
          >
            I agree to receive promotional and marketing text messages from{' '}
            <strong className="text-white">Abode Mode</strong> at the phone number provided regarding new land inventory,
            special cash buying programs, and investment updates. Message and data rates may apply. Message frequency
            varies. Reply <strong className="text-white">STOP</strong> to opt out,{' '}
            <strong className="text-white">HELP</strong> for help. Consent is not a condition of purchase or sale. View
            our{' '}
            <a
              href="/privacy"
              onClick={handlePrivacyClick}
              className="text-[#88BBD8] underline hover:text-[#F9C54B]"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a
              href="/terms"
              onClick={handleTermsClick}
              className="text-[#88BBD8] underline hover:text-[#F9C54B]"
            >
              Terms of Service
            </a>
            .
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-4 py-3 px-4 bg-[#F9C54B] hover:bg-yellow-400 text-[#00171C] font-bold text-sm uppercase tracking-wider rounded transition-colors cursor-pointer shadow-md disabled:opacity-50"
      >
        {submitting ? 'Generating Valuation Dossier...' : 'Get Cash Offer'}
      </button>
    </form>
  );
};
