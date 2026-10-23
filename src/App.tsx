import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { IntakePipeline } from './components/IntakePipeline';
import { HowItWorks } from './components/HowItWorks';
import { AboutUs } from './components/AboutUs';
import { PrivacyPolicyOverlay } from './components/PrivacyPolicyOverlay';
import { LegalModal } from './components/LegalModal';
import { LandInquiryForm } from './components/LandInquiryForm';
import { ShareModal } from './components/ShareModal';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';
import { GoogleDriveVaultModal } from './components/GoogleDriveVaultModal';
import { GoogleSheetsHubModal } from './components/GoogleSheetsHubModal';
import { GmailHubModal } from './components/GmailHubModal';
import { GoogleChatHubModal } from './components/GoogleChatHubModal';
import { GoogleDocsHubModal } from './components/GoogleDocsHubModal';
import { InteractiveLandMapModal, FeaturedParcel } from './components/InteractiveLandMapModal';
import { testConnection } from './services/firebaseAuth';
import { ThemeProvider } from './context/ThemeContext';
import { X } from 'lucide-react';

export default function App() {
  const [activeFlow, setActiveFlow] = useState<'sell' | 'buy'>('sell');
  const [privacyOverlayOpen, setPrivacyOverlayOpen] = useState(false);
  const [privacySection, setPrivacySection] = useState<string | undefined>(undefined);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'disclaimer' | 'contact' | null>(null);
  const [expressOfferModalOpen, setExpressOfferModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [driveVaultOpen, setDriveVaultOpen] = useState(false);
  const [sheetsHubOpen, setSheetsHubOpen] = useState(false);
  const [gmailHubOpen, setGmailHubOpen] = useState(false);
  const [chatHubOpen, setChatHubOpen] = useState(false);
  const [docsHubOpen, setDocsHubOpen] = useState(false);
  const [landMapOpen, setLandMapOpen] = useState(false);

  // Validate Firestore server connection on startup
  useEffect(() => {
    testConnection().then((connected) => {
      if (connected) {
        console.log('[Firebase] Connected successfully to Cloud Firestore.');
      }
    });
  }, []);

  // Check URL pathname and hash (e.g. /privacy, /terms, #privacy, #terms, #drive-vault, #sheets, #gmail, #chat, #docs)
  useEffect(() => {
    const handleNavigationRoute = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const path = window.location.pathname.toLowerCase();

      if (path === '/privacy' || hash === 'privacy' || hash === 'mobile-sms-privacy' || hash === 'state-disclosures') {
        setPrivacySection(hash === 'privacy' || path === '/privacy' ? undefined : hash);
        setPrivacyOverlayOpen(true);
      } else if (path === '/terms' || hash === 'terms') {
        setLegalModalType('terms');
      } else if (path === '/express-offer' || hash === 'express-offer') {
        setExpressOfferModalOpen(true);
      } else if (hash === 'share') {
        setShareModalOpen(true);
      } else if (hash === 'drive-vault' || hash === 'drive') {
        setDriveVaultOpen(true);
      } else if (hash === 'sheets' || hash === 'sheets-sync' || hash === 'sheets-hub' || path === '/sheets') {
        setSheetsHubOpen(true);
      } else if (hash === 'gmail' || hash === 'mail' || hash === 'inbox' || path === '/gmail' || path === '/inbox') {
        setGmailHubOpen(true);
      } else if (hash === 'chat' || hash === 'chat-alerts' || path === '/chat') {
        setChatHubOpen(true);
      } else if (hash === 'docs' || hash === 'purchase-agreement' || hash === 'contracts' || path === '/docs') {
        setDocsHubOpen(true);
      } else if (hash === 'map' || hash === 'land-map' || hash === 'parcels' || path === '/map') {
        setLandMapOpen(true);
      }
    };

    handleNavigationRoute();
    window.addEventListener('hashchange', handleNavigationRoute);
    window.addEventListener('popstate', handleNavigationRoute);
    return () => {
      window.removeEventListener('hashchange', handleNavigationRoute);
      window.removeEventListener('popstate', handleNavigationRoute);
    };
  }, []);

  const handleOpenPrivacy = (sectionId?: string) => {
    setPrivacySection(sectionId);
    setPrivacyOverlayOpen(true);
  };

  const handleClosePrivacy = () => {
    setPrivacyOverlayOpen(false);
    if (window.location.hash.includes('privacy') || window.location.hash.includes('sms')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleSelectFlow = (flow: 'sell' | 'buy') => {
    setActiveFlow(flow);
    const element = document.getElementById('form-container') || document.getElementById('intake-pipeline');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ThemeProvider>
      <div id="top" className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#061116] dark:text-slate-100 flex flex-col font-sans selection:bg-[#F2C864] selection:text-[#00171C] transition-colors duration-200">
        
        {/* Polished Commercial Header */}
      <Header
        onOpenPrivacyPolicy={handleOpenPrivacy}
        onOpenShareModal={() => setShareModalOpen(true)}
        onSelectFlow={handleSelectFlow}
        onOpenDriveVault={() => setDriveVaultOpen(true)}
        onOpenSheetsHub={() => setSheetsHubOpen(true)}
        onOpenGmailHub={() => setGmailHubOpen(true)}
        onOpenChatHub={() => setChatHubOpen(true)}
        onOpenDocsHub={() => setDocsHubOpen(true)}
        onOpenLandMap={() => setLandMapOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Institutional Hero Section with Dual Choice Cards */}
        <HeroSection
          activeFlow={activeFlow}
          onSelectFlow={handleSelectFlow}
        />

        {/* Public & Zero-Login Interactive Lead Intake Pipeline with CTIA / A2P 10DLC Checkboxes */}
        <IntakePipeline
          activeFlow={activeFlow}
          onFlowChange={setActiveFlow}
          onOpenPrivacyPolicy={handleOpenPrivacy}
          onOpenTerms={() => setLegalModalType('terms')}
          onOpenDriveVault={() => setDriveVaultOpen(true)}
          onOpenSheetsHub={() => setSheetsHubOpen(true)}
        />

        {/* 3-Step Transparent Overview for Sellers */}
        <HowItWorks onStartOffer={() => handleSelectFlow('sell')} />

        {/* Corporate Profile: About Us */}
        <AboutUs />

      </main>

      {/* Commercial Footer */}
      <Footer
        onOpenPrivacyPolicy={handleOpenPrivacy}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenShareModal={() => setShareModalOpen(true)}
        onOpenDriveVault={() => setDriveVaultOpen(true)}
        onOpenSheetsHub={() => setSheetsHubOpen(true)}
        onOpenGmailHub={() => setGmailHubOpen(true)}
        onOpenChatHub={() => setChatHubOpen(true)}
        onOpenDocsHub={() => setDocsHubOpen(true)}
        onOpenLandMap={() => setLandMapOpen(true)}
      />

      {/* Isolated Full-Page Privacy Policy Overlay (TCR A2P 10DLC Compliant) */}
      <PrivacyPolicyOverlay
        isOpen={privacyOverlayOpen}
        onClose={handleClosePrivacy}
        initialSection={privacySection}
      />

      {/* Official Legal Modal for Terms of Service, Valuation Disclaimers, and Contact */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Express Cash Offer Intake Modal (Embedded LandInquiryForm) */}
      {expressOfferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#00171C] border border-[#0A4251] rounded-2xl p-2 shadow-2xl">
            <button
              onClick={() => setExpressOfferModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close express offer modal"
            >
              <X className="w-5 h-5" />
            </button>
            <LandInquiryForm
              onOpenPrivacyPolicy={(sec) => {
                setExpressOfferModalOpen(false);
                handleOpenPrivacy(sec);
              }}
              onOpenTerms={() => {
                setExpressOfferModalOpen(false);
                setLegalModalType('terms');
              }}
              onSuccess={() => {
                // Keep modal open so user sees confirmation dossier
              }}
            />
          </div>
        </div>
      )}

      {/* One-Click Share Platform Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Google Drive Diligence & Document Vault Modal */}
      <GoogleDriveVaultModal
        isOpen={driveVaultOpen}
        onClose={() => setDriveVaultOpen(false)}
        onOpenSheetsHub={() => setSheetsHubOpen(true)}
      />

      {/* Google Sheets Lead Pipeline Hub Modal */}
      <GoogleSheetsHubModal
        isOpen={sheetsHubOpen}
        onClose={() => setSheetsHubOpen(false)}
      />

      {/* Gmail Acquisitions & Seller Inbox Hub Modal */}
      <GmailHubModal
        isOpen={gmailHubOpen}
        onClose={() => setGmailHubOpen(false)}
      />

      {/* Google Chat Team Notifications Modal */}
      <GoogleChatHubModal
        isOpen={chatHubOpen}
        onClose={() => setChatHubOpen(false)}
      />

      {/* Google Docs Purchase Agreement Generator Modal */}
      <GoogleDocsHubModal
        isOpen={docsHubOpen}
        onClose={() => setDocsHubOpen(false)}
      />

      {/* Google Maps Platform: Nationwide Interactive Land Map & Parcel Explorer */}
      <InteractiveLandMapModal
        isOpen={landMapOpen}
        onClose={() => setLandMapOpen(false)}
        onSelectParcelForOffer={(parcel) => {
          handleSelectFlow('sell');
        }}
      />

      {/* Cookie & Session Security Notice */}
      <CookieBanner onOpenPrivacyPolicy={() => handleOpenPrivacy()} />

      </div>
    </ThemeProvider>
  );
}
