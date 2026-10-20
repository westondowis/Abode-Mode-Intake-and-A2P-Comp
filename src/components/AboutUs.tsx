import React from 'react';
import { Building2, Shield, Landmark, Phone, Mail, Globe } from 'lucide-react';
import { ENTITY_DETAILS } from '../data/policyData';

export const AboutUs: React.FC = () => {
  return (
    <section id="about-us" className="scroll-mt-24 py-16 md:py-24 bg-[#00171C] text-white border-t border-[#0A4251]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2C864]">
            Direct Principal Acquisition Firm
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            About Abode Mode
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
            Abode Mode is the commercial operating brand of <strong className="text-white font-semibold">{ENTITY_DETAILS.legalName}</strong>. We are direct principal investors, acquiring vacant land, acreage, and residential property across all 50 states for long-term holding and sustainable community development.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0A4251] p-6 rounded-lg border border-[#F2C864]/30 space-y-3">
            <div className="w-10 h-10 rounded bg-[#00171C] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Direct Balance-Sheet Capital</h3>
            <p className="text-xs text-slate-200 leading-relaxed font-light">
              We never act as retail middleman brokers or wholesale assignors without authorization. When we sign an agreement, we purchase with our own allocated private capital.
            </p>
          </div>

          <div className="bg-[#0A4251] p-6 rounded-lg border border-[#F2C864]/30 space-y-3">
            <div className="w-10 h-10 rounded bg-[#00171C] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Licensed Title Escrow</h3>
            <p className="text-xs text-slate-200 leading-relaxed font-light">
              Every single transaction is closed through established, licensed, and state-bonded title companies or closing attorneys in the state where the property is located.
            </p>
          </div>

          <div className="bg-[#0A4251] p-6 rounded-lg border border-[#F2C864]/30 space-y-3">
            <div className="w-10 h-10 rounded bg-[#00171C] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-bold text-white">Nationwide Land Underwriting</h3>
            <p className="text-xs text-slate-200 leading-relaxed font-light">
              Our acquisitions desk operates across all 50 U.S. states with access to state GIS databases, parcel mapping, road access easements, and county recording records.
            </p>
          </div>
        </div>

        {/* Direct Intake Info Strip */}
        <div className="bg-[#0A4251]/40 rounded-lg border border-[#0A4251] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-serif font-bold text-white">
              Speak Directly with an Acquisitions Principal
            </h4>
            <p className="text-xs text-slate-300">
              Direct consultation for complex parcels, inherited land, back taxes, or multi-parcel sales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-[#00171C] px-4 py-2.5 rounded border border-[#F2C864]/30 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#F2C864]" />
              <div>
                <span className="text-slate-400 block text-[10px]">Direct Intake Line:</span>
                <a href={`tel:${ENTITY_DETAILS.primaryPhoneRaw}`} className="text-white font-bold hover:text-[#F2C864]">
                  {ENTITY_DETAILS.primaryPhone}
                </a>
              </div>
            </div>
            <div className="bg-[#00171C] px-4 py-2.5 rounded border border-[#F2C864]/30 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#88BBD8]" />
              <div>
                <span className="text-slate-400 block text-[10px]">Email Inquiries:</span>
                <a href={`mailto:${ENTITY_DETAILS.contactEmail}`} className="text-[#88BBD8] hover:text-white">
                  {ENTITY_DETAILS.contactEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
