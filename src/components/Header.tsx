import React, { useState } from 'react';
import { Share2, Phone, Menu, X, ArrowUpRight, HardDrive, FileSpreadsheet } from 'lucide-react';
import brokerImg from '../assets/images/abode_broker_1790971379949.jpg';
import { ENTITY_DETAILS } from '../data/policyData';

interface HeaderProps {
  onOpenPrivacyPolicy: (sectionId?: string) => void;
  onOpenShareModal: () => void;
  onSelectFlow: (flow: 'sell' | 'buy') => void;
  onOpenDriveVault: () => void;
  onOpenSheetsHub: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenPrivacyPolicy,
  onOpenShareModal,
  onSelectFlow,
  onOpenDriveVault,
  onOpenSheetsHub,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-cyan-950/60 bg-[#061014]/90 backdrop-blur sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Intake Phone Bar */}
        <div className="flex items-center justify-between text-xs py-2 text-cyan-400/80 border-b border-cyan-900/30">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium tracking-wide">DIRECT INTAKE LINE:</span>
            <a
              href={`tel:${ENTITY_DETAILS.primaryPhoneRaw}`}
              className="text-amber-400 font-semibold hover:underline"
            >
              {ENTITY_DETAILS.primaryPhone}
            </a>
            <span className="hidden sm:inline text-cyan-600">|</span>
            <span className="hidden sm:inline text-slate-400">Nationwide Acquisitions Across All 50 States</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onOpenPrivacyPolicy()}
              type="button"
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Privacy Policy &amp; 10DLC
            </button>
            <span className="text-cyan-800">•</span>
            <span className="font-semibold text-slate-300">ABODE-MODE LLC</span>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className="flex items-center justify-between py-4">
          
          {/* Brand Identity Lockup */}
          <a
            href="#top"
            className="flex items-center space-x-3 group cursor-pointer focus-visible:outline-none"
            title="Abode Mode - Nationwide Land Platform"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-400/40 flex items-center justify-center shadow-inner overflow-hidden">
              <img
                src={brokerImg}
                alt="The Broker - Abode Mode"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <span className="cinzel-text text-lg font-bold tracking-wider text-slate-100 block group-hover:text-amber-300 transition-colors">
                ABODE MODE
              </span>
              <span className="text-[10px] tracking-widest text-amber-400/90 font-medium block font-mono">
                NATIONWIDE LAND PLATFORM
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-7 text-xs uppercase tracking-wider font-semibold">
            <button
              onClick={() => onSelectFlow('sell')}
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-semibold"
            >
              <span>💰</span>
              <span>I Want to Sell</span>
            </button>
            <button
              onClick={() => onSelectFlow('buy')}
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-semibold"
            >
              <span>🗺️</span>
              <span>I Want to Buy</span>
            </button>
            <a
              href="#our-process"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Our Process
            </a>
            <a
              href="#about-us"
              className="text-slate-400 hover:text-white transition-colors"
            >
              About Us
            </a>
            <button
              onClick={() => onOpenPrivacyPolicy()}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer uppercase font-semibold"
            >
              Privacy Policy
            </button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center space-x-3">
            <button
              onClick={onOpenDriveVault}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-700/60 rounded-md transition-all cursor-pointer shadow-sm hover:shadow-cyan-900/40"
              title="Access Google Drive Property Diligence Vault"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>Drive Vault</span>
            </button>
            <button
              onClick={onOpenSheetsHub}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/60 rounded-md transition-all cursor-pointer shadow-sm hover:shadow-emerald-900/40"
              title="Access Google Sheets Lead Pipeline Hub"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sheets Sync</span>
            </button>
            <button
              onClick={onOpenShareModal}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-md transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share Platform</span>
            </button>
            <button
              onClick={() => onSelectFlow('sell')}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wide uppercase text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-md shadow-md shadow-amber-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>⚡</span>
              <span>Get Cash Offer</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onOpenShareModal}
              className="p-2 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Share platform"
            >
              <Share2 className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 text-slate-300 hover:text-white cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </nav>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-cyan-950/60 py-4 space-y-2 text-xs uppercase font-semibold">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectFlow('sell');
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-amber-400 hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <span>💰</span>
              <span>I Want to Sell</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectFlow('buy');
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-cyan-400 hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <span>🗺️</span>
              <span>I Want to Buy</span>
            </button>
            <a
              href="#our-process"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-cyan-950/60 rounded"
            >
              Our Process
            </a>
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-cyan-950/60 rounded"
            >
              About Us
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDriveVault();
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-cyan-300 hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <HardDrive className="w-4 h-4 text-amber-400" />
              <span>Drive Diligence Vault</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSheetsHub();
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-emerald-300 hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Sheets Pipeline Hub</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPrivacyPolicy();
              }}
              className="w-full text-left block px-3 py-2 text-slate-400 hover:text-white hover:bg-cyan-950/60 rounded cursor-pointer"
            >
              Privacy Policy &amp; 10DLC
            </button>

            <div className="pt-2 px-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSelectFlow('sell');
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 font-bold rounded-md text-center block uppercase shadow-md cursor-pointer"
              >
                Get Cash Offer
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
