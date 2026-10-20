import React, { useState, useEffect } from 'react';
import { Lock, X, Check } from 'lucide-react';

interface CookieBannerProps {
  onOpenPrivacyPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacyPolicy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('abode_cookie_consent');
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('abode_cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('abode_cookie_consent', 'dismissed');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Privacy Notice"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-40 bg-[#00171C]/95 text-white border border-[#0A4251] rounded-lg shadow-2xl p-4 backdrop-blur-md no-print animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded bg-[#0A4251] flex items-center justify-center text-[#F2C864] shrink-0 mt-0.5 border border-[#F2C864]/30">
          <Lock className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-[#F2C864]">
              Data Privacy &amp; Cookies
            </h4>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#0A4251] cursor-pointer"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-light">
            We use essential cookies to maintain form sessions and security. By continuing, you agree to our{' '}
            <button
              onClick={() => onOpenPrivacyPolicy()}
              type="button"
              className="text-[#88BBD8] underline hover:text-white font-medium cursor-pointer"
            >
              Privacy Policy
            </button>.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              type="button"
              className="px-3.5 py-1.5 bg-[#F2C864] hover:bg-[#fad379] text-[#00171C] text-xs font-bold rounded transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onOpenPrivacyPolicy()}
              type="button"
              className="px-3 py-1.5 text-xs text-[#88BBD8] hover:text-white hover:bg-[#0A4251] rounded transition-colors cursor-pointer"
            >
              Read Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
