'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Category } from '@life-quest/types';
import { AppShell } from '@/components/layout/AppShell';
import { CategoryList } from '@/components/categories/CategoryList';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { useCategoryStore } from '@/stores/useCategoryStore';

export default function CategoriesPage() {
  const { categories, fetchCategories, isLoading } = useCategoryStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-xl text-white md:text-2xl">
            LIFE CATEGORIES
          </h1>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-[#2dd610] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{ boxShadow: '6px 6px 0px 0px #fff' }}
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>

        {isLoading ? (
          <div
            className="border-[3px] border-white bg-zinc-900 p-12 text-center"
            style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
          >
            <p className="font-body text-zinc-400">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div
            className="border-[3px] border-white bg-zinc-900 p-12 text-center"
            style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
          >
            <p className="mb-4 font-body text-zinc-400">
              No categories yet. Organize your life!
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold text-black"
              style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            >
              Add Your First Category
            </button>
          </div>
        ) : (
          <CategoryList categories={categories} onEdit={handleEdit} />
        )}
      </div>

      <CategoryForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        category={editingCategory}
      />
    </AppShell>
  );
}
