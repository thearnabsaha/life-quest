'use client';

import { useXPAnimation } from '@/hooks/useXPAnimation';
import { useLevelUp } from '@/hooks/useLevelUp';
import { LevelUpOverlay } from './LevelUpOverlay';
import { XPBurstAnimation } from './XPBurstAnimation';

/**
 * Wrapper component that renders all active game effects (XP bursts, level up overlay).
 * Place this in the root layout or AppShell.
 */
export function GameEffects() {
  const { bursts, removeBurst } = useXPAnimation();
  const { isLevelUp, newLevel, newRank, dismissLevelUp } = useLevelUp();

  const hasEffects = bursts.length > 0 || isLevelUp;

  if (!hasEffects) {
    return null;
  }

  return (
    <>
      {bursts.map((burst) => (
        <XPBurstAnimation
          key={burst.id}
          amount={burst.amount}
          position={burst.position}
          color={burst.color}
          onComplete={() => removeBurst(burst.id)}
        />
      ))}
      <LevelUpOverlay
        newLevel={newLevel}
        newRank={newRank}
        onDismiss={dismissLevelUp}
        isVisible={isLevelUp}
      />
    </>
  );
}
