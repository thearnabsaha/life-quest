'use client';

import { useState, useCallback } from 'react';
import type { Goal, GoalType } from '@life-quest/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Modal } from '@/components/ui/Modal';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
}

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'LONG_TERM', label: 'LONG-TERM' },
  { value: 'SHORT_TERM', label: 'SHORT-TERM' },
];

function toDateInputValue(iso: string | null): string {
  if (!iso) return '';
  try {
    return iso.split('T')[0];
  } catch {
    return '';
  }
}

export function GoalForm({ isOpen, onClose, goal }: GoalFormProps) {
  const isEditing = !!goal;
  const [title, setTitle] = useState(goal?.title ?? '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [type, setType] = useState<GoalType>(goal?.type ?? 'SHORT_TERM');
  const [targetValue, setTargetValue] = useState(goal?.targetValue ?? 1);
  const [xpReward, setXpReward] = useState(goal?.xpReward ?? 0);
  const [categoryId, setCategoryId] = useState(goal?.categoryId ?? '');
  const [deadline, setDeadline] = useState(toDateInputValue(goal?.deadline ?? null));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createGoal, updateGoal } = useGoalStore();
  const { categories } = useCategoryStore();

  const reset = useCallback(() => {
    setTitle(goal?.title ?? '');
    setDescription(goal?.description ?? '');
    setType(goal?.type ?? 'SHORT_TERM');
    setTargetValue(goal?.targetValue ?? 1);
    setXpReward(goal?.xpReward ?? 0);
    setCategoryId(goal?.categoryId ?? '');
    setDeadline(toDateInputValue(goal?.deadline ?? null));
    setError(null);
  }, [goal]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (targetValue < 0) {
      setError('Target value must be non-negative');
      return;
    }
    if (xpReward < 0) {
      setError('XP reward must be non-negative');
      return;
    }
    setIsSubmitting(true);

    try {
      if (isEditing && goal) {
        await updateGoal(goal.id, {
          title: title.trim(),
          description: description.trim() || null,
          type,
          targetValue,
          xpReward,
          categoryId: categoryId || null,
          deadline: deadline ? `${deadline}T23:59:59.999Z` : null,
        });
        handleClose();
      } else {
        await createGoal({
          title: title.trim(),
          description: description.trim() || null,
          type,
          targetValue,
          xpReward,
          categoryId: categoryId || null,
          deadline: deadline ? `${deadline}T23:59:59.999Z` : null,
        });
        handleClose();
      }
    } catch {
      setError('Failed to save challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'EDIT CHALLENGE' : 'ADD CHALLENGE'}
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
            htmlFor="goal-title"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Title
          </label>
          <input
            id="goal-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none focus:ring-2 focus:ring-neonGreen"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            placeholder="Goal title"
          />
        </div>

        <div>
          <label
            htmlFor="goal-description"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Description (optional)
          </label>
          <textarea
            id="goal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            placeholder="Brief description"
          />
        </div>

        <div>
          <label
            htmlFor="goal-type"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Type
          </label>
          <select
            id="goal-type"
            value={type}
            onChange={(e) => setType(e.target.value as GoalType)}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            {GOAL_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="goal-target"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Target Value
          </label>
          <input
            id="goal-target"
            type="number"
            min={0}
            value={targetValue}
            onChange={(e) => setTargetValue(parseInt(e.target.value, 10) || 0)}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          />
        </div>

        <div>
          <label
            htmlFor="goal-xp"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            XP Reward
          </label>
          <input
            id="goal-xp"
            type="number"
            min={0}
            value={xpReward}
            onChange={(e) => setXpReward(parseInt(e.target.value, 10) || 0)}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          />
        </div>

        <div>
          <label
            htmlFor="goal-category"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Category (optional)
          </label>
          <select
            id="goal-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="goal-deadline"
            className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
          >
            Deadline (optional)
          </label>
          <input
            id="goal-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          />
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
