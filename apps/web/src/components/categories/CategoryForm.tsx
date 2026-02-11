'use client';

import { useState, useCallback } from 'react';
import type { Category, SubCategory } from '@life-quest/types';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Modal } from '@/components/ui/Modal';
import type { CreateCategoryData } from '@/stores/useCategoryStore';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
}

const NEON_PRESETS = [
  { name: 'neonGreen', hex: '#39ff14', label: 'Green' },
  { name: 'neonPink', hex: '#ff2d95', label: 'Pink' },
  { name: 'neonBlue', hex: '#00d4ff', label: 'Blue' },
  { name: 'neonYellow', hex: '#ffe600', label: 'Yellow' },
  { name: 'neonPurple', hex: '#bf00ff', label: 'Purple' },
] as const;

const EMOJI_PRESETS = ['📁', '💼', '🏃', '📚', '🎯', '💪', '🧠', '❤️', '🎨', '💰'];

export function CategoryForm({
  isOpen,
  onClose,
  category,
}: CategoryFormProps) {
  const isEditing = !!category;
  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? '📁');
  const [color, setColor] = useState(category?.color ?? 'neonGreen');
  const [subcategories, setSubcategories] = useState<SubCategory[]>(
    category?.subCategories ?? []
  );
  const [newSubName, setNewSubName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    createCategory,
    updateCategory,
    createSubCategory,
    deleteSubCategory,
  } = useCategoryStore();

  const reset = useCallback(() => {
    setName(category?.name ?? '');
    setIcon(category?.icon ?? '📁');
    setColor(category?.color ?? 'neonGreen');
    setSubcategories(category?.subCategories ?? []);
    setNewSubName('');
    setError(null);
  }, [category]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleAddSubcategory = async () => {
    if (!newSubName.trim()) return;
    if (isEditing && category) {
      try {
        const created = await createSubCategory(category.id, {
          name: newSubName.trim(),
        });
        setSubcategories((prev) => [...prev, created]);
        setNewSubName('');
      } catch {
        setError('Failed to add subcategory');
      }
    } else {
      setSubcategories((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          categoryId: '',
          name: newSubName.trim(),
          sortOrder: prev.length,
        },
      ]);
      setNewSubName('');
    }
  };

  const handleRemoveSubcategory = async (sub: SubCategory) => {
    if (sub.id.startsWith('temp-')) {
      setSubcategories((prev) => prev.filter((s) => s.id !== sub.id));
    } else {
      try {
        await deleteSubCategory(sub.id);
        setSubcategories((prev) => prev.filter((s) => s.id !== sub.id));
      } catch {
        setError('Failed to remove subcategory');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setIsSubmitting(true);

    try {
      if (isEditing && category) {
        await updateCategory(category.id, { name: name.trim(), icon, color });
        handleClose();
      } else {
        const created = await createCategory({
          name: name.trim(),
          icon: icon || null,
          color: color || null,
        } as CreateCategoryData);
        for (const sub of subcategories) {
          if (sub.id.startsWith('temp-')) {
            await createSubCategory(created.id, { name: sub.name });
          }
        }
        handleClose();
      }
    } catch {
      setError('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'EDIT CATEGORY' : 'ADD CATEGORY'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className="border-2 border-neonPink bg-neonPink/10 p-3 font-body text-sm text-neonPink"
            style={{ boxShadow: '3px 3px 0px 0px #ff2d95' }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none focus:ring-2 focus:ring-neonGreen"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            placeholder="Category name"
          />
        </div>

        <div>
          <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Icon (emoji)
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`border-[2px] border-white px-3 py-2 text-xl transition-all ${
                  icon === emoji
                    ? 'bg-neonGreen text-black'
                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                }`}
                style={{
                  boxShadow:
                    icon === emoji
                      ? '3px 3px 0px 0px #fff'
                      : '3px 3px 0px 0px #666',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="mt-2 w-full max-w-[100px] border-[2px] border-white bg-zinc-950 px-3 py-2 font-body text-lg focus:outline-none"
            style={{ boxShadow: '3px 3px 0px 0px #fff' }}
            maxLength={4}
          />
        </div>

        <div>
          <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {NEON_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setColor(preset.name)}
                className={`h-10 w-10 border-[2px] transition-all ${
                  color === preset.name ? 'border-white' : 'border-zinc-600'
                }`}
                style={{
                  backgroundColor: preset.hex,
                  boxShadow:
                    color === preset.name
                      ? `4px 4px 0px 0px #fff`
                      : `3px 3px 0px 0px ${preset.hex}`,
                }}
                aria-label={preset.label}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Subcategories
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubcategory();
                }
              }}
              className="flex-1 border-[2px] border-white bg-zinc-950 px-4 py-2 font-body text-white focus:outline-none"
              style={{ boxShadow: '3px 3px 0px 0px #fff' }}
              placeholder="Add subcategory..."
            />
            <button
              type="button"
              onClick={handleAddSubcategory}
              className="border-[2px] border-white bg-neonBlue px-4 py-2 font-body text-sm font-semibold text-black"
              style={{ boxShadow: '3px 3px 0px 0px #fff' }}
            >
              Add
            </button>
          </div>
          {subcategories.length > 0 && (
            <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
              {subcategories.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between border-l-4 border-neonGreen bg-zinc-950 px-3 py-2"
                  style={{ boxShadow: '2px 2px 0px 0px #333' }}
                >
                  <span className="font-body text-sm text-white">{sub.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubcategory(sub)}
                    className="border-[2px] border-neonPink bg-zinc-900 px-2 py-1 font-body text-xs text-neonPink"
                    style={{ boxShadow: '2px 2px 0px 0px #ff2d95' }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 border-[2px] border-white bg-zinc-800 px-4 py-3 font-body text-sm font-semibold text-white"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 border-[2px] border-white bg-neonGreen px-4 py-3 font-body text-sm font-semibold text-black disabled:opacity-50"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
