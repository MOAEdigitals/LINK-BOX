export type PlatformType =
  | 'tiktok'
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'x'
  | 'reddit'
  | 'pinterest'
  | 'vimeo'
  | 'threads'
  | 'linkedin'
  | 'web';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
  createdAt: number;
}

export interface SavedLink {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  categoryId: string;
  platform: PlatformType;
  siteName?: string;
  author?: string;
  favicon?: string;
  createdAt: number;
  notes?: string;
  isPinned?: boolean;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'title' | 'platform';

export interface MetadataResult {
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  siteName?: string;
  platform: PlatformType;
  author?: string;
  favicon?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
