import React, { useState } from 'react';
import { X, Lock, Phone, Mail, Printer, ArrowUp, Copy, Check } from 'lucide-react';
import { ENTITY_DETAILS, POLICY_SECTIONS } from '../data/policyData';

interface PrivacyPolicyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

export const PrivacyPolicyOverlay: React.FC<PrivacyPolicyOverlayProps> = ({
  isOpen,
  onClose,
  initialSection,
}) => {
  const [copiedClause, setCopiedClause] = useState(false);

  if (!isOpen) return null;

  const mandatoryClause =
    'No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances.';

  const handleCopyClause = () => {
    navigator.clipboard.writeText(mandatoryClause);
    setCopiedClause(true);
    setTimeout(() => setCopiedClause(false), 2400);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#00171C]/90 backdrop-blur-md flex flex-col items-center p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-4 no-print text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/30">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-serif font-bold text-white">
              Official Privacy Policy &amp; SMS Disclosures
            </h2>
            <p className="text-[11px] text-[#88BBD8] font-mono">
              ABODE-MODE LLC · A2P 10DLC Telecommunications Standards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            type="button"
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#0A4251] hover:bg-[#0e5c70] rounded border border-[#0A4251] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Print Policy Document"
          >
            <Printer className="w-3.5 h-3.5 text-[#88BBD8]" />
            <span className="hidden sm:inline">Print Policy</span>
          </button>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-300 hover:text-white bg-[#0A4251] hover:bg-rose-950/80 rounded-md transition-colors cursor-pointer"
            aria-label="Close Privacy Policy"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Document Canvas (High-Contrast Clean Light Surface) */}
      <div className="w-full max-w-4xl bg-white rounded-lg border border-[#D5DDE0] shadow-2xl p-6 sm:p-12 text-slate-800 space-y-10 print-surface">
        
        {/* Document Header */}
        <div className="border-b border-[#D5DDE0] pb-6 space-y-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251]">
            Official Carrier-Approved Regulatory Publication
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#00171C]">
            ABODE-MODE LLC · Comprehensive Privacy Policy
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-mono">
            <span>Operating as: <strong className="text-slate-800">{ENTITY_DETAILS.dbaName}</strong></span>
            <span>·</span>
            <span>Effective Date: <strong className="text-slate-800">{ENTITY_DETAILS.effectiveDate}</strong></span>
            <span>·</span>
            <span>Jurisdiction: All 50 U.S. States</span>
          </div>
        </div>

        {/* Section 2 Mandatory Highlight Card */}
        <div className="rounded-lg border-2 border-[#0A4251] bg-[#F8FAFB] p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#0A4251]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251]">
                Non-Negotiable Mobile Data Protection Covenant
              </span>
            </div>
            <button
              onClick={handleCopyClause}
              type="button"
              className="text-xs text-[#0A4251] hover:underline font-semibold flex items-center gap-1 cursor-pointer no-print"
            >
              {copiedClause ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedClause ? 'Copied' : 'Copy Clause'}</span>
            </button>
          </div>
          <blockquote className="bg-white p-4 rounded border border-[#D5DDE0] text-sm sm:text-base font-serif font-bold text-[#00171C] leading-relaxed">
            &ldquo;{mandatoryClause}&rdquo;
          </blockquote>
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            All prospective property sellers and buyers communicating regarding real estate transactions with Abode Mode are afforded full protection under CTIA principles and Tier-1 carrier codes of conduct.
          </p>
        </div>

        {/* The 8 Comprehensive Legal Clauses */}
        <div className="space-y-10 divide-y divide-slate-200">
          {POLICY_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="pt-8 first:pt-0 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-[#0A4251] tracking-wider uppercase">
                  Section {section.number}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#00171C]">
                  {section.title}
                </h3>
              </div>

              {section.highlightSummary && (
                <p className="text-xs sm:text-sm font-medium text-[#0A4251] bg-[#F3F5F6] p-3 rounded border border-[#D5DDE0]/70 leading-relaxed">
                  <strong>Summary: </strong> {section.highlightSummary}
                </p>
              )}

              <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
                {section.subsections.map((sub, sIdx) => (
                  <div key={sIdx} className="space-y-2">
                    {sub.subtitle && (
                      <h4 className="font-bold text-slate-900 font-serif pt-1">
                        {sub.subtitle}
                      </h4>
                    )}
                    {sub.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                    {sub.bulletPoints && sub.bulletPoints.length > 0 && (
                      <ul className="space-y-2 pl-4 pt-1">
                        {sub.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className="list-disc pl-1 text-slate-700">
                            {bp}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Corporate Entity Notice in Footer of Document */}
        <div className="border-t border-[#D5DDE0] pt-6 space-y-3 text-xs text-slate-600 font-mono">
          <div className="font-bold text-slate-800">
            {ENTITY_DETAILS.trademarkNotice}
          </div>
          <div>
            Direct Intake Line: {ENTITY_DETAILS.primaryPhone} · Email: {ENTITY_DETAILS.contactEmail} · Nationwide Acquisitions Across All 50 States
          </div>
          <div className="flex justify-end pt-2 no-print">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2 bg-[#0A4251] hover:bg-[#00171C] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
            >
              Close Privacy Policy
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
