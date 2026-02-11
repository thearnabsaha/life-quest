'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import {
  ProfileCard,
  StatsOverview,
} from '@/components/profile';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useHabitStore } from '@/stores/useHabitStore';
import type { Profile } from '@life-quest/types';
import { Save } from 'lucide-react';

function getCurrentStreak(
  profile: Profile | null,
  habits: { streak: number }[]
): number {
  if (!habits.length) return 0;
  return Math.max(0, ...habits.map((h) => h.streak));
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const {
    profile,
    fetchProfile,
    updateProfile,
    isLoading,
  } = useProfileStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { habits, fetchHabits } = useHabitStore();

  const [displayName, setDisplayName] = useState('');
  const [overrideLevel, setOverrideLevel] = useState<string>('');
  const [overrideXP, setOverrideXP] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    fetchProfile();
    fetchCategories();
    fetchHabits();
  }, [user, isInitialized, router, fetchProfile, fetchCategories, fetchHabits]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setOverrideLevel(
        profile.manualLevelOverride != null
          ? String(profile.manualLevelOverride)
          : ''
      );
      setOverrideXP(
        profile.manualXPOverride != null
          ? String(profile.manualXPOverride)
          : ''
      );
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        manualLevelOverride:
          overrideLevel.trim() !== ''
            ? parseInt(overrideLevel, 10) || null
            : null,
        manualXPOverride:
          overrideXP.trim() !== ''
            ? parseInt(overrideXP, 10) || null
            : null,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      // Error handled in store
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || !user) {
    return null;
  }

  const activeHabits = habits.filter((h) => h.isActive);
  const currentStreak = getCurrentStreak(profile, habits);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Profile Card */}
        {profile ? (
          <ProfileCard profile={profile} />
        ) : (
          <div className="border-2 border-white bg-zinc-900 p-8 text-center">
            <p className="font-body text-zinc-400">
              {isLoading ? 'Loading profile...' : 'No profile found'}
            </p>
          </div>
        )}

        {/* Editable form */}
        <div className="border-2 border-white bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
          <h2 className="font-heading text-sm text-neonGreen mb-6">
            EDIT PROFILE
          </h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label
                htmlFor="displayName"
                className="mb-2 block font-body text-sm font-medium text-white uppercase tracking-wider"
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border-2 border-white bg-zinc-900 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonGreen"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="mb-2 block font-body text-sm font-medium text-white uppercase tracking-wider"
              >
                Title (computed from level)
              </label>
              <input
                id="title"
                type="text"
                value={profile?.title ?? ''}
                readOnly
                className="w-full border-2 border-zinc-700 bg-zinc-950 px-4 py-3 font-body text-zinc-400 cursor-not-allowed"
              />
              <p className="mt-1 font-body text-xs text-zinc-500">
                Title is automatically derived from your level/rank
              </p>
            </div>

            {/* Manual override section */}
            <div className="border-2 border-neonYellow/50 bg-zinc-950 p-4">
              <h3 className="font-heading text-xs text-neonYellow mb-4">
                MANUAL OVERRIDE
              </h3>
              <p className="font-body text-xs text-zinc-500 mb-4">
                Override your level/XP for testing. Leave blank to use
                calculated values.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="overrideLevel"
                    className="mb-2 block font-body text-xs text-zinc-400"
                  >
                    Override Level
                  </label>
                  <input
                    id="overrideLevel"
                    type="number"
                    min={1}
                    value={overrideLevel}
                    onChange={(e) => setOverrideLevel(e.target.value)}
                    className="w-full border-2 border-white bg-zinc-900 px-4 py-2 font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonYellow"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="overrideXP"
                    className="mb-2 block font-body text-xs text-zinc-400"
                  >
                    Override XP
                  </label>
                  <input
                    id="overrideXP"
                    type="number"
                    min={0}
                    value={overrideXP}
                    onChange={(e) => setOverrideXP(e.target.value)}
                    className="w-full border-2 border-white bg-zinc-900 px-4 py-2 font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonYellow"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 border-4 border-neonGreen bg-neonGreen px-6 py-4 font-heading text-sm text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              <Save className="w-4 h-4" strokeWidth={2} />
              {saving ? 'SAVING...' : 'SAVE'}
            </button>

            {saveSuccess && (
              <p className="font-body text-sm text-neonGreen">
                Profile saved successfully!
              </p>
            )}
          </form>
        </div>

        {/* Stats overview */}
        {profile && (
          <div className="border-2 border-white bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
            <h2 className="font-heading text-sm text-neonBlue mb-4">
              STATS OVERVIEW
            </h2>
            <StatsOverview
              totalXP={profile.totalXP}
              level={profile.level}
              rank={profile.rank}
              habitsActive={activeHabits.length}
              categoriesCount={categories.length}
              currentStreak={currentStreak}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
