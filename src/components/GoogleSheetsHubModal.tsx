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
import { getStoredLeads as getAuditStoredLeads, StoredLeadRecord } from '../services/leadSubmission';

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

  // Destructive Action Modal (Required by Workspace Integration Skill)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Stored Leads
  const [storedLeads, setStoredLeads] = useState<(Lead | StoredLeadRecord)[]>([]);

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
      
      // Combine unique leads
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

  // Load spreadsheet details whenever selectedSpreadsheetId changes
  useEffect(() => {
    if (accessToken && selectedSpreadsheetId) {
      fetchDetails(accessToken, selectedSpreadsheetId);
    } else {
      setSpreadsheetDetails(null);
      setSheetTableData(null);
    }
  }, [accessToken, selectedSpreadsheetId]);

  // Load tab table values whenever selectedTabTitle changes
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
        // Auto select first or master ledger if found
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
      // Read top 40 rows
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
        message: `Master Land Ledger created: "${newSheet.title}". Both Seller and Buyer tabs formatted.`,
      });
      // Refresh list and select new sheet
      await fetchSpreadsheets(accessToken);
      setSelectedSpreadsheetId(newSheet.spreadsheetId);
    } catch (err: any) {
      console.error('Creation error:', err);
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
      const leadsToSync = storedLeads;
      if (leadsToSync.length === 0) {
        setStatusNotice({ type: 'error', message: 'No stored leads found in local cache to sync.' });
        return;
      }

      const res = await syncLeadsToSpreadsheet(accessToken, selectedSpreadsheetId, leadsToSync);
      setStatusNotice({
        type: 'success',
        message: `Successfully synchronized ${res.syncedCount} lead(s) with full A2P 10DLC timestamps to Google Sheets!`,
      });

      // Refresh table view
      if (selectedTabTitle) {
        fetchTableValues(accessToken, selectedSpreadsheetId, selectedTabTitle);
      }
    } catch (err: any) {
      console.error('Sync error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Failed to sync leads to sheet' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncActiveLead = async () => {
    if (!accessToken || !selectedSpreadsheetId || !activeLead) return;
    setIsSyncing(true);
    setStatusNotice(null);
    try {
      await appendLeadToSpreadsheet(accessToken, selectedSpreadsheetId, activeLead);
      setStatusNotice({
        type: 'success',
        message: `Active lead "${activeLead.id}" successfully appended to Google Sheets!`,
      });
      if (selectedTabTitle) {
        fetchTableValues(accessToken, selectedSpreadsheetId, selectedTabTitle);
      }
    } catch (err: any) {
      console.error('Single lead sync error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Failed to append lead' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Mandatory confirmation before clearing data per Google Workspace Guidelines
  const handleConfirmClearTab = async () => {
    if (!accessToken || !selectedSpreadsheetId || !selectedTabTitle) return;
    setIsClearing(true);
    try {
      // Clear data starting from row 2 downward (preserving header row)
      const rangeToClear = `${selectedTabTitle}!A2:Z500`;
      await clearSheetRange(accessToken, selectedSpreadsheetId, rangeToClear);
      setIsClearConfirmOpen(false);
      setStatusNotice({
        type: 'success',
        message: `Cleared entries in "${selectedTabTitle}" while preserving the institutional header row.`,
      });
      fetchTableValues(accessToken, selectedSpreadsheetId, selectedTabTitle);
    } catch (err: any) {
      console.error('Clear error:', err);
      setStatusNotice({ type: 'error', message: err.message || 'Failed to clear sheet range' });
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
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#00171C] border border-[#0A4251] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-[#001217] border-b border-[#0A4251]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Google Sheets Lead Pipeline Hub
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional land acquisition ledgers, direct pipeline sync, and carrier-grade audit trails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/60 border border-slate-700/60 rounded-lg text-xs">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-slate-300 font-medium truncate max-w-[140px]">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleSignOut}
                  title="Sign out from Google"
                  className="text-slate-400 hover:text-rose-400 transition-colors ml-1 p-0.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close Sheets Hub modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notice Banner */}
        {statusNotice && (
          <div
            className={`px-5 py-2.5 flex items-center justify-between text-xs font-medium border-b ${
              statusNotice.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              )}
              <span>{statusNotice.message}</span>
            </div>
            <button
              onClick={() => setStatusNotice(null)}
              className="text-slate-400 hover:text-white cursor-pointer ml-3"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* If NOT Authenticated: Show Official Sign in Prompt */}
          {!currentUser || !accessToken ? (
            <div className="p-8 text-center bg-[#001f26]/60 border border-[#0A4251] rounded-2xl max-w-xl mx-auto space-y-4 my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Connect Google Account to Enable Sheets Sync
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Connect your Google account with permission to automatically push land acquisitions, cash offer submissions, and A2P 10DLC carrier consent records into your Google Sheets ledger.
              </p>

              {authError && (
                <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-lg text-left">
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

              <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>OAuth tokens cached in-memory only. No server credential storage.</span>
              </div>
            </div>
          ) : (
            /* Authenticated Workspace View */
            <div className="space-y-6">

              {/* Action Toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Create Ledger */}
                <div className="p-4 bg-[#00242d]/60 border border-[#0A4251] rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                      Quick Setup
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Create Master Land Ledger
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
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
                <div className="p-4 bg-[#00242d]/60 border border-[#0A4251] rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      Pipeline Sync
                    </span>
                    <h4 className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Sync All Stored Leads</span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-mono">
                        {storedLeads.length} Available
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
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

                {/* 3. Active Inquiry Sync (If present) */}
                <div className="p-4 bg-[#00242d]/60 border border-[#0A4251] rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
                      Targeted Push
                    </span>
                    <h4 className="text-sm font-bold text-white truncate">
                      {activeLead ? `Lead: ${activeLead.id}` : 'Select / Open Lead'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeLead
                        ? `Push this specific active inquiry (${(activeLead as any).fullName || (activeLead as any).sellerName || 'Lead'}) directly into Google Sheets.`
                        : 'Submit a form or select a lead to export single records instantly.'}
                    </p>
                  </div>
                  {activeLead ? (
                    <button
                      onClick={handleSyncActiveLead}
                      disabled={isSyncing || !selectedSpreadsheetId}
                      className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Append Active Lead Only</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic py-2 text-center border border-dashed border-slate-700/60 rounded-lg">
                      No active lead selected
                    </div>
                  )}
                </div>
              </div>

              {/* Spreadsheet Selector & Viewer */}
              <div className="bg-[#00171C] border border-[#0A4251] rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 bg-[#001217] border-b border-[#0A4251] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Select Spreadsheet Dropdown */}
                  <div className="flex items-center gap-3 flex-1">
                    <Database className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 max-w-sm">
                      <select
                        value={selectedSpreadsheetId}
                        onChange={(e) => setSelectedSpreadsheetId(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#00242d] border border-[#0A4251] rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                      >
                        {spreadsheets.length === 0 ? (
                          <option value="">No Google Sheets found</option>
                        ) : (
                          spreadsheets.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <button
                      onClick={() => accessToken && fetchSpreadsheets(accessToken)}
                      disabled={isLoadingList}
                      title="Refresh Sheets list"
                      className="p-1.5 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {/* Tabs & Open in Google Sheets */}
                  {spreadsheetDetails && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 bg-[#00242d] p-1 rounded-lg border border-[#0A4251]">
                        {spreadsheetDetails.sheets.map((tab) => (
                          <button
                            key={tab.sheetId}
                            onClick={() => setSelectedTabTitle(tab.title)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                              selectedTabTitle === tab.title
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {tab.title}
                          </button>
                        ))}
                      </div>

                      <a
                        href={spreadsheetDetails.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/60 rounded-lg transition-colors"
                      >
                        <span>Open in Sheets</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => setIsClearConfirmOpen(true)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded border border-transparent hover:border-rose-900 transition-colors cursor-pointer"
                        title="Clear tab entries (preserves header row)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Table Data Preview */}
                <div className="p-4">
                  {isLoadingTable ? (
                    <div className="py-16 text-center space-y-3">
                      <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                      <p className="text-xs text-slate-400">Loading spreadsheet data...</p>
                    </div>
                  ) : !sheetTableData || sheetTableData.values.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                      <Table className="w-8 h-8 text-slate-600 mx-auto" />
                      <p>This sheet tab is currently empty or has no recorded rows.</p>
                      <p className="text-slate-500">
                        Click "Sync All Stored Leads" above or submit a new land inquiry to populate this ledger.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[380px] border border-slate-800 rounded-lg">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          {sheetTableData.values.slice(0, 1).map((row, rIdx) => (
                            <tr key={`header-${rIdx}`} className="bg-[#00242d] border-b border-[#0A4251] sticky top-0 z-10">
                              {row.map((cell, cIdx) => (
                                <th
                                  key={`head-cell-${cIdx}`}
                                  className="px-3 py-2 text-[11px] font-bold text-amber-400 uppercase tracking-wider whitespace-nowrap border-r border-[#0A4251]/60 last:border-r-0"
                                >
                                  {cell}
                                </th>
                              ))}
                            </tr>
                          ))}
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {sheetTableData.values.slice(1).map((row, rIdx) => (
                            <tr key={`row-${rIdx}`} className="hover:bg-slate-900/60 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={`cell-${rIdx}-${cIdx}`}
                                  className="px-3 py-2 text-slate-300 font-mono text-[11px] whitespace-nowrap border-r border-slate-800/60 last:border-r-0 max-w-[240px] truncate"
                                  title={cell}
                                >
                                  {cell.startsWith('YES') ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                                      <CheckCircle2 className="w-3 h-3" />
                                      {cell}
                                    </span>
                                  ) : cell === 'NO' ? (
                                    <span className="text-slate-500 font-normal">NO</span>
                                  ) : (
                                    cell
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {sheetTableData && sheetTableData.values.length > 1 && (
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span>
                        Displaying {sheetTableData.values.length - 1} data row(s) in{' '}
                        <strong className="text-slate-300">"{selectedTabTitle}"</strong>
                      </span>
                      <span className="font-mono text-emerald-400">● Live Google Sheets Feed</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 bg-[#001217] border-t border-[#0A4251]/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>A2P 10DLC &amp; CTIA Regulatory Consent Audit Schema Enforced</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>

      {/* Mandatory User Confirmation Dialog for Destructive Clearing */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#00171C] border border-rose-500/60 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-base font-bold text-white">Clear Sheet Range?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to clear all lead entries from{' '}
              <strong className="text-amber-300">"{selectedTabTitle}"</strong> in spreadsheet{' '}
              <strong className="text-white">"{spreadsheetDetails?.title}"</strong>?
            </p>
            <p className="text-[11px] text-slate-400">
              This action cannot be undone. The header row will be retained.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                disabled={isClearing}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
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
