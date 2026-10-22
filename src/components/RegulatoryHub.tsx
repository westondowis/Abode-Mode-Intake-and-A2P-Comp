import React, { useState } from 'react';
import { 
  POLICY_SECTIONS, 
  ENTITY_DETAILS 
} from '../data/policyData';
import { getAcquisitionMailtoHref } from '../utils/contactEmail';
import { StrictSmsCallout } from './StrictSmsCallout';
import { 
  Search, 
  ChevronRight, 
  Bookmark, 
  Printer, 
  ShieldCheck, 
  Hash, 
  Check, 
  Phone, 
  Mail, 
  Building2, 
  ChevronDown,
  Info
} from 'lucide-react';

interface RegulatoryHubProps {
  onOpenAuditModal: () => void;
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export const RegulatoryHub: React.FC<RegulatoryHubProps> = ({
  onOpenAuditModal,
  activeSection,
  onSelectSection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Accordion state: keep active open or allow expanding all
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'scope-information-collected': true,
    'mobile-sms-privacy': true,
    'purpose-of-use': true,
    'consumer-rights-opt-out': true,
    'data-security-storage': true,
    'direct-contact': true,
    'state-disclosures': true,
    'governing-law': true,
  });

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopySectionLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const highlightMatches = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-[#F2C864] text-[#00171C] font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filteredSections = POLICY_SECTIONS.filter((section) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = section.title.toLowerCase().includes(query);
    const summaryMatch = section.highlightSummary?.toLowerCase().includes(query);
    const contentMatch = section.subsections.some(
      (sub) =>
        sub.subtitle?.toLowerCase().includes(query) ||
        sub.paragraphs.some((p) => p.toLowerCase().includes(query)) ||
        sub.bulletPoints?.some((bp) => bp.toLowerCase().includes(query))
    );
    return titleMatch || summaryMatch || contentMatch;
  });

  return (
    <section id="regulatory-hub" className="scroll-mt-20 py-14 md:py-20 bg-[#00171C] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#0A4251]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A4251] border border-[#F2C864]/40 rounded text-xs font-mono tracking-wider text-[#F2C864] uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CTIA Short Code &amp; 10DLC Regulatory Hub</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
              Official Privacy Policy &amp; Telecommunications Disclosures
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light max-w-3xl leading-relaxed">
              Comprehensive regulatory framework, CTIA mobile data protection covenants, and state-specific acquisition disclosures for <strong className="text-white font-semibold">{ENTITY_DETAILS.legalName}</strong> (d/b/a <strong className="text-[#F2C864] font-semibold">{ENTITY_DETAILS.dbaName}</strong>).
            </p>
          </div>

          <div className="no-print flex items-center gap-3 shrink-0">
            <button
              onClick={() => window.print()}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#0A4251] hover:bg-[#0e5c70] border border-[#0A4251] rounded transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#88BBD8]" />
              <span>Print Carrier PDF</span>
            </button>
            <button
              onClick={onOpenAuditModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#00171C] bg-[#F2C864] hover:bg-[#fad379] rounded transition-colors cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>A2P 10DLC Vetting Sheet</span>
            </button>
          </div>
        </div>

        {/* 2-Column Layout: Sticky Navigation (Desktop) + Policy Document (Light Reading Canvas) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 sticky top-28 self-start space-y-6 no-print">
            
            {/* Search Box */}
            <div className="bg-white p-4 rounded-lg border border-[#d5dde0] shadow-xs text-slate-800">
              <label
                htmlFor="policy-search"
                className="block text-xs font-bold uppercase tracking-wider text-[#0A4251] mb-2 font-mono"
              >
                Search Regulatory Clauses
              </label>
              <div className="relative">
                <input
                  id="policy-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. STOP, third parties, data rates..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafb] border border-[#d5dde0] rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4251] text-slate-900 placeholder-slate-400"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>
              {searchQuery && (
                <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Filtered to matching clauses</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#0A4251] hover:underline font-semibold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>

            {/* Table of Contents */}
            <div className="bg-white rounded-lg border border-[#d5dde0] shadow-xs overflow-hidden text-slate-800">
              <div className="p-4 bg-[#f3f5f6] border-b border-[#d5dde0] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#0A4251]" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    Policy Index
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-500">8 Sections</span>
              </div>

              <nav className="p-2 divide-y divide-slate-100">
                {POLICY_SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  const isStrict = section.id === 'mobile-sms-privacy';

                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectSection(section.id);
                        const el = document.getElementById(section.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`flex items-start gap-2.5 p-2.5 rounded transition-all group ${
                        isActive
                          ? 'bg-[#0A4251] text-white font-semibold'
                          : isStrict
                          ? 'hover:bg-amber-50 text-slate-800'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span
                        className={`text-[11px] font-mono shrink-0 mt-0.5 ${
                          isActive
                            ? 'text-[#F2C864]'
                            : isStrict
                            ? 'text-[#0A4251] font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        {section.number}.
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs leading-snug flex items-center gap-1.5">
                          <span className="truncate">{section.title}</span>
                          {isStrict && !isActive && (
                            <span className="text-[9px] font-mono uppercase bg-[#F2C864]/20 text-[#00171C] font-bold px-1 rounded">
                              Strict
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform ${
                          isActive
                            ? 'text-[#F2C864] translate-x-0.5'
                            : 'text-slate-300 group-hover:text-slate-500'
                        }`}
                      />
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Entity Summary Card */}
            <div className="bg-[#0A4251] text-white p-5 rounded-lg border border-[#F2C864]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F2C864] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#F2C864]" />
                <span>Verified Entity Audit Data</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-200 font-mono text-[11px]">
                <div><span className="text-slate-400">Legal:</span> {ENTITY_DETAILS.legalName}</div>
                <div><span className="text-slate-400">DBA:</span> {ENTITY_DETAILS.dbaName}</div>
                <div><span className="text-slate-400">Colorado Desk:</span> {ENTITY_DETAILS.primaryPhone}</div>
                <div><span className="text-slate-400">Texas Desk:</span> {ENTITY_DETAILS.secondaryPhone}</div>
                <div><span className="text-slate-400">Email:</span> {ENTITY_DETAILS.contactEmail}</div>
              </div>
            </div>

          </aside>

          {/* Main Legal Document Surface (8 Cols) - High-Contrast Light Surface on Dark Ground */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Regulatory Masthead Card */}
            <div className="bg-white rounded-lg border border-[#d5dde0] p-6 sm:p-8 shadow-xs text-slate-800 print-surface">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#d5dde0]">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251] block">
                    Official Regulatory Publication
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#00171C]">
                    ABODE-MODE LLC · Comprehensive Privacy Policy
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    Rev: {ENTITY_DETAILS.effectiveDate}
                  </span>
                </div>
              </div>

              <div className="pt-4 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  This document sets forth the comprehensive privacy framework, data retention schedules, and mandatory CTIA telecommunications disclosures for <strong className="text-slate-900">{ENTITY_DETAILS.legalName}</strong> (publicly trading and operating as <strong className="text-slate-900">{ENTITY_DETAILS.dbaName}</strong>).
                </p>
                <p>
                  All prospective sellers, property owners, and representatives communicating regarding direct real estate acquisitions are afforded the complete statutory and carrier protections delineated in the following clauses.
                </p>
              </div>
            </div>

            {/* Render 8 Sections */}
            {filteredSections.map((section) => {
              const isStrictSection = section.id === 'mobile-sms-privacy';
              const isExpanded = expandedSections[section.id] !== false;

              return (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 bg-white rounded-lg border border-[#d5dde0] p-6 sm:p-10 shadow-xs print-surface text-slate-800"
                >
                  {/* Section Header */}
                  <div className="flex flex-wrap items-baseline justify-between gap-4 pb-5 mb-6 border-b border-[#d5dde0]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#0A4251] tracking-wider uppercase">
                          Section {section.number}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs font-mono text-slate-500 uppercase">
                          ABODE-MODE LLC Regulatory Document
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#00171C] tracking-tight">
                        {highlightMatches(section.title)}
                      </h3>
                    </div>

                    <div className="no-print flex items-center gap-2">
                      <button
                        onClick={() => handleCopySectionLink(section.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-slate-500 hover:text-[#0A4251] bg-[#f8fafb] hover:bg-slate-100 rounded border border-[#d5dde0] transition-colors cursor-pointer"
                        title="Copy direct anchor link to this clause"
                      >
                        {copiedSection === section.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Link Copied</span>
                          </>
                        ) : (
                          <>
                            <Hash className="w-3.5 h-3.5 text-slate-400" />
                            <span>#{section.id}</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                        aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-6">
                      {/* Highlight Summary Kicker */}
                      {section.highlightSummary && (
                        <p className="text-sm font-medium text-[#0A4251] bg-[#f3f5f6] p-3.5 rounded border border-[#d5dde0]/60 leading-relaxed">
                          <strong className="font-semibold text-[#00171C]">Executive Summary: </strong>
                          {highlightMatches(section.highlightSummary)}
                        </p>
                      )}

                      {/* Special Callout for Section 2: Non-Negotiable Strict Carrier Mobile & SMS Privacy Clause */}
                      {isStrictSection && <StrictSmsCallout />}

                      {/* Subsection Contents */}
                      <div className="space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
                        {section.subsections.map((sub, sIdx) => (
                          <div key={sIdx} className="space-y-3">
                            {sub.subtitle && (
                              <h4 className="text-base sm:text-lg font-bold text-[#00171C] font-serif pt-2 border-t border-slate-100">
                                {highlightMatches(sub.subtitle)}
                              </h4>
                            )}

                            {sub.paragraphs.map((p, pIdx) => (
                              <p key={pIdx} className="leading-relaxed">
                                {highlightMatches(p)}
                              </p>
                            ))}

                            {/* Bullet Points */}
                            {sub.bulletPoints && sub.bulletPoints.length > 0 && (
                              <ul className="space-y-2.5 pl-2 sm:pl-4">
                                {sub.bulletPoints.map((bp, bIdx) => {
                                  const colonIndex = bp.indexOf(':');
                                  const hasPrefix = colonIndex > -1;
                                  const prefix = hasPrefix ? bp.substring(0, colonIndex + 1) : '';
                                  const rest = hasPrefix ? bp.substring(colonIndex + 1) : bp;

                                  return (
                                    <li key={bIdx} className="flex items-start gap-3 text-sm sm:text-[15px]">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#0A4251] shrink-0 mt-2.5" />
                                      <div>
                                        {hasPrefix ? (
                                          <>
                                            <strong className="font-bold text-[#00171C]">
                                              {highlightMatches(prefix)}
                                            </strong>
                                            <span>{highlightMatches(rest)}</span>
                                          </>
                                        ) : (
                                          <span>{highlightMatches(bp)}</span>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Factual Breakdown Table for Section 1 */}
                      {section.id === 'scope-information-collected' && (
                        <div className="mt-8 pt-6 border-t border-[#d5dde0] space-y-3">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A4251]">
                            Factual Breakdown of Consumer Data Fields Collected
                          </h4>
                          <div className="overflow-x-auto rounded border border-[#d5dde0]">
                            <table className="w-full text-left text-xs text-slate-700">
                              <thead className="bg-[#f3f5f6] text-slate-900 font-mono font-semibold uppercase tracking-wider border-b border-[#d5dde0]">
                                <tr>
                                  <th className="py-2.5 px-3">Data Category</th>
                                  <th className="py-2.5 px-3">Specific Data Fields Collected</th>
                                  <th className="py-2.5 px-3">Collection Method</th>
                                  <th className="py-2.5 px-3">Shared With 3rd Parties?</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                <tr>
                                  <td className="py-2.5 px-3 font-semibold text-[#00171C]">Mobile Telephony</td>
                                  <td className="py-2.5 px-3 font-mono">Mobile telephone number, SMS opt-in consent record</td>
                                  <td className="py-2.5 px-3">Direct web inquiry, inbound call, or signed contact request</td>
                                  <td className="py-2.5 px-3 font-bold text-emerald-800 bg-emerald-50/60">NEVER (Strictly Excluded)</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-3 font-semibold text-[#00171C]">Consumer Identity</td>
                                  <td className="py-2.5 px-3 font-mono">Full name, email address, owner relationship</td>
                                  <td className="py-2.5 px-3">Direct communication with acquisition desk</td>
                                  <td className="py-2.5 px-3 text-slate-600">Escrow/Title only during contracted closing</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-3 font-semibold text-[#00171C]">Real Property Details</td>
                                  <td className="py-2.5 px-3 font-mono">Property address, parcel ID (APN), county, square footage</td>
                                  <td className="py-2.5 px-3">Public county land records &amp; seller submission</td>
                                  <td className="py-2.5 px-3 text-slate-600">Escrow closing &amp; title insurance partners</td>
                                </tr>
                                <tr>
                                  <td className="py-2.5 px-3 font-semibold text-[#00171C]">Transaction Milestones</td>
                                  <td className="py-2.5 px-3 font-mono">Desired closing horizon, mortgage standing, probate notes</td>
                                  <td className="py-2.5 px-3">Seller consultation discussions</td>
                                  <td className="py-2.5 px-3 font-bold text-emerald-800 bg-emerald-50/60">NEVER Shared for Marketing</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* CTIA Interactive Cards for Section 4 (STOP & HELP) */}
                      {section.id === 'consumer-rights-opt-out' && (
                        <div className="mt-8 pt-6 border-t border-[#d5dde0] grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* STOP Box */}
                          <div className="bg-[#f8fafc] p-5 rounded-lg border border-[#d5dde0] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-[#0A4251] uppercase tracking-wider">
                                Opt-Out Keyword
                              </span>
                              <span className="px-2 py-0.5 font-mono text-xs font-bold bg-[#00171C] text-white rounded">
                                STOP
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 font-serif">Immediate Message Revocation</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Reply <strong>STOP</strong> to any SMS message received from Abode Mode to immediately terminate future messaging. Our telecommunications gateway halts all outbound SMS instantly.
                            </p>
                          </div>

                          {/* HELP Box */}
                          <div className="bg-[#f8fafc] p-5 rounded-lg border border-[#d5dde0] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-mono font-bold text-[#0A4251] uppercase tracking-wider">
                                Assistance Keyword
                              </span>
                              <span className="px-2 py-0.5 font-mono text-xs font-bold bg-[#0A4251] text-white rounded">
                                HELP
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 font-serif">Customer Care Information</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Reply <strong>HELP</strong> to any SMS for customer care information, or contact our acquisition desk directly at <strong>(719) 502-7119</strong> or <strong>WDowis@Abode-Mode.com</strong>.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Contact Desk Panel for Section 6 */}
                      {section.id === 'direct-contact' && (
                        <div className="mt-8 pt-6 border-t border-[#d5dde0]">
                          <div className="bg-[#00171C] text-white p-6 sm:p-8 rounded-lg border border-[#0A4251] space-y-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#0A4251]">
                              <div>
                                <h4 className="text-xl font-serif font-bold text-white tracking-wide">
                                  ABODE-MODE LLC Direct Acquisitions Desk
                                </h4>
                                <p className="text-xs text-[#88BBD8] font-mono mt-0.5">
                                  Direct Lines for Homeowners, Land Sellers &amp; Regulatory Inquiries
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-slate-400 block font-mono">Response Turnaround</span>
                                <span className="text-xs font-bold text-[#F2C864]">Within 24 Business Hours</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[#88BBD8]">
                                  <Phone className="w-4 h-4 text-[#F2C864]" />
                                  <span className="font-mono font-semibold uppercase">Colorado Desk</span>
                                </div>
                                <a
                                  href={`tel:${ENTITY_DETAILS.primaryPhone.replace(/\D/g, '')}`}
                                  className="text-base font-bold text-white hover:text-[#F2C864] block font-mono"
                                >
                                  {ENTITY_DETAILS.primaryPhone}
                                </a>
                                <span className="text-slate-400 block">Primary Acquisition Desk &amp; SMS Inquiries</span>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[#88BBD8]">
                                  <Phone className="w-4 h-4 text-[#F2C864]" />
                                  <span className="font-mono font-semibold uppercase">Texas Desk</span>
                                </div>
                                <a
                                  href={`tel:${ENTITY_DETAILS.secondaryPhone.replace(/\D/g, '')}`}
                                  className="text-base font-bold text-white hover:text-[#F2C864] block font-mono"
                                >
                                  {ENTITY_DETAILS.secondaryPhone}
                                </a>
                                <span className="text-slate-400 block">DFW &amp; Central Texas Direct Acquisitions</span>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-[#88BBD8]">
                                  <Mail className="w-4 h-4 text-[#F2C864]" />
                                  <span className="font-mono font-semibold uppercase">Electronic Inquiries</span>
                                </div>
                                <a
                                  href={getAcquisitionMailtoHref()}
                                  className="text-sm font-bold text-white hover:text-[#F2C864] block font-mono truncate"
                                  title="Compose pre-filled inquiry email to wdowis@abode-mode.com"
                                >
                                  {ENTITY_DETAILS.contactEmail}
                                </a>
                                <span className="text-slate-400 block">Director: W. Dowis · ABODE-MODE LLC</span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-[#0A4251] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                              <div>Entity Registration: ABODE-MODE LLC (United States)</div>
                              <div className="font-mono text-[#88BBD8]">#AbodeMode · @abodemodeinvest</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

          </div>

        </div>

      </div>
    </section>
  );
};
