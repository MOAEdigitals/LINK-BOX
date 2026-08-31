import React from 'react';
import { Category } from '../types';
import { 
  Folder, 
  FolderPlus, 
  Layers, 
  Settings, 
  MoreHorizontal, 
  Plus,
  Sliders
} from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string; // 'all' or category ID
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  onOpenNewCategory: () => void;
  onEditCategory: (category: Category) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  categoryCounts,
  totalCount,
  onOpenNewCategory,
  onEditCategory,
}) => {
  return (
    <div className="w-full">
      {/* Category Pills Bar (Horizontal scrollable with smooth wrap) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {/* All Links Tab */}
        <button
          type="button"
          id="category-pill-all"
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shrink-0 border ${
            selectedCategoryId === 'all'
              ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/40 shadow-2xs font-semibold'
              : 'bg-[#16191f] text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Links</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-2xs font-semibold ${
              selectedCategoryId === 'all'
                ? 'bg-indigo-600/30 text-indigo-300'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {/* Custom Category Pills */}
        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <div key={cat.id} className="relative group shrink-0 flex items-center">
              <button
                type="button"
                id={`category-pill-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 pl-3.5 pr-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition border ${
                  isSelected
                    ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/40 shadow-2xs font-semibold'
                    : 'bg-[#16191f] text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: cat.color || '#6366f1',
                  }}
                />
                <span className="truncate max-w-[140px]">{cat.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-2xs font-semibold ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>

              {/* Category Quick Edit Button (appears on hover or when selected) */}
              <button
                type="button"
                id={`edit-category-btn-${cat.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCategory(cat);
                }}
                className="ml-1 p-1 rounded-lg transition opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                title={`Manage "${cat.name}" category`}
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* Add New Category Button */}
        <button
          type="button"
          id="add-category-pill-btn"
          onClick={onOpenNewCategory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/30 border border-dashed border-slate-700 hover:border-indigo-500/50 transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </div>
    </div>
  );
};
