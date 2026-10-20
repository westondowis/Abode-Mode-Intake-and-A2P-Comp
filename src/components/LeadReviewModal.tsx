import React, { useState } from 'react';
import { Lead, SellLead, BuyLead } from '../types';
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  CheckSquare,
  Users,
  Compass,
  FileText,
  Sparkles,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';
import { syncLeadToGoogleWorkspace } from '../services/googleWorkspace';
import { updateLeadGoogleSync } from '../services/leadsStorage';
import { BrokerAvatar } from './brand/BrokerAvatar';
import { AbodeWordmark } from './brand/AbodeWordmark';
import { ImagenGeneratorModal } from './ImagenGeneratorModal';

interface LeadReviewModalProps {
  lead: Lead | null;
  onClose: () => void;
  accessToken: string | null;
  onSyncComplete?: (updatedLead: Lead) => void;
  onLeadUpdated?: (updatedLead: Lead) => void;
}

export const LeadReviewModal: React.FC<LeadReviewModalProps> = ({
  lead: initialLead,
  onClose,
  accessToken,
  onSyncComplete,
  onLeadUpdated,
}) => {
  const [lead, setLead] = useState<Lead | null>(initialLead);
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showImagenModal, setShowImagenModal] = useState(false);

  React.useEffect(() => {
    setLead(initialLead);
  }, [initialLead]);

  if (!lead) return null;

  const isSell = lead.type === 'sell';
  const sell = isSell ? (lead as SellLead) : null;
  const buy = !isSell ? (lead as BuyLead) : null;

  const shareableUrl = `${window.location.origin}/#review-${lead.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSync = async () => {
    if (!accessToken) {
      setSyncFeedback('Please sign in with Google to sync to your Google Tasks & Contacts.');
      return;
    }
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncLeadToGoogleWorkspace(lead, accessToken);
      let msg = '';
      if (result.taskResult && result.contactResult) {
        msg = 'Successfully synced to both Google Tasks and Google Contacts!';
      } else if (result.taskResult) {
        msg = 'Created Google Task successfully!';
      } else if (result.contactResult) {
        msg = 'Created Google Contact successfully!';
      } else {
        msg = `Sync failed: ${result.taskError || result.contactError || 'Unknown error'}`;
      }
      setSyncFeedback(msg);

      const updated = updateLeadGoogleSync(
        lead.id,
        result.taskResult?.id,
        result.contactResult?.resourceName
      );
      if (updated && onSyncComplete) {
        onSyncComplete(updated);
      }
    } catch (err: unknown) {
      setSyncFeedback(err instanceof Error ? err.message : 'Error syncing to Google Workspace');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#00171C] border border-[#0A4251] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Official Brand Identity */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0A4251] bg-[#0A4251]/40">
          <div className="flex items-center gap-3">
            <BrokerAvatar size="sm" variant="circle" />
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isSell
                      ? 'bg-[#F2C864]/20 text-[#F2C864] border border-[#F2C864]/40'
                      : 'bg-[#88BBD8]/20 text-[#88BBD8] border border-[#88BBD8]/40'
                  }`}
                >
                  {isSell ? 'Seller Intake' : 'Buyer Criteria'}
                </span>
                <span className="text-xs font-mono text-slate-300">#{lead.id}</span>
              </div>
              <span className="text-[11px] text-[#88BBD8] font-medium block">
                ABODE-MODE LLC Verified File
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
              title="Copy shareable link to this filled out form"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-teal-300">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Form Link</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="px-6 py-2.5 bg-[#101b29] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-slate-300">
                Google Task:{' '}
                {lead.googleTaskId ? (
                  <strong className="text-teal-300">Created ({lead.googleTaskId})</strong>
                ) : (
                  <span className="text-slate-500">Not created yet</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-300">
                Google Contact:{' '}
                {lead.googleContactId ? (
                  <strong className="text-sky-300">Saved to Contacts</strong>
                ) : (
                  <span className="text-slate-500">Not saved yet</span>
                )}
              </span>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-all disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <div className="w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <span>Sync with Google Workspace</span>
              </>
            )}
          </button>
        </div>

        {syncFeedback && (
          <div className="px-6 py-2 bg-teal-950/40 border-b border-teal-800/40 text-xs text-teal-200">
            {syncFeedback}
          </div>
        )}

        {/* Form Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Main Title & Time */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">
                {isSell ? sell?.sellerName : buy?.buyerName}
              </h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-teal-400" />
                Submitted on {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowImagenModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A4251] hover:bg-[#0e5264] border border-[#F2C864]/50 text-[#F2C864] text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{lead.imageUrl ? 'Regenerate Imagen Photo' : 'Generate Imagen Photo'}</span>
              </button>
              <span className="px-3 py-1 rounded-lg bg-[#14202e] border border-slate-700 text-xs text-slate-300">
                Status: <strong className="text-white capitalize">{lead.status}</strong>
              </span>
            </div>
          </div>

          {/* Imagen Land Listing Imagery Display */}
          {lead.imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-[#0A4251] bg-[#00171C] shadow-xl group">
              <div className="w-full h-56 sm:h-64 relative overflow-hidden">
                <img
                  src={lead.imageUrl}
                  alt={`Listing imagery for ${lead.id}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#00171C] via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[#00171C]/80 border border-[#F2C864]/50 text-[11px] font-bold text-[#F2C864] backdrop-blur-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Imagen Land Imagery</span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                  <span className="truncate max-w-[70%] font-medium text-slate-300">
                    {lead.imagePrompt || 'Custom synthesized land terrain'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowImagenModal(true)}
                    className="px-3 py-1 rounded-lg bg-[#F2C864] text-[#00171C] font-bold text-xs shadow-md hover:bg-amber-300 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#0A4251]/20 border border-[#0A4251] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0A4251] border border-[#F2C864]/40 flex items-center justify-center text-[#F2C864] flex-shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">No placeholder land imagery attached</h4>
                  <p className="text-slate-400 text-[11px]">
                    Use Google Imagen to synthesize realistic terrain and parcel photography.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImagenModal(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F2C864] hover:bg-amber-300 text-[#00171C] font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Generate with Imagen
              </button>
            </div>
          )}

          {/* Contact Card */}
          <div className="p-4 rounded-2xl bg-[#121c27] border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name:</span>
                <span className="text-white font-medium">
                  {isSell ? sell?.sellerName : buy?.buyerName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Number:</span>
                <a
                  href={`tel:${isSell ? sell?.sellerPhone : buy?.buyerPhone}`}
                  className="text-teal-300 font-mono hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {isSell ? sell?.sellerPhone : buy?.buyerPhone}
                </a>
              </div>
              <div>
                <span className="text-slate-500 block">Email Address:</span>
                <a
                  href={`mailto:${isSell ? sell?.sellerEmail : buy?.buyerEmail}`}
                  className="text-teal-300 font-mono hover:underline flex items-center gap-1 truncate"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {isSell ? sell?.sellerEmail : buy?.buyerEmail}
                </a>
              </div>
            </div>
            <div className="text-xs text-slate-400 pt-1">
              Preferred Contact Method:{' '}
              <strong className="text-slate-200 capitalize">
                {isSell ? sell?.preferredContactMethod : buy?.preferredContactMethod}
              </strong>
            </div>
          </div>

          {/* Sell Form Details */}
          {isSell && sell && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121c27] border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" /> Property & Location Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Address/Region:</span>
                    <span className="text-white font-medium">{sell.address || 'Vacant Land'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">County, State:</span>
                    <span className="text-white font-medium">
                      {sell.county}, {sell.state}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Parcel Number (APN):</span>
                    <span className="text-teal-300 font-mono font-medium">
                      {sell.parcelNumber || 'To be researched'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Acreage:</span>
                    <span className="text-white font-semibold">{sell.acreage} Acres</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121c27] border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 mb-3">
                  <Compass className="w-4 h-4" /> Physical & Utility Characteristics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Zoning:</span>
                    <span className="text-white">{sell.zoningType || 'Unrestricted / Rural'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Road Access:</span>
                    <span className="text-white">{sell.roadAccess || 'Paved / Dirt'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Electricity:</span>
                    <span className="text-white">{sell.electricity}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Water & Sewer:</span>
                    <span className="text-white">
                      {sell.waterSource} / {sell.sewer}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121c27] border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4" /> Pricing & Title Ownership
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Asking Expectation:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {sell.askingPriceExpectation}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Timeline:</span>
                    <span className="text-white">{sell.sellingTimeline}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Ownership Status:</span>
                    <span className="text-white">{sell.ownershipType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Back Taxes / Liens:</span>
                    <span className="text-white">
                      {sell.backTaxesOwed} ({sell.hasLiensOrMortgages})
                    </span>
                  </div>
                </div>
                {sell.additionalComments && (
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-500 block">Seller Notes:</span>
                    <p className="text-slate-300 italic mt-0.5">{sell.additionalComments}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buy Form Details */}
          {!isSell && buy && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#121c27] border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" /> Target Acquisition Location
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Target States:</span>
                    <span className="text-white font-semibold">
                      {buy.targetStates.join(', ') || 'Anywhere'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Counties:</span>
                    <span className="text-white font-medium">
                      {buy.targetCounties || 'Any county in region'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Acreage Range:</span>
                    <span className="text-teal-300 font-semibold">
                      {buy.minAcreage} - {buy.maxAcreage} Acres
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121c27] border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4" /> Budget & Funding
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Budget Allocation:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {buy.budgetRange}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Funding Source:</span>
                    <span className="text-white">{buy.fundingSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Acquisition Timeline:</span>
                    <span className="text-white">{buy.purchasingTimeline}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#121c27] border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" /> Desired Use & Must-Haves
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Planned Use:</span>
                    <span className="text-white">{buy.plannedUse}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Must-Have Features:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {buy.mustHaveFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="px-2.5 py-1 rounded-md bg-teal-950/60 border border-teal-500/30 text-teal-300 text-[11px]"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                  {buy.specialRequests && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-500 block">Special Requests:</span>
                      <p className="text-slate-300 italic mt-0.5">{buy.specialRequests}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0a1017] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>Ready for Underwriting & Verification</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
          >
            Close View
          </button>
        </div>
      </div>

      {/* Imagen AI Land Visualizer Modal */}
      {showImagenModal && (
        <ImagenGeneratorModal
          lead={lead}
          onClose={() => setShowImagenModal(false)}
          onImageSaved={(updated) => {
            setLead(updated);
            if (onLeadUpdated) onLeadUpdated(updated);
          }}
        />
      )}
    </div>
  );
};
