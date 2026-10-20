import React, { useState } from 'react';
import { X, CheckCircle2, ExternalLink, ShieldCheck, Copy, Check, Info, FileSpreadsheet } from 'lucide-react';
import { COMPLIANCE_CHECKLIST, ENTITY_DETAILS } from '../data/policyData';

interface ComplianceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const ComplianceInspectorModal: React.FC<ComplianceInspectorModalProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleCopyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00171C]/85 backdrop-blur-sm no-print">
      <div
        className="bg-white rounded-lg border border-[#d5dde0] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-labelledby="audit-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#00171C] text-white p-5 border-b border-[#0A4251] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="audit-modal-title" className="text-base font-serif font-bold text-white tracking-wide">
                Carrier A2P 10DLC Regulatory Verification Sheet
              </h2>
              <p className="text-xs text-[#88BBD8] font-mono">
                ABODE-MODE LLC · The Campaign Registry (TCR) &amp; CTIA Compliance Matrix
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#0A4251] transition-colors cursor-pointer"
            aria-label="Close Audit Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Summary Banner */}
        <div className="bg-[#f3f5f6] px-5 py-3 border-b border-[#d5dde0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="font-semibold text-[#0A4251]">Target Entity:</span>
            <span className="font-mono text-slate-900 font-bold">{ENTITY_DETAILS.legalName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">DBA: {ENTITY_DETAILS.dbaName}</span>
          </div>
          <button
            onClick={handleCopyPageUrl}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs text-[#0A4251] hover:text-[#00171C] font-semibold cursor-pointer underline"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Copy Submission URL'}</span>
          </button>
        </div>

        {/* Checklist Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="text-xs text-slate-600 leading-relaxed bg-[#f8fafc] p-3 rounded border border-slate-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#0A4251] shrink-0 mt-0.5" />
            <span>
              This verification matrix confirms adherence to all Tier-1 carrier requirements (AT&amp;T, T-Mobile, Verizon) and CTIA principles for campaign approval. Each requirement below maps directly to an active clause on this page.
            </span>
          </div>

          <div className="divide-y divide-[#d5dde0] border border-[#d5dde0] rounded-md overflow-hidden bg-white">
            {COMPLIANCE_CHECKLIST.map((item, index) => (
              <div
                key={item.id}
                className="p-4 hover:bg-[#f8fafb] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-500">REQ-{index + 1}</span>
                    <h3 className="text-sm font-bold text-slate-900">{item.requirement}</h3>
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                      {item.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.standard}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                    {item.carrierNotice}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateSection(item.sectionTarget);
                  }}
                  className="sm:self-center shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0A4251] hover:text-white bg-slate-100 hover:bg-[#0A4251] border border-[#d5dde0] rounded transition-colors cursor-pointer"
                >
                  <span>Inspect Clause</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Quick Registration Field Mapping */}
          <div className="mt-4 pt-4 border-t border-[#d5dde0] space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wide font-mono text-[11px] text-[#0A4251]">
              Quick Reference for Carrier Portal Registration (TCR / Twilio / Bandwidth / Sinch)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Brand Legal Name</span>
                <span className="font-bold text-slate-800 text-xs">{ENTITY_DETAILS.legalName}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Trade / DBA Name</span>
                <span className="font-bold text-slate-800 text-xs">{ENTITY_DETAILS.dbaName}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Campaign Colorado Desk Phone</span>
                <span className="font-bold text-slate-800 text-xs">{ENTITY_DETAILS.primaryPhone}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Campaign Texas Desk Phone</span>
                <span className="font-bold text-slate-800 text-xs">{ENTITY_DETAILS.secondaryPhone}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">Official Support &amp; Privacy Email</span>
                <span className="font-bold text-slate-800 text-xs">{ENTITY_DETAILS.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f3f5f6] p-4 border-t border-[#d5dde0] flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Status: Fully Compliant for 2026 A2P 10DLC Vetting
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#0A4251] hover:bg-[#00171C] rounded transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
