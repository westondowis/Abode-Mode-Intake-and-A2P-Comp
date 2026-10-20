import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Mail, Link as LinkIcon } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareTitle = 'Abode Mode | Direct Land Acquisitions & Sales';
  const shareText =
    'Take a look at Abode Mode (ABODE-MODE LLC). They purchase residential land and acreage directly for cash with zero realtor commissions and clear title closings across all 50 states.';
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://abode-mode.com';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    'Direct Land Sales & Acquisitions: Abode Mode'
  )}&body=${encodeURIComponent(`${shareText}\n\nVisit: ${shareUrl}`)}`;

  const smsUrl = `sms:?&body=${encodeURIComponent(
    `Check out Abode Mode for selling or buying vacant land with zero fees: ${shareUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00171C]/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-lg border border-[#D5DDE0] shadow-2xl w-full max-w-md overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* Header */}
        <div className="bg-[#00171C] text-white p-5 border-b border-[#0A4251] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] border border-[#F2C864]/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="share-modal-title" className="text-base font-serif font-bold text-white">
                Share Abode Mode
              </h3>
              <p className="text-xs text-[#88BBD8]">Direct Land Acquisitions Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#0A4251] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Send this platform to a co-owner, spouse, family member, or business partner interested in selling or acquiring vacant land without broker commissions.
          </p>

          {/* Copy Link Field */}
          <div className="flex items-center gap-2 p-1.5 bg-[#F3F5F6] rounded-md border border-[#D5DDE0]">
            <LinkIcon className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-transparent text-xs text-slate-700 outline-none truncate font-mono"
            />
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-3 py-1.5 bg-[#0A4251] hover:bg-[#00171C] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Native / Quick Actions */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={smsUrl}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#F3F5F6] hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-[#D5DDE0] transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#0A4251]" />
              <span>Send Text / SMS</span>
            </a>
            <a
              href={mailtoUrl}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-[#F3F5F6] hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded border border-[#D5DDE0] transition-colors"
            >
              <Mail className="w-4 h-4 text-[#0A4251]" />
              <span>Email Link</span>
            </a>
          </div>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              type="button"
              className="w-full py-2.5 px-4 bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Open Device Share Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
