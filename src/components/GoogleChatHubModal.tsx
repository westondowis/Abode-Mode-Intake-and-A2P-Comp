import React, { useState, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  Building2,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
} from '../services/firebaseAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  listChatSpaces,
  sendChatMessage,
  GoogleChatSpace,
} from '../services/googleChatService';
import { Lead } from '../types';

interface GoogleChatHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead?: Lead | null;
}

export const GoogleChatHubModal: React.FC<GoogleChatHubModalProps> = ({
  isOpen,
  onClose,
  activeLead = null,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpaceName, setSelectedSpaceName] = useState<string>('');
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);

  const [messageText, setMessageText] = useState(() => {
    if (activeLead) {
      if (activeLead.type === 'sell') {
        const s = activeLead as any;
        return `🚨 NEW LAND SELLER INQUIRY:\n• Owner: ${s.sellerName}\n• Location: ${s.county || 'N/A'}, ${s.state || 'N/A'} (${s.acreage || 'N/A'} ac)\n• APN / Address: ${s.address || s.parcelNumber || 'N/A'}\n• Asking Price: ${s.askingPriceExpectation || 'Make offer'}`;
      } else {
        const b = activeLead as any;
        return `🎯 NEW BUYER CRITERIA:\n• Buyer: ${b.buyerName}\n• Target: ${b.targetStates.join(', ') || 'Anywhere'}\n• Budget: ${b.budgetRange || 'Open'}`;
      }
    }
    return '📋 Abode Mode Acquisitions Desk Update: All land acquisition pipeline systems operating nominally.';
  });

  const [isSending, setIsSending] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        if (token) {
          loadSpaces(token);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setSpaces([]);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const loadSpaces = async (token: string) => {
    setIsLoadingSpaces(true);
    setStatusNotice(null);
    try {
      const list = await listChatSpaces(token);
      setSpaces(list);
      if (list.length > 0 && !selectedSpaceName) {
        setSelectedSpaceName(list[0].name);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load Google Chat spaces';
      setStatusNotice({ type: 'error', message: msg });
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        await loadSpaces(res.accessToken);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google authentication failed';
      setAuthError(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setSpaces([]);
  };

  const handleInitiateSend = () => {
    if (!selectedSpaceName) {
      setStatusNotice({ type: 'error', message: 'Please select a Google Chat space.' });
      return;
    }
    if (!messageText.trim()) {
      setStatusNotice({ type: 'error', message: 'Message text cannot be empty.' });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmedSend = async () => {
    if (!accessToken) return;
    setShowConfirmModal(false);
    setIsSending(true);
    setStatusNotice(null);

    try {
      await sendChatMessage(
        accessToken,
        {
          spaceName: selectedSpaceName,
          text: messageText,
        },
        true // userConfirmed
      );

      setStatusNotice({
        type: 'success',
        message: 'Message successfully dispatched to Google Chat space!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send Google Chat message';
      setStatusNotice({ type: 'error', message: msg });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const selectedSpace = spaces.find((s) => s.name === selectedSpaceName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#06141a] border border-slate-200 dark:border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-cyan-950/80 bg-slate-50/80 dark:bg-[#030d12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold cinzel-text text-slate-900 dark:text-white">
                  Google Chat Team Notifications
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-teal-200 dark:border-cyan-800">
                  Workspace API
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly broadcast land acquisition updates and seller leads to your Google Chat spaces
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={handleLogout}
                title="Disconnect Google Account"
                className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!currentUser || !accessToken ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shadow-md">
              <MessageSquare className="w-7 h-7 text-teal-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white cinzel-text mb-2">
              Connect Google Workspace for Chat
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
              Authenticate with Google Workspace to enable direct messaging and team alerts in your Google Chat spaces.
            </p>
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isAuthenticating}
              text="Sign in with Google Workspace"
            />
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            {statusNotice && (
              <div
                className={`p-3 text-xs rounded-xl flex items-center justify-between border ${
                  statusNotice.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/60 border-red-200 text-red-800 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {statusNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>{statusNotice.message}</span>
                </div>
                <button
                  onClick={() => setStatusNotice(null)}
                  className="font-bold hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Select Space */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Google Chat Space *
                </label>
                <button
                  type="button"
                  onClick={() => accessToken && loadSpaces(accessToken)}
                  disabled={isLoadingSpaces}
                  className="text-[11px] text-teal-700 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                  <span>Refresh Spaces</span>
                </button>
              </div>

              {isLoadingSpaces ? (
                <div className="p-4 text-center text-xs text-slate-400">Loading spaces...</div>
              ) : spaces.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs text-slate-500 text-center">
                  No Google Chat spaces found. Create a space in Google Chat to receive automated alerts.
                </div>
              ) : (
                <select
                  value={selectedSpaceName}
                  onChange={(e) => setSelectedSpaceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {spaces.map((sp) => (
                    <option key={sp.name} value={sp.name}>
                      {sp.displayName || sp.name} ({sp.type || 'SPACE'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Message Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notification Message *
              </label>
              <textarea
                rows={6}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter acquisition update or lead details..."
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 font-sans leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleInitiateSend}
                disabled={isSending || !selectedSpaceName}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Send Chat Notification</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#071922] border-2 border-teal-500 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-800 dark:text-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-teal-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirm Google Chat Dispatch
                  </h3>
                  <p className="text-xs text-slate-500">Security Verification</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                Are you sure you want to broadcast this message to the selected Google Chat space?
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs mb-5 font-mono text-slate-700 dark:text-slate-300">
                {messageText}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSend}
                  disabled={isSending}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isSending ? 'Sending...' : 'Confirm & Send'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
