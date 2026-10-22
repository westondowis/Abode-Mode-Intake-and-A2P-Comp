import React from 'react';
import { Search, FileText, CheckCircle2, DollarSign, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartOffer: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartOffer }) => {
  return (
    <section id="our-process" className="scroll-mt-24 py-16 md:py-24 bg-white text-slate-900 border-t border-slate-200 dark:bg-[#0A4251] dark:text-white dark:border-[#083541] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-[#F2C864]">
            Transparent 3-Step Acquisition Flow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-950 dark:text-white tracking-tight">
            How Selling to Abode Mode Works
          </h2>
          <p className="text-slate-600 dark:text-slate-200 text-sm sm:text-base font-normal dark:font-light leading-relaxed">
            Skip months on the MLS, expensive surveys, and broker commissions. We buy land directly with verified funds and local title company closing.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-slate-50 dark:bg-[#00171C] p-8 rounded-xl border border-slate-200 dark:border-[#F2C864]/30 shadow-md dark:shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-serif font-bold text-amber-600 dark:text-[#F2C864]">01</span>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 dark:bg-[#0A4251] dark:text-[#F2C864] flex items-center justify-center border border-amber-300 dark:border-[#F2C864]/40">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-950 dark:text-white">
                Parcel Analysis &amp; Valuation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal dark:font-light">
                Submit your street address or county APN parcel number. Our acquisitions team reviews county GIS records, road access, topography, zoning, and comparable sales within 24 hours.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-teal-700 dark:text-[#88BBD8] font-medium">
              Turnaround: Immediate – 24 Hours
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 dark:bg-[#00171C] p-8 rounded-xl border border-slate-200 dark:border-[#F2C864]/30 shadow-md dark:shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-serif font-bold text-amber-600 dark:text-[#F2C864]">02</span>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 dark:bg-[#0A4251] dark:text-[#F2C864] flex items-center justify-center border border-amber-300 dark:border-[#F2C864]/40">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-950 dark:text-white">
                Transparent Written Offer
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal dark:font-light">
                We deliver a straightforward, plain-English cash purchase agreement. No financing contingencies, no appraisal delays, and no surprise price reductions before closing.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-teal-700 dark:text-[#88BBD8] font-medium">
              Net Cash to Seller · Zero Fees
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 dark:bg-[#00171C] p-8 rounded-xl border border-slate-200 dark:border-[#F2C864]/30 shadow-md dark:shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-serif font-bold text-amber-600 dark:text-[#F2C864]">03</span>
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 dark:bg-[#0A4251] dark:text-[#F2C864] flex items-center justify-center border border-amber-300 dark:border-[#F2C864]/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-950 dark:text-white">
                Closing &amp; Wire Disbursement
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal dark:font-light">
                We open escrow with a licensed, bonded local title company or closing attorney. Choose your closing date—from 7 business days to several weeks out—and receive funds via bank wire or cashier&apos;s check.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 text-xs font-mono text-teal-700 dark:text-[#88BBD8] font-medium">
              Licensed Title Escrow Protection
            </div>
          </div>

        </div>

        {/* Comparison Table */}
        <div className="bg-slate-50 dark:bg-[#00171C] rounded-xl border border-slate-200 dark:border-[#F2C864]/40 p-6 sm:p-10 shadow-lg dark:shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200 dark:border-[#0A4251]">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-[#F2C864] block">
                Direct Principal vs Traditional Agent
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-950 dark:text-white">
                Why Sellers Choose Abode Mode
              </h3>
            </div>
            <button
              onClick={onStartOffer}
              type="button"
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm self-start sm:self-auto"
            >
              Request Cash Offer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#0A4251] text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4">Transaction Factor</th>
                  <th className="py-3 px-4 text-amber-800 dark:text-[#F2C864] bg-amber-100/60 dark:bg-[#0A4251]/40 rounded-t font-bold">Abode Mode Direct Cash</th>
                  <th className="py-3 px-4 text-slate-500 dark:text-slate-400">Traditional Broker Listing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#0A4251]/60 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-950 dark:text-white">Broker Commissions</td>
                  <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold bg-amber-50/40 dark:bg-[#0A4251]/20 font-mono">0% (Zero Broker Fees)</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">5% to 10% of gross sales price</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-950 dark:text-white">Closing Costs</td>
                  <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold bg-amber-50/40 dark:bg-[#0A4251]/20 font-mono">100% Paid by Abode Mode</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">Seller pays 1.5% - 3% in fees</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-950 dark:text-white">Property Condition</td>
                  <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold bg-amber-50/40 dark:bg-[#0A4251]/20">100% As-Is (No cleanup or survey)</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">Requires clearing, weed control, survey</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-950 dark:text-white">Closing Timeline</td>
                  <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold bg-amber-50/40 dark:bg-[#0A4251]/20 font-mono">7 to 14 Days (or Your Choice)</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">6 to 18 months average for raw land</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-950 dark:text-white">Financing / Buyer Risk</td>
                  <td className="py-3.5 px-4 text-emerald-700 dark:text-emerald-400 font-bold bg-amber-50/40 dark:bg-[#0A4251]/20">Zero (Direct Principal Capital)</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">Frequent bank loan fallouts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
