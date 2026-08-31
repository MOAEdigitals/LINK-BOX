import React from 'react';
import { ViewMode, SortOption } from '../types';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  Search, 
  SlidersHorizontal, 
  Bookmark, 
  Download, 
  Upload, 
  Smartphone,
  X
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortOption: SortOption;
  onSortOptionChange: (sort: SortOption) => void;
  onOpenAddModal: () => void;
  onOpenImportExport: () => void;
  onOpenPwaGuide: () => void;
  totalLinksCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortOption,
  onSortOptionChange,
  onOpenAddModal,
  onOpenImportExport,
  onOpenPwaGuide,
  totalLinksCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0f1115]/95 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* App Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Bookmark className="w-4.5 h-4.5 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                  Link Saver
                </h1>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-2xs font-semibold bg-indigo-950/60 text-indigo-400 border border-indigo-800/60">
                  Organizer
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {totalLinksCount} {totalLinksCount === 1 ? 'link' : 'links'} saved
              </p>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                id="search-links-input"
                placeholder="Search links, titles, or notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-800/60 hover:bg-slate-800 focus:bg-slate-800 border border-slate-700/80 focus:border-indigo-500 rounded-full text-xs sm:text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-200 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: View Switcher, Sort, Add Button, Options */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* View Mode Toggle (Grid / List) */}
            <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/80">
              <button
                type="button"
                id="view-grid-btn"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Thumbnail / Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="view-list-btn"
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-slate-700 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Compact List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Selector (Desktop) */}
            <div className="hidden md:flex items-center">
              <select
                id="sort-select-dropdown"
                value={sortOption}
                onChange={(e) => onSortOptionChange(e.target.value as SortOption)}
                className="px-2.5 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="newest" className="bg-[#16191f] text-slate-200">Newest First</option>
                <option value="oldest" className="bg-[#16191f] text-slate-200">Oldest First</option>
                <option value="title" className="bg-[#16191f] text-slate-200">Title (A-Z)</option>
                <option value="platform" className="bg-[#16191f] text-slate-200">Platform</option>
              </select>
            </div>

            {/* PWA & Backup Tools */}
            <button
              type="button"
              id="pwa-guide-btn"
              onClick={onOpenPwaGuide}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
              title="Share Target & PWA Installation Guide"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="import-export-btn"
              onClick={onOpenImportExport}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
              title="Backup & Restore Links"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Primary "Add Link" Button */}
            <button
              type="button"
              id="open-add-link-btn"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Add Link</span>
              <kbd className="hidden lg:inline-block text-2xs px-1.5 py-0.2 bg-indigo-750/70 rounded text-indigo-100 font-mono ml-1">
                ⌘V
              </kbd>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
