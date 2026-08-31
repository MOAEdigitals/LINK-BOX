import React, { useState, useEffect, useRef } from 'react';
import { Category, PlatformType, SavedLink } from '../types';
import { fetchMetadata } from '../lib/metadata';
import { PlatformBadge } from './PlatformBadge';
import { 
  X, 
  Plus, 
  Link as LinkIcon, 
  Sparkles, 
  Clipboard, 
  Check, 
  FolderPlus,
  Loader2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialUrl?: string;
  initialCategoryId?: string;
  onSaveLink: (link: Omit<SavedLink, 'id' | 'createdAt'>) => Promise<void>;
  onCreateCategory: (name: string, color?: string) => Promise<Category>;
}

export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialUrl = '',
  initialCategoryId,
  onSaveLink,
  onCreateCategory,
}) => {
  const [url, setUrl] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('web');
  const [siteName, setSiteName] = useState('');
  const [author, setAuthor] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New category inline creation
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const urlInputRef = useRef<HTMLInputElement>(null);
  const metadataFetchAbort = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const targetUrl = initialUrl.trim();
      setUrl(targetUrl);
      setTitle('');
      setDescription('');
      setThumbnail('');
      setPlatform('web');
      setSiteName('');
      setAuthor('');
      setNotes('');
      setShowNotes(false);
      setIsCreatingCategory(false);
      setNewCategoryName('');

      // Set category default
      if (initialCategoryId && categories.some((c) => c.id === initialCategoryId)) {
        setSelectedCategoryId(initialCategoryId);
      } else if (categories.length > 0) {
        setSelectedCategoryId(categories[0].id);
      }

      if (targetUrl) {
        handleUrlChange(targetUrl);
      } else {
        setTimeout(() => urlInputRef.current?.focus(), 50);
      }
    }
  }, [isOpen, initialUrl, initialCategoryId, categories]);

  if (!isOpen) return null;

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);

    if (metadataFetchAbort.current) {
      window.clearTimeout(metadataFetchAbort.current);
    }

    if (!newUrl.trim() || !/^https?:\/\//i.test(newUrl.trim()) && !newUrl.includes('.')) {
      return;
    }

    // Debounce metadata fetch
    metadataFetchAbort.current = window.setTimeout(async () => {
      setIsLoadingMetadata(true);
      try {
        const meta = await fetchMetadata(newUrl);
        setTitle(meta.title || '');
        setDescription(meta.description || '');
        setThumbnail(meta.thumbnail || '');
        setPlatform(meta.platform || 'web');
        setSiteName(meta.siteName || '');
        setAuthor(meta.author || '');
      } catch (err) {
        console.error('Metadata fetch error:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    }, 300);
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        // Extract URL if surrounded by other text
        const urlMatch = text.match(/(https?:\/\/[^\s]+)/i);
        const target = urlMatch ? urlMatch[0].replace(/[),.;!]+$/, '') : text.trim();
        handleUrlChange(target);
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or unavailable');
    }
  };

  const handleInlineCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const created = await onCreateCategory(newCategoryName.trim());
      setSelectedCategoryId(created.id);
      setNewCategoryName('');
      setIsCreatingCategory(false);
    } catch (err) {
      console.error('Error creating inline category:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !selectedCategoryId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }

      await onSaveLink({
        url: finalUrl,
        title: title.trim() || siteName || finalUrl,
        description: description.trim(),
        thumbnail: thumbnail.trim(),
        categoryId: selectedCategoryId,
        platform: platform,
        siteName: siteName || undefined,
        author: author || undefined,
        notes: notes.trim() || undefined,
      });

      onClose();
    } catch (err) {
      console.error('Error saving link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="add-link-modal-card" 
        className="w-full max-w-lg bg-[#16191f] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden my-6 transition-all text-slate-300"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f1115]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center font-bold">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Save New Link</h2>
              <p className="text-xs text-slate-400">Add to your organized collections</p>
            </div>
          </div>
          <button
            id="close-add-link-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* URL Input with Paste button */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Link URL / Video Link
            </label>
            <div className="relative flex items-center">
              <input
                id="link-url-input"
                ref={urlInputRef}
                type="text"
                required
                placeholder="Paste link from TikTok, YouTube, Instagram, etc..."
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full pl-3.5 pr-24 py-2.5 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <button
                type="button"
                id="paste-clipboard-btn"
                onClick={handlePasteClipboard}
                className="absolute right-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 shadow-2xs transition"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                <span>Paste</span>
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          {(url.trim().length > 3 || isLoadingMetadata) && (
            <div className="p-3.5 bg-[#0f1115] rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  {isLoadingMetadata ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Fetching preview & thumbnail...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Link Preview</span>
                    </>
                  )}
                </span>
                <PlatformBadge platform={platform} />
              </div>

              <div className="flex gap-3">
                {thumbnail ? (
                  <div className="w-24 h-18 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative group">
                    <img
                      src={thumbnail}
                      alt="Thumbnail preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={() => setThumbnail('')}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-18 shrink-0 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <LinkIcon className="w-5 h-5 mb-1 opacity-50" />
                    <span>No Image</span>
                  </div>
                )}

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <input
                    type="text"
                    id="link-title-preview-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter or edit link title..."
                    className="font-semibold text-sm text-slate-100 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none truncate w-full"
                  />
                  {author && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      by <span className="font-medium text-slate-300">{author}</span>
                    </p>
                  )}
                  {siteName && (
                    <p className="text-2xs text-slate-500 uppercase tracking-wider mt-0.5 truncate">
                      {siteName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Select Category <span className="text-rose-400">*</span>
              </label>
              {!isCreatingCategory && (
                <button
                  type="button"
                  id="open-inline-new-category-btn"
                  onClick={() => setIsCreatingCategory(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>+ New Category</span>
                </button>
              )}
            </div>

            {/* Inline New Category Creation Input */}
            {isCreatingCategory && (
              <div className="mb-3 p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl flex items-center gap-2">
                <input
                  type="text"
                  id="inline-category-name-input"
                  autoFocus
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInlineCreateCategory(e);
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-[#0c0d0f] border border-indigo-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  id="confirm-inline-category-btn"
                  onClick={handleInlineCreateCategory}
                  disabled={!newCategoryName.trim()}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Category Select Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    id={`select-category-pill-${cat.id}`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/30 shadow-2xs font-semibold'
                        : 'bg-[#0c0d0f] border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#6366f1' }}
                    />
                    <span className="truncate flex-1">{cat.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
            {categories.length === 0 && (
              <p className="text-xs text-amber-400">Please create a category first to save links.</p>
            )}
          </div>

          {/* Optional Notes & Tags */}
          <div className="border-t border-slate-800 pt-3">
            {!showNotes ? (
              <button
                type="button"
                id="toggle-notes-btn"
                onClick={() => setShowNotes(true)}
                className="text-xs text-slate-400 hover:text-indigo-400 font-medium flex items-center gap-1 transition"
              >
                <span>+ Add optional note / description</span>
              </button>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Personal Notes / Summary
                </label>
                <textarea
                  id="link-notes-input"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Try this pasta recipe on Friday! Or key timestamp 02:45"
                  className="w-full px-3.5 py-2 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-2xs text-slate-500 hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-slate-400">Enter</kbd> to save
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-link-submit-btn"
                disabled={!url.trim() || !selectedCategoryId || isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
