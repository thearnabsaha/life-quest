'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { Goal } from '@life-quest/types';
import { AppShell } from '@/components/layout/AppShell';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalForm } from '@/components/goals/GoalForm';
import { useGoalStore } from '@/stores/useGoalStore';
import { useCategoryStore } from '@/stores/useCategoryStore';

export default function GoalsPage() {
  const { goals, fetchGoals, isLoading } = useGoalStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    fetchGoals();
    fetchCategories();
  }, [fetchGoals, fetchCategories]);

  const { longTermGoals, shortTermGoals } = useMemo(() => {
    const long: Goal[] = [];
    const short: Goal[] = [];
    for (const g of goals) {
      if (g.type === 'LONG_TERM') long.push(g);
      else short.push(g);
    }
    return { longTermGoals: long, shortTermGoals: short };
  }, [goals]);

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.name ?? null;
  };

  const handleAdd = () => {
    setEditingGoal(null);
    setFormOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingGoal(null);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-heading text-xl text-white md:text-2xl">CHALLENGES</h1>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-2 border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-[#2dd610] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            style={{ boxShadow: '6px 6px 0px 0px #fff' }}
          >
            <Plus className="h-5 w-5" />
            Add Challenge
          </button>
        </div>

        {isLoading ? (
          <div
            className="border-[3px] border-white bg-zinc-900 p-12 text-center"
            style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
          >
            <p className="font-body text-zinc-400">Loading challenges...</p>
          </div>
        ) : goals.length === 0 ? (
          <div
            className="border-[3px] border-white bg-zinc-900 p-12 text-center"
            style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
          >
            <p className="mb-4 font-body text-zinc-400">
              No challenges yet. Set your quests and track progress!
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="border-[2px] border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold text-black"
              style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            >
              Add Your First Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div
              className="border-[3px] border-white bg-zinc-900 p-6"
              style={{ boxShadow: '6px 6px 0px 0px #ffe600' }}
            >
              <h2 className="mb-4 font-heading text-sm text-neonYellow">
                LONG-TERM CHALLENGES
              </h2>
              <div className="space-y-4">
                {longTermGoals.length === 0 ? (
                  <p className="font-body text-sm text-zinc-500">
                    No long-term challenges yet.
                  </p>
                ) : (
                  longTermGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      categoryName={getCategoryName(goal.categoryId)}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </div>

            <div
              className="border-[3px] border-white bg-zinc-900 p-6"
              style={{ boxShadow: '6px 6px 0px 0px #00d4ff' }}
            >
              <h2 className="mb-4 font-heading text-sm text-neonBlue">
                SHORT-TERM CHALLENGES
              </h2>
              <div className="space-y-4">
                {shortTermGoals.length === 0 ? (
                  <p className="font-body text-sm text-zinc-500">
                    No short-term challenges yet.
                  </p>
                ) : (
                  shortTermGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      categoryName={getCategoryName(goal.categoryId)}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <GoalForm isOpen={formOpen} onClose={handleCloseForm} goal={editingGoal} />
    </AppShell>
  );
}
