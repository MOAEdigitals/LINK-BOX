import React, { useState } from 'react';
import { SavedLink, Category } from '../types';
import { PlatformBadge } from './PlatformBadge';
import { 
  ExternalLink, 
  Copy, 
  Check, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Pin,
  FileText,
  Clock
} from 'lucide-react';

interface LinkGridItemProps {
  link: SavedLink;
  category?: Category;
  onEdit: (link: SavedLink) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onCopySuccess: () => void;
}

export const LinkGridItem: React.FC<LinkGridItemProps> = ({
  link,
  category,
  onEdit,
  onDelete,
  onTogglePin,
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(link.createdAt));

  return (
    <div
      id={`link-card-${link.id}`}
      className="group relative bg-[#1a1d23] rounded-2xl border border-slate-800 shadow-md hover:shadow-xl hover:border-slate-700 transition-all flex flex-col overflow-hidden"
    >
      {/* Clickable Card Link Anchor */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative w-full aspect-16/10 bg-slate-900 overflow-hidden cursor-pointer"
        title={`Open ${link.title} in new tab`}
      >
        {link.thumbnail && !imageError ? (
          <img
            src={link.thumbnail}
            alt={link.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-500 bg-slate-900/90">
            {link.favicon ? (
              <img src={link.favicon} alt="" className="w-8 h-8 rounded-md mb-1.5 opacity-70" />
            ) : (
              <ExternalLink className="w-8 h-8 mb-1.5 opacity-40" />
            )}
            <span className="text-2xs font-medium text-slate-500 uppercase tracking-wider">
              {link.siteName || 'Web Page'}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <PlatformBadge platform={link.platform} className="shadow-xs backdrop-blur-md bg-slate-900/90 border-slate-700/80" />
          
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {link.isPinned && (
              <span className="p-1 rounded-md bg-amber-500 text-white shadow-xs">
                <Pin className="w-3 h-3 fill-current" />
              </span>
            )}
            <button
              type="button"
              id={`quick-open-link-${link.id}`}
              onClick={(e) => {
                e.stopPropagation();
                window.open(link.url, '_blank', 'noopener,noreferrer');
              }}
              className="p-1.5 rounded-lg bg-black/60 text-slate-200 hover:text-white hover:bg-black/80 backdrop-blur-xs transition shadow-xs"
              title="Open link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </a>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag & Domain */}
          <div className="flex items-center gap-2 mb-2">
            {category && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-semibold"
                style={{
                  backgroundColor: `${category.color}20`,
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
            {link.siteName && (
              <span className="text-2xs font-medium text-slate-400 truncate">
                {link.siteName}
              </span>
            )}
          </div>

          {/* Title */}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-slate-100 line-clamp-2 hover:text-indigo-400 transition-colors leading-snug"
          >
            {link.title}
          </a>

          {/* Author if available */}
          {link.author && (
            <p className="text-xs text-slate-400 mt-1 truncate">
              by <span className="font-medium text-slate-300">{link.author}</span>
            </p>
          )}

          {/* User Notes if added */}
          {link.notes && (
            <div className="mt-2.5 p-2 bg-slate-900/70 border border-slate-800 rounded-lg flex items-start gap-1.5 text-xs text-slate-300">
              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{link.notes}</span>
            </div>
          )}
        </div>

        {/* Footer Info & Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1">
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
              title="Edit link"
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
