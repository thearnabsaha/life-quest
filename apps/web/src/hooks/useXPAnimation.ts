'use client';

import { useXPAnimationStore } from '@/stores/useXPAnimationStore';

export function useXPAnimation() {
  const bursts = useXPAnimationStore((s) => s.bursts);
  const triggerXPBurst = useXPAnimationStore((s) => s.triggerXPBurst);
  const removeBurst = useXPAnimationStore((s) => s.removeBurst);

  return {
    bursts,
    triggerXPBurst,
    removeBurst,
  };
}
