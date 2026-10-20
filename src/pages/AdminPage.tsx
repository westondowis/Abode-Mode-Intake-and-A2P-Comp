import React, { useState } from 'react';
import { Lead, SellLead, BuyLead, LeadStatus } from '../types';
import {
  getStoredLeads,
  updateLeadStatus,
  deleteLeadById,
  updateLeadGoogleSync,
} from '../services/leadsStorage';
import { syncLeadToGoogleWorkspace } from '../services/googleWorkspace';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { googleSignIn, logout } from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import { BrokerAvatar } from '../components/brand/BrokerAvatar';
import { AbodeSeal } from '../components/brand/AbodeSeal';
import { ImagenGeneratorModal } from '../components/ImagenGeneratorModal';
import { PropertyValueTrendChart } from '../components/admin/PropertyValueTrendChart';
import {
  Users,
  CheckSquare,
  ArrowUpDown,
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
  ExternalLink,
  DollarSign,
  Layers,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminPageProps {
  onOpenReview: (leadId: string) => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthChange: (user: User | null, hasToken: boolean) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  onOpenReview,
  currentUser,
  accessToken,
  onAuthChange,
}) => {
  const [leads, setLeads] = useState<Lead[]>(getStoredLeads());
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sell' | 'buy'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'type' | 'status'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Deletion Confirmation Dialog State
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Imagen Generation Dialog State
  const [selectedImagenLead, setSelectedImagenLead] = useState<Lead | null>(null);

  // Syncing state for individual leads
  const [syncingLeadId, setSyncingLeadId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const refreshLeads = () => {
    setLeads(getStoredLeads());
  };

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    updateLeadStatus(id, newStatus);
    refreshLeads();
  };

  const confirmDeleteLead = () => {
    if (!leadToDelete) return;
    deleteLeadById(leadToDelete.id);
    setLeadToDelete(null);
    refreshLeads();
  };

  const handleSyncWorkspace = async (lead: Lead) => {
    if (!accessToken) {
      setSyncMessage('Please sign in with Google to sync to Google Tasks and Contacts.');
      return;
    }

    setSyncingLeadId(lead.id);
    setSyncMessage(null);

    try {
      const res = await syncLeadToGoogleWorkspace(lead, accessToken);
      let feedback = '';
      if (res.taskResult && res.contactResult) {
        feedback = `Synced #${lead.id}: Task created and contact saved!`;
      } else if (res.taskResult) {
        feedback = `Synced #${lead.id}: Task created in Google Tasks.`;
      } else if (res.contactResult) {
        feedback = `Synced #${lead.id}: Contact created in Google People.`;
      } else {
        feedback = `Sync failed: ${res.taskError || res.contactError}`;
      }
      setSyncMessage(feedback);

      updateLeadGoogleSync(lead.id, res.taskResult?.id, res.contactResult?.resourceName);
      refreshLeads();
    } catch (err: unknown) {
      setSyncMessage(err instanceof Error ? err.message : 'Error syncing to Google Workspace');
    } finally {
      setSyncingLeadId(null);
    }
  };

  // Metrics
  const sellerCount = leads.filter((l) => l.type === 'sell').length;
  const buyerCount = leads.filter((l) => l.type === 'buy').length;
  const newCount = leads.filter((l) => l.status === 'new').length;
  const syncedCount = leads.filter((l) => l.googleTaskId || l.googleContactId).length;

  // Filter & Sort
  const filteredLeads = leads
    .filter((l) => {
      if (typeFilter !== 'all' && l.type !== typeFilter) return false;
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      if (l.type === 'sell') {
        const s = l as SellLead;
        return (
          s.sellerName.toLowerCase().includes(q) ||
          s.sellerEmail.toLowerCase().includes(q) ||
          s.county.toLowerCase().includes(q) ||
          s.state.toLowerCase().includes(q) ||
          s.parcelNumber.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
        );
      } else {
        const b = l as BuyLead;
        return (
          b.buyerName.toLowerCase().includes(q) ||
          b.buyerEmail.toLowerCase().includes(q) ||
          b.targetStates.some((st) => st.toLowerCase().includes(q)) ||
          (b.targetCounties && b.targetCounties.toLowerCase().includes(q)) ||
          b.id.toLowerCase().includes(q)
        );
      }
    })
    .sort((a, b) => {
      if (sortField === 'date') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortAsc ? timeA - timeB : timeB - timeA;
      }
      if (sortField === 'type') {
        return sortAsc ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      }
      if (sortField === 'status') {
        return sortAsc ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      }
      return 0;
    });

  const toggleSort = (field: 'date' | 'type' | 'status') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#0A4251]">
        <div className="flex items-center gap-4">
          <BrokerAvatar size="md" variant="rounded" className="ring-1 ring-[#F2C864]/50" />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0A4251]/60 border border-[#F2C864]/30 text-[#F2C864] text-xs font-semibold uppercase tracking-wider mb-1">
              ABODE-MODE LLC • Operations & Underwriting
            </div>
            <h1 className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Real-time pipeline of land sellers, buyer acquisition criteria, and Google Workspace automations.
            </p>
          </div>
        </div>

        {/* Google Workspace Connection Controls */}
        <div className="flex items-center gap-3">
          {currentUser && accessToken ? (
            <div className="flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-[#0A4251]/30 border border-[#F2C864]/30 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F2C864] animate-pulse" />
              <div>
                <span className="text-[#88BBD8] block text-[10px]">Google Workspace Linked</span>
                <span className="text-slate-200 font-semibold">{currentUser.email}</span>
              </div>
            </div>
          ) : (
            <GoogleSignInButton
              text="Connect Google Tasks & Contacts"
              onClick={async () => {
                const res = await googleSignIn();
                if (res?.accessToken) {
                  onAuthChange(res.user, true);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Stats Row: 3 summary metric cards as requested + Google Automation metric */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Sellers */}
        <div className="p-6 rounded-2xl bg-[#0f1722] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Sellers</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{sellerCount} Sellers</div>
          <p className="text-xs text-slate-500 mt-2">Total sell leads submitted</p>
        </div>

        {/* Metric 2: Buyers */}
        <div className="p-6 rounded-2xl bg-[#0f1722] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Buyers</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{buyerCount} Buyers</div>
          <p className="text-xs text-slate-500 mt-2">Total buy leads with criteria</p>
        </div>

        {/* Metric 3: New */}
        <div className="p-6 rounded-2xl bg-[#0f1722] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>New Submissions</span>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-teal-400 font-mono">{newCount} New</div>
          <p className="text-xs text-slate-500 mt-2">Recent unread submissions</p>
        </div>

        {/* Metric 4: Google Workspace Automation */}
        <div className="p-6 rounded-2xl bg-[#0f1722] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Tasks & Contacts</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <CheckSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono">{syncedCount} Synced</div>
          <p className="text-xs text-slate-500 mt-2">Linked to Google Workspace</p>
        </div>
      </div>

      {/* Property Value Trend Visualization Chart (12 Months Market Dynamics via Recharts) */}
      <PropertyValueTrendChart />

      {/* Sync Status Banner */}
      {syncMessage && (
        <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-teal-400 hover:text-teal-200 font-semibold text-xs ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f1722] border border-slate-800 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by contact name, email, county, APN, or ID..."
            className="w-full bg-[#131f2d] text-sm text-slate-100 placeholder:text-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/60 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <div className="flex bg-[#131f2d] p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-teal-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setTypeFilter('sell')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                typeFilter === 'sell'
                  ? 'bg-amber-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sellers ({sellerCount})
            </button>
            <button
              onClick={() => setTypeFilter('buy')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                typeFilter === 'buy'
                  ? 'bg-cyan-600 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Buyers ({buyerCount})
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#131f2d] text-xs text-slate-200 rounded-xl px-3 py-2 border border-slate-700/60 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="contacted">Contacted</option>
            <option value="offer_sent">Offer Sent</option>
            <option value="under_contract">Under Contract</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={refreshLeads}
            className="p-2 bg-[#131f2d] hover:bg-[#1a2839] border border-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh Leads"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leads Data Table: functional table sortable by Type, Date, Status */}
      <div className="bg-[#0f1722] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0a1017] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th
                  onClick={() => toggleSort('type')}
                  className="px-6 py-4 font-bold cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Type (Buy/Sell)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold">Contact / Owner</th>
                <th className="px-6 py-4 font-bold">Location & Specs</th>
                <th className="px-6 py-4 font-bold">Value / Asking</th>
                <th
                  onClick={() => toggleSort('date')}
                  className="px-6 py-4 font-bold cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('status')}
                  className="px-6 py-4 font-bold cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-center">Google Workspace</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No leads match your filter criteria. Try adjusting your search query.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSell = lead.type === 'sell';
                  const sell = isSell ? (lead as SellLead) : null;
                  const buy = !isSell ? (lead as BuyLead) : null;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#121c27] transition-colors group cursor-pointer"
                      onClick={() => onOpenReview(lead.id)}
                    >
                      {/* Type Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isSell
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {isSell ? <MapPin className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {isSell ? 'Sell Lead' : 'Buy Lead'}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-100 text-sm">
                          {isSell ? sell?.sellerName : buy?.buyerName}
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {isSell ? sell?.sellerEmail : buy?.buyerEmail}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {isSell ? sell?.sellerPhone : buy?.buyerPhone}
                        </div>
                      </td>

                      {/* Location & Specs with optional Imagen thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {lead.imageUrl ? (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImagenLead(lead);
                              }}
                              className="relative w-12 h-9 rounded-lg overflow-hidden border border-[#F2C864]/50 flex-shrink-0 cursor-pointer group/thumb shadow-sm"
                              title="Click to view or regenerate Imagen imagery"
                            >
                              <img
                                src={lead.imageUrl}
                                alt="Land thumbnail"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                <Wand2 className="w-3 h-3 text-[#F2C864]" />
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImagenLead(lead);
                              }}
                              className="w-12 h-9 rounded-lg border border-dashed border-[#0A4251] hover:border-[#F2C864]/60 bg-[#0A4251]/20 flex items-center justify-center text-[#88BBD8] hover:text-[#F2C864] flex-shrink-0 transition-colors"
                              title="Generate land placeholder image with Imagen"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div>
                            {isSell && sell && (
                              <div>
                                <div className="text-slate-200 font-medium">
                                  {sell.county}, {sell.state}
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                  {sell.acreage} ac • APN:{' '}
                                  <span className="font-mono text-teal-300">
                                    {sell.parcelNumber}
                                  </span>
                                </div>
                              </div>
                            )}
                            {!isSell && buy && (
                              <div>
                                <div className="text-slate-200 font-medium">
                                  {buy.targetStates.join(', ') || 'Any State'}
                                </div>
                                <div className="text-slate-400 text-[11px]">
                                  {buy.minAcreage}-{buy.maxAcreage} ac • {buy.plannedUse}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Value / Asking */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-emerald-400 font-mono">
                          {isSell ? sell?.askingPriceExpectation : buy?.budgetRange}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status Selector */}
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(lead.id, e.target.value as LeadStatus)
                          }
                          className="bg-[#14202e] text-[11px] font-semibold text-slate-200 rounded-lg px-2.5 py-1 border border-slate-700/80 focus:outline-none focus:border-teal-500 uppercase tracking-wider"
                        >
                          <option value="new">New</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="contacted">Contacted</option>
                          <option value="offer_sent">Offer Sent</option>
                          <option value="under_contract">Under Contract</option>
                          <option value="closed">Closed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>

                      {/* Google Workspace Badges & Sync Action */}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleSyncWorkspace(lead)}
                            disabled={syncingLeadId === lead.id}
                            className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                              lead.googleTaskId && lead.googleContactId
                                ? 'bg-teal-950/60 border-teal-500/50 text-teal-300'
                                : 'bg-[#141f2d] border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                            title={
                              lead.googleTaskId
                                ? `Google Task #${lead.googleTaskId} created. Click to re-sync.`
                                : 'Click to create Google Task & Contact'
                            }
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
                            <Users className="w-3.5 h-3.5 text-sky-400" />
                            <span className="text-[10px] font-medium hidden sm:inline">
                              {syncingLeadId === lead.id
                                ? 'Syncing...'
                                : lead.googleTaskId
                                ? 'Synced'
                                : 'Sync'}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Imagen AI Land Visualizer Action */}
                          <button
                            type="button"
                            onClick={() => setSelectedImagenLead(lead)}
                            className={`p-1.5 rounded-lg border text-xs transition-all flex items-center gap-1 ${
                              lead.imageUrl
                                ? 'bg-[#0A4251] border-[#F2C864]/50 text-[#F2C864] hover:bg-[#0e5264]'
                                : 'text-slate-400 hover:text-[#F2C864] hover:bg-[#0A4251]/40 border-slate-700/60'
                            }`}
                            title={
                              lead.imageUrl
                                ? 'Regenerate Imagen Land Photography'
                                : 'Generate Land Placeholder with Imagen'
                            }
                          >
                            <Wand2 className="w-3.5 h-3.5 text-[#F2C864]" />
                            <span className="text-[10px] hidden xl:inline font-semibold">
                              {lead.imageUrl ? 'Photo' : 'Imagen'}
                            </span>
                          </button>

                          <button
                            onClick={() => onOpenReview(lead.id)}
                            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Inspect filled-out form details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Deleting Lead (as per skill requirements) */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0f1722] border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete lead{' '}
              <strong className="text-white">#{leadToDelete.id}</strong> (
              {leadToDelete.type === 'sell'
                ? (leadToDelete as SellLead).sellerName
                : (leadToDelete as BuyLead).buyerName}
              )? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLead}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Imagen AI Land Visualizer Modal */}
      {selectedImagenLead && (
        <ImagenGeneratorModal
          lead={selectedImagenLead}
          onClose={() => setSelectedImagenLead(null)}
          onImageSaved={() => {
            refreshLeads();
          }}
        />
      )}
    </div>
  );
};
