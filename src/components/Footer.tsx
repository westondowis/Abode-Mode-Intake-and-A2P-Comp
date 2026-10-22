import React from 'react';
import { Phone, Mail, ArrowUp, Share2, Lock, Globe, HardDrive, FileSpreadsheet } from 'lucide-react';
import { BrandWordmark } from './brand/BrandWordmark';
import { ENTITY_DETAILS } from '../data/policyData';
import { getAcquisitionMailtoHref, ACQUISITION_EMAIL } from '../utils/contactEmail';

interface FooterProps {
  onOpenPrivacyPolicy: (sectionId?: string) => void;
  onOpenTerms?: () => void;
  onOpenShareModal: () => void;
  onOpenDriveVault?: () => void;
  onOpenSheetsHub?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPrivacyPolicy,
  onOpenTerms,
  onOpenShareModal,
  onOpenDriveVault,
  onOpenSheetsHub,
}) => {
  const mailtoHref = getAcquisitionMailtoHref();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-100 border-t border-slate-800 dark:bg-[#00171C] dark:text-white dark:border-[#0A4251] pt-14 pb-12 print-surface transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Tier */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Brand Wordmark with Broker Mark */}
          <div className="md:col-span-5 space-y-4">
            <BrandWordmark variant="horizontal" brokerWidth={48} />
            <p className="text-xs text-slate-300 leading-relaxed font-light max-w-sm pt-2">
              Direct institutional acquisition and disposition of residential vacant land and acreage across all 50 U.S. states. Transparent cash transactions, clear titles, and disciplined closing timelines.
            </p>
            <div className="text-[11px] font-mono text-cyan-400 dark:text-[#88BBD8]">
              <span>#AbodeMode · @abodemodeinvest</span>
            </div>
          </div>

          {/* Column 2: Direct Nationwide Intake Desk */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 dark:text-[#F2C864]">
              Direct Acquisitions Desk
            </h4>
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-start gap-2.5">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px] font-sans">Direct Intake Line:</span>
                  <a
                    href={`tel:${ENTITY_DETAILS.primaryPhoneRaw}`}
                    className="text-white hover:text-amber-400 font-bold tracking-wider"
                  >
                    {ENTITY_DETAILS.primaryPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px] font-sans">Coverage:</span>
                  <span className="text-white">All 50 U.S. States</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[11px] font-sans">Acquisitions Email:</span>
                  <a
                    href={mailtoHref}
                    className="text-cyan-300 hover:text-white font-bold hover:underline"
                    title="Compose pre-filled inquiry email to wdowis@abode-mode.com"
                  >
                    {ACQUISITION_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Navigation & Legal Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 dark:text-[#F2C864]">
              Platform &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenPrivacyPolicy();
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Privacy Policy &amp; 10DLC</span>
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => {
                    if (onOpenTerms) {
                      e.preventDefault();
                      onOpenTerms();
                    }
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenPrivacyPolicy('state-disclosures')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Principal Real Estate Notices
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPrivacyPolicy('consumer-rights-opt-out')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  CTIA STOP / HELP Protocols
                </button>
              </li>
              {onOpenDriveVault && (
                <li>
                  <button
                    onClick={onOpenDriveVault}
                    className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-cyan-300"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Drive Diligence Vault</span>
                  </button>
                </li>
              )}
              {onOpenSheetsHub && (
                <li>
                  <button
                    onClick={onOpenSheetsHub}
                    className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-emerald-300"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Google Sheets Pipeline Hub</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenShareModal}
                  className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-cyan-300"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Platform</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Corporate Entity Notice & Trademark Attribution */}
        <div className="pt-8 border-t border-slate-800 dark:border-[#0A4251] space-y-4 text-xs text-slate-400">
          <div className="bg-slate-800/60 dark:bg-[#0A4251]/40 p-4 rounded-lg border border-slate-700/60 dark:border-[#0A4251] text-[11px] leading-relaxed text-slate-300">
            <p>
              <strong className="text-white">Legal Notice &amp; Trademark Attribution: </strong>
              {ENTITY_DETAILS.trademarkNotice} Direct residential and vacant land acquisitions conducted pursuant to applicable state commercial real estate regulations. In prose, write Abode Mode. The hyphen lives in the legal name and in the wordmark, not in a sentence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} {ENTITY_DETAILS.legalName}. All rights reserved. Effective Date: {ENTITY_DETAILS.effectiveDate}.
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Return to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
