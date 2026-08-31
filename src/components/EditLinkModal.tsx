import React, { useState, useEffect } from 'react';
import { Category, SavedLink } from '../types';
import { PlatformBadge } from './PlatformBadge';
import { fetchMetadata } from '../lib/metadata';
import { X, Trash2, ExternalLink, RotateCw, Image as ImageIcon } from 'lucide-react';

interface EditLinkModalProps {
  isOpen: boolean;
  link: SavedLink | null;
  categories: Category[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<SavedLink>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  isOpen,
  link,
  categories,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [author, setAuthor] = useState('');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (link) {
      setTitle(link.title || '');
      setDescription(link.description || '');
      setCategoryId(link.categoryId || '');
      setNotes(link.notes || '');
      setThumbnail(link.thumbnail || '');
      setAuthor(link.author || '');
      setShowDeleteConfirm(false);
    }
  }, [link, isOpen]);

  if (!isOpen || !link) return null;

  const handleRefetchMetadata = async () => {
    try {
      setIsFetchingMeta(true);
      const meta = await fetchMetadata(link.url);
      if (meta.title) setTitle(meta.title);
      if (meta.description) setDescription(meta.description);
      if (meta.thumbnail) setThumbnail(meta.thumbnail);
      if (meta.author) setAuthor(meta.author);
    } catch (err) {
      console.error('Failed to refetch metadata:', err);
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onUpdate(link.id, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        notes: notes.trim() || undefined,
        thumbnail: thumbnail.trim() || undefined,
        author: author.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error updating link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await onDelete(link.id);
      onClose();
    } catch (err) {
      console.error('Error deleting link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="edit-link-modal-card" 
        className="w-full max-w-lg bg-[#16191f] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-300 my-6"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f1115]/90">
          <div className="flex items-center gap-2.5">
            <PlatformBadge platform={link.platform} />
            <h2 className="text-base font-semibold text-white">Edit Saved Link</h2>
          </div>
          <button
            id="close-edit-link-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Thumbnail preview & refetch button */}
          <div className="flex gap-4 p-3 bg-[#0f1115] rounded-xl border border-slate-800">
            <div className="w-24 h-18 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative flex items-center justify-center">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-600" />
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">
                  Media Preview & Caption
                </span>
                <span className="text-2xs text-slate-500 line-clamp-1 truncate max-w-xs">
                  {link.url}
                </span>
              </div>

              <button
                type="button"
                id="refetch-link-meta-modal-btn"
                onClick={handleRefetchMetadata}
                disabled={isFetchingMeta}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 w-fit transition disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isFetchingMeta ? 'animate-spin text-indigo-400' : ''}`} />
                <span>{isFetchingMeta ? 'Fetching...' : 'Re-fetch Video Metadata'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Title / Video Headline
            </label>
            <input
              id="edit-link-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Caption / Description
            </label>
            <textarea
              id="edit-link-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Caption or description from post..."
              className="w-full px-3.5 py-2.5 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                id="edit-link-category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-[#16191f] text-slate-200">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Creator / Author
              </label>
              <input
                id="edit-link-author-input"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="@username"
                className="w-full px-3.5 py-2.5 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes / Annotations
            </label>
            <textarea
              id="edit-link-notes-input"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add thoughts, key timestamps, or reminder notes..."
              className="w-full px-3.5 py-2.5 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs resize-none"
            />
          </div>

          <div className="pt-1">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 hover:underline truncate max-w-full"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{link.url}</span>
            </a>
          </div>

          {/* Delete section */}
          <div className="pt-3 border-t border-slate-800">
            {!showDeleteConfirm ? (
              <button
                type="button"
                id="delete-link-trigger-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete this saved link</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center justify-between gap-3">
                <span className="text-xs text-rose-300">Confirm deletion?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="confirm-delete-link-btn"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-500 transition"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-link-updates-btn"
              disabled={!title.trim() || !categoryId || isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
