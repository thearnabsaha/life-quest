'use client';

import { useEffect, useRef, useState } from 'react';
import { useProfileStore } from '@/stores/useProfileStore';

interface LevelUpState {
  isLevelUp: boolean;
  newLevel: number;
  newRank: string;
}

export function useLevelUp() {
  const { profile } = useProfileStore();
  const [levelUpState, setLevelUpState] = useState<LevelUpState>({
    isLevelUp: false,
    newLevel: 1,
    newRank: 'E',
  });
  const previousLevelRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!profile) return;

    const currentLevel = profile.level;
    const currentRank = profile.rank;

    // Skip level-up detection on initial mount (first profile load)
    if (isInitialMount.current) {
      previousLevelRef.current = currentLevel;
      isInitialMount.current = false;
      return;
    }

    const prevLevel = previousLevelRef.current;
    if (prevLevel !== null && currentLevel > prevLevel) {
      setLevelUpState({
        isLevelUp: true,
        newLevel: currentLevel,
        newRank: currentRank,
      });
    }
    previousLevelRef.current = currentLevel;
  }, [profile?.level, profile?.rank, profile]);

  const dismissLevelUp = () => {
    setLevelUpState((prev) => ({ ...prev, isLevelUp: false }));
  };

  return {
    isLevelUp: levelUpState.isLevelUp,
    newLevel: levelUpState.newLevel,
    newRank: levelUpState.newRank,
    dismissLevelUp,
  };
}
