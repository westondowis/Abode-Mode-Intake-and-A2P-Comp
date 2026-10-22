import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Table,
  Search,
  Database,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Sparkles,
  Copy,
  Check,
  Mail,
  Send,
  HelpCircle,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  listGoogleSpreadsheets,
  getSpreadsheetDetails,
  readSheetValues,
  createMasterLandSpreadsheet,
  appendLeadToSpreadsheet,
  syncLeadsToSpreadsheet,
  clearSheetRange,
  GoogleSpreadsheetSummary,
  SpreadsheetDetails,
  SheetValuesResult,
} from '../services/googleSheetsService';
import {
  initAuth,
  googleSignIn,
  logout,
} from '../services/firebaseAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Lead } from '../types';
import { getStoredLeads as getCoreStoredLeads } from '../services/leadsStorage';
import {
  getStoredLeads as getAuditStoredLeads,
  StoredLeadRecord,
  SHEETS_WEBHOOK_KEY,
  getActiveWebhookUrl,
  submitLead,
} from '../services/leadSubmission';
import { GOOGLE_APPS_SCRIPT_CODE } from '../data/appsScriptTemplate';
import { ACQUISITION_EMAIL } from '../utils/contactEmail';

interface GoogleSheetsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead?: Lead | StoredLeadRecord | null;
}

export const GoogleSheetsHubModal: React.FC<GoogleSheetsHubModalProps> = ({
  isOpen,
  onClose,
  activeLead = null,
}) => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<'workspace' | 'automation'>('workspace');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sheets Data State
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheetSummary[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string>('');
  const [spreadsheetDetails, setSpreadsheetDetails] = useState<SpreadsheetDetails | null>(null);
  const [selectedTabTitle, setSelectedTabTitle] = useState<string>('');
  const [sheetTableData, setSheetTableData] = useState<SheetValuesResult | null>(null);

  // Loading & Feedback
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isCreatingLedger, setIsCreatingLedger] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Destructive Action Modal
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Stored Leads
  const [storedLeads, setStoredLeads] = useState<(Lead | StoredLeadRecord)[]>([]);

  // Webhook Automation State
  const [webhookUrlInput, setWebhookUrlInput] = useState(() => {
    try {
      return localStorage.getItem(SHEETS_WEBHOOK_KEY) || import.meta.env.VITE_APPS_SCRIPT_URL || '';
    } catch {
      return '';
    }
  });
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) {
          setAccessToken(token);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setSpreadsheets([]);
        setSpreadsheetDetails(null);
        setSheetTableData(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch stored leads for syncing
  useEffect(() => {
    if (isOpen) {
      const coreLeads = getCoreStoredLeads();
      const auditLeads = getAuditStoredLeads();
      
      const map = new Map<string, Lead | StoredLeadRecord>();
      auditLeads.forEach((l) => map.set(l.id, l));
      coreLeads.forEach((l) => {
        if (!map.has(l.id)) map.set(l.id, l);
      });

      const combined = Array.from(map.values());
      setStoredLeads(combined);
    }
  }, [isOpen]);

  // Load spreadsheets when modal opens and token is active
  useEffect(() => {
    if (isOpen && accessToken) {
      fetchSpreadsheets(accessToken);
    }
  }, [isOpen, accessToken]);

  useEffect(() => {
    if (accessToken && selectedSpreadsheetId) {
      fetchDetails(accessToken, selectedSpreadsheetId);
    } else {
      setSpreadsheetDetails(null);
      setSheetTableData(null);
    }
  }, [accessToken, selectedSpreadsheetId]);

  useEffect(() => {
    if (accessToken && selectedSpreadsheetId && selectedTabTitle) {
      fetchTableValues(accessToken, selectedSpreadsheetId, selectedTabTitle);
    }
  }, [accessToken, selectedSpreadsheetId, selectedTabTitle]);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        setCurrentUser(res.user);
        fetchSpreadsheets(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google. Please retry.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setSpreadsheets([]);
      setSpreadsheetDetails(null);
      setSheetTableData(null);
      setSelectedSpreadsheetId('');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  const fetchSpreadsheets = async (token: string) => {
    setIsLoadingList(true);
    setStatusNotice(null);
    try {
      const list = await listGoogleSpreadsheets(token);
      setSpreadsheets(list);
      if (list.length > 0 && !selectedSpreadsheetId) {
        const master = list.find((s) => s.name.toLowerCase().includes('abode mode'));
        setSelectedSpreadsheetId(master ? master.id : list[0].id);
      }
    } catch (err: any) {
      console.error('Fetch spreadsheets error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Failed to list spreadsheets' });
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchDetails = async (token: string, sheetId: string) => {
    setIsLoadingDetails(true);
    try {
      const details = await getSpreadsheetDetails(token, sheetId);
      setSpreadsheetDetails(details);
      if (details.sheets.length > 0) {
        setSelectedTabTitle(details.sheets[0].title);
      }
    } catch (err: any) {
      console.error('Fetch details error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Could not inspect spreadsheet' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchTableValues = async (token: string, sheetId: string, tabName: string) => {
    setIsLoadingTable(true);
    try {
      const range = `${tabName}!A1:Z40`;
      const values = await readSheetValues(token, sheetId, range);
      setSheetTableData(values);
    } catch (err: any) {
      console.error('Fetch values error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Could not read sheet data' });
    } finally {
      setIsLoadingTable(false);
    }
  };

  const handleCreateNewMasterLedger = async () => {
    if (!accessToken) return;
    setIsCreatingLedger(true);
    setStatusNotice(null);
    try {
      const newSheet = await createMasterLandSpreadsheet(accessToken);
      setStatusNotice({
        type: 'success',
        message: `Master Ledger "${newSheet.title}" created successfully!`,
      });
      await fetchSpreadsheets(accessToken);
      setSelectedSpreadsheetId(newSheet.spreadsheetId);
    } catch (err: any) {
      console.error('Create ledger error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Failed to create spreadsheet' });
    } finally {
      setIsCreatingLedger(false);
    }
  };

  const handleSyncAllLeads = async () => {
    if (!accessToken || !selectedSpreadsheetId) return;
    setIsSyncing(true);
    setStatusNotice(null);
    try {
      const result = await syncLeadsToSpreadsheet(accessToken, selectedSpreadsheetId, storedLeads);
      setStatusNotice({
        type: 'success',
        message: `Successfully synchronized ${result.syncedCount} leads to Google Sheets.`,
      });
      if (selectedTabTitle) {
        fetchTableValues(accessToken, selectedSpreadsheetId, selectedTabTitle);
      }
    } catch (err: any) {
      console.error('Sync leads error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Failed to synchronize leads' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveWebhookUrl = () => {
    try {
      const cleaned = webhookUrlInput.trim();
      if (cleaned) {
        localStorage.setItem(SHEETS_WEBHOOK_KEY, cleaned);
        setStatusNotice({
          type: 'success',
          message: 'Google Apps Script Webhook URL saved! Submissions will now write directly to your sheet.',
        });
      } else {
        localStorage.removeItem(SHEETS_WEBHOOK_KEY);
        setStatusNotice({
          type: 'success',
          message: 'Custom Webhook URL cleared.',
        });
      }
    } catch (err) {
      console.error('Error saving webhook URL:', err);
    }
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
    setStatusNotice({
      type: 'success',
      message: 'Google Apps Script (Code.gs) copied to clipboard! Paste it into Extensions > Apps Script in your Google Sheet.',
    });
  };

  const handleTestWebhookDispatch = async () => {
    setIsTestingWebhook(true);
    setStatusNotice(null);
    try {
      const testResult = await submitLead({
        flow: 'sell',
        fullName: 'William Dowis (Test Lead)',
        phone: '(720) 649-0734',
        email: ACQUISITION_EMAIL,
        propertyAddress: '100 Ranch Road, Park County, CO',
        county: 'Park',
        state: 'CO',
        acreage: '10.5',
        askingPrice: '$45,000 Cash',
        motivation: 'Testing automated Google Sheets, Gmail alert, and Google Task creation',
        timeline: 'Immediate (< 14 days)',
        smsTransactionalConsent: true,
        smsMarketingConsent: false,
      });

      setStatusNotice({
        type: 'success',
        message: `Test lead submitted! ID: ${testResult.leadId}. Persisted to: ${testResult.persistedTo?.join(', ') || 'datastore'}.`,
      });
    } catch (err: any) {
      setStatusNotice({
        type: 'error',
        message: `Test dispatch error: ${err.message || 'Could not complete test'}`,
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleConfirmClearTab = async () => {
    if (!accessToken || !selectedSpreadsheetId || !selectedTabTitle) return;
    setIsClearing(true);
    try {
      const range = `${selectedTabTitle}!A2:Z500`;
      await clearSheetRange(accessToken, selectedSpreadsheetId, range);
      setIsClearConfirmOpen(false);
      setStatusNotice({
        type: 'success',
        message: `Cleared lead rows from tab "${selectedTabTitle}". Headers preserved.`,
      });
      fetchTableValues(accessToken, selectedSpreadsheetId, selectedTabTitle);
    } catch (err: any) {
      console.error('Clear tab error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Failed to clear sheet rows' });
    } finally {
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  const filteredSpreadsheets = spreadsheets.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-[#00171C] border border-slate-200 dark:border-[#0A4251] rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-[#001217] border-b border-slate-200 dark:border-[#0A4251]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-950 dark:text-white tracking-wide">
                  Google Sheets Lead Pipeline Hub
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 rounded-full">
                  Zero-Cost Google Integration
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Persistent database storage, direct Google Sheets sync, Gmail notifications, and Google Tasks automation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign out from Google"
                  className="text-slate-400 hover:text-rose-500 transition-colors ml-1 p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close Sheets Hub modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-[#0A4251] px-6 bg-slate-100/70 dark:bg-[#00141a]">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'workspace'
                ? 'border-emerald-600 text-emerald-800 dark:text-emerald-400 font-bold bg-white dark:bg-transparent'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Interactive Sheets Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'automation'
                ? 'border-amber-600 text-amber-800 dark:text-amber-400 font-bold bg-white dark:bg-transparent'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Zero-Cost Webhook, Gmail &amp; Tasks Engine</span>
          </button>
        </div>

        {/* Status Notice Banner */}
        {statusNotice && (
          <div
            className={`px-5 py-2.5 flex items-center justify-between text-xs font-medium border-b ${
              statusNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50'
                : 'bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              )}
              <span>{statusNotice.message}</span>
            </div>
            <button
              onClick={() => setStatusNotice(null)}
              className="text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer ml-3"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: INTERACTIVE SHEETS LEDGER */}
          {activeTab === 'workspace' && (
            <>
              {!currentUser || !accessToken ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-[#001f26]/60 border border-slate-200 dark:border-[#0A4251] rounded-2xl max-w-xl mx-auto space-y-4 my-6">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/20 flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                    Connect Google Account to Inspect &amp; Sync Sheets
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                    Sign in with Google to browse your Google Drive spreadsheets, create a standardized master acquisition ledger with frozen headers, and push leads with verified A2P 10DLC timestamps.
                  </p>

                  {authError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-lg text-left">
                      {authError}
                    </div>
                  )}

                  <div className="pt-2">
                    <GoogleSignInButton
                      onClick={handleSignIn}
                      isLoading={isAuthenticating}
                      text="Connect Google Sheets"
                      className="w-full sm:w-auto"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>OAuth tokens cached in-memory only. No server credential storage.</span>
                  </div>
                </div>
              ) : (
                /* Authenticated Workspace View */
                <div className="space-y-6">
                  {/* Action Toolbar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Create Ledger */}
                    <div className="p-4 bg-slate-50 dark:bg-[#00242d]/60 border border-slate-200 dark:border-[#0A4251] rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                          Quick Setup
                        </span>
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">
                          Create Master Land Ledger
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Instantly generates a formatted 2-tab spreadsheet (Sellers &amp; Buyers) with frozen headers.
                        </p>
                      </div>
                      <button
                        onClick={handleCreateNewMasterLedger}
                        disabled={isCreatingLedger}
                        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isCreatingLedger ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Plus className="w-3.5 h-3.5" />
                        )}
                        <span>{isCreatingLedger ? 'Building Sheet...' : 'Generate New Master Ledger'}</span>
                      </button>
                    </div>

                    {/* 2. Sync Stored Leads */}
                    <div className="p-4 bg-slate-50 dark:bg-[#00242d]/60 border border-slate-200 dark:border-[#0A4251] rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                          Pipeline Sync
                        </span>
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white flex items-center justify-between">
                          <span>Sync All Stored Leads</span>
                          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded font-mono">
                            {storedLeads.length} Available
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Appends all local inquiries to the selected Google Sheet with compliant consent timestamps.
                        </p>
                      </div>
                      <button
                        onClick={handleSyncAllLeads}
                        disabled={isSyncing || !selectedSpreadsheetId || storedLeads.length === 0}
                        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSyncing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <UploadCloud className="w-3.5 h-3.5" />
                        )}
                        <span>{isSyncing ? 'Syncing...' : 'Sync All Leads to Sheet'}</span>
                      </button>
                    </div>

                    {/* 3. Switch to Zero-Cost Webhook */}
                    <div className="p-4 bg-slate-50 dark:bg-[#00242d]/60 border border-slate-200 dark:border-[#0A4251] rounded-xl flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-cyan-400 block mb-1">
                          Automated Pipeline
                        </span>
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">
                          Gmail Alert &amp; Task Setup
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          Configure Google Apps Script to auto-email alerts to wdowis@abode-mode.com and create CRM tasks.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('automation')}
                        className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-teal-800 dark:text-cyan-300 bg-teal-100 dark:bg-cyan-950/70 hover:bg-teal-200 dark:hover:bg-cyan-900 border border-teal-300 dark:border-cyan-700 rounded-lg transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Configure Webhook &amp; Tasks</span>
                      </button>
                    </div>
                  </div>

                  {/* Spreadsheet Picker & Table Viewer */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex-1 max-w-sm">
                        <select
                          value={selectedSpreadsheetId}
                          onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white dark:bg-[#061014] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        >
                          <option value="">-- Choose a Google Spreadsheet --</option>
                          {spreadsheets.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {spreadsheetDetails && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Sheet Tab:</span>
                          <select
                            value={selectedTabTitle}
                            onChange={(e) => setSelectedTabTitle(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white dark:bg-[#061014] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                          >
                            {spreadsheetDetails.sheets.map((tab) => (
                              <option key={tab.sheetId} value={tab.title}>
                                {tab.title}
                              </option>
                            ))}
                          </select>
                          <a
                            href={`https://docs.google.com/spreadsheets/d/${selectedSpreadsheetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
                            title="Open in Google Sheets"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Table Preview */}
                    {sheetTableData && sheetTableData.values && sheetTableData.values.length > 0 ? (
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-60 bg-white dark:bg-[#061014]">
                        <table className="w-full text-left text-xs font-mono">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                              {sheetTableData.values[0].map((h, i) => (
                                <th key={i} className="py-2 px-3 font-semibold whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                            {sheetTableData.values.slice(1, 15).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 dark:bg-[#061014] rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500">
                        Select a spreadsheet and tab above to preview lead records.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: ZERO-COST WEBHOOK & TASKS AUTOMATION */}
          {activeTab === 'automation' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* How Inbound Leads Are Stored Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0A4251]/20 border border-slate-200 dark:border-[#0A4251] space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-700 dark:text-cyan-400" />
                  <h3 className="font-bold text-sm text-slate-950 dark:text-white">
                    Lead Persistence &amp; Storage Architecture Audit
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Every inbound form submission for sellers and buyers is preserved through three redundant tiers:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-[#061116] border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block font-mono text-[11px]">
                      Tier 1: Audit Log
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      Appended to immutable server file <code className="text-slate-800 dark:text-slate-200">data/leads_audit.jsonl</code> and client localStorage.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#061116] border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                    <span className="font-bold text-teal-700 dark:text-teal-400 block font-mono text-[11px]">
                      Tier 2: Firestore Database
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      Stored in Cloud collection <code className="text-slate-800 dark:text-slate-200">leads</code> with ISO timestamps &amp; A2P 10DLC audit metadata.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-[#061116] border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block font-mono text-[11px]">
                      Tier 3: Google Sheets &amp; Tasks
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      100% free Google Apps Script webhook writes rows, sends Gmail to wdowis@abode-mode.com, and creates a Google Task.
                    </p>
                  </div>
                </div>
              </div>

              {/* Webhook Configuration Form */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#00242d]/60 border border-slate-200 dark:border-[#0A4251] space-y-4 shadow-sm">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Configure Your Google Apps Script Webhook URL</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Paste the Web App URL generated from your Google Sheet below to wire real-time sheet row writes, Gmail notifications, and task creation.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-[#061014] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    onClick={handleSaveWebhookUrl}
                    type="button"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow cursor-pointer whitespace-nowrap"
                  >
                    Save Webhook URL
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleCopyScriptCode}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied Code.gs!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Copy Ready-to-Run Code.gs</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleTestWebhookDispatch}
                    disabled={isTestingWebhook}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTestingWebhook ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isTestingWebhook ? 'Sending Test...' : 'Test Webhook & Email Alert'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#001f26]/60 border border-slate-200 dark:border-[#0A4251] space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-amber-400">
                  3-Minute Zero-Cost Setup Guide (Google Sheets + Gmail + Google Tasks)
                </h4>
                <ol className="list-decimal list-inside text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                  <li>
                    Open your Google Sheet, click <strong>Extensions &gt; Apps Script</strong>.
                  </li>
                  <li>
                    In the left sidebar under <strong>Services</strong>, click <strong>+</strong>, choose <strong>Tasks API</strong>, and click <strong>Add</strong>.
                  </li>
                  <li>
                    Click the button above to copy <strong>Code.gs</strong> and paste it into the editor, replacing any default content.
                  </li>
                  <li>
                    Click <strong>Deploy &gt; New deployment</strong>, select type <strong>Web app</strong>, execute as <strong>Me</strong>, set access to <strong>Anyone</strong>, and copy the Web App URL into the input field above.
                  </li>
                </ol>
                <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Incoming leads will immediately write to your Google Sheet, email <span className="font-bold text-slate-800 dark:text-slate-200">{ACQUISITION_EMAIL}</span>, and create a task in your Google Tasks queue with the link to the email!
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#001217] border-t border-slate-200 dark:border-[#0A4251]/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            Direct Lead Sync Desk · {ACQUISITION_EMAIL}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* Mandatory User Confirmation Dialog for Destructive Clearing */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#00171C] border border-rose-300 dark:border-rose-500/60 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Clear Sheet Range?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to clear all lead entries from{' '}
              <strong className="text-amber-600 dark:text-amber-300">"{selectedTabTitle}"</strong> in spreadsheet{' '}
              <strong className="text-slate-950 dark:text-white">"{spreadsheetDetails?.title}"</strong>?
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              This action cannot be undone. The header row will be retained.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                disabled={isClearing}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearTab}
                disabled={isClearing}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow cursor-pointer disabled:opacity-50"
              >
                {isClearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isClearing ? 'Clearing...' : 'Confirm Clear'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
