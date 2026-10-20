import React from 'react';
import { MapPin, Phone, CheckCircle2, Building, Mountain, Trees, Shield } from 'lucide-react';
import { ENTITY_DETAILS } from '../data/policyData';

export const MarketCorridors: React.FC = () => {
  const recentTransactions = [
    {
      id: 'TX-2918',
      location: 'Fort Worth, Tarrant County, TX',
      type: 'Single Family Residence',
      condition: 'Major Cosmetic Rehab',
      timeline: 'Closed in 9 Days',
      status: 'Funded & Recorded',
      desk: 'Texas Regional Desk',
    },
    {
      id: 'CO-8401',
      location: 'Colorado Springs, El Paso County, CO',
      type: 'Mountain View Ranch',
      condition: 'Deferred Maintenance',
      timeline: 'Closed in 11 Days',
      status: 'Funded & Recorded',
      desk: 'Colorado Primary Desk',
    },
    {
      id: 'CO-9122',
      location: 'Woodland Park, Teller County, CO',
      type: '10.5 Acres Raw Mountain Land',
      condition: 'Undeveloped Acreage',
      timeline: 'Closed in 14 Days',
      status: 'Funded & Recorded',
      desk: 'Colorado Primary Desk',
    },
    {
      id: 'TX-4089',
      location: 'Plano, Collin County, TX',
      type: 'Residential Rental Portfolio',
      condition: 'Tenant Occupied',
      timeline: 'Closed in 12 Days',
      status: 'Funded & Recorded',
      desk: 'Texas Regional Desk',
    },
  ];

  return (
    <section id="market-corridors" className="scroll-mt-24 py-14 md:py-20 bg-[#00171C] text-white border-t border-[#0A4251]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#0A4251]">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#F2C864]">
              Active Regional Acquisition Desks
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Colorado &amp; Texas Operational Corridors
            </h2>
            <p className="text-sm text-slate-300 font-light max-w-2xl">
              Abode Mode deploys direct balance-sheet capital across designated western and southern growth corridors, with active underwriting teams licensed and operating locally.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-[#0A4251] rounded border border-[#F2C864]/30 text-xs font-mono text-[#88BBD8]">
              Status: <span className="text-emerald-400 font-bold">Acquiring Active Inventory</span>
            </div>
          </div>
        </div>

        {/* 2 Regional Desk Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Colorado Desk */}
          <div className="bg-[#0A4251] p-6 sm:p-8 rounded-lg border border-[#F2C864]/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#00171C] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <Mountain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Colorado Primary Desk</h3>
                  <span className="text-xs font-mono text-[#88BBD8]">Front Range &amp; Mountain Corridors</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#F2C864] bg-[#00171C] px-2.5 py-1 rounded border border-[#F2C864]/30 font-semibold">
                HQ Desk
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-light">
              Specializing in single-family residential properties, probate estates, and rural mountain land across El Paso, Teller, Douglas, Weld, Pueblo, and Fremont counties. Direct cash purchases with local Colorado title escrow.
            </p>

            <div className="space-y-2 text-xs border-t border-white/10 pt-4 font-mono text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Direct Intake Line:</span>
                <a href={`tel:${ENTITY_DETAILS.primaryPhone.replace(/\D/g, '')}`} className="font-bold text-[#F2C864] hover:underline">
                  {ENTITY_DETAILS.primaryPhone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Escrow Partners:</span>
                <span className="text-white">First American Title · Land Title Guarantee</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Average Turnaround:</span>
                <span className="text-emerald-400 font-bold">8 Business Days</span>
              </div>
            </div>
          </div>

          {/* Texas Desk */}
          <div className="bg-[#0A4251] p-6 sm:p-8 rounded-lg border border-[#F2C864]/40 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#00171C] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/40">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Texas Regional Desk</h3>
                  <span className="text-xs font-mono text-[#88BBD8]">DFW Metroplex &amp; Central Texas</span>
                </div>
              </div>
              <span className="text-xs font-mono text-[#F2C864] bg-[#00171C] px-2.5 py-1 rounded border border-[#F2C864]/30 font-semibold">
                Regional Hub
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-light">
              Targeting turnkey to full distress single-family dwellings, small multi-family portfolios, and undeveloped acreage across Tarrant, Dallas, Denton, Collin, Johnson, Parker, and Wise counties.
            </p>

            <div className="space-y-2 text-xs border-t border-white/10 pt-4 font-mono text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Direct Intake Line:</span>
                <a href={`tel:${ENTITY_DETAILS.secondaryPhone.replace(/\D/g, '')}`} className="font-bold text-[#F2C864] hover:underline">
                  {ENTITY_DETAILS.secondaryPhone}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Escrow Partners:</span>
                <span className="text-white">Alamo Title · Fidelity National Title</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Average Turnaround:</span>
                <span className="text-emerald-400 font-bold">10 Business Days</span>
              </div>
            </div>
          </div>

        </div>

        {/* Real Closed Transactions Audit Feed */}
        <div className="bg-[#00171C] rounded-lg border border-[#0A4251] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#0A4251]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#F2C864]" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Recent Closed &amp; Funded Property Acquisitions
              </h4>
            </div>
            <span className="text-[11px] font-mono text-[#88BBD8]">
              Public County Assessor Filings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="bg-[#0A4251]/40 p-4 rounded border border-[#0A4251] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#F2C864] font-bold text-[11px]">{tx.id}</span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                    {tx.status}
                  </span>
                </div>
                <div className="font-bold text-white text-sm truncate">{tx.location}</div>
                <div className="text-slate-400 text-[11px]">{tx.type} · {tx.condition}</div>
                <div className="pt-2 border-t border-white/10 text-[#88BBD8] font-mono text-[10px] flex items-center justify-between">
                  <span>{tx.timeline}</span>
                  <span className="text-slate-500">{tx.desk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
