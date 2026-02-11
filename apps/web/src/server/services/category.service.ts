import { readDb, writeDb, cuid } from '../db';
import { AppError } from '../api-utils';
import type { Category, SubCategory } from '@life-quest/types';

export interface CreateCategoryData {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string;
  color?: string;
}

export interface CreateSubCategoryData {
  name: string;
}

export async function getUserCategories(userId: string): Promise<Category[]> {
  const db = readDb();
  const cats = db.categories
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return cats.map((c) => {
    const subs = db.subCategories
      .filter((s) => s.categoryId === c.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return toCategoryResponse(c, subs);
  });
}

export async function createCategory(
  userId: string,
  data: CreateCategoryData
): Promise<Category> {
  const db = readDb();
  const userCats = db.categories.filter((c) => c.userId === userId);
  const maxOrder = userCats.length > 0 ? Math.max(...userCats.map((c) => c.sortOrder)) : -1;

  const cat = {
    id: cuid(),
    userId,
    name: data.name,
    icon: data.icon ?? null,
    color: data.color ?? null,
    sortOrder: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  db.categories.push(cat);
  writeDb(db);
  return toCategoryResponse(cat, []);
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: UpdateCategoryData
): Promise<Category> {
  const db = readDb();
  const idx = db.categories.findIndex((c) => c.id === categoryId && c.userId === userId);
  if (idx === -1) throw new AppError(404, 'Category not found');

  const cat = db.categories[idx];
  if (data.name !== undefined) cat.name = data.name;
  if (data.icon !== undefined) cat.icon = data.icon;
  if (data.color !== undefined) cat.color = data.color;
  db.categories[idx] = cat;
  writeDb(db);

  const subs = db.subCategories.filter((s) => s.categoryId === categoryId);
  return toCategoryResponse(cat, subs);
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const db = readDb();
  const cat = db.categories.find((c) => c.id === categoryId && c.userId === userId);
  if (!cat) throw new AppError(404, 'Category not found');

  db.categories = db.categories.filter((c) => c.id !== categoryId);
  db.subCategories = db.subCategories.filter((s) => s.categoryId !== categoryId);
  writeDb(db);
}

export async function reorderCategories(
  userId: string,
  categoryIds: string[]
): Promise<Category[]> {
  const db = readDb();
  categoryIds.forEach((id, index) => {
    const idx = db.categories.findIndex((c) => c.id === id && c.userId === userId);
    if (idx !== -1) {
      db.categories[idx].sortOrder = index;
    }
  });
  writeDb(db);
  return getUserCategories(userId);
}

export async function createSubCategory(
  userId: string,
  categoryId: string,
  data: CreateSubCategoryData
): Promise<SubCategory> {
  const db = readDb();
  const cat = db.categories.find((c) => c.id === categoryId && c.userId === userId);
  if (!cat) throw new AppError(404, 'Category not found');

  const existingSubs = db.subCategories.filter((s) => s.categoryId === categoryId);
  const maxOrder = existingSubs.length > 0 ? Math.max(...existingSubs.map((s) => s.sortOrder)) : -1;

  const sub = {
    id: cuid(),
    categoryId,
    name: data.name,
    sortOrder: maxOrder + 1,
  };

  db.subCategories.push(sub);
  writeDb(db);
  return sub;
}

export async function updateSubCategory(
  userId: string,
  subCategoryId: string,
  data: { name?: string }
): Promise<SubCategory> {
  const db = readDb();
  const idx = db.subCategories.findIndex((s) => s.id === subCategoryId);
  if (idx === -1) throw new AppError(404, 'Subcategory not found');

  const sub = db.subCategories[idx];
  const cat = db.categories.find((c) => c.id === sub.categoryId && c.userId === userId);
  if (!cat) throw new AppError(404, 'Subcategory not found');

  if (data.name !== undefined) sub.name = data.name;
  db.subCategories[idx] = sub;
  writeDb(db);
  return sub;
}

export async function deleteSubCategory(userId: string, subCategoryId: string): Promise<void> {
  const db = readDb();
  const sub = db.subCategories.find((s) => s.id === subCategoryId);
  if (!sub) throw new AppError(404, 'Subcategory not found');

  const cat = db.categories.find((c) => c.id === sub.categoryId && c.userId === userId);
  if (!cat) throw new AppError(404, 'Subcategory not found');

  db.subCategories = db.subCategories.filter((s) => s.id !== subCategoryId);
  writeDb(db);
}

function toCategoryResponse(
  c: { id: string; userId: string; name: string; icon: string | null; color: string | null; sortOrder: number },
  subs: { id: string; categoryId: string; name: string; sortOrder: number }[]
): Category {
  return {
    id: c.id,
    userId: c.userId,
    name: c.name,
    icon: c.icon,
    color: c.color,
    sortOrder: c.sortOrder,
    subCategories: subs.map((s) => ({
      id: s.id,
      categoryId: s.categoryId,
      name: s.name,
      sortOrder: s.sortOrder,
    })),
  };
}
