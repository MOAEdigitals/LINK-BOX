import React from 'react';
import { BookmarkPlus, Search, Sparkles, FolderPlus } from 'lucide-react';
import { Category } from '../types';

interface EmptyStateProps {
  isSearching: boolean;
  selectedCategory?: Category;
  onAddLink: () => void;
  onClearSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearching,
  selectedCategory,
  onAddLink,
  onClearSearch,
}) => {
  if (isSearching) {
    return (
      <div className="py-16 px-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Search className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No matching links found</h3>
        <p className="text-xs text-slate-400 mb-4">
          Try searching with different keywords, titles, or notes.
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            Clear Search Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 mx-auto flex items-center justify-center mb-3.5 shadow-lg shadow-indigo-950/50">
        <BookmarkPlus className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">
        {selectedCategory ? `No links saved in "${selectedCategory.name}" yet` : 'No saved links yet'}
      </h3>
      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Save videos, reels, TikToks, Shorts, and social posts to organize and revisit them anytime.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <button
          type="button"
          id="empty-state-add-btn"
          onClick={onAddLink}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-1.5"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>Save Your First Link</span>
        </button>
      </div>
    </div>
  );
};
