import React, { useState } from 'react';
import { SavedLink, Category } from '../types';
import { PlatformBadge } from './PlatformBadge';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  FileText,
  Clock,
  Play,
  RotateCw
} from 'lucide-react';

interface LinkListItemProps {
  link: SavedLink;
  category?: Category;
  onEdit: (link: SavedLink) => void;
  onDelete: (id: string) => void;
  onCopySuccess: () => void;
  onPlayVideo?: (link: SavedLink) => void;
  onRefreshMetadata?: (link: SavedLink) => Promise<void>;
}

export const LinkListItem: React.FC<LinkListItemProps> = ({
  link,
  category,
  onEdit,
  onDelete,
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
      id={`link-list-row-${link.id}`}
      className="group bg-[#181a20] rounded-xl border border-slate-800 shadow-sm hover:border-slate-700 transition-all p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300"
    >
      {/* Left: Media Thumbnail & Title Info */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <div
          onClick={() => {
            if (isVideoPlatform && onPlayVideo) onPlayVideo(link);
            else window.open(link.url, '_blank', 'noopener,noreferrer');
          }}
          className="shrink-0 w-16 h-16 sm:w-14 sm:h-14 rounded-xl bg-[#0f1115] border border-slate-800 overflow-hidden relative flex items-center justify-center cursor-pointer group-hover:opacity-95 transition group/media shadow-xs"
          title={isVideoPlatform ? 'Watch video' : 'Open link'}
        >
          {link.thumbnail && !imageError ? (
            <img
              src={link.thumbnail}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : link.favicon ? (
            <img src={link.favicon} alt="" className="w-6 h-6 rounded-md opacity-80" />
          ) : (
            <ExternalLink className="w-5 h-5 text-slate-500" />
          )}

          {isVideoPlatform && (
            <div className="absolute inset-0 bg-black/40 group-hover/media:bg-indigo-600/70 flex items-center justify-center transition">
              <Play className="w-5 h-5 text-white fill-current drop-shadow-md" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <PlatformBadge platform={link.platform} showName={false} className="py-0 border-slate-700 bg-slate-850" />
            
            {category && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-2xs font-semibold"
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
              <span className="text-2xs text-indigo-400 font-medium truncate">
                @{link.author}
              </span>
            )}

            {link.siteName && !link.author && (
              <span className="text-2xs text-slate-400 hidden md:inline">
                {link.siteName}
              </span>
            )}
          </div>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition truncate block"
          >
            {link.title}
          </a>

          {/* Caption preview if available */}
          {link.description && link.description !== link.title && (
            <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xl">
              {link.description}
            </p>
          )}

          {link.notes && (
            <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>{link.notes}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Date & Action Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80 text-xs text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{formattedDate}</span>
        </span>

        <div className="flex items-center gap-1">
          {onRefreshMetadata && (
            <button
              type="button"
              id={`refresh-list-link-${link.id}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh thumbnail & caption"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          )}

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            id={`open-link-row-${link.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
            title="Open link in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            id={`copy-link-row-${link.id}`}
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Copy URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            id={`edit-link-row-${link.id}`}
            onClick={() => onEdit(link)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/40 transition"
            title="Edit link"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            id={`delete-link-row-${link.id}`}
            onClick={() => onDelete(link.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
            title="Delete link"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
