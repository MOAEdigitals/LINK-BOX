import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { X, Check } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => Promise<void>;
  categoryToEdit?: Category | null;
  onDelete?: (id: string) => Promise<void>;
}

const COLOR_PALETTE = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Slate', value: '#64748b' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setColor(categoryToEdit.color || '#3b82f6');
    } else {
      setName('');
      setColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].value);
    }
    setShowDeleteConfirm(false);
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave(name.trim(), color);
      onClose();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToEdit || !onDelete) return;
    try {
      setIsSubmitting(true);
      await onDelete(categoryToEdit.id);
      onClose();
    } catch (err) {
      console.error('Error deleting category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div 
        id="category-modal-card" 
        className="w-full max-w-md bg-[#16191f] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden text-slate-300"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f1115]/90">
          <h2 className="text-base font-bold text-white">
            {categoryToEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            id="close-category-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category Name
            </label>
            <input
              id="category-name-input"
              type="text"
              required
              autoFocus
              placeholder="e.g. Cooking, Tech Tutorials, Workout Ideas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0c0d0f] border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {color === c.value && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Delete Option if editing */}
          {categoryToEdit && onDelete && (
            <div className="pt-2 border-t border-slate-800">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  id="delete-category-trigger-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium transition"
                >
                  Delete this category...
                </button>
              ) : (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-2">
                  <p className="text-xs text-rose-300">
                    Are you sure? Deleting this category will also remove links saved exclusively in it.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="confirm-delete-category-btn"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-500 transition"
                    >
                      Yes, delete category
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-category-submit-btn"
              disabled={!name.trim() || isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              {isSubmitting ? 'Saving...' : categoryToEdit ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
