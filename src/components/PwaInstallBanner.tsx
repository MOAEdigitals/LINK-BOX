import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Share2, 
  Download, 
  CheckCircle2, 
  ArrowRight,
  Info,
  Layers
} from 'lucide-react';

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestShare: (url: string) => void;
}

export const PwaGuideModal: React.FC<PwaGuideModalProps> = ({
  isOpen,
  onClose,
  onTestShare,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const sampleLinks = [
    { name: 'TikTok Sample', url: 'https://www.tiktok.com/@tiktok/video/7106594312292453678' },
    { name: 'YouTube Shorts Sample', url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ' },
    { name: 'Instagram Reel Sample', url: 'https://www.instagram.com/reel/C_sample' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        id="pwa-guide-modal-card" 
        className="w-full max-w-lg bg-[#16191f] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-300"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f1115]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Web Share Target & PWA</h2>
              <p className="text-xs text-slate-400">Share links straight from other apps</p>
            </div>
          </div>
          <button
            id="close-pwa-guide-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-slate-300 text-xs sm:text-sm">
          {/* Status banner */}
          <div className="p-3.5 bg-indigo-950/30 border border-indigo-800/50 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-300 text-xs sm:text-sm">
                Web Share Target API Enabled
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                When installed on Android or supported mobile browsers, Link Saver will appear in your device's native <strong>Share Menu</strong> when sharing from TikTok, YouTube, Instagram, Facebook, and X.
              </p>
            </div>
          </div>

          {/* Quick Install Button if available */}
          {deferredPrompt && (
            <div className="text-center py-2">
              <button
                type="button"
                id="install-pwa-app-btn"
                onClick={handleInstallClick}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Install Link Saver to Home Screen</span>
              </button>
            </div>
          )}

          {/* How to use */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">
              How it works on mobile
            </h4>
            <ol className="space-y-2 text-xs text-slate-400 list-decimal list-inside pl-1">
              <li>Open any app (e.g. TikTok, YouTube, Instagram, X).</li>
              <li>Tap the native <strong>Share</strong> button on any video or post.</li>
              <li>Choose <strong>Link Saver</strong> from the share sheet list.</li>
              <li>Link Saver automatically opens a quick prompt to pick your category and saves it!</li>
            </ol>
          </div>

          {/* Test in Browser Simulator */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">
              Simulate incoming share (test in browser)
            </h4>
            <div className="flex flex-wrap gap-2">
              {sampleLinks.map((sample) => (
                <button
                  type="button"
                  key={sample.name}
                  onClick={() => {
                    onClose();
                    onTestShare(sample.url);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 hover:border-indigo-700 transition flex items-center gap-1 shadow-xs"
                >
                  <span>{sample.name}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
