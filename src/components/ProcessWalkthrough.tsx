import React from 'react';
import { FileEdit, FileCheck2, Landmark, Check, X, Shield, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { BrandWordmark } from './brand/BrandWordmark';
import { ENTITY_DETAILS } from '../data/policyData';

interface ProcessWalkthroughProps {
  onStartOffer: () => void;
}

export const ProcessWalkthrough: React.FC<ProcessWalkthroughProps> = ({ onStartOffer }) => {
  return (
    <section id="acquisition-process" className="scroll-mt-24 py-14 md:py-20 bg-[#0A4251] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono tracking-widest text-[#88BBD8] uppercase">
            THE ABODE MODE ADVANTAGE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white">
            Fashionably Easy Real Estate Sales
          </h2>
          <p className="text-slate-200 text-sm sm:text-base font-light leading-relaxed">
            Eliminate staging, weekend open houses, appraisal contingencies, and agent commissions. We acquire directly using private capital and licensed title companies.
          </p>
        </div>

        {/* 3-Step Walkthrough Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 1 */}
          <div className="bg-[#00171C] p-8 rounded-lg border border-[#F2C864]/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#F2C864] transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-serif font-bold text-[#F2C864]">01</span>
                <div className="w-10 h-10 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <FileEdit className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Submit Property Details
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Provide your street address or county parcel number (APN) alongside property condition. Our proprietary underwriting algorithm pairs with county GIS land data to generate a preliminary valuation immediately.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#88BBD8] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F2C864]" />
              <span>Turnaround: Immediate – 2 Hours</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#00171C] p-8 rounded-lg border border-[#F2C864]/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#F2C864] transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-serif font-bold text-[#F2C864]">02</span>
                <div className="w-10 h-10 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Review Written Cash Offer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Receive an official, non-contingent cash purchase agreement from our Colorado or Texas acquisitions desk. What we offer is what you walk away with at closing: zero commission cuts, zero hidden junk fees, and zero repair concessions.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#88BBD8] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#F2C864]" />
              <span>Firm Number · No Retrading</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#00171C] p-8 rounded-lg border border-[#F2C864]/30 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#F2C864] transition-colors">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-serif font-bold text-[#F2C864]">03</span>
                <div className="w-10 h-10 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <Landmark className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                Close with Title Escrow
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                Pick your closing date—from 7 business days to several months out. Funds are wired directly from a licensed, bonded state title company (or cashier's check). Sign documents in person or via mobile notary from your living room.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 text-xs font-mono text-[#88BBD8] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#F2C864]" />
              <span>Licensed Escrow Protection</span>
            </div>
          </div>

        </div>

        {/* Comparison Matrix: Abode Mode vs Traditional Agent Sale */}
        <div className="bg-[#00171C] rounded-lg border border-[#F2C864]/40 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#0A4251]">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2C864] block">
                Side-by-Side Economic Comparison
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">
                Abode Mode Direct Cash vs. Traditional Retail Listing
              </h3>
            </div>
            <button
              onClick={onStartOffer}
              className="px-4 py-2 bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              Get Your Cash Number
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#0A4251] text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4">Transaction Factor</th>
                  <th className="py-3 px-4 text-[#F2C864] bg-[#0A4251]/50 rounded-t font-bold">Abode Mode Direct Purchase</th>
                  <th className="py-3 px-4 text-slate-400">Traditional Broker Listing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0A4251]/60 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Broker Commissions</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/30 font-mono">0% (Zero Broker Fees)</td>
                  <td className="py-3.5 px-4 text-slate-400">5% to 6% of gross sale price</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Closing Costs Paid By</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/30 font-mono">100% Paid by Abode Mode</td>
                  <td className="py-3.5 px-4 text-slate-400">Seller pays 1.5% - 3% in fees</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Property Condition</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/30">100% As-Is (No repairs or cleaning)</td>
                  <td className="py-3.5 px-4 text-slate-400">Repairs, deep clean, staging required</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Closing Timeline</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/30 font-mono">7 to 14 Days (or Your Choice)</td>
                  <td className="py-3.5 px-4 text-slate-400">60 to 90+ days on market + escrow</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Financing / Appraisal Risk</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/30">None (Private Cash Allocation)</td>
                  <td className="py-3.5 px-4 text-slate-400">Mortgage denial &amp; low appraisal fallouts</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-white">Open Houses &amp; Showings</td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold bg-[#0A4251]/30">Zero Public Showings</td>
                  <td className="py-3.5 px-4 text-slate-400">Dozens of strangers walking through</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
