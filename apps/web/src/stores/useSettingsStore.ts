import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  // Theme
  themeId: string;

  // Audio
  sfxEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;

  // Animations
  animationsEnabled: boolean;

  // Game
  autoXP: boolean;

  // Actions
  setTheme: (id: string) => void;
  setSfxEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setMasterVolume: (v: number) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setAutoXP: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults
      themeId: 'solo-leveling',
      sfxEnabled: true,
      musicEnabled: false,
      masterVolume: 0.5,
      animationsEnabled: true,
      autoXP: true,

      setTheme: (id) => set({ themeId: id }),
      setSfxEnabled: (v) => set({ sfxEnabled: v }),
      setMusicEnabled: (v) => set({ musicEnabled: v }),
      setMasterVolume: (v) => set({ masterVolume: v }),
      setAnimationsEnabled: (v) => set({ animationsEnabled: v }),
      setAutoXP: (v) => set({ autoXP: v }),
    }),
    {
      name: 'life-quest-settings',
    }
  )
);
