import Dexie, { type Table } from 'dexie';
import { Category, SavedLink } from '../types';

export class LinkSaverDB extends Dexie {
  categories!: Table<Category, string>;
  links!: Table<SavedLink, string>;

  constructor() {
    super('LinkSaverDB');
    this.version(1).stores({
      categories: 'id, name, order, createdAt',
      links: 'id, url, categoryId, platform, createdAt, isPinned',
    });
  }
}

export const db = new LinkSaverDB();

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-cooking', name: 'Cooking & Recipes', color: '#f97316', icon: 'Utensils', order: 0, createdAt: 1700000000000 },
  { id: 'cat-fitness', name: 'Fitness & Health', color: '#10b981', icon: 'Dumbbell', order: 1, createdAt: 1700000001000 },
  { id: 'cat-tech', name: 'Tech Tutorials', color: '#3b82f6', icon: 'Code', order: 2, createdAt: 1700000002000 },
  { id: 'cat-inspiration', name: 'Inspiration & Ideas', color: '#8b5cf6', icon: 'Sparkles', order: 3, createdAt: 1700000003000 },
  { id: 'cat-watch-later', name: 'Watch Later', color: '#ec4899', icon: 'Clock', order: 4, createdAt: 1700000004000 },
];

export async function initializeDatabase(): Promise<void> {
  const count = await db.categories.count();
  if (count === 0) {
    // Use bulkPut to idempotently insert default categories and avoid duplicate key ConstraintError
    await db.categories.bulkPut(DEFAULT_CATEGORIES);
  }
}

// Category helpers
export async function getCategories(): Promise<Category[]> {
  return await db.categories.orderBy('order').toArray();
}

export async function addCategory(name: string, color: string = '#3b82f6', icon: string = 'Folder'): Promise<Category> {
  const id = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const count = await db.categories.count();
  const category: Category = {
    id,
    name: name.trim(),
    color,
    icon,
    order: count,
    createdAt: Date.now(),
  };
  await db.categories.add(category);
  return category;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await db.categories.update(id, updates);
}

export async function deleteCategory(id: string, fallbackCategoryId?: string): Promise<void> {
  await db.transaction('rw', db.categories, db.links, async () => {
    if (fallbackCategoryId) {
      // Reassign links
      const linksInCat = await db.links.where('categoryId').equals(id).toArray();
      for (const link of linksInCat) {
        await db.links.update(link.id, { categoryId: fallbackCategoryId });
      }
    } else {
      // Delete links in this category
      await db.links.where('categoryId').equals(id).delete();
    }
    await db.categories.delete(id);
  });
}

// Link helpers
export async function getLinks(categoryId?: string): Promise<SavedLink[]> {
  if (categoryId && categoryId !== 'all') {
    return await db.links.where('categoryId').equals(categoryId).reverse().sortBy('createdAt');
  }
  return await db.links.reverse().sortBy('createdAt');
}

export async function getLinkCountByCategory(): Promise<Record<string, number>> {
  const links = await db.links.toArray();
  const counts: Record<string, number> = {};
  for (const link of links) {
    counts[link.categoryId] = (counts[link.categoryId] || 0) + 1;
  }
  return counts;
}

export async function addLink(linkData: Omit<SavedLink, 'id' | 'createdAt'>): Promise<SavedLink> {
  const link: SavedLink = {
    ...linkData,
    id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    createdAt: Date.now(),
  };
  await db.links.add(link);
  return link;
}

export async function updateLink(id: string, updates: Partial<SavedLink>): Promise<void> {
  await db.links.update(id, updates);
}

export async function deleteLink(id: string): Promise<void> {
  await db.links.delete(id);
}

export async function deleteMultipleLinks(ids: string[]): Promise<void> {
  await db.links.bulkDelete(ids);
}

export async function moveMultipleLinks(ids: string[], newCategoryId: string): Promise<void> {
  await db.transaction('rw', db.links, async () => {
    for (const id of ids) {
      await db.links.update(id, { categoryId: newCategoryId });
    }
  });
}
