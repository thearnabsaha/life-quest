'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Habit } from '@life-quest/types';
import { formatDate } from '@life-quest/utils';
import { AppShell } from '@/components/layout/AppShell';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitForm } from '@/components/habits/HabitForm';
import { useHabitStore } from '@/stores/useHabitStore';

export default function HabitsPage() {
  const { habits, fetchHabits, isLoading } = useHabitStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const today = formatDate(new Date());

  const { totalHabits, activeStreaks, xpEarnedToday } = useMemo(() => {
    let xpToday = 0;
    let streaks = 0;
    for (const h of habits) {
      if (h.streak > 0) streaks++;
      const todayComp = h.completions?.find((c) => c.date === today && c.completed);
      if (todayComp?.xpAwarded) xpToday += todayComp.xpAwarded;
    }
    return {
      totalHabits: habits.length,
      activeStreaks: streaks,
      xpEarnedToday: xpToday,
    };
  }, [habits, today]);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingHabit(null);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-xl text-white md:text-2xl">
            HABIT TRACKER
          </h1>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-[#2dd610] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{ boxShadow: '6px 6px 0px 0px #fff' }}
          >
            <Plus className="h-5 w-5" />
            Add Habit
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            className="border-[3px] border-white bg-zinc-900 p-4"
            style={{ boxShadow: '4px 4px 0px 0px #39ff14' }}
          >
            <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
              Total Habits
            </p>
            <p className="mt-1 font-heading text-2xl text-neonGreen">
              {totalHabits}
            </p>
          </div>
          <div
            className="border-[3px] border-white bg-zinc-900 p-4"
            style={{ boxShadow: '4px 4px 0px 0px #ffe600' }}
          >
            <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
              Active Streaks
            </p>
            <p className="mt-1 font-heading text-2xl text-neonYellow">
              {activeStreaks}
            </p>
          </div>
          <div
            className="border-[3px] border-white bg-zinc-900 p-4"
            style={{ boxShadow: '4px 4px 0px 0px #00d4ff' }}
          >
            <p className="font-body text-xs uppercase tracking-wider text-zinc-400">
              XP Earned Today
            </p>
            <p className="mt-1 font-heading text-2xl text-neonBlue">
              +{xpEarnedToday}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div
            className="border-[3px] border-white bg-zinc-900 p-12 text-center"
            style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
          >
            <p className="font-body text-zinc-400">Loading habits...</p>
          </div>
        ) : habits.length === 0 ? (
          <div
            className="border-[3px] border-white bg-zinc-900 p-12 text-center"
            style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
          >
            <p className="mb-4 font-body text-zinc-400">
              No habits yet. Build your streak!
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold text-black"
              style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {habits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      <HabitForm
        isOpen={formOpen}
        onClose={handleCloseForm}
        habit={editingHabit}
      />
    </AppShell>
  );
}
