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

export const DEFAULT_LINKS: SavedLink[] = [
  {
    id: 'link-seed-1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: '15-Minute Creamy Garlic Butter Pasta with Crispy Herbs',
    description: 'Quick and delicious weeknight dinner recipe! Step-by-step technique for velvety garlic butter sauce, crispy rosemary, and al dente pasta perfection.',
    thumbnail: 'https://images.unsplash.com/photo-1621996346565-e3d5d628120e?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-cooking',
    platform: 'youtube',
    siteName: 'YouTube',
    author: 'ChefTable',
    createdAt: Date.now() - 3600000 * 2,
    isPinned: true,
  },
  {
    id: 'link-seed-2',
    url: 'https://www.tiktok.com/@fitnesslab/video/7234567890',
    title: '5-Minute Morning Mobility & Core Activation Routine',
    description: 'Do this routine right after waking up to release tight hip flexors, activate deep core muscles, and boost full-body circulation without any equipment! #mobility #workout',
    thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-fitness',
    platform: 'tiktok',
    siteName: 'TikTok',
    author: 'fitnesslab',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'link-seed-3',
    url: 'https://www.instagram.com/reel/C8k9LxPOz21/',
    title: 'Minimalist Workspace Setup & Aesthetic Desk Organization 2025',
    description: 'Clean workspace essentials: 4K OLED display, wireless walnut wrist rest, warm ambient diffused light bars, and zero visible cable clutter.',
    thumbnail: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-inspiration',
    platform: 'instagram',
    siteName: 'Instagram',
    author: 'designspaces',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'link-seed-4',
    url: 'https://www.facebook.com/reel/9876543210',
    title: 'Next-Gen Fullstack Architecture & Edge Server Actions',
    description: 'Deep dive into modern web bundling, streaming SSR, and edge micro-caches to achieve sub-100ms response times globally.',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    categoryId: 'cat-tech',
    platform: 'facebook',
    siteName: 'Facebook',
    author: 'TechFoundry',
    createdAt: Date.now() - 3600000 * 24,
  },
];

export async function initializeDatabase(): Promise<void> {
  const catCount = await db.categories.count();
  if (catCount === 0) {
    await db.categories.bulkPut(DEFAULT_CATEGORIES);
  }
  const linkCount = await db.links.count();
  if (linkCount === 0) {
    await db.links.bulkPut(DEFAULT_LINKS);
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
