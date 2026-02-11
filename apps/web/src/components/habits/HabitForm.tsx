'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Habit, HabitType } from '@life-quest/types';
import { useHabitStore } from '@/stores/useHabitStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Modal } from '@/components/ui/Modal';
import { ChevronRight, FolderOpen } from 'lucide-react';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

const HABIT_TYPES: { value: HabitType; label: string; desc: string }[] = [
  { value: 'YES_NO', label: 'YES/NO', desc: 'Simple completion toggle' },
  { value: 'HOURS', label: 'HOURS', desc: 'Log hours spent' },
  { value: 'MANUAL', label: 'MANUAL XP', desc: 'Enter exact XP amount' },
];

export function HabitForm({ isOpen, onClose, habit }: HabitFormProps) {
  const isEditing = !!habit;
  const [name, setName] = useState('');
  const [type, setType] = useState<HabitType>('YES_NO');
  const [xpReward, setXpReward] = useState(10);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createHabit, updateHabit } = useHabitStore();
  const { categories, fetchCategories } = useCategoryStore();

  // Sync form state when habit prop changes or form opens
  useEffect(() => {
    if (isOpen) {
      setName(habit?.name ?? '');
      setType(habit?.type ?? 'YES_NO');
      setXpReward(habit?.xpReward ?? 10);
      setCategoryId(habit?.categoryId ?? null);
      setSubCategoryId(habit?.subCategoryId ?? null);
      setError(null);
      fetchCategories();
    }
  }, [isOpen, habit, fetchCategories]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId]
  );

  const subCategories = useMemo(
    () => selectedCategory?.subCategories ?? [],
    [selectedCategory]
  );

  const selectedSubCategory = useMemo(
    () => subCategories.find((s) => s.id === subCategoryId) ?? null,
    [subCategories, subCategoryId]
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (xpReward < 1) {
      setError('XP reward must be at least 1');
      return;
    }
    setIsSubmitting(true);

    try {
      if (isEditing && habit) {
        await updateHabit(habit.id, {
          name: name.trim(),
          type,
          xpReward,
          categoryId,
          subCategoryId,
        });
        handleClose();
      } else {
        await createHabit({
          name: name.trim(),
          type,
          xpReward,
          categoryId,
          subCategoryId,
        });
        handleClose();
      }
    } catch {
      setError('Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'EDIT HABIT' : 'ADD HABIT'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="border-2 border-neonPink bg-neonPink/10 p-3 font-body text-sm text-neonPink">
            {error}
          </div>
        )}

        {/* Breadcrumb trail */}
        {(categoryId || subCategoryId) && (
          <div className="flex items-center gap-1 text-xs font-body text-zinc-400 px-1">
            <FolderOpen className="w-3 h-3" />
            {selectedCategory && (
              <>
                <span className="text-neonGreen">{selectedCategory.icon || '📁'} {selectedCategory.name}</span>
                {selectedSubCategory && (
                  <>
                    <ChevronRight className="w-3 h-3 text-zinc-600" />
                    <span className="text-neonBlue">{selectedSubCategory.name}</span>
                  </>
                )}
              </>
            )}
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-white">{name || 'New Habit'}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label
            htmlFor="habit-name"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Name
          </label>
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none focus:ring-2 focus:ring-neonGreen"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            placeholder="Morning Run 5km"
          />
        </div>

        {/* Category + SubCategory Mapping */}
        <div className="border-2 border-zinc-700 bg-zinc-950 p-4">
          <label className="mb-2 block font-heading text-[10px] uppercase tracking-wider text-neonGreen">
            Category Mapping
          </label>
          <p className="mb-3 font-body text-[11px] text-zinc-500">
            Link this habit to a category for XP auto-aggregation.
          </p>

          <div className="space-y-3">
            {/* Category Select */}
            <div>
              <label className="mb-1 block font-body text-xs text-zinc-400">Category</label>
              <select
                value={categoryId ?? ''}
                onChange={(e) => {
                  const val = e.target.value || null;
                  setCategoryId(val);
                  setSubCategoryId(null);
                }}
                className="w-full border-2 border-zinc-600 bg-zinc-900 px-3 py-2 font-body text-sm text-white focus:outline-none focus:ring-1 focus:ring-neonGreen"
              >
                <option value="">-- No Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon || '📁'} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* SubCategory Select (visible only if category is selected) */}
            {categoryId && subCategories.length > 0 && (
              <div>
                <label className="mb-1 block font-body text-xs text-zinc-400">SubCategory</label>
                <select
                  value={subCategoryId ?? ''}
                  onChange={(e) => setSubCategoryId(e.target.value || null)}
                  className="w-full border-2 border-zinc-600 bg-zinc-900 px-3 py-2 font-body text-sm text-white focus:outline-none focus:ring-1 focus:ring-neonBlue"
                >
                  <option value="">-- No SubCategory --</option>
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {categoryId && subCategories.length === 0 && (
              <p className="font-body text-[11px] text-zinc-600 italic">
                No subcategories. Add some in the Categories page.
              </p>
            )}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Type
          </label>
          <div className="flex gap-2">
            {HABIT_TYPES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`flex-1 border-2 px-3 py-3 text-center transition-all ${
                  type === opt.value
                    ? 'border-neonGreen bg-neonGreen/10 text-neonGreen'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                <span className="block font-heading text-[10px]">{opt.label}</span>
                <span className="block font-body text-[9px] mt-1 text-zinc-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* XP Reward */}
        <div>
          <label
            htmlFor="habit-xp"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            XP Reward
          </label>
          <input
            id="habit-xp"
            type="number"
            min={1}
            max={1000}
            value={xpReward}
            onChange={(e) => setXpReward(parseInt(e.target.value, 10) || 1)}
            className="w-full border-2 border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 border-2 border-white bg-zinc-800 px-4 py-3 font-body text-sm font-semibold text-white transition-all active:translate-y-[1px]"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 border-2 border-white bg-neonGreen px-4 py-3 font-body text-sm font-semibold text-black disabled:opacity-50 transition-all active:translate-y-[1px]"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
