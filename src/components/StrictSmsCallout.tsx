import React, { useState } from 'react';
import { Copy, Check, Lock, ShieldCheck, FileCheck } from 'lucide-react';

export const StrictSmsCallout: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const exactMandatoryClause =
    'No mobile information will be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with or sold to any third parties under any circumstances.';

  const handleCopy = () => {
    navigator.clipboard.writeText(exactMandatoryClause);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div className="my-8 rounded-lg border-2 border-[#0A4251] bg-[#f8fafb] p-6 sm:p-8 shadow-xs compliance-callout-print page-break-inside-avoid">
      {/* Header bar within callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#d5dde0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251] block">
              Carrier A2P 10DLC Mandatory Compliance Clause
            </span>
            <span className="text-xs text-slate-500 font-sans">
              CTIA Strict Mobile Privacy &amp; Non-Transferability Covenant
            </span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0A4251] hover:text-[#00171C] bg-white hover:bg-slate-100 rounded border border-[#d5dde0] transition-colors cursor-pointer shadow-2xs"
          title="Copy verbatim clause for carrier registration or TCR audit"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Copied to Clipboard</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#0A4251]" />
              <span>Copy Verbatim Clause</span>
            </>
          )}
        </button>
      </div>

      {/* The Non-Negotiable Verbatim Text */}
      <blockquote className="my-2 bg-white p-5 sm:p-6 rounded border border-[#d5dde0] text-slate-900 leading-relaxed shadow-2xs">
        <p className="text-base sm:text-lg font-serif font-bold text-[#00171C] tracking-tight">
          &ldquo;{exactMandatoryClause}&rdquo;
        </p>
      </blockquote>

      {/* Explanatory context for carrier vetting analysts */}
      <div className="mt-4 pt-3 border-t border-[#d5dde0]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="font-semibold text-[#0A4251]">Vetting Standard:</span>
          <span>10DLC Direct Carrier Guidelines &amp; TCR Registration Code</span>
        </div>
        <div className="font-mono text-slate-500">
          Enforced by: ABODE-MODE LLC Acquisitions Desk
        </div>
      </div>
    </div>
  );
};
