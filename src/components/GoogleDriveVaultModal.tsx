import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Folder,
  FolderPlus,
  Upload,
  Search,
  RefreshCw,
  ExternalLink,
  Trash2,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCheck2,
  ChevronRight,
  HardDrive,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  DriveFile,
  DriveAbout,
  DriveFilterCategory,
  listDriveFiles,
  createDriveFolder,
  uploadDriveFile,
  saveLeadDossierToDrive,
  trashDriveFile,
  fetchDriveAbout,
  formatBytes,
  getMimeDetails,
} from '../services/googleDriveService';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from '../services/firebaseAuth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Lead } from '../types';
import { getStoredLeads } from '../services/leadsStorage';

interface GoogleDriveVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead?: Lead | null;
}

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export const GoogleDriveVaultModal: React.FC<GoogleDriveVaultModalProps> = ({
  isOpen,
  onClose,
  activeLead = null,
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [driveAbout, setDriveAbout] = useState<DriveAbout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Navigation & Filtering
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: 'My Drive' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<DriveFilterCategory>('all');

  // Modals & Sub-actions
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lead dossier export state
  const [storedLeads, setStoredLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [isSavingDossier, setIsSavingDossier] = useState(false);

  // Destructive action confirmation modal (MANDATORY per Workspace guidelines)
  const [deleteConfirmationFile, setDeleteConfirmationFile] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Listen to Firebase auth state
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
        setFiles([]);
        setDriveAbout(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync stored leads from local storage for quick dossier archiving
  useEffect(() => {
    if (isOpen) {
      const leads = getStoredLeads();
      setStoredLeads(leads);
      if (activeLead) {
        setSelectedLeadId(activeLead.id);
      } else if (leads.length > 0) {
        setSelectedLeadId(leads[0].id);
      }
    }
  }, [isOpen, activeLead]);

  // Load files and user quota whenever token or navigation state changes
  useEffect(() => {
    if (isOpen && accessToken) {
      loadDriveContent(accessToken, currentFolder, searchTerm, activeCategory);
    }
  }, [isOpen, accessToken, currentFolder, activeCategory]);

  const loadDriveContent = async (
    token: string,
    folderId: string | null,
    search: string,
    category: DriveFilterCategory
  ) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [filesRes, aboutRes] = await Promise.all([
        listDriveFiles(token, {
          folderId,
          searchTerm: search,
          category,
          pageSize: 40,
        }),
        fetchDriveAbout(token).catch(() => null),
      ]);
      setFiles(filesRes.files);
      if (aboutRes) {
        setDriveAbout(aboutRes);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to communicate with Google Drive';
      setErrorMessage(msg);
      // If error indicates token expired or unauthorized, reset token
      if (msg.includes('401') || msg.includes('invalid_grant')) {
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
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
        setSuccessNotice('Connected to Google Drive successfully.');
        setTimeout(() => setSuccessNotice(null), 4000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In failed';
      setAuthError(msg);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setAccessToken(null);
    setFiles([]);
    setDriveAbout(null);
    setBreadcrumbs([{ id: null, name: 'My Drive' }]);
    setCurrentFolder(null);
  };

  const handleFolderClick = (folder: DriveFile) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentFolder(target.id);
    setSearchTerm('');
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setIsCreatingFolder(true);
    setErrorMessage(null);
    try {
      const created = await createDriveFolder(accessToken, newFolderName.trim(), currentFolder);
      setSuccessNotice(`Created folder "${created.name}" in Google Drive.`);
      setTimeout(() => setSuccessNotice(null), 4000);
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      // Refresh file list
      loadDriveContent(accessToken, currentFolder, searchTerm, activeCategory);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Folder creation failed');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!accessToken || !filesList || filesList.length === 0) return;

    const file = filesList[0];
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const uploaded = await uploadDriveFile(accessToken, file, currentFolder);
      setSuccessNotice(`Uploaded "${uploaded.name}" directly to Google Drive.`);
      setTimeout(() => setSuccessNotice(null), 4000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDriveContent(accessToken, currentFolder, searchTerm, activeCategory);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'File upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportLeadDossier = async () => {
    if (!accessToken || !selectedLeadId) return;
    const targetLead = storedLeads.find((l) => l.id === selectedLeadId) || activeLead;
    if (!targetLead) {
      setErrorMessage('Please select a valid property lead to export.');
      return;
    }

    setIsSavingDossier(true);
    setErrorMessage(null);
    try {
      const file = await saveLeadDossierToDrive(accessToken, targetLead, currentFolder);
      setSuccessNotice(`Saved dossier "${file.name}" to Google Drive!`);
      setTimeout(() => setSuccessNotice(null), 5000);
      loadDriveContent(accessToken, currentFolder, searchTerm, activeCategory);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to export dossier');
    } finally {
      setIsSavingDossier(false);
    }
  };

  // User Confirmation for Destructive Operation (Mandatory Skill Guideline)
  const confirmDeleteFile = async () => {
    if (!accessToken || !deleteConfirmationFile) return;

    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await trashDriveFile(accessToken, deleteConfirmationFile.id);
      setSuccessNotice(`Moved "${deleteConfirmationFile.name}" to Google Drive Trash.`);
      setTimeout(() => setSuccessNotice(null), 4000);
      setDeleteConfirmationFile(null);
      loadDriveContent(accessToken, currentFolder, searchTerm, activeCategory);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const usagePercent =
    driveAbout?.storageQuota?.limit && driveAbout?.storageQuota?.usage
      ? Math.min(
          100,
          Math.round(
            (parseInt(driveAbout.storageQuota.usage, 10) /
              parseInt(driveAbout.storageQuota.limit, 10)) *
              100
          )
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#00171C]/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#081820] border border-cyan-900/50 shadow-2xl overflow-hidden text-slate-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-950/80 bg-[#06131a]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <HardDrive className="w-5 h-5 text-[#88BBD8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Property Diligence &amp; Document Vault
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Google Drive
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional deed repository, title records, surveys &amp; transaction dossiers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth / Account Ribbon */}
        <div className="px-6 py-3 bg-[#0a1e28]/70 border-b border-cyan-950/60 flex flex-wrap items-center justify-between gap-3 text-sm">
          {currentUser && accessToken ? (
            <div className="flex items-center justify-between w-full flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-cyan-500/40"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-900/40 text-cyan-300 font-semibold flex items-center justify-center text-xs border border-cyan-700/50">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {currentUser.displayName || 'Authorized Diligence Officer'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Storage Quota bar if available */}
              {driveAbout?.storageQuota && (
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="hidden sm:block text-right">
                    <span className="text-slate-400">Storage: </span>
                    <span className="font-semibold text-slate-200">
                      {formatBytes(driveAbout.storageQuota.usage)}
                    </span>
                    {driveAbout.storageQuota.limit && (
                      <span className="text-slate-400"> / {formatBytes(driveAbout.storageQuota.limit)}</span>
                    )}
                  </div>
                  {usagePercent !== null && (
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 rounded-full"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-rose-300 rounded-lg hover:bg-rose-950/30 border border-slate-700/60 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full flex-wrap gap-3">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#88BBD8]" />
                <span>
                  Sign in with your Google Account to access real-time Drive files and archive transaction records.
                </span>
              </div>
              <GoogleSignInButton
                onClick={handleSignIn}
                isLoading={isAuthenticating}
                text="Connect Google Drive"
                className="py-1.5 px-3 text-xs"
              />
            </div>
          )}
        </div>

        {/* Global Alerts */}
        {authError && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={() => setAuthError(null)}
              className="text-rose-400 hover:text-rose-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successNotice && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-teal-950/40 border border-teal-800/50 text-teal-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              onClick={() => setSuccessNotice(null)}
              className="text-teal-400 hover:text-teal-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Body */}
        {currentUser && accessToken ? (
          <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            
            {/* Toolbar: Breadcrumbs, Search & Actions */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#0a1e28]/50 p-3 rounded-xl border border-cyan-950/70">
              
              {/* Breadcrumb Path */}
              <nav className="flex items-center gap-1 text-xs overflow-x-auto py-1 scrollbar-none">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id ?? 'root'}>
                    <button
                      onClick={() => handleBreadcrumbClick(idx)}
                      className={`px-2 py-1 rounded hover:bg-slate-800/70 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                        idx === breadcrumbs.length - 1
                          ? 'font-bold text-cyan-300'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {idx === 0 && <Folder className="w-3.5 h-3.5 text-amber-400" />}
                      {crumb.name}
                    </button>
                    {idx < breadcrumbs.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </nav>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Search Bar */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        loadDriveContent(accessToken, currentFolder, searchTerm, activeCategory);
                      }
                    }}
                    placeholder="Search deeds, APNs, PDFs..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/70 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Filter Categories */}
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value as DriveFilterCategory)}
                  aria-label="Filter documents by category"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/70 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Files</option>
                  <option value="deeds">Deeds &amp; Diligence</option>
                  <option value="documents">PDFs &amp; Documents</option>
                  <option value="images">Plat Maps &amp; Aerials</option>
                  <option value="spreadsheets">Spreadsheets / Comps</option>
                  <option value="folders">Folders Only</option>
                </select>

                {/* Refresh */}
                <button
                  onClick={() => loadDriveContent(accessToken, currentFolder, searchTerm, activeCategory)}
                  disabled={isLoading}
                  title="Refresh Drive Files"
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/70 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
                </button>

                {/* New Folder */}
                <button
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-700/60 text-xs font-semibold text-cyan-200 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
                  New Folder
                </button>

                {/* Direct Upload */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  id="drive-file-upload-input"
                />
                <label
                  htmlFor="drive-file-upload-input"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A4251] hover:bg-[#0c4e60] border border-teal-500/40 text-xs font-semibold text-teal-100 cursor-pointer shadow-sm transition-colors ${
                    isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-[#F2C864]" />
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </label>

              </div>
            </div>

            {/* Quick Feature: Save Submitted Lead Packet to Drive as Archived Dossier */}
            {storedLeads.length > 0 && (
              <div className="bg-gradient-to-r from-teal-950/40 to-cyan-950/40 p-3 rounded-xl border border-teal-800/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-teal-200">
                  <Sparkles className="w-4 h-4 text-[#F2C864]" />
                  <span>
                    <strong>Archive Transaction Dossier:</strong> Save intake inquiry specs and preliminary valuations directly into your current Google Drive folder.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    aria-label="Select property dossier to archive"
                    className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-teal-700/60 text-xs text-slate-200 focus:outline-none"
                  >
                    {storedLeads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.type === 'sell'
                          ? `[SELLER] ${(l as any).sellerName} - ${(l as any).state || 'US'} (${l.id})`
                          : `[BUYER] ${(l as any).buyerName} (${(l as any).budgetRange})`}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleExportLeadDossier}
                    disabled={isSavingDossier}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F2C864] hover:bg-[#e0b853] text-[#00171C] font-bold text-xs shadow-sm transition-colors disabled:opacity-60"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    {isSavingDossier ? 'Archiving...' : 'Save Dossier to Drive'}
                  </button>
                </div>
              </div>
            )}

            {/* Create Folder Inline Modal */}
            {isCreateFolderOpen && (
              <form
                onSubmit={handleCreateFolder}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-800/60 flex flex-wrap items-center gap-3 animate-fadeIn"
              >
                <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-amber-400" />
                  New Google Drive Folder Name:
                </div>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. 120 Acres Travis County Diligence"
                  className="flex-1 min-w-[240px] px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isCreatingFolder}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow disabled:opacity-50"
                  >
                    {isCreatingFolder ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateFolderOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* File List / Content Container */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-cyan-950/60 bg-[#06141c]/60 min-h-[300px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                  <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
                  <p className="text-xs font-medium tracking-wide">Querying Google Drive files...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-500">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">No matching files found</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {searchTerm
                        ? `No Google Drive files match "${searchTerm}". Try a different search query.`
                        : 'This Google Drive location is currently empty. Use the buttons above to create a folder or upload property diligence documents.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <label
                      htmlFor="drive-file-upload-input"
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/70 cursor-pointer"
                    >
                      Upload First File
                    </label>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-cyan-950 bg-[#081b24]/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider sticky top-0 backdrop-blur z-10">
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-3 hidden sm:table-cell">Type</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">Size</th>
                      <th className="py-2.5 px-3 hidden lg:table-cell">Last Modified</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-950/40">
                    {files.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      const details = getMimeDetails(file.mimeType);

                      return (
                        <tr
                          key={file.id}
                          className="hover:bg-cyan-950/30 transition-colors group"
                        >
                          {/* File Name & Icon */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {isFolder ? (
                                <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              ) : file.mimeType.startsWith('image/') ? (
                                <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                              ) : file.mimeType.includes('sheet') ? (
                                <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              )}

                              <div className="min-w-0 flex-1">
                                {isFolder ? (
                                  <button
                                    onClick={() => handleFolderClick(file)}
                                    className="font-medium text-slate-100 hover:text-cyan-300 hover:underline text-left truncate block max-w-md"
                                  >
                                    {file.name}
                                  </button>
                                ) : (
                                  <a
                                    href={file.webViewLink || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-slate-200 hover:text-cyan-300 hover:underline truncate block max-w-md"
                                  >
                                    {file.name}
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-3 px-3 hidden sm:table-cell">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${details.color}`}
                            >
                              {details.label}
                            </span>
                          </td>

                          {/* Size */}
                          <td className="py-3 px-3 hidden md:table-cell text-slate-400">
                            {isFolder ? '—' : formatBytes(file.size)}
                          </td>

                          {/* Last Modified */}
                          <td className="py-3 px-3 hidden lg:table-cell text-slate-400">
                            {new Date(file.modifiedTime).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open in Google Drive"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {file.webContentLink && (
                                <a
                                  href={file.webContentLink}
                                  download
                                  title="Download File"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-teal-300 hover:bg-slate-800 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {/* Destructive Delete Button - Triggers Confirmation Dialog */}
                              <button
                                onClick={() => setDeleteConfirmationFile(file)}
                                title="Move to Trash"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        ) : (
          /* Empty / Unauthenticated View */
          <div className="flex-1 p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center shadow-lg text-cyan-400">
              <HardDrive className="w-8 h-8 text-[#F2C864]" />
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Connect Google Drive for Real Estate Diligence
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly store, access, and archive institutional land transaction files, title commitments, survey plat maps, purchase contracts, and property valuation dossiers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Deeds &amp; Title
                </div>
                <p className="text-[11px] text-slate-400">
                  Organize escrow deeds, easements, and title reports by county and APN.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  Plat Maps &amp; Aerials
                </div>
                <p className="text-[11px] text-slate-400">
                  Store boundary surveys, drone photos, and topographical maps in Drive folders.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  Archived Dossiers
                </div>
                <p className="text-[11px] text-slate-400">
                  Export complete acquisition &amp; buyer intake files directly to Drive with 1-click.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <GoogleSignInButton
                onClick={handleSignIn}
                isLoading={isAuthenticating}
                text="Sign in with Google to Connect Drive"
                className="px-6 py-3 text-sm font-bold shadow-lg"
              />
              <p className="text-[11px] text-slate-500 mt-2">
                Authentication is handled securely via Google OAuth. Data access requires explicit user permission.
              </p>
            </div>
          </div>
        )}

        {/* MANDATORY USER CONFIRMATION MODAL FOR DESTRUCTIVE ACTIONS */}
        {deleteConfirmationFile && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl bg-[#0b171e] border border-rose-600/40 p-6 shadow-2xl text-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-600/40 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Move to Google Drive Trash?
                  </h3>
                  <p className="text-xs text-rose-300/80">
                    Destructive action confirmation
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="text-slate-400">Selected Item:</div>
                <div className="font-mono font-semibold text-white truncate">
                  {deleteConfirmationFile.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  Type: {deleteConfirmationFile.mimeType}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to move this file to your Google Drive trash? You can still restore it later from the Trash folder inside your Google Drive account.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmationFile(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFile}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? 'Moving to Trash...' : 'Confirm Move to Trash'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
