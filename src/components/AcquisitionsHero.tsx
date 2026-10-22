import React from 'react';
import { BrandWordmark } from './brand/BrandWordmark';
import { ENTITY_DETAILS } from '../data/policyData';
import { getAcquisitionMailtoHref } from '../utils/contactEmail';
import { ShieldCheck, ArrowDown, PhoneCall, Sparkles, Building, Landmark, CheckCircle2 } from 'lucide-react';
import brokerImg from '../assets/images/abode_broker_1790971379949.jpg';

interface AcquisitionsHeroProps {
  onOpenAuditModal: () => void;
  onStartOffer: () => void;
}

export const AcquisitionsHero: React.FC<AcquisitionsHeroProps> = ({
  onOpenAuditModal,
  onStartOffer,
}) => {
  return (
    <section className="relative bg-[#00171C] text-white pt-8 pb-14 md:pt-12 md:pb-20 border-b border-[#0A4251] overflow-hidden">
      {/* Background Architectural Ambient Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen bg-[radial-gradient(#88BBD8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Institutional Kicker & Carrier Compliance Ribbon */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-mono tracking-wider text-[#88BBD8] mb-6">
          <span className="text-[#F2C864] font-bold">ABODE-MODE LLC · ACQUISITIONS DIVISION</span>
          <span aria-hidden="true" className="text-slate-600">/</span>
          <span>COLORADO &amp; TEXAS PRINCIPAL DESKS</span>
          <span aria-hidden="true" className="text-slate-600">/</span>
          <span className="text-slate-400">A2P 10DLC CTIA VERIFIED</span>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Positioning */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
              Professional Direct Acquisition of Residential Homes &amp; Vacant Land
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              Direct institutional acquisition of residential houses and raw land acreage across <strong className="font-semibold text-white">Colorado</strong>, <strong className="font-semibold text-white">Texas</strong>, and select national corridors. We buy directly for our portfolio—no realtor commissions, no staging inspections, and flexible title escrow closings on your timeline.
            </p>

            {/* Quick Core Assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#0A4251]/60 p-3 rounded border border-[#0A4251] space-y-1">
                <span className="text-[#F2C864] font-mono font-bold text-xs block">0% COMMISSIONS</span>
                <span className="text-[11px] text-slate-300 block">No agent cuts or listing fees</span>
              </div>
              <div className="bg-[#0A4251]/60 p-3 rounded border border-[#0A4251] space-y-1">
                <span className="text-[#F2C864] font-mono font-bold text-xs block">100% AS-IS SALE</span>
                <span className="text-[11px] text-slate-300 block">Zero repairs or cleaning</span>
              </div>
              <div className="bg-[#0A4251]/60 p-3 rounded border border-[#0A4251] space-y-1">
                <span className="text-[#F2C864] font-mono font-bold text-xs block">7–14 DAY CLOSE</span>
                <span className="text-[11px] text-slate-300 block">Licensed title company wire</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartOffer}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>Request Written Cash Offer</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onOpenAuditModal}
                type="button"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded bg-[#0A4251] hover:bg-[#0d5366] text-[#88BBD8] hover:text-white border border-[#F2C864]/30 font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#F2C864]" />
                <span>Carrier 10DLC Vetting Matrix</span>
              </button>
            </div>
          </div>

          {/* Right Column: Official Brand Lockup with The Broker Handshake Mark */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-[#0A4251] p-6 rounded-lg border border-[#F2C864]/40 shadow-2xl space-y-5">
              
              {/* Stacked Lockup: The Broker Handshake Mark above the Wordmark Panel */}
              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded overflow-hidden border-2 border-[#F2C864] bg-[#00171C] mb-4 shadow-lg">
                  <img
                    src={brokerImg}
                    alt="The Broker - Abode Mode Official Brand Mark"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Wordmark Panel */}
                <div className="w-full border border-[#F2C864] bg-[#0A4251] py-2.5 px-4">
                  <div className="text-[9px] tracking-[0.28em] text-[#88BBD8] font-semibold uppercase font-mono">
                    ABODE · A · LA · MODE
                  </div>
                  <div className="text-xl md:text-2xl font-serif tracking-[0.24em] text-[#F2C864] font-bold uppercase my-1">
                    ABODE — MODE
                  </div>
                  <div className="text-[9px] tracking-[0.26em] text-[#88BBD8] font-medium uppercase">
                    FASHIONABLY EASY HOME SALES
                  </div>
                </div>
              </div>

              {/* Direct Acquisition Coordinates */}
              <div className="space-y-2 pt-2 border-t border-[#F2C864]/20 text-xs">
                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-[#F2C864]" />
                    <span>Colorado Desk:</span>
                  </span>
                  <a
                    href={`tel:${ENTITY_DETAILS.primaryPhone.replace(/\D/g, '')}`}
                    className="font-mono text-white hover:text-[#F2C864] font-bold"
                  >
                    {ENTITY_DETAILS.primaryPhone}
                  </a>
                </div>

                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-[#F2C864]" />
                    <span>Texas Desk:</span>
                  </span>
                  <a
                    href={`tel:${ENTITY_DETAILS.secondaryPhone.replace(/\D/g, '')}`}
                    className="font-mono text-white hover:text-[#F2C864] font-bold"
                  >
                    {ENTITY_DETAILS.secondaryPhone}
                  </a>
                </div>

                <div className="flex items-center justify-between text-slate-200">
                  <span className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-[#F2C864]" />
                    <span>Acquisitions Email:</span>
                  </span>
                  <a
                    href={getAcquisitionMailtoHref()}
                    className="font-mono text-[#88BBD8] hover:text-white truncate max-w-[190px]"
                    title="Compose pre-filled inquiry email to wdowis@abode-mode.com"
                  >
                    {ENTITY_DETAILS.contactEmail}
                  </a>
                </div>
              </div>

              {/* Compliance & Principal Notice */}
              <div className="bg-[#00171C]/70 p-3 rounded border border-white/10 text-[11px] text-slate-300 leading-snug">
                <span className="text-[#F2C864] font-semibold block mb-0.5 font-mono">
                  DIRECT PRINCIPAL BUYER NOTICE
                </span>
                ABODE-MODE LLC purchases real property directly for its own portfolio. Never brokered or wholesaled without express written authorization.
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
