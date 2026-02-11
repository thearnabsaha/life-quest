import { create } from 'zustand';
import type { Category, SubCategory } from '@life-quest/types';
import api from '@/lib/api';

export interface CreateCategoryData {
  name: string;
  icon?: string | null;
  color?: string | null;
}

export interface UpdateCategoryData {
  name?: string;
  icon?: string | null;
  color?: string | null;
}

export interface CreateSubCategoryData {
  name: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  _lastFetch: number;
  fetchCategories: (force?: boolean) => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (ids: string[]) => Promise<void>;
  createSubCategory: (categoryId: string, data: CreateSubCategoryData) => Promise<SubCategory>;
  updateSubCategory: (id: string, data: { name?: string }) => Promise<void>;
  deleteSubCategory: (id: string) => Promise<void>;
}

const STALE_MS = 10_000;

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  _lastFetch: 0,

  fetchCategories: async (force) => {
    const now = Date.now();
    const state = get();
    if (!force && state.categories.length > 0 && now - state._lastFetch < STALE_MS) return;
    if (state.isLoading) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get<Category[]>('/categories');
      set({ categories: data, isLoading: false, _lastFetch: Date.now() });
    } catch {
      set({ categories: [], isLoading: false });
    }
  },

  createCategory: async (createData: CreateCategoryData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<Category>('/categories', createData);
      set((s) => ({
        categories: [...s.categories, data],
        isLoading: false,
      }));
      return data;
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to create category');
    }
  },

  updateCategory: async (id: string, updateData: UpdateCategoryData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch<Category>(`/categories/${id}`, updateData);
      set((s) => ({
        categories: s.categories.map((c) => (c.id === id ? data : c)),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to update category');
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true });
    try {
      await api.delete(`/categories/${id}`);
      set((s) => ({
        categories: s.categories.filter((c) => c.id !== id),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to delete category');
    }
  },

  reorderCategories: async (ids: string[]) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch<Category[]>('/categories/reorder', {
        categoryIds: ids,
      });
      set({ categories: data, isLoading: false });
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to reorder categories');
    }
  },

  createSubCategory: async (categoryId: string, createData: CreateSubCategoryData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<SubCategory>(
        `/categories/${categoryId}/subcategories`,
        createData
      );
      set((s) => ({
        categories: s.categories.map((c) =>
          c.id === categoryId
            ? { ...c, subCategories: [...c.subCategories, data] }
            : c
        ),
        isLoading: false,
      }));
      return data;
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to create subcategory');
    }
  },

  updateSubCategory: async (id: string, updateData: { name?: string }) => {
    set({ isLoading: true });
    try {
      const { data } = await api.patch<SubCategory>(
        `/categories/subcategories/${id}`,
        updateData
      );
      set((s) => ({
        categories: s.categories.map((c) =>
          c.id === data.categoryId
            ? {
                ...c,
                subCategories: c.subCategories.map((sc) =>
                  sc.id === id ? data : sc
                ),
              }
            : c
        ),
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to update subcategory');
    }
  },

  deleteSubCategory: async (id: string) => {
    set({ isLoading: true });
    try {
      const cat = get().categories.find((c) =>
        c.subCategories.some((sc) => sc.id === id)
      );
      await api.delete(`/categories/subcategories/${id}`);
      set((s) => ({
        categories: cat
          ? s.categories.map((c) =>
              c.id === cat.id
                ? {
                    ...c,
                    subCategories: c.subCategories.filter((sc) => sc.id !== id),
                  }
                : c
            )
          : s.categories,
        isLoading: false,
      }));
    } catch {
      set((s) => ({ isLoading: false }));
      throw new Error('Failed to delete subcategory');
    }
  },
}));
