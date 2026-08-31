import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Category, 
  SavedLink, 
  ViewMode, 
  SortOption, 
  ToastMessage 
} from './types';
import { 
  initializeDatabase, 
  getCategories, 
  getLinks, 
  addLink, 
  updateLink, 
  deleteLink, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  getLinkCountByCategory
} from './lib/db';
import { checkShareTargetParams } from './lib/shareTarget';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { LinkGridItem } from './components/LinkGridItem';
import { LinkListItem } from './components/LinkListItem';
import { AddLinkModal } from './components/AddLinkModal';
import { EditLinkModal } from './components/EditLinkModal';
import { CategoryModal } from './components/CategoryModal';
import { PwaGuideModal } from './components/PwaInstallBanner';
import { ImportExportModal } from './components/ImportExportModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { EmptyState } from './components/EmptyState';
import { ToastContainer } from './components/Toast';
import { fetchMetadata } from './lib/metadata';
import { Plus, Sparkles, Filter, AlertTriangle } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialUrl, setAddModalInitialUrl] = useState('');
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);
  const [playingVideoLink, setPlayingVideoLink] = useState<SavedLink | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'info' | 'error' = 'success',
    actionLabel?: string,
    onAction?: () => void
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, message, type, actionLabel, onAction };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load Initial Data
  const loadData = useCallback(async () => {
    try {
      await initializeDatabase();
      const [allCats, allLinks] = await Promise.all([
        getCategories(),
        getLinks(),
      ]);
      setCategories(allCats);
      setLinks(allLinks);
    } catch (err) {
      console.error('Failed to load database data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Register service worker if available in browser
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
    }

    // Check for incoming Web Share Target parameters
    const sharedData = checkShareTargetParams();
    if (sharedData && sharedData.url) {
      setAddModalInitialUrl(sharedData.url);
      setIsAddModalOpen(true);
      showToast('Shared link received! Pick a category to save.', 'info');
    }

    // Restore saved view preference
    const savedView = localStorage.getItem('linksaver_view_mode') as ViewMode;
    if (savedView === 'grid' || savedView === 'list') {
      setViewMode(savedView);
    }
  }, [loadData, showToast]);

  // Global Keyboard Shortcuts (Cmd+V / Ctrl+V to quickly paste link when not inside input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (isInput) return;

      // Cmd+V or Ctrl+V
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        navigator.clipboard?.readText?.().then((text) => {
          if (text) {
            setAddModalInitialUrl(text);
          }
          setIsAddModalOpen(true);
        }).catch(() => {
          setIsAddModalOpen(true);
        });
      }

      // 'n' or 'N' for new link
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setAddModalInitialUrl('');
        setIsAddModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('linksaver_view_mode', mode);
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const link of links) {
      counts[link.categoryId] = (counts[link.categoryId] || 0) + 1;
    }
    return counts;
  }, [links]);

  // Active Category Object
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  // Filtered & Sorted Links
  const displayedLinks = useMemo(() => {
    let result = [...links];

    // Category filter
    if (selectedCategoryId !== 'all') {
      result = result.filter((l) => l.categoryId === selectedCategoryId);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((l) => {
        const titleMatch = l.title?.toLowerCase().includes(q);
        const urlMatch = l.url?.toLowerCase().includes(q);
        const notesMatch = l.notes?.toLowerCase().includes(q);
        const authorMatch = l.author?.toLowerCase().includes(q);
        const siteMatch = l.siteName?.toLowerCase().includes(q);
        const cat = categories.find((c) => c.id === l.categoryId);
        const catMatch = cat?.name?.toLowerCase().includes(q);
        return titleMatch || urlMatch || notesMatch || authorMatch || siteMatch || catMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      // Pinned items on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      switch (sortOption) {
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'platform':
          return (a.platform || '').localeCompare(b.platform || '');
        case 'newest':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [links, selectedCategoryId, searchQuery, sortOption, categories]);

  // Category Handlers
  const handleSaveCategory = async (name: string, color: string) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, { name, color });
      showToast(`Updated "${name}" category`);
    } else {
      const newCat = await addCategory(name, color);
      setSelectedCategoryId(newCat.id);
      showToast(`Created category "${name}"`);
    }
    await loadData();
    setEditingCategory(null);
  };

  const handleInlineCreateCategory = async (name: string, color?: string): Promise<Category> => {
    const created = await addCategory(name, color || '#3b82f6');
    await loadData();
    showToast(`Created category "${name}"`);
    return created;
  };

  const handleDeleteCategory = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    await deleteCategory(id);
    if (selectedCategoryId === id) {
      setSelectedCategoryId('all');
    }
    await loadData();
    showToast(`Deleted category "${target?.name || ''}"`, 'info');
  };

  // Link Handlers
  const handleSaveLink = async (linkData: Omit<SavedLink, 'id' | 'createdAt'>) => {
    const saved = await addLink(linkData);
    const cat = categories.find((c) => c.id === linkData.categoryId);
    await loadData();
    showToast(
      `Saved link to ${cat?.name || 'Category'}!`,
      'success',
      'Open Link',
      () => window.open(saved.url, '_blank', 'noopener,noreferrer')
    );
  };

  const handleUpdateLink = async (id: string, updates: Partial<SavedLink>) => {
    await updateLink(id, updates);
    await loadData();
    showToast('Updated link');
  };

  const handleRefreshMetadata = async (link: SavedLink) => {
    try {
      showToast('Fetching latest thumbnail & caption...', 'info');
      const meta = await fetchMetadata(link.url);
      await updateLink(link.id, {
        thumbnail: meta.thumbnail || link.thumbnail,
        description: meta.description || link.description,
        title: meta.title && meta.title !== 'web' ? meta.title : link.title,
        author: meta.author || link.author,
        siteName: meta.siteName || link.siteName,
        favicon: meta.favicon || link.favicon,
      });
      await loadData();
      showToast('Preview refreshed successfully!');
    } catch (err) {
      showToast('Could not refresh metadata', 'error');
    }
  };

  const handleDeleteLink = async (id: string) => {
    const deletedItem = links.find((l) => l.id === id);
    await deleteLink(id);
    await loadData();

    if (deletedItem) {
      showToast('Link deleted', 'info', 'Undo', async () => {
        await addLink({
          url: deletedItem.url,
          title: deletedItem.title,
          description: deletedItem.description,
          thumbnail: deletedItem.thumbnail,
          categoryId: deletedItem.categoryId,
          platform: deletedItem.platform,
          siteName: deletedItem.siteName,
          author: deletedItem.author,
          favicon: deletedItem.favicon,
          notes: deletedItem.notes,
        });
        await loadData();
        showToast('Link restored');
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-slate-300 flex flex-col selection:bg-indigo-900 selection:text-indigo-200 pb-20">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        onOpenAddModal={() => {
          setAddModalInitialUrl('');
          setIsAddModalOpen(true);
        }}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenPwaGuide={() => setIsPwaGuideOpen(true)}
        totalLinksCount={links.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
        {/* Category Navigation Bar */}
        <div className="mb-6">
          <CategoryNav
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            categoryCounts={categoryCounts}
            totalCount={links.length}
            onOpenNewCategory={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            onEditCategory={(cat) => {
              setEditingCategory(cat);
              setIsCategoryModalOpen(true);
            }}
          />
        </div>

        {/* Section Header: Current Category Info & Active Filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white">
              {selectedCategoryId === 'all' ? 'All Saved Links' : currentCategory?.name || 'Category'}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              ({displayedLinks.length})
            </span>
          </div>

          {searchQuery && (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>Filtering by &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium">Loading saved links...</p>
          </div>
        ) : displayedLinks.length === 0 ? (
          /* Empty State */
          <EmptyState
            isSearching={Boolean(searchQuery.trim())}
            selectedCategory={currentCategory}
            onAddLink={() => {
              setAddModalInitialUrl('');
              setIsAddModalOpen(true);
            }}
            onClearSearch={() => setSearchQuery('')}
          />
        ) : viewMode === 'grid' ? (
          /* Thumbnail / Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {displayedLinks.map((link) => {
              const cat = categories.find((c) => c.id === link.categoryId);
              return (
                <LinkGridItem
                  key={link.id}
                  link={link}
                  category={cat}
                  onEdit={(l) => setEditingLink(l)}
                  onDelete={handleDeleteLink}
                  onCopySuccess={() => showToast('Link URL copied to clipboard')}
                  onPlayVideo={(l) => setPlayingVideoLink(l)}
                  onRefreshMetadata={handleRefreshMetadata}
                />
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-2.5 max-w-5xl mx-auto">
            {displayedLinks.map((link) => {
              const cat = categories.find((c) => c.id === link.categoryId);
              return (
                <LinkListItem
                  key={link.id}
                  link={link}
                  category={cat}
                  onEdit={(l) => setEditingLink(l)}
                  onDelete={handleDeleteLink}
                  onCopySuccess={() => showToast('Link URL copied to clipboard')}
                  onPlayVideo={(l) => setPlayingVideoLink(l)}
                  onRefreshMetadata={handleRefreshMetadata}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button for mobile & quick desktop access */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          id="floating-add-link-btn"
          onClick={() => {
            setAddModalInitialUrl('');
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center w-14 h-14 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-2xl shadow-xl shadow-indigo-600/35 transition-all hover:scale-105"
          title="Add new link (⌘V or N)"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Modals */}
      <VideoPlayerModal
        isOpen={Boolean(playingVideoLink)}
        link={playingVideoLink}
        onClose={() => setPlayingVideoLink(null)}
      />

      <AddLinkModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalInitialUrl('');
        }}
        categories={categories}
        initialUrl={addModalInitialUrl}
        initialCategoryId={selectedCategoryId !== 'all' ? selectedCategoryId : undefined}
        onSaveLink={handleSaveLink}
        onCreateCategory={handleInlineCreateCategory}
      />

      <EditLinkModal
        isOpen={Boolean(editingLink)}
        link={editingLink}
        categories={categories}
        onClose={() => setEditingLink(null)}
        onUpdate={handleUpdateLink}
        onDelete={handleDeleteLink}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        categoryToEdit={editingCategory}
        onDelete={editingCategory ? handleDeleteCategory : undefined}
      />

      <PwaGuideModal
        isOpen={isPwaGuideOpen}
        onClose={() => setIsPwaGuideOpen(false)}
        onTestShare={(testUrl) => {
          setAddModalInitialUrl(testUrl);
          setIsAddModalOpen(true);
        }}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        categories={categories}
        links={links}
        onRefreshData={loadData}
        onShowToast={(msg) => showToast(msg)}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
