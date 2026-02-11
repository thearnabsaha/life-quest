'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@life-quest/types';
import { useCategoryStore } from '@/stores/useCategoryStore';

interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
}

const NEON_COLORS: Record<string, string> = {
  neonGreen: '#39ff14',
  neonPink: '#ff2d95',
  neonBlue: '#00d4ff',
  neonYellow: '#ffe600',
  neonPurple: '#bf00ff',
};

const DEFAULT_SHADOW = '#39ff14';

export function CategoryCard({ category, onEdit }: CategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteCategory = useCategoryStore((s) => s.deleteCategory);

  const shadowColor =
    category.color && NEON_COLORS[category.color]
      ? NEON_COLORS[category.color]
      : category.color || DEFAULT_SHADOW;

  const borderColor =
    category.color && NEON_COLORS[category.color]
      ? NEON_COLORS[category.color]
      : category.color || '#39ff14';

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id);
      setShowDeleteConfirm(false);
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="border-[3px] border-white bg-zinc-900 p-5 transition-all"
        style={{
          borderLeftWidth: '6px',
          borderLeftColor: borderColor,
          boxShadow: `6px 6px 0px 0px ${shadowColor}`,
        }}
      >
        <div
          className="flex cursor-pointer items-center justify-between"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl" role="img" aria-hidden>
              {category.icon || '📁'}
            </span>
            <div>
              <h3 className="font-body text-base font-semibold text-white">
                {category.name}
              </h3>
              <p className="font-body text-xs text-zinc-400">
                {category.subCategories?.length ?? 0} subcategories
              </p>
            </div>
          </div>
          <div
            className="flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="border-[2px] border-white bg-zinc-800 p-2 text-white transition-all hover:bg-zinc-700"
              style={{ boxShadow: '3px 3px 0px 0px #00d4ff' }}
              aria-label="Edit category"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-[2px] border-white bg-zinc-800 p-2 text-neonPink transition-all hover:bg-zinc-700"
              style={{ boxShadow: '3px 3px 0px 0px #ff2d95' }}
              aria-label="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {expanded && category.subCategories?.length > 0 && (
          <div className="mt-4 border-t-2 border-zinc-700 pt-4">
            <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Subcategories
            </p>
            <ul
              className="max-h-48 space-y-2 overflow-y-auto"
              style={{ scrollbarGutter: 'stable' }}
            >
              {category.subCategories.map((sub) => (
                <li
                  key={sub.id}
                  className="border-l-2 border-zinc-600 bg-zinc-950 px-3 py-2 font-body text-sm text-white"
                  style={{ borderLeftColor: borderColor }}
                >
                  {sub.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm border-[3px] border-white bg-zinc-900 p-6"
            style={{ boxShadow: '8px 8px 0px 0px #ff2d95' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-6 font-body text-sm text-white">
              Delete &quot;{category.name}&quot;? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-[2px] border-white bg-zinc-800 px-4 py-2 font-body text-sm font-semibold text-white"
                style={{ boxShadow: '3px 3px 0px 0px #fff' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 border-[2px] border-white bg-neonPink px-4 py-2 font-body text-sm font-semibold text-black"
                style={{ boxShadow: '3px 3px 0px 0px #fff' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
