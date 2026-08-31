import React from 'react';
import { SavedLink } from '../types';
import { PlatformBadge } from './PlatformBadge';
import { getYouTubeVideoId } from '../lib/metadata';
import { X, ExternalLink, Play, Sparkles, Copy, Check } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  link: SavedLink | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  link,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !link) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine embed URL
  const ytId = link.platform === 'youtube' ? getYouTubeVideoId(link.url) : null;
  const isYouTube = !!ytId;

  // Instagram shortcode
  const igMatch = link.url.match(/(?:reel|p|tv|share\/reel)\/([A-Za-z0-9_-]+)/i);
  const igShortcode = igMatch ? igMatch[1] : null;

  // Vimeo ID
  const vimeoMatch = link.url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  const vimeoId = vimeoMatch ? vimeoMatch[1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        id="video-player-modal-card" 
        className="w-full max-w-2xl bg-[#14161b] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0f1115]">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <PlatformBadge platform={link.platform} />
            <span className="text-xs font-semibold text-slate-300 truncate">
              {link.siteName || link.platform}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="copy-video-link-modal-btn"
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              title="Copy URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition"
              title="Open directly in official app / web"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              id="close-video-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video / Media Player Container */}
        <div className="relative w-full bg-black flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-hidden">
          {isYouTube ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`}
              title={link.title}
              className="w-full aspect-video border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : vimeoId ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
              title={link.title}
              className="w-full aspect-video border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : igShortcode ? (
            <iframe
              src={`https://www.instagram.com/p/${igShortcode}/embed/captioned/`}
              title={link.title}
              className="w-full h-[480px] border-0 bg-white"
              allowTransparency
            />
          ) : (
            <div className="relative w-full h-[360px] flex flex-col items-center justify-center p-6 text-center">
              {link.thumbnail ? (
                <>
                  <img
                    src={link.thumbnail}
                    alt={link.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14161b] via-black/60 to-transparent" />
                </>
              ) : null}

              <div className="relative z-10 max-w-md space-y-4">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Play on platform"
                >
                  <Play className="w-8 h-8 fill-current ml-1" />
                </a>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                    {link.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Watch directly in the {link.siteName || link.platform} app for the full interactive experience.
                  </p>
                </div>

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                >
                  <span>Open in {link.siteName || 'Native App'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Caption & Notes Details */}
        <div className="p-5 bg-[#14161b] border-t border-slate-800/80 space-y-3 overflow-y-auto">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white leading-snug">
              {link.title}
            </h2>
            {link.author && (
              <p className="text-xs text-indigo-400 font-medium mt-1">
                @{link.author}
              </p>
            )}
          </div>

          {link.description && link.description !== link.title && (
            <p className="text-xs text-slate-300 leading-relaxed bg-[#0e1014] p-3 rounded-xl border border-slate-800/70">
              {link.description}
            </p>
          )}

          {link.notes && (
            <div className="p-3 bg-indigo-950/20 border border-indigo-800/40 rounded-xl">
              <span className="text-2xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">
                Your Saved Notes
              </span>
              <p className="text-xs text-slate-200">{link.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
