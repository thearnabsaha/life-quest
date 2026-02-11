import { create } from 'zustand';

export interface XPBurstItem {
  id: string;
  amount: number;
  position: { x: number; y: number };
  color?: string;
}

interface XPAnimationState {
  bursts: XPBurstItem[];
  triggerXPBurst: (
    amount: number,
    event?: MouseEvent | React.MouseEvent
  ) => void;
  removeBurst: (id: string) => void;
}

export const useXPAnimationStore = create<XPAnimationState>((set) => ({
  bursts: [],
  triggerXPBurst: (amount, event) => {
    const position = event
      ? { x: event.clientX, y: event.clientY }
      : {
          x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
          y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
        };

    const id = `xp-burst-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newBurst: XPBurstItem = { id, amount, position };
    set((s) => ({ bursts: [...s.bursts, newBurst] }));

    setTimeout(() => {
      set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) }));
    }, 1500);
  },
  removeBurst: (id) =>
    set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) })),
}));
