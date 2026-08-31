import React from 'react';
import { PlatformType } from '../types';
import { 
  Video, 
  Youtube, 
  Instagram, 
  Facebook, 
  Twitter, 
  Globe, 
  Share2,
  Tv,
  MessageSquare
} from 'lucide-react';

interface PlatformBadgeProps {
  platform: PlatformType;
  className?: string;
  showName?: boolean;
}

export const PLATFORM_INFO: Record<PlatformType, { label: string; color: string; bg: string }> = {
  tiktok: { label: 'TikTok', color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-800/60' },
  youtube: { label: 'YouTube', color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/60' },
  instagram: { label: 'Instagram', color: 'text-pink-400', bg: 'bg-pink-950/40 border-pink-800/60' },
  facebook: { label: 'Facebook', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60' },
  x: { label: 'X / Twitter', color: 'text-slate-200', bg: 'bg-slate-800/80 border-slate-700' },
  reddit: { label: 'Reddit', color: 'text-orange-400', bg: 'bg-orange-950/40 border-orange-800/60' },
  pinterest: { label: 'Pinterest', color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/60' },
  vimeo: { label: 'Vimeo', color: 'text-sky-400', bg: 'bg-sky-950/40 border-sky-800/60' },
  threads: { label: 'Threads', color: 'text-zinc-200', bg: 'bg-zinc-800 border-zinc-700' },
  linkedin: { label: 'LinkedIn', color: 'text-blue-400', bg: 'bg-blue-950/40 border-blue-800/60' },
  web: { label: 'Web Link', color: 'text-slate-400', bg: 'bg-slate-800/80 border-slate-700' },
};

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, className = '', showName = true }) => {
  const info = PLATFORM_INFO[platform] || PLATFORM_INFO.web;

  const renderIcon = () => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5" />;
      case 'tiktok':
        return <Video className="w-3.5 h-3.5" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5" />;
      case 'facebook':
        return <Facebook className="w-3.5 h-3.5" />;
      case 'x':
        return <Twitter className="w-3.5 h-3.5" />;
      case 'vimeo':
        return <Tv className="w-3.5 h-3.5" />;
      case 'threads':
      case 'reddit':
        return <MessageSquare className="w-3.5 h-3.5" />;
      default:
        return <Globe className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${info.bg} ${info.color} ${className}`}
    >
      {renderIcon()}
      {showName && <span>{info.label}</span>}
    </span>
  );
};
