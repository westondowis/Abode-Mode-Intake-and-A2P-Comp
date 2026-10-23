import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  Building2,
  Send,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
} from '../services/firebaseAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  createPurchaseAgreementDoc,
  getGoogleDocDetails,
  GoogleDocResult,
} from '../services/googleDocsService';
import { Lead } from '../types';

interface GoogleDocsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead?: Lead | null;
}

export const GoogleDocsHubModal: React.FC<GoogleDocsHubModalProps> = ({
  isOpen,
  onClose,
  activeLead = null,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form state for generating agreement
  const [sellerName, setSellerName] = useState(activeLead && activeLead.type === 'sell' ? (activeLead as any).sellerName || '' : '');
  const [propertyAddress, setPropertyAddress] = useState(activeLead && activeLead.type === 'sell' ? (activeLead as any).address || '' : '');
  const [parcelNumber, setParcelNumber] = useState(activeLead && activeLead.type === 'sell' ? (activeLead as any).parcelNumber || '' : '');
  const [county, setCounty] = useState(activeLead && activeLead.type === 'sell' ? (activeLead as any).county || '' : '');
  const [state, setState] = useState(activeLead && activeLead.type === 'sell' ? (activeLead as any).state || 'TX' : 'TX');
  const [acreage, setAcreage] = useState(activeLead && activeLead.type === 'sell' ? String((activeLead as any).acreage || '5') : '5');
  const [offerAmount, setOfferAmount] = useState(activeLead && activeLead.type === 'sell' ? String((activeLead as any).askingPriceExpectation || '$25,000') : '$25,000');

  const [isGenerating, setIsGenerating] = useState(false);
  const [createdDoc, setCreatedDoc] = useState<GoogleDocResult | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
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
  };

  const handleInitiateCreate = () => {
    if (!sellerName.trim() || !county.trim()) {
      setStatusNotice({ type: 'error', message: 'Seller Name and County are required.' });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmedCreate = async () => {
    if (!accessToken) return;
    setShowConfirmModal(false);
    setIsGenerating(true);
    setStatusNotice(null);
    setCreatedDoc(null);

    try {
      const result = await createPurchaseAgreementDoc(
        accessToken,
        {
          sellerName,
          propertyAddress,
          parcelNumber,
          county,
          state,
          acreage,
          offerAmount,
        },
        true // userConfirmed
      );

      setCreatedDoc(result);
      setStatusNotice({
        type: 'success',
        message: 'Formal Land Purchase Agreement successfully created in your Google Docs!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create Google Doc';
      setStatusNotice({ type: 'error', message: msg });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#06141a] border border-slate-200 dark:border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-cyan-950/80 bg-slate-50/80 dark:bg-[#030d12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold cinzel-text text-slate-900 dark:text-white">
                  Google Docs Purchase Agreement Generator
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Workspace API
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate formal, legally-structured land purchase contracts directly in Google Docs
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
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-md">
              <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white cinzel-text mb-2">
              Connect Google Workspace for Docs
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
              Authenticate with Google Workspace to automatically generate purchase agreements and contract documents.
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

            {createdDoc && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Document Created Successfully!</span>
                </div>
                <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
                  Title: {createdDoc.title}
                </div>
                <a
                  href={createdDoc.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <span>Open in Google Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seller Full Name *
                </label>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Address / APN
                </label>
                <input
                  type="text"
                  value={parcelNumber || propertyAddress}
                  onChange={(e) => {
                    setParcelNumber(e.target.value);
                    setPropertyAddress(e.target.value);
                  }}
                  placeholder="APN 123-456-789"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  County *
                </label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="Presidio County"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="TX"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Acreage
                </label>
                <input
                  type="text"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  placeholder="40"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Offer Amount ($)
                </label>
                <input
                  type="text"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="$28,500"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleInitiateCreate}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Create Google Doc Agreement</span>
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#071922] border-2 border-blue-500 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-800 dark:text-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirm Google Docs Creation
                  </h3>
                  <p className="text-xs text-slate-500">Security Verification</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                Are you sure you want to create a new Land Purchase Agreement document in Google Docs for <strong>{sellerName}</strong> ({county}, {state})?
              </p>

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
                  onClick={handleConfirmedCreate}
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isGenerating ? 'Creating...' : 'Confirm & Create Doc'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
