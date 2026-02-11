'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, CalendarDays, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Habit } from '@life-quest/types';
import { formatDate } from '@life-quest/utils';
import { AppShell } from '@/components/layout/AppShell';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitForm } from '@/components/habits/HabitForm';
import { useHabitStore } from '@/stores/useHabitStore';
import { useCategoryStore } from '@/stores/useCategoryStore';

// Format YYYY-MM-DD to display label
function formatDateLabel(dateStr: string): string {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  const tomorrow = formatDate(new Date(Date.now() + 86400000));
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  if (dateStr === tomorrow) return 'Tomorrow';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export default function HabitsPage() {
  const { habits, fetchHabits, isLoading } = useHabitStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchHabits(true);
    fetchCategories();
  }, [fetchHabits, fetchCategories]);

  const today = formatDate(new Date());

  // Unique categories used by habits
  const habitCategories = useMemo(() => {
    const catIds = new Set<string>();
    habits.forEach((h) => {
      if (h.categoryId) catIds.add(h.categoryId);
    });
    return categories.filter((c) => catIds.has(c.id));
  }, [habits, categories]);

  // Uncategorized count
  const uncategorizedCount = useMemo(
    () => habits.filter((h) => !h.categoryId).length,
    [habits]
  );

  // Filtered habits
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'all') return habits;
    if (selectedCategory === 'uncategorized') return habits.filter((h) => !h.categoryId);
    return habits.filter((h) => h.categoryId === selectedCategory);
  }, [habits, selectedCategory]);

  // Stats for the selected date
  const { completedCount, totalCount, xpEarnedOnDate } = useMemo(() => {
    let completed = 0;
    let xp = 0;
    for (const h of filteredHabits) {
      const comp = h.completions?.find((c) => c.date === selectedDate && c.completed);
      if (comp) {
        completed++;
        xp += comp.xpAwarded;
      }
    }
    return { completedCount: completed, totalCount: filteredHabits.length, xpEarnedOnDate: xp };
  }, [filteredHabits, selectedDate]);

  const handleEdit = useCallback((habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  }, []);

  const handleAdd = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingHabit(null);
  };

  const goToToday = () => setSelectedDate(formatDate(new Date()));
  const goPrev = () => setSelectedDate((d) => shiftDate(d, -1));
  const goNext = () => setSelectedDate((d) => shiftDate(d, 1));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-lg md:text-xl animate-text-shimmer">
            HABIT TRACKER
          </h1>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 border-[2px] px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-accent)',
              boxShadow: '6px 6px 0px 0px var(--color-border-accent)',
            }}
          >
            <Plus className="h-5 w-5" />
            Add Habit
          </button>
        </div>

        {/* ===== DATE NAVIGATION ===== */}
        <div
          className="flex items-center justify-between border-[2px] p-3 gap-2"
          style={{
            borderColor: 'var(--color-border-accent)',
            backgroundColor: 'var(--color-bg-card)',
            boxShadow: 'var(--color-shadow)',
          }}
        >
          <button
            type="button"
            onClick={goPrev}
            className="border-[2px] p-2 transition-all hover:opacity-80"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
            <div className="text-center">
              <p className="font-heading text-xs" style={{ color: 'var(--color-accent)' }}>
                {formatDateLabel(selectedDate)}
              </p>
              <p className="font-mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                {selectedDate}
              </p>
            </div>
            {selectedDate !== today && (
              <button
                type="button"
                onClick={goToToday}
                className="border px-2 py-0.5 font-body text-[10px] uppercase"
                style={{
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-accent)',
                }}
              >
                Today
              </button>
            )}
            {/* Date picker */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="border px-2 py-1 font-body text-[10px] uppercase cursor-pointer w-[90px]"
                style={{
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-bg-elevated)',
                  colorScheme: 'dark',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            className="border-[2px] p-2 transition-all hover:opacity-80"
            style={{
              borderColor: 'var(--color-border-subtle)',
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ===== CATEGORY FILTER TABS ===== */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max pb-1">
            {/* All tab */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`border-[2px] px-4 py-2 font-body text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedCategory === 'all' ? 'text-black font-bold' : ''
              }`}
              style={{
                borderColor: selectedCategory === 'all' ? 'var(--color-accent)' : 'var(--color-border-subtle)',
                backgroundColor: selectedCategory === 'all' ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                color: selectedCategory === 'all' ? '#000' : 'var(--color-text-muted)',
              }}
            >
              All ({habits.length})
            </button>

            {/* Category tabs */}
            {habitCategories.map((cat) => {
              const count = habits.filter((h) => h.categoryId === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`border-[2px] px-4 py-2 font-body text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive ? 'text-black font-bold' : ''
                  }`}
                  style={{
                    borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border-subtle)',
                    backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                    color: isActive ? '#000' : 'var(--color-text-muted)',
                  }}
                >
                  <FolderOpen className="w-3 h-3" />
                  {cat.icon || ''} {cat.name} ({count})
                </button>
              );
            })}

            {/* Uncategorized tab (if any) */}
            {uncategorizedCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategory('uncategorized')}
                className={`border-[2px] px-4 py-2 font-body text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === 'uncategorized' ? 'text-black font-bold' : ''
                }`}
                style={{
                  borderColor: selectedCategory === 'uncategorized' ? 'var(--color-accent)' : 'var(--color-border-subtle)',
                  backgroundColor: selectedCategory === 'uncategorized' ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                  color: selectedCategory === 'uncategorized' ? '#000' : 'var(--color-text-muted)',
                }}
              >
                Uncategorized ({uncategorizedCount})
              </button>
            )}
          </div>
        </div>

        {/* ===== STATS BAR ===== */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="border-[2px] p-3 text-center"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-card)',
              boxShadow: '3px 3px 0px 0px var(--color-accent-glow)',
            }}
          >
            <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Completed
            </p>
            <p className="mt-1 font-heading text-lg" style={{ color: 'var(--color-accent)' }}>
              {completedCount}/{totalCount}
            </p>
          </div>
          <div
            className="border-[2px] p-3 text-center"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-card)',
              boxShadow: '3px 3px 0px 0px var(--color-accent-glow)',
            }}
          >
            <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              XP Earned
            </p>
            <p className="mt-1 font-heading text-lg" style={{ color: 'var(--color-accent)' }}>
              +{xpEarnedOnDate}
            </p>
          </div>
          <div
            className="border-[2px] p-3 text-center"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-card)',
              boxShadow: '3px 3px 0px 0px var(--color-accent-glow)',
            }}
          >
            <p className="font-body text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Streaks Active
            </p>
            <p className="mt-1 font-heading text-lg" style={{ color: 'var(--color-accent)' }}>
              {filteredHabits.filter((h) => h.streak > 0).length}
            </p>
          </div>
        </div>

        {/* ===== COMPLETION PROGRESS ===== */}
        {totalCount > 0 && (
          <div
            className="border-[2px] p-3"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-card)',
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-body text-[10px] uppercase" style={{ color: 'var(--color-text-muted)' }}>
                {formatDateLabel(selectedDate)} Progress
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-accent)' }}>
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 w-full" style={{ backgroundColor: 'var(--color-border)' }}>
              <motion.div
                className="h-full"
                style={{ backgroundColor: 'var(--color-accent)' }}
                initial={{ width: 0 }}
                animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* ===== HABIT CARDS ===== */}
        {isLoading ? (
          <div
            className="border-[3px] p-12 text-center"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-card)',
              boxShadow: 'var(--color-shadow)',
            }}
          >
            <p className="font-body" style={{ color: 'var(--color-text-muted)' }}>Loading habits...</p>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div
            className="border-[3px] p-12 text-center"
            style={{
              borderColor: 'var(--color-border-accent)',
              backgroundColor: 'var(--color-bg-card)',
              boxShadow: 'var(--color-shadow)',
            }}
          >
            <p className="mb-4 font-body" style={{ color: 'var(--color-text-muted)' }}>
              {selectedCategory !== 'all'
                ? 'No habits in this category.'
                : 'No habits yet. Build your streak!'}
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="border-[2px] px-6 py-3 font-body text-sm font-bold text-black"
              style={{
                borderColor: 'var(--color-border-accent)',
                backgroundColor: 'var(--color-accent)',
                boxShadow: '4px 4px 0px 0px var(--color-border-accent)',
              }}
            >
              {selectedCategory !== 'all' ? 'Add a Habit' : 'Add Your First Habit'}
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredHabits.map((habit) => (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <HabitCard
                    habit={habit}
                    selectedDate={selectedDate}
                    onEdit={handleEdit}
                  />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
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
