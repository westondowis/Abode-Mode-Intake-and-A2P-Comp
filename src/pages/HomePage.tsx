import React from 'react';
import {
  MapPin,
  ClipboardList,
  Sparkles,
  Clock,
  ShieldCheck,
  Globe2,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';
import { BrokerAvatar } from '../components/brand/BrokerAvatar';
import { AbodeWordmark } from '../components/brand/AbodeWordmark';
import { AbodeSeal } from '../components/brand/AbodeSeal';
import { AbodeLockup } from '../components/brand/AbodeLockup';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onOpenContact: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenContact }) => {
  return (
    <div className="space-y-16 sm:space-y-24 py-8 sm:py-14">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6">
        {/* Brand Tag Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0A4251]/80 border border-[#F2C864]/40 text-[#F2C864] text-xs sm:text-sm font-semibold mb-6 shadow-md select-none animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="w-2 h-2 rounded-full bg-[#F2C864] animate-pulse" />
          <span className="tracking-wide">ABODE-MODE LLC • Direct Land Acquisition & Exchange</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] leading-[1.1]">
          What would you <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2C864] via-amber-200 to-[#88BBD8]">
            like to do?
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Submit your property or buying criteria in just a few minutes. There is no obligation.
        </p>

        {/* Live Market Counter pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F2C864]" />
            <span>Average initial valuation: <strong>24 Hours</strong></span>
          </div>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-[#88BBD8]" />
            <span>Over <strong>1,400+ Parcels</strong> Underwritten</span>
          </div>
        </div>
      </section>

      {/* Main Actions (Grid Layout - 3 Cards as specified) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: I'm Looking to Sell Land */}
          <div
            onClick={() => onNavigate('/sell')}
            className="group relative flex flex-col justify-between rounded-3xl bg-[#00171C] border border-[#0A4251] hover:border-[#F2C864]/70 p-7 sm:p-9 shadow-xl hover:shadow-2xl hover:shadow-[#F2C864]/5 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A4251]/20 rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#0A4251] border border-[#F2C864]/40 flex items-center justify-center text-[#F2C864] mb-6 group-hover:scale-105 transition-all shadow-md">
                <MapPin className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold text-white group-hover:text-[#F2C864] transition-colors font-['Plus_Jakarta_Sans']">
                I'm Looking to Sell Land
              </h2>

              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Receive a direct, all-cash offer for your vacant acreage or rural parcel. We cover 100% of closing costs, handle all back-tax title clearances, and charge zero realtor commissions.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2C864] flex-shrink-0" />
                  <span>Cash offers dispatched in 24-48 business hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2C864] flex-shrink-0" />
                  <span>Closing via certified title companies</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#0A4251]/80 flex items-center justify-between">
              <span className="text-[#F2C864] font-bold text-sm group-hover:text-amber-300 transition-colors flex items-center gap-2">
                Start selling <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[11px] font-mono text-slate-500">Step 1 of 6</span>
            </div>
          </div>

          {/* Card 2: I'm Looking to Buy Land */}
          <div
            onClick={() => onNavigate('/buy')}
            className="group relative flex flex-col justify-between rounded-3xl bg-[#00171C] border border-[#0A4251] hover:border-[#88BBD8]/70 p-7 sm:p-9 shadow-xl hover:shadow-2xl hover:shadow-[#88BBD8]/5 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0A4251]/20 rounded-bl-[100px] pointer-events-none group-hover:scale-110 transition-transform" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#0A4251] border border-[#88BBD8]/40 flex items-center justify-center text-[#88BBD8] mb-6 group-hover:scale-105 transition-all shadow-md">
                <ClipboardList className="w-7 h-7" />
              </div>

              <h2 className="text-2xl font-bold text-white group-hover:text-[#88BBD8] transition-colors font-['Plus_Jakarta_Sans']">
                I'm Looking to Buy Land
              </h2>

              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Define your exact dream acreage, preferred terrain, and budget. Get prioritized direct access to vetted, off-market acreage deals before public MLS syndication.
              </p>

              <div className="mt-5 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#88BBD8] flex-shrink-0" />
                  <span>Wholesale & owner-financed inventory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#88BBD8] flex-shrink-0" />
                  <span>Clean title & survey guaranteed</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#0A4251]/80 flex items-center justify-between">
              <span className="text-[#88BBD8] font-bold text-sm group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                Start buying <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[11px] font-mono text-slate-500">Step 1 of 3</span>
            </div>
          </div>

          {/* Card 3: Abode Mode Guarantee (Stylized promotional card using Field Teal and official Brand Seal/Wordmark) */}
          <div className="relative flex flex-col justify-between rounded-3xl bg-[#0A4251] border-2 border-[#F2C864]/50 p-7 sm:p-9 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-25 pointer-events-none">
              <AbodeSeal size="lg" />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00171C]/70 border border-[#F2C864]/40 text-[#F2C864] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#F2C864]" />
                  <span>Official Guarantee</span>
                </div>
                <BrokerAvatar size="sm" variant="circle" />
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-snug font-['Plus_Jakarta_Sans']">
                Fashionably Easy Property Sales: Direct cash acquisitions, transparent terms, and zero agent commissions.
              </h3>

              <div className="mt-4 p-3.5 rounded-xl bg-[#00171C]/60 border border-[#F2C864]/30 text-xs text-[#88BBD8]">
                <p className="font-semibold text-white">"A clean sale. A clear number."</p>
                <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
                  Traditional land sales sit on the market for 8 to 14 months. Abode Mode provides certainty with liquid funds and direct escrow closings.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F2C864]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-white font-medium">
                <ShieldCheck className="w-4 h-4 text-[#F2C864]" />
                <span>Zero Hidden Fees</span>
              </div>
              <button
                onClick={() => onNavigate('/sell')}
                className="px-4 py-2 rounded-xl bg-[#F2C864] hover:bg-amber-300 text-[#00171C] font-bold text-xs shadow-lg transition-colors"
              >
                Get Cash Offer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Row: Three horizontal icon blocks detailing benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Benefit 1: Under 5 minutes */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#00171C] border border-[#0A4251] flex items-start gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#0A4251] border border-[#F2C864]/30 flex items-center justify-center text-[#F2C864] flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                Under 5 minutes
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Streamlined digital intake workflows tailored for landowners and buyers. No lengthy appraisals or paperwork hurdles.
              </p>
            </div>
          </div>

          {/* Benefit 2: No obligation */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#00171C] border border-[#0A4251] flex items-start gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#0A4251] border border-[#88BBD8]/30 flex items-center justify-center text-[#88BBD8] flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                No obligation
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review your preliminary cash valuation completely risk-free. You decide whether to proceed or hold your property.
              </p>
            </div>
          </div>

          {/* Benefit 3: Multi-market */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[#00171C] border border-[#0A4251] flex items-start gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-[#0A4251] border border-[#F2C864]/30 flex items-center justify-center text-[#F2C864] flex-shrink-0">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                Multi-market
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Active cash acquisitions and disposition networks spanning Texas, Florida, Colorado, Arizona, New Mexico, and nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Banner: Subtle rounded banner at the bottom with The Broker avatar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#00171C] via-[#0A4251] to-[#00171C] border border-[#F2C864]/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <BrokerAvatar size="md" variant="rounded" className="hidden sm:inline-flex shadow-xl" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
                Have questions before you start?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Talk to our land acquisitions team about probate, boundaries, or custom timelines.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F2C864] hover:bg-amber-300 text-[#00171C] font-bold text-sm shadow-xl transition-all whitespace-nowrap active:scale-95"
          >
            Talk to our team
          </button>
        </div>
      </section>
    </div>
  );
};
