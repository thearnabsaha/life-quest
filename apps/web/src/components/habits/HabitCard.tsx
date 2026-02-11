'use client';

import { useState, useMemo } from 'react';
import { Pencil, Trash2, Check, ChevronRight, FolderOpen } from 'lucide-react';
import type { Habit } from '@life-quest/types';
import { formatDate } from '@life-quest/utils';
import { useHabitStore } from '@/stores/useHabitStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { StreakCounter } from './StreakCounter';

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const [hoursInput, setHoursInput] = useState('');
  const [manualXpInput, setManualXpInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { completeHabit, deleteHabit } = useHabitStore();
  const { categories } = useCategoryStore();

  const breadcrumb = useMemo(() => {
    if (!habit.categoryId) return null;
    const cat = categories.find((c) => c.id === habit.categoryId);
    if (!cat) return null;
    const sub = habit.subCategoryId
      ? cat.subCategories?.find((s) => s.id === habit.subCategoryId)
      : null;
    return { category: cat, subCategory: sub };
  }, [habit.categoryId, habit.subCategoryId, categories]);

  const today = formatDate(new Date());
  const completedToday = habit.completions?.some(
    (c) => c.date === today && c.completed
  );
  const todayCompletion = habit.completions?.find(
    (c) => c.date === today && c.completed
  );

  const handleCompleteYesNo = async () => {
    if (completedToday) return;
    try {
      await completeHabit(habit.id, today);
    } catch {
      // Error handling
    }
  };

  const handleCompleteHours = async () => {
    const hours = parseFloat(hoursInput);
    if (isNaN(hours) || hours <= 0) return;
    try {
      await completeHabit(habit.id, today, hours);
      setHoursInput('');
    } catch {
      // Error handling
    }
  };

  const handleCompleteManual = async () => {
    const xp = parseInt(manualXpInput, 10);
    if (isNaN(xp) || xp <= 0) return;
    try {
      await completeHabit(habit.id, today, xp);
      setManualXpInput('');
    } catch {
      // Error handling
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHabit(habit.id);
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
          <h3 className="font-body text-base font-semibold text-white">
            {habit.name}
          </h3>
          <div className="mt-1 flex items-center gap-3">
            <span
              className="border-[2px] border-zinc-600 px-2 py-0.5 font-mono text-xs text-zinc-400"
              style={{ boxShadow: '2px 2px 0px 0px #333' }}
            >
              {habit.type === 'YES_NO' ? 'YES/NO' : habit.type === 'HOURS' ? 'HOURS' : 'MANUAL'}
            </span>
            <span className="font-body text-xs text-neonGreen">
              +{habit.xpReward} XP
            </span>
          </div>
          {breadcrumb && (
            <div className="mt-2 flex items-center gap-1 text-[10px] font-body">
              <FolderOpen className="w-3 h-3 text-zinc-500" />
              <span className="text-neonGreen">{breadcrumb.category.icon || '📁'} {breadcrumb.category.name}</span>
              {breadcrumb.subCategory && (
                <>
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span className="text-neonBlue">{breadcrumb.subCategory.name}</span>
                </>
              )}
              <ChevronRight className="w-3 h-3 text-zinc-600" />
              <span className="text-zinc-400">{habit.name}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(habit)}
            className="border-[2px] border-white bg-zinc-800 p-2 text-white transition-all hover:bg-zinc-700"
            style={{ boxShadow: '3px 3px 0px 0px #00d4ff' }}
            aria-label="Edit habit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-[2px] border-white bg-zinc-800 p-2 text-neonPink transition-all hover:bg-zinc-700"
            style={{ boxShadow: '3px 3px 0px 0px #ff2d95' }}
            aria-label="Delete habit"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <StreakCounter count={habit.streak} />
      </div>

      {habit.type === 'YES_NO' ? (
        <button
          type="button"
          onClick={handleCompleteYesNo}
          disabled={completedToday}
          className={`flex w-full items-center justify-center gap-2 border-[2px] border-white py-4 font-body text-sm font-bold uppercase tracking-wider transition-all ${
            completedToday
              ? 'bg-neonGreen text-black'
              : 'bg-zinc-800 text-white hover:bg-zinc-700'
          }`}
          style={{
            boxShadow: completedToday
              ? '4px 4px 0px 0px #fff'
              : '4px 4px 0px 0px #39ff14',
          }}
        >
          {completedToday ? (
            <>
              <Check className="h-5 w-5" />
              Done
            </>
          ) : (
            'Complete'
          )}
        </button>
      ) : habit.type === 'MANUAL' ? (
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            step="1"
            value={manualXpInput}
            onChange={(e) => setManualXpInput(e.target.value)}
            placeholder="XP amount"
            className="flex-1 border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none"
            style={{ boxShadow: '3px 3px 0px 0px #fff' }}
          />
          <button
            type="button"
            onClick={handleCompleteManual}
            disabled={
              !manualXpInput ||
              parseInt(manualXpInput, 10) <= 0 ||
              (completedToday && todayCompletion?.hoursLogged != null)
            }
            className="border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold text-black disabled:opacity-50"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            LOG XP
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="0.5"
            max="24"
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value)}
            placeholder="Hours"
            className="flex-1 border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none"
            style={{ boxShadow: '3px 3px 0px 0px #fff' }}
          />
          <button
            type="button"
            onClick={handleCompleteHours}
            disabled={
              !hoursInput ||
              parseFloat(hoursInput) <= 0 ||
              (completedToday && todayCompletion?.hoursLogged != null)
            }
            className="border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold text-black disabled:opacity-50"
            style={{ boxShadow: '4px 4px 0px 0px #fff' }}
          >
            Log
          </button>
        </div>
      )}

      {completedToday && habit.type === 'HOURS' && todayCompletion?.hoursLogged != null && (
        <p className="mt-2 font-body text-xs text-zinc-400">
          Logged {todayCompletion.hoursLogged} hrs today
        </p>
      )}

      {completedToday && habit.type === 'MANUAL' && todayCompletion?.hoursLogged != null && (
        <p className="mt-2 font-body text-xs text-zinc-400">
          Logged {todayCompletion.hoursLogged} XP today
        </p>
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
              Delete &quot;{habit.name}&quot;? Progress will be lost.
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
