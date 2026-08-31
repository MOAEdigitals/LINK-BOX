import React, { useState } from 'react';
import { SavedLink, Category } from '../types';
import { PlatformBadge } from './PlatformBadge';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Pin,
  FileText,
  Clock,
  Play,
  RotateCw,
  Sparkles
} from 'lucide-react';

interface LinkGridItemProps {
  link: SavedLink;
  category?: Category;
  onEdit: (link: SavedLink) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onCopySuccess: () => void;
  onPlayVideo?: (link: SavedLink) => void;
  onRefreshMetadata?: (link: SavedLink) => Promise<void>;
}

export const LinkGridItem: React.FC<LinkGridItemProps> = ({
  link,
  category,
  onEdit,
  onDelete,
  onTogglePin,
  onCopySuccess,
  onPlayVideo,
  onRefreshMetadata,
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isVideoPlatform = ['tiktok', 'youtube', 'instagram', 'facebook', 'vimeo'].includes(
    link.platform
  );

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isRefreshing || !onRefreshMetadata) return;
    try {
      setIsRefreshing(true);
      await onRefreshMetadata(link);
      setImageError(false);
    } catch (err) {
      console.error('Refresh metadata failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(link.createdAt));

  return (
    <div
      id={`link-card-${link.id}`}
      className="group relative bg-[#181a20] rounded-2xl border border-slate-800/90 shadow-lg hover:shadow-2xl hover:border-slate-700 transition-all duration-200 flex flex-col overflow-hidden text-slate-300"
    >
      {/* Visual Media Header / Reel Poster */}
      <div className="relative w-full aspect-16/10 sm:aspect-16/10 bg-[#0f1115] overflow-hidden">
        {link.thumbnail && !imageError ? (
          <div className="relative w-full h-full">
            <img
              src={link.thumbnail}
              alt={link.title}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Gradient bottom scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181a20] via-black/30 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-slate-500 bg-gradient-to-b from-[#13151a] to-[#0c0d0f]">
            {link.favicon ? (
              <img src={link.favicon} alt="" className="w-10 h-10 rounded-xl mb-2 opacity-80 shadow-md" />
            ) : (
              <ExternalLink className="w-9 h-9 mb-2 opacity-40 text-slate-400" />
            )}
            <span className="text-2xs font-semibold text-slate-400 uppercase tracking-widest">
              {link.siteName || link.platform}
            </span>
          </div>
        )}

        {/* Big Center Play Button Overlay for Video Platforms */}
        {isVideoPlatform && (
          <button
            type="button"
            id={`play-video-card-btn-${link.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (onPlayVideo) {
                onPlayVideo(link);
              } else {
                window.open(link.url, '_blank', 'noopener,noreferrer');
              }
            }}
            className="absolute inset-0 m-auto w-13 h-13 rounded-2xl bg-black/60 hover:bg-indigo-600/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer z-10 group/play"
            title="Play video / reel"
          >
            <Play className="w-6 h-6 fill-current ml-0.5 text-white drop-shadow-md group-hover/play:scale-105 transition" />
          </button>
        )}

        {/* Top Badges & Controls Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
          <PlatformBadge
            platform={link.platform}
            className="shadow-md backdrop-blur-md bg-black/70 border-white/10 text-white font-medium"
          />

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {link.isPinned && (
              <span className="p-1.5 rounded-lg bg-amber-500/90 text-white shadow-md backdrop-blur-xs">
                <Pin className="w-3 h-3 fill-current" />
              </span>
            )}

            {onRefreshMetadata && (
              <button
                type="button"
                id={`refresh-link-meta-${link.id}`}
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-black/70 text-slate-300 hover:text-white hover:bg-black/90 backdrop-blur-md transition shadow-md border border-white/10"
                title="Refresh thumbnail & caption"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            )}

            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-black/70 text-slate-300 hover:text-white hover:bg-black/90 backdrop-blur-md transition shadow-md border border-white/10"
              title="Open link in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Platform Meta */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {category && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold"
                style={{
                  backgroundColor: `${category.color}25`,
                  color: category.color || '#818cf8',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: category.color || '#818cf8' }}
                />
                {category.name}
              </span>
            )}
            {link.author && (
              <span className="text-2xs font-medium text-indigo-400 truncate">
                @{link.author}
              </span>
            )}
          </div>

          {/* Title / Video Headline */}
          <h3 className="text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-400 transition-colors">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.title}
            </a>
          </h3>

          {/* Video Caption / Description Preview */}
          {link.description && link.description !== link.title && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed bg-[#111317] p-2 rounded-lg border border-slate-800/80">
              {link.description}
            </p>
          )}

          {/* Notes if added */}
          {link.notes && (
            <div className="mt-2 p-2 bg-indigo-950/20 border border-indigo-800/40 rounded-lg flex items-start gap-1.5 text-xs text-slate-300">
              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{link.notes}</span>
            </div>
          )}
        </div>

        {/* Footer info & action buttons */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1">
            {isVideoPlatform && (
              <button
                type="button"
                onClick={() => onPlayVideo?.(link)}
                className="px-2 py-1 rounded-lg text-2xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/50 transition flex items-center gap-1"
                title="Watch preview"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Watch</span>
              </button>
            )}

            <button
              type="button"
              id={`copy-link-btn-${link.id}`}
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Copy URL"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="button"
              id={`edit-link-btn-${link.id}`}
              onClick={() => onEdit(link)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/40 transition"
              title="Edit link details"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id={`delete-link-btn-${link.id}`}
              onClick={() => onDelete(link.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
              title="Delete link"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
