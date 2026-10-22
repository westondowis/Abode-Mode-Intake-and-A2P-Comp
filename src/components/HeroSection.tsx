import React from 'react';
import { ArrowRight, Phone, ShieldCheck, DollarSign, Clock, Trees, Building, CheckCircle2, Mail } from 'lucide-react';
import { ENTITY_DETAILS } from '../data/policyData';
import { getAcquisitionMailtoHref, ACQUISITION_EMAIL } from '../utils/contactEmail';

interface HeroSectionProps {
  activeFlow?: 'sell' | 'buy';
  onSelectFlow: (flow: 'sell' | 'buy') => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ activeFlow = 'sell', onSelectFlow }) => {
  const mailtoHref = getAcquisitionMailtoHref();

  return (
    <section className="relative bg-slate-50 text-slate-900 dark:bg-[#061116] dark:text-white pt-6 pb-14 md:pt-10 md:pb-20 border-b border-slate-200 dark:border-cyan-950/60 overflow-hidden transition-colors duration-200">
      {/* Background Architectural Ambient Texture */}
      <div className="absolute inset-0 opacity-15 dark:opacity-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen bg-[radial-gradient(#0A4251_1px,transparent_1px)] dark:bg-[radial-gradient(#88BBD8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* =========================================================================
            HERO TOP BANNER & HEADLINE
           ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 dark:bg-cyan-950/50 dark:border-cyan-800/50 text-[11px] font-semibold tracking-wider dark:text-amber-400 uppercase shadow-xs">
            <span>📍</span> Nationwide Land Acquisitions &amp; Dispositions
          </div>
          <h1 className="serif-title text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">
            What Would You Like to Do Today?
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-normal dark:font-light">
            Whether liquidating property for an immediate, guaranteed cash exit or scouting institutional-grade off-market acreage, select your path below.
          </p>
        </div>

        {/* =========================================================================
            THE TWO BIG BOXES PRESENTED FIRST
            "The second user gets to the page have been presented with two big boxes
             that say I want to buy I want to sell"
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch max-w-5xl mx-auto">
          
          {/* ============================================== */}
          {/* LEFT CARD: I WANT TO SELL (Warm Gold/Cash)    */}
          {/* ============================================== */}
          <div
            id="seller-portal"
            onClick={() => onSelectFlow('sell')}
            className={`relative group rounded-2xl bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 dark:from-[#141b18] dark:via-[#0e1818] dark:to-[#091417] p-8 sm:p-9 border border-amber-300 dark:border-amber-500/30 glow-seller transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-lg dark:shadow-none ${
              activeFlow === 'sell' ? 'ring-2 ring-amber-500 dark:ring-amber-400/80 shadow-amber-500/20' : ''
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectFlow('sell');
            }}
          >
            {/* Top decorative badge & ambient aura */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/15 transition-all" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500" />

            <div>
              {/* Header Bar: Tag and Round Action Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider shadow-xs">
                  <span className="text-sm">🏡</span>
                  <span>Property Owners • Sellers</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <span className="text-base">💰</span>
                </div>
              </div>

              {/* Title with Cash / Sale Identity */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="serif-title text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white tracking-tight">
                    I Want to Sell
                  </h2>
                  <span className="text-2xl animate-bounce" title="Fast Cash Closing">🏷️</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400/90 font-mono">
                  Immediate Cash Out • 0% Commissions • As-Is Closing
                </p>
              </div>

              {/* Description */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 font-normal dark:font-light">
                Submit your parcel details or APN to receive an expedited, written all-cash offer. We purchase directly with private institutional capital—zero broker commissions, zero closing fees, and no clearing or survey contingencies.
              </p>

              {/* Seller Value Proposition Bullets */}
              <div className="space-y-3 mb-8 pt-2 border-t border-amber-200 dark:border-amber-500/15">
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="text-base text-amber-600 dark:text-amber-400">💵</span>
                  <div>
                    <span className="font-semibold text-slate-950 dark:text-amber-200">0% Broker Commissions</span>
                    <span className="text-slate-600 dark:text-slate-400"> — 100% As-Is Sale with zero repair or cleanup demands</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="text-base text-emerald-600 dark:text-emerald-400">⚡</span>
                  <div>
                    <span className="font-semibold text-slate-950 dark:text-emerald-300">Fast Cash Closing in 7-14 Days</span>
                    <span className="text-slate-600 dark:text-slate-400"> — Escrow funds directly wired on your schedule</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="text-base text-amber-600 dark:text-amber-400">📑</span>
                  <div>
                    <span className="font-semibold text-slate-950 dark:text-amber-200">We Cover 100% of Closing Costs</span>
                    <span className="text-slate-600 dark:text-slate-400"> — Title escrow, deed recording &amp; transfer tax included</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFlow('sell');
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Get Written Cash Offer</span>
                <span className="text-base">→</span>
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-amber-700 dark:text-amber-400/80 font-medium font-mono">
                <span>🔒 Confidential</span>
                <span>•</span>
                <span>⚡ No Obligation</span>
                <span>•</span>
                <span>⏱️ 24-Hr Valuation</span>
              </div>
            </div>
          </div>

          {/* ============================================== */}
          {/* RIGHT CARD: I WANT TO BUY (Cool Cyan/Map)     */}
          {/* ============================================== */}
          <div
            id="buyer-portal"
            onClick={() => onSelectFlow('buy')}
            className={`relative group rounded-2xl bg-gradient-to-b from-teal-50/70 via-white to-teal-50/40 dark:from-[#0c1c24] dark:via-[#0a171d] dark:to-[#071217] p-8 sm:p-9 border border-teal-300 dark:border-cyan-500/30 glow-buyer transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-lg dark:shadow-none ${
              activeFlow === 'buy' ? 'ring-2 ring-teal-500 dark:ring-cyan-400/80 shadow-teal-500/20' : ''
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onSelectFlow('buy');
            }}
          >
            {/* Top decorative badge & ambient aura */}
            <div className="absolute -top-24 -right-24 w-60 h-60 bg-teal-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/15 transition-all" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-400" />

            <div>
              {/* Header Bar: Tag and Round Action Icon */}
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 dark:bg-cyan-950/60 border border-teal-300 dark:border-cyan-500/40 text-teal-900 dark:text-cyan-300 text-xs font-semibold uppercase tracking-wider shadow-xs">
                  <span className="text-sm">🧭</span>
                  <span>Buyers &amp; Institutional Investors</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-teal-500/30 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                  <span className="text-base">🛒</span>
                </div>
              </div>

              {/* Title with Map / Investment Identity */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <h2 className="serif-title text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white tracking-tight">
                    I Want to Buy
                  </h2>
                  <span className="text-2xl animate-pulse" title="Acreage & Inventory">🗺️</span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-cyan-400/90 font-mono">
                  Exclusive Inventory • Wholesale Acreage • Prime Locations
                </p>
              </div>

              {/* Description */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 font-normal dark:font-light">
                Find deeply discounted off-market rural acreage, residential infill lots, recreational parcels, and agricultural tracts nationwide. Match your custom investment buy-box with verified, clear-title properties.
              </p>

              {/* Buyer Value Proposition Bullets */}
              <div className="space-y-3 mb-8 pt-2 border-t border-teal-200 dark:border-cyan-500/15">
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="text-base text-teal-600 dark:text-cyan-400">🇺🇸</span>
                  <div>
                    <span className="font-semibold text-slate-950 dark:text-cyan-200">Nationwide Inventory Across All 50 States</span>
                    <span className="text-slate-600 dark:text-slate-400"> — Pre-vetted off-market land tracts</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="text-base text-emerald-600 dark:text-teal-400">🤝</span>
                  <div>
                    <span className="font-semibold text-slate-950 dark:text-teal-300">Cash Discounts &amp; Flexible Seller Financing</span>
                    <span className="text-slate-600 dark:text-slate-400"> — Low down payment and terms available</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="text-base text-teal-600 dark:text-cyan-400">📜</span>
                  <div>
                    <span className="font-semibold text-slate-950 dark:text-cyan-200">Guaranteed Clean Title via Escrow</span>
                    <span className="text-slate-600 dark:text-slate-400"> — Full title insurance policy on every transaction</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buyer Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFlow('buy');
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-400 hover:from-teal-400 hover:to-cyan-300 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Enter Buyer Criteria</span>
                <span className="text-base">→</span>
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-teal-700 dark:text-cyan-400/80 font-medium font-mono">
                <span>🚜 Raw Land</span>
                <span>•</span>
                <span>🏡 Residential Lots</span>
                <span>•</span>
                <span>📈 Multi-Acre Holdings</span>
              </div>
            </div>
          </div>

        </div>

        {/* =========================================================================
            FAST TOGGLE MODE BAR
           ========================================================================= */}
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 font-mono font-medium">Fast Toggle Mode</p>
          <div className="inline-flex p-1.5 rounded-full bg-slate-200/80 dark:bg-[#08171e] border border-slate-300 dark:border-cyan-900/60 shadow-md">
            <button
              type="button"
              onClick={() => onSelectFlow('sell')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeFlow === 'sell'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-md'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <span>💰</span>
              <span>I Want to Sell</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectFlow('buy')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeFlow === 'buy'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <span>🗺️</span>
              <span>I Want to Buy</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            NATIONWIDE COVERAGE & ESCROW CREDIBILITY ROW
           ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-cyan-950/60 max-w-5xl mx-auto">
          
          {/* Stats Box 1 */}
          <div className="col-span-1 md:col-span-2 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#0e1c22] dark:to-[#071317] p-6 border border-slate-200 dark:border-cyan-800/40 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-cyan-400 mb-2">
                <span>🛡️</span> Institutional Operating Model
              </div>
              <h3 className="serif-title text-xl font-bold text-slate-900 dark:text-white mb-2">
                All 50 States • 100% In-House Capital • Title Escrow Closed
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal dark:font-light">
                Abode Mode operates as a direct principal acquirer and disposition desk. Every deed conveyance, purchase agreement, and escrow disbursement is conducted through national title insurance underwriters (First American, Fidelity, Chicago Title) in the jurisdiction where the parcel sits.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-cyan-900/40 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#09171d] border border-slate-200 dark:border-cyan-500/20">
                <div className="text-amber-600 dark:text-amber-400 font-bold text-lg font-mono">50</div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold uppercase">U.S. States</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Direct acquisitions</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#09171d] border border-slate-200 dark:border-cyan-500/20">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg font-mono">$0</div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold uppercase">Seller Fees</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">100% covered closing</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#09171d] border border-slate-200 dark:border-cyan-500/20">
                <div className="text-teal-600 dark:text-cyan-400 font-bold text-lg font-mono">7-14 Day</div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold uppercase">Close Window</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Title wire transfer</div>
              </div>
            </div>
          </div>

          {/* Institutional Badge Card with Direct Contact */}
          <div className="rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#0e2129] dark:to-[#07141a] p-6 border border-slate-200 dark:border-cyan-800/40 flex flex-col justify-between shadow-sm">
            <div className="text-center pb-4 border-b border-slate-100 dark:border-cyan-900/50">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-50 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
                🏛️
              </div>
              <h4 className="cinzel-text text-sm font-bold text-slate-900 dark:text-amber-300 tracking-widest">ABODE — MODE</h4>
              <p className="text-[10px] tracking-widest text-slate-500 dark:text-slate-400 uppercase mt-0.5 font-mono">Fashionably Easy Land Solutions</p>
            </div>
            
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 my-4 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Direct Intake Line:</span>
                <a href={`tel:${ENTITY_DETAILS.primaryPhoneRaw}`} className="font-semibold text-amber-600 dark:text-amber-300 hover:underline">
                  {ENTITY_DETAILS.primaryPhone}
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Coverage:</span>
                <span className="font-medium text-teal-700 dark:text-cyan-300">All 50 U.S. States</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Acquisitions:</span>
                <a
                  href={mailtoHref}
                  className="font-medium text-teal-700 hover:text-amber-600 dark:text-cyan-300 dark:hover:text-amber-300 flex items-center gap-1 group"
                  title="Compose pre-filled email to wdowis@abode-mode.com"
                >
                  <Mail className="w-3 h-3 text-amber-500" />
                  <span>{ACQUISITION_EMAIL}</span>
                </a>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-cyan-950/40 border border-teal-200 dark:border-cyan-800/30 text-center text-[11px] text-teal-800 dark:text-cyan-400 font-medium">
              ✓ Verified Institutional Land Escrow
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
