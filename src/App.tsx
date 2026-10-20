import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { IntakePipeline } from './components/IntakePipeline';
import { HowItWorks } from './components/HowItWorks';
import { AboutUs } from './components/AboutUs';
import { PrivacyPolicyOverlay } from './components/PrivacyPolicyOverlay';
import { ShareModal } from './components/ShareModal';
import { CookieBanner } from './components/CookieBanner';
import { Footer } from './components/Footer';

export default function App() {
  const [activeFlow, setActiveFlow] = useState<'sell' | 'buy'>('sell');
  const [privacyOverlayOpen, setPrivacyOverlayOpen] = useState(false);
  const [privacySection, setPrivacySection] = useState<string | undefined>(undefined);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Check initial URL hash (e.g. #privacy or #mobile-sms-privacy)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'privacy' || hash === 'mobile-sms-privacy' || hash === 'state-disclosures') {
        setPrivacySection(hash === 'privacy' ? undefined : hash);
        setPrivacyOverlayOpen(true);
      } else if (hash === 'share') {
        setShareModalOpen(true);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
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
    <div id="top" className="min-h-screen bg-[#061116] text-slate-100 flex flex-col font-sans selection:bg-[#F2C864] selection:text-[#00171C]">
      
      {/* Polished Commercial Header */}
      <Header
        onOpenPrivacyPolicy={handleOpenPrivacy}
        onOpenShareModal={() => setShareModalOpen(true)}
        onSelectFlow={handleSelectFlow}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Institutional Hero Section with Dual Choice Cards */}
        <HeroSection
          activeFlow={activeFlow}
          onSelectFlow={handleSelectFlow}
        />

        {/* Public & Zero-Login Interactive Lead Intake Pipeline */}
        <IntakePipeline
          activeFlow={activeFlow}
          onFlowChange={setActiveFlow}
          onOpenPrivacyPolicy={handleOpenPrivacy}
        />

        {/* 3-Step Transparent Overview for Sellers */}
        <HowItWorks onStartOffer={() => handleSelectFlow('sell')} />

        {/* Corporate Profile: About Abode Mode */}
        <AboutUs />

      </main>

      {/* Commercial Footer */}
      <Footer
        onOpenPrivacyPolicy={handleOpenPrivacy}
        onOpenShareModal={() => setShareModalOpen(true)}
      />

      {/* Isolated Full-Page Privacy Policy Overlay (TCR A2P 10DLC Compliant) */}
      <PrivacyPolicyOverlay
        isOpen={privacyOverlayOpen}
        onClose={handleClosePrivacy}
        initialSection={privacySection}
      />

      {/* One-Click Share Platform Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />

      {/* Cookie & Session Security Notice */}
      <CookieBanner onOpenPrivacyPolicy={() => handleOpenPrivacy()} />

    </div>
  );
}
