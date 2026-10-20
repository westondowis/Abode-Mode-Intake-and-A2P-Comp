import React from 'react';
import { Search, FileText, CheckCircle2, DollarSign, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  onStartOffer: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ onStartOffer }) => {
  return (
    <section id="our-process" className="scroll-mt-24 py-16 md:py-24 bg-[#0A4251] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2C864]">
            Transparent 3-Step Acquisition Flow
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            How Selling to Abode Mode Works
          </h2>
          <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed">
            Skip months on the MLS, expensive surveys, and broker commissions. We buy land directly with verified funds and local title company closing.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-[#00171C] p-8 rounded-lg border border-[#F2C864]/30 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-serif font-bold text-[#F2C864]">01</span>
                <div className="w-10 h-10 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <Search className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Parcel Analysis &amp; Valuation
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Submit your street address or county APN parcel number. Our acquisitions team reviews county GIS records, road access, topography, zoning, and comparable sales within 24 hours.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#88BBD8]">
              Turnaround: Immediate – 24 Hours
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#00171C] p-8 rounded-lg border border-[#F2C864]/30 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-serif font-bold text-[#F2C864]">02</span>
                <div className="w-10 h-10 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Transparent Written Offer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                We deliver a straightforward, plain-English cash purchase agreement. No financing contingencies, no appraisal delays, and no surprise price reductions before closing.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#88BBD8]">
              Net Cash to Seller · Zero Fees
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#00171C] p-8 rounded-lg border border-[#F2C864]/30 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl font-serif font-bold text-[#F2C864]">03</span>
                <div className="w-10 h-10 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Closing &amp; Wire Disbursement
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                We open escrow with a licensed, bonded local title company or closing attorney. Choose your closing date—from 7 business days to several weeks out—and receive funds via bank wire or cashier&apos;s check.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#88BBD8]">
              Licensed Title Escrow Protection
            </div>
          </div>

        </div>

        {/* Comparison Table */}
        <div className="bg-[#00171C] rounded-lg border border-[#F2C864]/40 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#0A4251]">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2C864] block">
                Direct Principal vs Traditional Agent
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">
                Why Sellers Choose Abode Mode
              </h3>
            </div>
            <button
              onClick={onStartOffer}
              type="button"
              className="px-4 py-2 bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
            >
              Request Cash Offer
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#0A4251] text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4">Transaction Factor</th>
                  <th className="py-3 px-4 text-[#F2C864] bg-[#0A4251]/40 rounded-t font-bold">Abode Mode Direct Cash</th>
                  <th className="py-3 px-4 text-slate-400">Traditional Broker Listing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4251]/60 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Broker Commissions</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/20 font-mono">0% (Zero Broker Fees)</td>
                  <td className="py-3.5 px-4 text-slate-400">5% to 10% of gross sales price</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Closing Costs</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/20 font-mono">100% Paid by Abode Mode</td>
                  <td className="py-3.5 px-4 text-slate-400">Seller pays 1.5% - 3% in fees</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Property Condition</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/20">100% As-Is (No cleanup or survey)</td>
                  <td className="py-3.5 px-4 text-slate-400">Requires clearing, weed control, survey</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Closing Timeline</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/20 font-mono">7 to 14 Days (or Your Choice)</td>
                  <td className="py-3.5 px-4 text-slate-400">6 to 18 months average for raw land</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Financing / Buyer Risk</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/20">Zero (Direct Principal Capital)</td>
                  <td className="py-3.5 px-4 text-slate-400">Frequent bank loan fallouts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
