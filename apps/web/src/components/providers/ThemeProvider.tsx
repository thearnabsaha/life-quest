'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { getTheme } from '@/lib/themes';
import { audioManager } from '@/lib/audioManager';

/**
 * Applies the selected theme as CSS custom properties on <html>.
 * Also syncs audio settings with the AudioManager.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeId, sfxEnabled, musicEnabled, masterVolume } = useSettingsStore();

  // Apply CSS variables whenever theme changes
  useEffect(() => {
    const theme = getTheme(themeId);
    const root = document.documentElement;
    const c = theme.colors;

    root.setAttribute('data-theme', themeId);

    root.style.setProperty('--color-bg-base', c.bgBase);
    root.style.setProperty('--color-bg-surface', c.bgSurface);
    root.style.setProperty('--color-bg-card', c.bgCard);
    root.style.setProperty('--color-bg-elevated', c.bgElevated);
    root.style.setProperty('--color-accent', c.accent);
    root.style.setProperty('--color-accent-2', c.accent2);
    root.style.setProperty('--color-accent-glow', c.accentGlow);
    root.style.setProperty('--color-border', c.border);
    root.style.setProperty('--color-border-subtle', c.borderSubtle);
    root.style.setProperty('--color-border-accent', c.borderAccent);
    root.style.setProperty('--color-text-primary', c.textPrimary);
    root.style.setProperty('--color-text-muted', c.textMuted);
    root.style.setProperty('--color-shadow', c.shadow);
  }, [themeId]);

  // Sync audio settings
  useEffect(() => {
    if (!audioManager) return;
    audioManager.sfxEnabled = sfxEnabled;
  }, [sfxEnabled]);

  useEffect(() => {
    if (!audioManager) return;
    audioManager.musicEnabled = musicEnabled;
  }, [musicEnabled]);

  useEffect(() => {
    if (!audioManager) return;
    audioManager.masterVolume = masterVolume;
  }, [masterVolume]);

  return <>{children}</>;
}
