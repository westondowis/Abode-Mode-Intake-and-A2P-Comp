import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  FileEdit,
  Inbox,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  User,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Reply,
  Copy,
  Check,
  Tag,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
} from '../services/firebaseAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  listGmailMessages,
  getGmailMessage,
  sendGmailMessage,
  createGmailDraft,
  modifyMessageLabels,
  getGmailProfile,
  GmailMessageSummary,
  GmailUserProfile,
  ACQUISITION_EMAIL_TEMPLATES,
  EmailTemplate,
  SendEmailParams,
} from '../services/gmailService';
import { Lead } from '../types';

interface GmailHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: Lead | null;
  prefillRecipient?: string;
  prefillSubject?: string;
}

export const GmailHubModal: React.FC<GmailHubModalProps> = ({
  isOpen,
  onClose,
  initialLead = null,
  prefillRecipient = '',
  prefillSubject = '',
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'templates'>('inbox');

  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<GmailUserProfile | null>(null);

  // Messages State
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageSummary | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inboxFilter, setInboxFilter] = useState<'all' | 'unread' | 'sent'>('all');

  // Compose State
  const [composeTo, setComposeTo] = useState(prefillRecipient);
  const [composeSubject, setComposeSubject] = useState(prefillSubject);
  const [composeBody, setComposeBody] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [inReplyToMessageId, setInReplyToMessageId] = useState<string | undefined>(undefined);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Status & Confirmation State
  const [isSending, setIsSending] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  // Listen for auth state
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        if (token) {
          loadProfile(token);
          loadMessages(token);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setUserProfile(null);
        setMessages([]);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  // Handle prefill updates when opened
  useEffect(() => {
    if (prefillRecipient) setComposeTo(prefillRecipient);
    if (prefillSubject) setComposeSubject(prefillSubject);
    if (initialLead) {
      if (initialLead.type === 'sell') {
        const s = initialLead as any;
        setComposeTo(s.sellerEmail || '');
        setComposeSubject(`Abode Mode Land Acquisition: APN ${s.parcelNumber || ''} (${s.county || ''}, ${s.state || ''})`);
      } else {
        const b = initialLead as any;
        setComposeTo(b.buyerEmail || '');
        setComposeSubject(`Abode Mode Land Inventory Match: ${b.buyerName || ''}`);
      }
    }
  }, [prefillRecipient, prefillSubject, initialLead]);

  const loadProfile = async (token: string) => {
    try {
      const profile = await getGmailProfile(token);
      setUserProfile(profile);
    } catch (err: unknown) {
      console.warn('Could not load Gmail profile:', err);
    }
  };

  const loadMessages = async (token: string, query?: string) => {
    setIsLoadingMessages(true);
    setStatusNotice(null);
    try {
      let q = query || '';
      if (inboxFilter === 'unread') {
        q = q ? `${q} is:unread` : 'is:unread';
      } else if (inboxFilter === 'sent') {
        q = q ? `${q} in:sent` : 'in:sent';
      }

      const res = await listGmailMessages(token, {
        maxResults: 20,
        q: q || undefined,
      });
      setMessages(res.messages);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch messages';
      setStatusNotice({ type: 'error', message: errMsg });
    } finally {
      setIsLoadingMessages(false);
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
        await loadProfile(res.accessToken);
        await loadMessages(res.accessToken);
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
    setUserProfile(null);
    setMessages([]);
    setSelectedMessage(null);
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplateId(template.id);
    let populatedSubject = template.subject;
    let populatedBody = template.body;

    if (initialLead && initialLead.type === 'sell') {
      const s = initialLead as any;
      populatedSubject = populatedSubject
        .replace('[County]', s.county || 'Your')
        .replace('[State]', s.state || '')
        .replace('[APN]', s.parcelNumber || 'TBD');
      
      populatedBody = populatedBody
        .replace(/\[Seller Name\]/g, s.sellerName || 'Property Owner')
        .replace(/\[County\]/g, s.county || 'County')
        .replace(/\[State\]/g, s.state || 'State')
        .replace(/\[APN \/ Address\]/g, s.address || s.parcelNumber || 'Parcel')
        .replace(/\[APN\]/g, s.parcelNumber || 'Pending')
        .replace(/\[Acreage\]/g, String(s.acreage || 'Specified'))
        .replace(/\[Offer Amount\]/g, s.askingPriceExpectation ? `${s.askingPriceExpectation}` : 'TBD')
        .replace(/\[EMD Amount\]/g, '1,000');
    }

    setComposeSubject(populatedSubject);
    setComposeBody(populatedBody);
    setActiveTab('compose');
  };

  const handleCopyTemplate = (template: EmailTemplate) => {
    navigator.clipboard.writeText(`${template.subject}\n\n${template.body}`);
    setCopiedTemplateId(template.id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const handleOpenReply = (msg: GmailMessageSummary) => {
    setSelectedMessage(null);
    setActiveTab('compose');

    // Extract raw email from format "Name <email@domain.com>"
    let replyTo = msg.from;
    const match = msg.from.match(/<([^>]+)>/);
    if (match) replyTo = match[1];

    setComposeTo(replyTo);
    setComposeSubject(
      msg.subject.toLowerCase().startsWith('re:') ? msg.subject : `Re: ${msg.subject}`
    );
    setInReplyToMessageId(msg.id);
    setComposeBody(
      `\n\n---------------- Original Message ----------------\nFrom: ${msg.from}\nDate: ${msg.date}\nSubject: ${msg.subject}\n\n${msg.bodyText || msg.snippet}`
    );
  };

  const handleSaveDraft = async () => {
    if (!accessToken) return;
    if (!composeTo.trim() || !composeSubject.trim()) {
      setStatusNotice({ type: 'error', message: 'Recipient and Subject are required to save draft.' });
      return;
    }

    setIsDrafting(true);
    setStatusNotice(null);
    try {
      const params: SendEmailParams = {
        to: composeTo,
        subject: composeSubject,
        body: composeBody,
        cc: composeCc || undefined,
        inReplyTo: inReplyToMessageId,
      };

      await createGmailDraft(accessToken, params, userProfile?.emailAddress);
      setStatusNotice({ type: 'success', message: 'Email draft successfully saved to your Gmail mailbox!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save draft';
      setStatusNotice({ type: 'error', message: msg });
    } finally {
      setIsDrafting(false);
    }
  };

  // STEP 1 of Sending: User clicks "Dispatch via Gmail", triggers confirmation modal
  const handleInitiateSend = () => {
    if (!composeTo.trim()) {
      setStatusNotice({ type: 'error', message: 'Please specify at least one recipient email address.' });
      return;
    }
    if (!composeSubject.trim()) {
      setStatusNotice({ type: 'error', message: 'Please provide an email subject.' });
      return;
    }
    if (!composeBody.trim()) {
      setStatusNotice({ type: 'error', message: 'Email body cannot be empty.' });
      return;
    }

    // MANDATORY USER CONFIRMATION REQUIRED
    setShowSendConfirmation(true);
  };

  // STEP 2 of Sending: User explicitly clicks "Confirm & Send" in the confirmation modal
  const handleConfirmedSend = async () => {
    if (!accessToken) return;
    setShowSendConfirmation(false);
    setIsSending(true);
    setStatusNotice(null);

    try {
      const params: SendEmailParams = {
        to: composeTo,
        subject: composeSubject,
        body: composeBody,
        cc: composeCc || undefined,
        inReplyTo: inReplyToMessageId,
      };

      // Passed with userConfirmed = true
      await sendGmailMessage(accessToken, params, true, userProfile?.emailAddress);
      
      setStatusNotice({
        type: 'success',
        message: `Email successfully sent to ${composeTo} via Gmail!`,
      });

      // Clear compose fields
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setComposeCc('');
      setInReplyToMessageId(undefined);

      // Refresh inbox
      loadMessages(accessToken);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to dispatch email';
      setStatusNotice({ type: 'error', message: msg });
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleReadStatus = async (msg: GmailMessageSummary) => {
    if (!accessToken) return;
    try {
      if (msg.isUnread) {
        await modifyMessageLabels(accessToken, msg.id, [], ['UNREAD']);
        msg.isUnread = false;
        msg.labelIds = msg.labelIds.filter((l) => l !== 'UNREAD');
      } else {
        await modifyMessageLabels(accessToken, msg.id, ['UNREAD'], []);
        msg.isUnread = true;
        msg.labelIds.push('UNREAD');
      }
      setMessages([...messages]);
    } catch (err) {
      console.warn('Failed to modify label:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white dark:bg-[#06141a] border border-slate-200 dark:border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* MODAL HEADER */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-cyan-950/80 bg-slate-50/80 dark:bg-[#030d12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center shadow-inner">
              <Mail className="w-5 h-5 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold cinzel-text text-slate-900 dark:text-white">
                  Gmail Acquisitions &amp; Seller Inbox
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                  Workspace API
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Google Workspace Integration • Underwriting, Cash Offers &amp; Inquiry Tracking
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser && userProfile && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">
                  {userProfile.emailAddress}
                </span>
                <button
                  onClick={handleLogout}
                  title="Disconnect Google Account"
                  className="ml-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Gmail Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BODY CONTENT */}
        {!currentUser || !accessToken ? (
          /* AUTHENTICATION PROMPT */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-slate-50 dark:from-[#06141a] dark:to-[#020b0e]">
            <div className="max-w-md w-full space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500/20 via-amber-500/10 to-transparent border border-red-500/30 flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-red-500" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white cinzel-text">
                  Connect Your Gmail Account
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Authenticate securely with Google Workspace to view seller replies, draft official underwriting letters, and send formal cash offers directly from your acquisitions email.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs text-red-700 dark:text-red-300 text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="pt-2">
                <GoogleSignInButton
                  onClick={handleSignIn}
                  isLoading={isAuthenticating}
                  text="Sign in with Google Workspace"
                  className="w-full justify-center"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 text-left space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Security &amp; Privacy Safeguards:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  • <strong>In-Memory Tokens:</strong> OAuth credentials are never saved to localStorage or disk.
                </p>
                <p className="text-[11px] leading-relaxed">
                  • <strong>User Confirmation Guard:</strong> Every outgoing email requires explicit user confirmation before transmission.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED WORKSPACE */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* SUBHEADER TABS */}
            <div className="px-5 py-2.5 bg-slate-100/90 dark:bg-[#040e13] border-b border-slate-200 dark:border-cyan-950/60 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inbox');
                    setSelectedMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'inbox'
                      ? 'bg-white dark:bg-cyan-950/80 text-slate-900 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400" />
                  <span>Inbox ({messages.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'compose'
                      ? 'bg-white dark:bg-cyan-950/80 text-slate-900 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileEdit className="w-3.5 h-3.5 text-amber-500" />
                  <span>Compose Outreach</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('templates')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'templates'
                      ? 'bg-white dark:bg-cyan-950/80 text-slate-900 dark:text-cyan-300 shadow-xs border border-slate-200 dark:border-cyan-800'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Acquisition Templates</span>
                </button>
              </div>

              {activeTab === 'inbox' && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1 py-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setInboxFilter('all');
                        if (accessToken) loadMessages(accessToken, searchQuery);
                      }}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        inboxFilter === 'all'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInboxFilter('unread');
                        if (accessToken) loadMessages(accessToken, searchQuery);
                      }}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        inboxFilter === 'unread'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Unread
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInboxFilter('sent');
                        if (accessToken) loadMessages(accessToken, searchQuery);
                      }}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        inboxFilter === 'sent'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Sent
                    </button>
                  </div>

                  <button
                    onClick={() => accessToken && loadMessages(accessToken, searchQuery)}
                    disabled={isLoadingMessages}
                    className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Refresh Messages"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              )}
            </div>

            {/* STATUS NOTICES */}
            {statusNotice && (
              <div
                className={`px-4 py-2 text-xs flex items-center justify-between border-b ${
                  statusNotice.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900 text-red-800 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {statusNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  )}
                  <span>{statusNotice.message}</span>
                </div>
                <button
                  onClick={() => setStatusNotice(null)}
                  className="text-xs font-bold hover:opacity-75 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* MAIN TAB CONTENT */}
            <div className="flex-1 overflow-hidden flex">
              
              {/* TAB 1: INBOX */}
              {activeTab === 'inbox' && (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  
                  {/* Message List Pane */}
                  <div
                    className={`w-full md:w-5/12 border-r border-slate-200 dark:border-cyan-950/60 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-[#030d12] ${
                      selectedMessage ? 'hidden md:flex' : 'flex'
                    }`}
                  >
                    {/* Search Bar */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && accessToken) {
                              loadMessages(accessToken, searchQuery);
                            }
                          }}
                          placeholder="Search sender, APN, or keywords..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white placeholder-slate-400"
                        />
                      </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {isLoadingMessages ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                          <div className="w-6 h-6 mx-auto mb-2 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                          <span>Loading messages from Gmail...</span>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                          <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300">No emails found</p>
                          <p className="text-[11px] mt-1 text-slate-400">
                            Try adjusting your search query or refreshing the inbox.
                          </p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            onClick={() => setSelectedMessage(msg)}
                            className={`p-3.5 text-left cursor-pointer transition-colors relative hover:bg-slate-100/70 dark:hover:bg-cyan-950/40 ${
                              selectedMessage?.id === msg.id
                                ? 'bg-amber-50/70 dark:bg-cyan-950/70 border-l-4 border-amber-500'
                                : ''
                            } ${msg.isUnread ? 'font-bold' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2 text-xs mb-1">
                              <span
                                className={`truncate font-semibold ${
                                  msg.isUnread
                                    ? 'text-slate-950 dark:text-white'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {msg.from.replace(/<[^>]+>/, '').trim() || msg.from}
                              </span>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                                {new Date(msg.date).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>

                            <div className="text-xs text-slate-900 dark:text-slate-200 truncate mb-1">
                              {msg.subject || '(No Subject)'}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                              {msg.snippet}
                            </p>

                            {msg.isUnread && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                NEW
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Message Detail Pane */}
                  <div
                    className={`w-full md:w-7/12 flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#06141a] ${
                      !selectedMessage ? 'hidden md:flex' : 'flex'
                    }`}
                  >
                    {selectedMessage ? (
                      <div className="flex-1 flex flex-col overflow-hidden">
                        
                        {/* Detail Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#040e13]">
                          <div className="flex items-center justify-between mb-3">
                            <button
                              type="button"
                              onClick={() => setSelectedMessage(null)}
                              className="md:hidden text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                            >
                              ← Back to Inbox
                            </button>

                            <div className="flex items-center gap-2 ml-auto">
                              <button
                                type="button"
                                onClick={() => handleToggleReadStatus(selectedMessage)}
                                className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                              >
                                {selectedMessage.isUnread ? 'Mark as Read' : 'Mark as Unread'}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenReply(selectedMessage)}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <Reply className="w-3.5 h-3.5" />
                                <span>Reply</span>
                              </button>
                            </div>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {selectedMessage.subject}
                          </h3>

                          <div className="mt-2 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                            <div>
                              <span className="font-semibold text-slate-500 dark:text-slate-400">From: </span>
                              <span className="font-mono">{selectedMessage.from}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-500 dark:text-slate-400">To: </span>
                              <span className="font-mono">{selectedMessage.to}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-500 dark:text-slate-400">Date: </span>
                              <span>{selectedMessage.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Email Body */}
                        <div className="flex-1 overflow-y-auto p-5 leading-relaxed text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                          {selectedMessage.bodyText || selectedMessage.snippet}
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                        <Mail className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Select an email to view conversation
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mt-1">
                          Browse leads, seller questions, and underwriting communications received in your connected Gmail account.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 2: COMPOSE OUTREACH */}
              {activeTab === 'compose' && (
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/30 dark:bg-[#040e13]">
                  <div className="max-w-3xl mx-auto space-y-4">
                    
                    {/* Header bar with quick template loader */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileEdit className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Quick Load Real Estate Template:
                        </span>
                      </div>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => {
                          const t = ACQUISITION_EMAIL_TEMPLATES.find((tpl) => tpl.id === e.target.value);
                          if (t) handleSelectTemplate(t);
                        }}
                        className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                      >
                        <option value="">-- Choose Template --</option>
                        {ACQUISITION_EMAIL_TEMPLATES.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            [{tpl.category}] {tpl.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Compose Form */}
                    <div className="bg-white dark:bg-[#06141a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3.5">
                      
                      {/* Recipient */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          To (Seller or Client Email) *
                        </label>
                        <input
                          type="email"
                          value={composeTo}
                          onChange={(e) => setComposeTo(e.target.value)}
                          placeholder="seller@example.com"
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* CC */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Cc (Optional Acquisition Coordinator)
                        </label>
                        <input
                          type="text"
                          value={composeCc}
                          onChange={(e) => setComposeCc(e.target.value)}
                          placeholder="wdowis@abode-mode.com"
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Subject *
                        </label>
                        <input
                          type="text"
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          placeholder="Abode Mode Land Acquisition: Cash Offer for APN..."
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Body */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Message Body *
                        </label>
                        <textarea
                          rows={12}
                          value={composeBody}
                          onChange={(e) => setComposeBody(e.target.value)}
                          placeholder="Write your email to the seller or paste an acquisition proposal here..."
                          className="w-full p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 gap-3">
                        <button
                          type="button"
                          onClick={handleSaveDraft}
                          disabled={isDrafting || isSending}
                          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isDrafting ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                              <span>Saving Draft...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span>Save as Gmail Draft</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleInitiateSend}
                          disabled={isSending || isDrafting}
                          className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2 cursor-pointer font-serif"
                        >
                          <Send className="w-4 h-4" />
                          <span>Dispatch via Gmail</span>
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: ACQUISITION TEMPLATES */}
              {activeTab === 'templates' && (
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50 dark:bg-[#030d12]">
                  <div className="max-w-4xl mx-auto space-y-4">
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Underwriting &amp; Acquisition Templates
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pre-approved real estate communications tailored for parcel evaluations, title coordination, and cash offers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ACQUISITION_EMAIL_TEMPLATES.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="bg-white dark:bg-[#06141a] border border-slate-200 dark:border-cyan-900/60 rounded-xl p-4 flex flex-col justify-between shadow-xs hover:border-amber-400 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                                {tpl.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyTemplate(tpl)}
                                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                title="Copy to clipboard"
                              >
                                {copiedTemplateId === tpl.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-[11px] text-emerald-600">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span className="text-[11px]">Copy</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                              {tpl.title}
                            </h4>

                            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2 truncate">
                              Subject: {tpl.subject}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed font-sans bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                              {tpl.body}
                            </p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSelectTemplate(tpl)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <span>Use Template</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE/MUTATING EMAIL DISPATCH */}
        {/* ========================================================================= */}
        {showSendConfirmation && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white dark:bg-[#071922] border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl text-slate-800 dark:text-slate-100">
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirm Email Transmission
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mandatory Google Workspace Security Verification
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs mb-5">
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">From: </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {userProfile?.emailAddress || currentUser?.email || 'Connected Account'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">To: </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{composeTo}</span>
                </div>
                {composeCc && (
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Cc: </span>
                    <span className="font-mono text-slate-600 dark:text-slate-300">{composeCc}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Subject: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{composeSubject}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Message Preview:
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 italic">
                    "{composeBody}"
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Are you sure you want to send this email on your behalf? This action will permanently deliver an outgoing message through the Gmail API to the recipient.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSendConfirmation(false)}
                  disabled={isSending}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSend}
                  disabled={isSending}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Send Now</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
