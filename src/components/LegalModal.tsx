import React from 'react';
import { X, ShieldCheck, FileText, AlertTriangle, Phone, Mail, Clock } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'disclaimer' | 'contact' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0f1722] border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#0c131c]">
          <div className="flex items-center gap-3">
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-teal-400" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-sky-400" />}
            {type === 'disclaimer' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {type === 'contact' && <Phone className="w-5 h-5 text-teal-400" />}

            <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms of Use'}
              {type === 'disclaimer' && 'Land Valuation & Verification Disclaimer'}
              {type === 'contact' && 'Talk to our Acquisitions Team'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-300 leading-relaxed">
          {type === 'privacy' && (
            <>
              <p>
                At Abode Mode, your privacy and land ownership data are strictly protected. We collect contact information, parcel coordinates, and property characteristics solely for the purpose of formulating acquisition offers and matching buyer criteria.
              </p>
              <h3 className="font-semibold text-white pt-2">Google Workspace Integration</h3>
              <p>
                When you link your Google Workspace account or submit a request, review tasks and contact cards are created exclusively within your authorized Google Tasks and Google Contacts containers. We never resell or distribute your data to third-party marketing brokers.
              </p>
              <h3 className="font-semibold text-white pt-2">Data Retention</h3>
              <p>
                You may request complete removal of your property assessment records or contact details at any time through our administrative dashboard or by contacting team@abodemode.com.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                By accessing Abode Mode or submitting land data, you agree to provide truthful and accurate information regarding property ownership, APN numbers, and acquisition terms.
              </p>
              <h3 className="font-semibold text-white pt-2">Cash Offer Terms</h3>
              <p>
                Any preliminary cash offer presented on this platform is non-binding until confirmed in an executed Purchase and Sale Agreement, accompanied by satisfactory title examination and verified survey boundaries.
              </p>
              <h3 className="font-semibold text-white pt-2">Direct Principal Status</h3>
              <p>
                Abode Mode operates as an active land buyer and seller. We do not represent users as fiduciary real estate brokers.
              </p>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                Important: Preliminary GIS coordinates and mock boundaries are provided for identification purposes only.
              </div>
              <p>
                All land acreage, legal boundaries, access easements, zoning allowances, soil perk test viability, flood zones, and utility availability are subject to independent survey and municipal planning verification.
              </p>
              <p>
                Abode Mode facilitates closing solely through licensed title agencies and real estate settlement attorneys who provide marketable title insurance policies.
              </p>
            </>
          )}

          {type === 'contact' && (
            <div className="space-y-6">
              <p className="text-slate-300">
                Have questions regarding your parcel, probate land, title curative actions, or 1031 exchange acquisitions? Our land specialists are standing by.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#141f2d] border border-slate-700/60">
                  <div className="flex items-center gap-3 mb-2 text-teal-400">
                    <Phone className="w-4 h-4" />
                    <span className="font-semibold text-white text-sm">Direct Intake Line</span>
                  </div>
                  <p className="text-slate-300 font-mono text-sm">(720) 649-0734</p>
                  <p className="text-xs text-slate-500 mt-1">Available Nationwide</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#141f2d] border border-slate-700/60">
                  <div className="flex items-center gap-3 mb-2 text-sky-400">
                    <Mail className="w-4 h-4" />
                    <span className="font-semibold text-white text-sm">Acquisitions Email</span>
                  </div>
                  <p className="text-slate-300 text-sm">team@abodemode.com</p>
                  <p className="text-xs text-slate-500 mt-1">Typical response under 2 hours</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 flex items-center gap-3 text-xs text-teal-300">
                <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>
                  Our land underwriting team operates 7 days a week to review submissions and dispatch cash offers.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0c131c] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
