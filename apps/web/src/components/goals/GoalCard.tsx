'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Goal } from '@life-quest/types';
import { useGoalStore } from '@/stores/useGoalStore';

interface GoalCardProps {
  goal: Goal;
  categoryName?: string | null;
  onEdit: (goal: Goal) => void;
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null;
  try {
    const d = new Date(deadline);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return deadline;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; shadow: string }> = {
    ACTIVE: { bg: 'border-neonBlue text-neonBlue', shadow: '3px 3px 0px 0px #00d4ff' },
    COMPLETED: { bg: 'border-neonGreen text-neonGreen', shadow: '3px 3px 0px 0px #39ff14' },
    FAILED: { bg: 'border-neonPink text-neonPink', shadow: '3px 3px 0px 0px #ff2d95' },
  };
  const s = styles[status] ?? styles.ACTIVE;
  return (
    <span
      className={`border-[2px] px-2 py-0.5 font-mono text-xs ${s.bg}`}
      style={{ boxShadow: s.shadow }}
    >
      {status}
    </span>
  );
}

export function GoalCard({ goal, categoryName, onEdit }: GoalCardProps) {
  const [progressInput, setProgressInput] = useState('');
  const [showProgressInput, setShowProgressInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { updateProgress, deleteGoal } = useGoalStore();

  const progressPercent =
    goal.targetValue > 0 ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0;
  const deadlineFormatted = formatDeadline(goal.deadline);

  const handleUpdateProgress = async () => {
    const increment = parseInt(progressInput, 10);
    if (isNaN(increment) || increment <= 0) return;
    try {
      await updateProgress(goal.id, increment);
      setProgressInput('');
      setShowProgressInput(false);
    } catch {
      // Error handling
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal(goal.id);
      setShowDeleteConfirm(false);
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className="border-[3px] border-white bg-zinc-900 p-5"
      style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-body text-base font-semibold text-white">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 font-body text-sm text-zinc-400">{goal.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={goal.status} />
            <span className="font-body text-xs text-neonGreen">+{goal.xpReward} XP</span>
            {categoryName && (
              <span
                className="border-[2px] border-zinc-600 px-2 py-0.5 font-mono text-xs text-zinc-400"
                style={{ boxShadow: '2px 2px 0px 0px #333' }}
              >
                {categoryName}
              </span>
            )}
            {deadlineFormatted && (
              <span className="font-body text-xs text-zinc-500">
                Due: {deadlineFormatted}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="border-[2px] border-white bg-zinc-800 p-2 text-white transition-all hover:bg-zinc-700"
            style={{ boxShadow: '3px 3px 0px 0px #00d4ff' }}
            aria-label="Edit challenge"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-[2px] border-white bg-zinc-800 p-2 text-neonPink transition-all hover:bg-zinc-700"
            style={{ boxShadow: '3px 3px 0px 0px #ff2d95' }}
            aria-label="Delete challenge"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between font-body text-xs text-zinc-400">
          <span>
            {goal.currentValue} / {goal.targetValue}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div
          className="h-4 w-full border-[2px] border-white bg-zinc-950"
          style={{ boxShadow: '3px 3px 0px 0px #fff' }}
        >
          <div
            className="h-full bg-neonGreen transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {goal.status === 'ACTIVE' && (
        <div className="flex gap-2">
          {showProgressInput ? (
            <>
              <input
                type="number"
                min="1"
                step="1"
                value={progressInput}
                onChange={(e) => setProgressInput(e.target.value)}
                placeholder="Increment"
                className="flex-1 border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none"
                style={{ boxShadow: '3px 3px 0px 0px #fff' }}
              />
              <button
                type="button"
                onClick={handleUpdateProgress}
                disabled={!progressInput || parseInt(progressInput, 10) <= 0}
                className="border-[2px] border-white bg-neonGreen px-4 py-3 font-body text-sm font-bold text-black disabled:opacity-50"
                style={{ boxShadow: '4px 4px 0px 0px #fff' }}
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProgressInput(false);
                  setProgressInput('');
                }}
                className="border-[2px] border-white bg-zinc-800 px-4 py-3 font-body text-sm font-semibold text-white"
                style={{ boxShadow: '3px 3px 0px 0px #fff' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowProgressInput(true)}
              className="w-full border-[2px] border-white bg-zinc-800 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-zinc-700"
              style={{ boxShadow: '4px 4px 0px 0px #39ff14' }}
            >
              Update Progress
            </button>
          )}
        </div>
      )}

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
              Delete &quot;{goal.title}&quot;? Progress will be lost.
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
