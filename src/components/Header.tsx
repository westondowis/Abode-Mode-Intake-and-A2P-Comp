import React, { useState } from 'react';
import { Share2, Phone, Menu, X, HardDrive, FileSpreadsheet, Sun, Moon, Mail } from 'lucide-react';
import brokerImg from '../assets/images/abode_broker_1790971379949.jpg';
import { ENTITY_DETAILS } from '../data/policyData';
import { useTheme } from '../context/ThemeContext';
import { getAcquisitionMailtoHref, ACQUISITION_EMAIL } from '../utils/contactEmail';

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
  const { theme, toggleTheme } = useTheme();

  const mailtoHref = getAcquisitionMailtoHref();

  return (
    <header className="w-full border-b border-slate-200 bg-white/95 text-slate-800 dark:border-cyan-950/60 dark:bg-[#061014]/90 dark:text-slate-100 backdrop-blur sticky top-0 z-50 no-print transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Intake & Acquisitions Contact Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs py-2 border-b border-slate-200/80 text-slate-600 dark:text-cyan-400/80 dark:border-cyan-900/30 gap-y-1">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold tracking-wide text-slate-700 dark:text-slate-300">DIRECT INTAKE:</span>
              <a
                href={`tel:${ENTITY_DETAILS.primaryPhoneRaw}`}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                title="Call our direct acquisitions desk"
              >
                {ENTITY_DETAILS.primaryPhone}
              </a>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-cyan-900">|</span>

            {/* Direct Acquisition Email with Pre-Filled Mailto Form */}
            <div className="flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold tracking-wide text-slate-700 dark:text-slate-300 hidden md:inline">ACQUISITION DESK:</span>
              <a
                href={mailtoHref}
                className="text-teal-700 dark:text-cyan-300 font-bold hover:underline flex items-center gap-1 group"
                title="Send pre-filled inquiry email to wdowis@abode-mode.com"
              >
                <span>{ACQUISITION_EMAIL}</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">(Direct Email)</span>
              </a>
            </div>

            <span className="hidden lg:inline text-slate-300 dark:text-cyan-900">|</span>
            <span className="hidden lg:inline text-slate-500 dark:text-slate-400">All 50 U.S. States</span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Quick Theme Switch in Top Bar */}
            <button
              onClick={toggleTheme}
              type="button"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label={`Toggle theme (currently ${theme})`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3 h-3 text-indigo-600" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenPrivacyPolicy()}
              type="button"
              className="text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-300 transition-colors cursor-pointer text-[11px] sm:text-xs"
            >
              Privacy &amp; 10DLC
            </button>
            <span className="text-slate-300 dark:text-cyan-800 hidden sm:inline">•</span>
            <span className="font-semibold text-slate-800 dark:text-slate-300 text-[11px] sm:text-xs hidden sm:inline">ABODE-MODE LLC</span>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className="flex items-center justify-between py-3.5">
          
          {/* Brand Identity Lockup */}
          <a
            href="#top"
            className="flex items-center space-x-3 group cursor-pointer focus-visible:outline-none"
            title="Abode Mode - Nationwide Land Platform"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/40 dark:border-amber-400/40 flex items-center justify-center shadow-inner overflow-hidden">
              <img
                src={brokerImg}
                alt="The Broker - Abode Mode"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <span className="cinzel-text text-lg font-bold tracking-wider text-slate-900 dark:text-slate-100 block group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                ABODE MODE
              </span>
              <span className="text-[10px] tracking-widest text-amber-600 dark:text-amber-400 font-semibold block font-mono">
                NATIONWIDE LAND PLATFORM
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-7 text-xs uppercase tracking-wider font-semibold">
            <button
              onClick={() => onSelectFlow('sell')}
              className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold"
            >
              <span>💰</span>
              <span>I Want to Sell</span>
            </button>
            <button
              onClick={() => onSelectFlow('buy')}
              className="text-teal-700 hover:text-teal-800 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer uppercase font-bold"
            >
              <span>🗺️</span>
              <span>I Want to Buy</span>
            </button>
            <a
              href="#our-process"
              className="text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Our Process
            </a>
            <a
              href="#about-us"
              className="text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              About Us
            </a>
            <a
              href={mailtoHref}
              className="text-teal-700 hover:text-teal-800 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="Compose pre-filled email to wdowis@abode-mode.com"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Us</span>
            </a>
          </div>

          {/* Desktop Actions & Theme Toggle */}
          <div className="hidden sm:flex items-center space-x-2.5">
            {/* Easy Sun/Moon Switch Switcher Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className="p-2 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md transition-colors cursor-pointer shadow-xs"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            <button
              onClick={onOpenDriveVault}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-300 dark:text-cyan-300 dark:bg-cyan-950/70 dark:hover:bg-cyan-900/80 dark:border-cyan-700/60 rounded-md transition-all cursor-pointer shadow-xs"
              title="Access Google Drive Property Diligence Vault"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Drive Vault</span>
            </button>
            <button
              onClick={onOpenSheetsHub}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/80 dark:border-emerald-700/60 rounded-md transition-all cursor-pointer shadow-xs"
              title="Access Google Sheets Lead Pipeline Hub & Automation"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sheets Sync</span>
            </button>
            <button
              onClick={onOpenShareModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 dark:text-slate-300 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 dark:border-cyan-800/60 rounded-md transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
              <span className="hidden md:inline">Share</span>
            </button>
            <button
              onClick={() => onSelectFlow('sell')}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wide uppercase text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-md shadow-md shadow-amber-950/20 dark:shadow-amber-950/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>⚡</span>
              <span>Get Cash Offer</span>
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center space-x-1.5">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white rounded cursor-pointer"
              aria-label={`Toggle theme (currently ${theme})`}
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <button
              onClick={onOpenShareModal}
              className="p-2 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer"
              aria-label="Share platform"
            >
              <Share2 className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </nav>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-cyan-950/60 py-4 space-y-2 text-xs uppercase font-semibold">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectFlow('sell');
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <span>💰</span>
              <span>I Want to Sell</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onSelectFlow('buy');
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-teal-700 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <span>🗺️</span>
              <span>I Want to Buy</span>
            </button>
            <a
              href={mailtoHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded"
            >
              <Mail className="w-4 h-4 text-amber-500" />
              <span>Email Acquisitions ({ACQUISITION_EMAIL})</span>
            </a>
            <a
              href="#our-process"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded"
            >
              Our Process
            </a>
            <a
              href="#about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded"
            >
              About Us
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDriveVault();
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-teal-800 dark:text-cyan-300 hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <HardDrive className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Drive Diligence Vault</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSheetsHub();
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-emerald-800 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded cursor-pointer font-bold"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Sheets Pipeline Hub</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                toggleTheme();
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded cursor-pointer"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>Switch to Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Switch to Light Mode</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPrivacyPolicy();
              }}
              className="w-full text-left block px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-cyan-950/60 rounded cursor-pointer"
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
