'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '@/components/layout/AppShell';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { themes, getTheme } from '@/lib/themes';
import { audioManager } from '@/lib/audioManager';
import {
  Mail, Key, Zap, Volume2, VolumeX, Music, Download, Upload,
  Trash2, RotateCcw, Info, Loader2, LogOut, Palette, Sparkles,
  Check, ChevronRight,
} from 'lucide-react';

const APP_VERSION = '0.2.0';

/* ===== Section Card ===== */
function SectionCard({
  title,
  icon: Icon,
  iconColor = 'text-accent',
  children,
  className = '',
}: {
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border-2 border-[var(--color-border-accent)] bg-[var(--color-bg-card)] p-6 shadow-theme theme-transition ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={2.5} />}
        <h2 className="font-heading text-xs text-[var(--color-accent)] uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

/* ===== Theme Card ===== */
function ThemeCard({
  theme,
  isActive,
  onClick,
}: {
  theme: (typeof themes)[0];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col items-start p-3 border-2 transition-all duration-200 text-left ${
        isActive
          ? 'border-[var(--color-accent)] shadow-glow'
          : 'border-[var(--color-border)] hover:border-[var(--color-border-subtle)]'
      }`}
      style={{ backgroundColor: theme.colors.bgCard }}
    >
      {/* Preview gradient */}
      <div
        className="w-full h-12 mb-2 border border-white/10"
        style={{ background: theme.preview }}
      />

      {/* Color dots */}
      <div className="flex gap-1.5 mb-2">
        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.accent }} />
        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.accent2 }} />
        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.bgBase }} />
        <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.borderAccent }} />
      </div>

      {/* Name */}
      <div className="flex items-center gap-1.5 w-full">
        <span className="text-sm">{theme.emoji}</span>
        <span
          className="font-body text-xs font-semibold truncate"
          style={{ color: theme.colors.textPrimary }}
        >
          {theme.name}
        </span>
      </div>
      <p
        className="font-body text-[10px] mt-1 line-clamp-2"
        style={{ color: theme.colors.textMuted }}
      >
        {theme.description}
      </p>

      {/* Active check */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center border-2"
          style={{
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.accent,
          }}
        >
          <Check className="w-3 h-3 text-black" strokeWidth={3} />
        </motion.div>
      )}
    </motion.button>
  );
}

/* ===== Volume Slider ===== */
function VolumeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3 w-full max-w-[200px]">
      <VolumeX className="w-3 h-3 text-[var(--color-text-muted)]" />
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="flex-1 h-1 appearance-none rounded-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:border-2
          [&::-webkit-slider-thumb]:border-[var(--color-accent)]
          [&::-webkit-slider-thumb]:bg-[var(--color-accent)]
          [&::-webkit-slider-thumb]:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          [&::-webkit-slider-runnable-track]:h-1
          [&::-webkit-slider-runnable-track]:bg-[var(--color-border)]
        "
      />
      <Volume2 className="w-3 h-3 text-[var(--color-text-muted)]" />
    </div>
  );
}

/* ===== Main Page ===== */
export default function SettingsPage() {
  const router = useRouter();
  const { user, isInitialized, logout } = useAuthStore();
  const { resetProfile } = useProfileStore();
  const {
    themeId, setTheme,
    sfxEnabled, setSfxEnabled,
    musicEnabled, setMusicEnabled,
    masterVolume, setMasterVolume,
    animationsEnabled, setAnimationsEnabled,
    autoXP, setAutoXP,
  } = useSettingsStore();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearXPModalOpen, setClearXPModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isClearingXP, setIsClearingXP] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace('/login');
      return;
    }
  }, [user, isInitialized, router]);

  const handleThemeChange = (id: string) => {
    setTheme(id);
    if (audioManager) audioManager.playClick();
  };

  const handleToggleSfx = (v: boolean) => {
    setSfxEnabled(v);
    // Play a sound AFTER enabling (so user hears the confirmation)
    if (v && audioManager) {
      setTimeout(() => audioManager.playToggle(true), 50);
    }
  };

  const handleToggleMusic = (v: boolean) => {
    setMusicEnabled(v);
    if (audioManager) audioManager.playToggle(v);
  };

  const handleToggleAnimations = (v: boolean) => {
    setAnimationsEnabled(v);
    if (audioManager) audioManager.playToggle(v);
  };

  const handleChangePassword = () => {
    if (audioManager) audioManager.playClick();
  };

  const handleExportData = () => {
    if (audioManager) audioManager.playClick();
  };

  const handleImportData = () => {
    if (audioManager) audioManager.playClick();
  };

  const handleResetProgress = async () => {
    setIsResetting(true);
    try {
      await resetProfile();
      setResetModalOpen(false);
      window.location.href = '/';
    } catch {
      setIsResetting(false);
    }
  };

  const handleClearXP = async () => {
    setIsClearingXP(true);
    try {
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/xp/clear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to clear XP');
      setClearXPModalOpen(false);
      window.location.href = '/';
    } catch {
      setIsClearingXP(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteModalOpen(false);
    useAuthStore.getState().logout();
    router.replace('/login');
  };

  if (!isInitialized || !user) return null;

  const currentTheme = getTheme(themeId);
  const visibleThemes = showAllThemes ? themes : themes.slice(0, 6);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <h1 className="font-heading text-base md:text-lg animate-text-shimmer">
            SETTINGS
          </h1>
        </motion.div>

        {/* ===== THEME SELECTOR ===== */}
        <SectionCard title="THEME" icon={Palette}>
          <div className="space-y-4">
            {/* Current theme banner */}
            <div
              className="flex items-center gap-3 p-3 border-2 border-[var(--color-accent)]/30"
              style={{ background: currentTheme.preview }}
            >
              <span className="text-2xl">{currentTheme.emoji}</span>
              <div>
                <p className="font-body text-sm font-bold" style={{ color: currentTheme.colors.accent }}>
                  {currentTheme.name}
                </p>
                <p className="font-body text-xs" style={{ color: currentTheme.colors.textMuted }}>
                  {currentTheme.description}
                </p>
              </div>
            </div>

            {/* Theme grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {visibleThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={theme.id === themeId}
                    onClick={() => handleThemeChange(theme.id)}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Show more */}
            {themes.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllThemes(!showAllThemes)}
                className="flex items-center gap-1 font-body text-xs text-[var(--color-accent)] hover:underline"
              >
                {showAllThemes ? 'Show less' : `Show all ${themes.length} themes`}
                <ChevronRight className={`w-3 h-3 transition-transform ${showAllThemes ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>
        </SectionCard>

        {/* ===== AUDIO & EFFECTS ===== */}
        <SectionCard title="AUDIO & EFFECTS" icon={Music}>
          <div className="space-y-6">
            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={2} />
                <div>
                  <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>Sound Effects</span>
                  <p className="font-body text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    XP gains, level ups, clicks
                  </p>
                </div>
              </div>
              <Toggle checked={sfxEnabled} onChange={handleToggleSfx} />
            </div>

            {/* Music */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5" style={{ color: 'var(--color-accent-2)' }} strokeWidth={2} />
                <div>
                  <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>Ambient Music</span>
                  <p className="font-body text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    Low ambient background drone
                  </p>
                </div>
              </div>
              <Toggle checked={musicEnabled} onChange={handleToggleMusic} />
            </div>

            {/* Master Volume */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Master Volume
              </span>
              <VolumeSlider value={masterVolume} onChange={setMasterVolume} />
            </div>

            {/* Preview Sounds */}
            <div className="flex flex-wrap gap-2">
              <p className="w-full font-body text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Preview sounds
              </p>
              {[
                { label: 'Click', fn: () => audioManager?.playClick() },
                { label: 'XP Gain', fn: () => audioManager?.playXPGain() },
                { label: 'Level Up', fn: () => audioManager?.playLevelUp() },
                { label: 'Habit Done', fn: () => audioManager?.playHabitComplete() },
                { label: 'Navigate', fn: () => audioManager?.playNavigate() },
                { label: 'Error', fn: () => audioManager?.playError() },
              ].map(({ label, fn }) => (
                <motion.button
                  key={label}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fn}
                  className="px-3 py-1.5 border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] font-body text-[10px] uppercase tracking-wider hover:border-[var(--color-accent)] transition-colors"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* ===== ANIMATIONS ===== */}
        <SectionCard title="ANIMATIONS" icon={Sparkles}>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" style={{ color: 'var(--color-accent-2)' }} strokeWidth={2} />
                <div>
                  <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>Enable Animations</span>
                  <p className="font-body text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    Page transitions, hover effects, XP bursts
                  </p>
                </div>
              </div>
              <Toggle checked={animationsEnabled} onChange={handleToggleAnimations} />
            </div>

            {/* Animation preview */}
            <AnimatePresence>
              {animationsEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4 border border-[var(--color-border)]" style={{ backgroundColor: 'var(--color-bg-elevated)' }}>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-8 h-8 border-2 flex items-center justify-center"
                      style={{
                        borderColor: 'var(--color-accent)',
                        backgroundColor: 'var(--color-bg-card)',
                      }}
                    >
                      <Zap className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      className="w-8 h-8 border-2 flex items-center justify-center"
                      style={{
                        borderColor: 'var(--color-accent-2)',
                        backgroundColor: 'var(--color-bg-card)',
                      }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent-2)' }} />
                    </motion.div>
                    <motion.div
                      className="flex-1 h-2"
                      style={{ backgroundColor: 'var(--color-border)' }}
                    >
                      <motion.div
                        animate={{ width: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                        className="h-full"
                        style={{ backgroundColor: 'var(--color-accent)' }}
                      />
                    </motion.div>
                    <span className="font-body text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      Preview
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SectionCard>

        {/* ===== GAME SETTINGS ===== */}
        <SectionCard title="GAME SETTINGS" icon={Zap} iconColor="text-[var(--color-accent)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5" style={{ color: 'var(--color-accent)' }} strokeWidth={2} />
                <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Auto XP calculation
                </span>
              </div>
              <Toggle checked={autoXP} onChange={(v) => { setAutoXP(v); if (audioManager) audioManager.playToggle(v); }} />
            </div>
          </div>
        </SectionCard>

        {/* ===== ACCOUNT ===== */}
        <SectionCard title="ACCOUNT" icon={Mail}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center border-2"
                style={{ borderColor: 'var(--color-border-subtle)', backgroundColor: 'var(--color-bg-elevated)' }}
              >
                <Mail className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} strokeWidth={2} />
              </div>
              <div>
                <p className="font-body text-xs uppercase" style={{ color: 'var(--color-text-muted)' }}>Email</p>
                <p className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>{user.email}</p>
              </div>
            </div>
            <motion.button
              type="button"
              onClick={handleChangePassword}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex items-center gap-2 border-2 px-4 py-3 font-body text-sm transition-colors"
              style={{
                borderColor: 'var(--color-border-accent)',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
              }}
            >
              <Key className="h-4 w-4" strokeWidth={2} />
              Change Password
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="flex items-center gap-2 border-2 border-red-500 px-4 py-3 font-body text-sm text-red-400 transition-colors hover:bg-red-500/10"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Logout
            </motion.button>
          </div>
        </SectionCard>

        {/* ===== DATA ===== */}
        <SectionCard title="DATA" icon={Download}>
          <div className="flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={handleExportData}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 border-2 px-4 py-3 font-body text-sm transition-colors"
              style={{
                borderColor: 'var(--color-accent)',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-accent)',
              }}
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              Export Data
            </motion.button>
            <motion.button
              type="button"
              onClick={handleImportData}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 border-2 px-4 py-3 font-body text-sm transition-colors"
              style={{
                borderColor: 'var(--color-accent)',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-accent)',
              }}
            >
              <Upload className="h-4 w-4" strokeWidth={2} />
              Import Data
            </motion.button>
          </div>
        </SectionCard>

        {/* ===== DANGER ZONE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-4 border-red-500 p-6 shadow-[8px_8px_0px_0px_rgba(239,68,68,0.5)]"
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        >
          <h2 className="font-heading text-xs text-red-500 mb-4">DANGER ZONE</h2>
          <div className="flex flex-wrap gap-3">
            <motion.button
              type="button"
              onClick={() => setClearXPModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 border-2 border-orange-500 px-4 py-3 font-body text-sm text-orange-400 transition-colors hover:bg-orange-500/10"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              <Zap className="h-4 w-4" strokeWidth={2} />
              Clear XP History
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setResetModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 border-2 border-neonYellow px-4 py-3 font-body text-sm text-neonYellow transition-colors hover:bg-neonYellow/10"
              style={{ backgroundColor: 'var(--color-bg-elevated)' }}
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Reset Progress
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 border-4 border-red-500 bg-red-500 px-4 py-3 font-heading text-xs text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
              Delete Account
            </motion.button>
          </div>
        </motion.div>

        {/* ===== ABOUT ===== */}
        <SectionCard title="ABOUT" icon={Info}>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5" style={{ color: 'var(--color-accent)' }} strokeWidth={2} />
              <span className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>
                Life Quest v{APP_VERSION}
              </span>
            </div>
            <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Gamify your life with quests, XP, and achievements. Solo Leveling meets Notion meets GitHub Contributions.
            </p>
          </div>
        </SectionCard>
      </div>

      {/* Reset Progress Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => !isResetting && setResetModalOpen(false)}
        title="RESET PROGRESS"
      >
        <div className="space-y-6">
          <div className="border-2 border-red-500/30 bg-red-500/5 p-4">
            <p className="font-body text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
              This will <span className="text-red-400 font-bold">permanently delete</span> ALL your data:
            </p>
            <ul className="font-body text-xs space-y-1 ml-4 list-disc" style={{ color: 'var(--color-text-muted)' }}>
              <li>All categories and subcategories</li>
              <li>All habits and completions</li>
              <li>All XP logs and history</li>
              <li>All challenges</li>
              <li>All notifications</li>
              <li>All shop items and purchases</li>
              <li>Calendar entries</li>
              <li>Rulebook configuration</li>
            </ul>
            <p className="font-body text-xs text-red-400 mt-3 font-bold">
              Your profile will be reset to Level 1, 0 XP. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              disabled={isResetting}
              className="flex-1 border-2 px-4 py-3 font-body text-sm disabled:opacity-50"
              style={{
                borderColor: 'var(--color-border-accent)',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetProgress}
              disabled={isResetting}
              className="flex-1 border-4 border-red-500 bg-red-500 px-4 py-3 font-heading text-xs text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  RESETTING...
                </>
              ) : (
                'RESET EVERYTHING'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Clear XP History Modal */}
      <Modal
        isOpen={clearXPModalOpen}
        onClose={() => !isClearingXP && setClearXPModalOpen(false)}
        title="CLEAR XP HISTORY"
      >
        <div className="space-y-6">
          <div className="border-2 border-orange-500/30 bg-orange-500/5 p-4">
            <p className="font-body text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
              This will <span className="text-orange-400 font-bold">permanently delete</span>:
            </p>
            <ul className="font-body text-xs space-y-1 ml-4 list-disc" style={{ color: 'var(--color-text-muted)' }}>
              <li>All XP logs and history</li>
              <li>All calendar activity entries</li>
              <li>All habit completions and streaks</li>
              <li>Reset your level to 1 and XP to 0</li>
            </ul>
            <p className="font-body text-xs text-orange-400 mt-3 font-bold">
              Your habits, categories, and challenges will remain. Only XP data is removed.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setClearXPModalOpen(false)}
              disabled={isClearingXP}
              className="flex-1 border-2 px-4 py-3 font-body text-sm disabled:opacity-50"
              style={{
                borderColor: 'var(--color-border-accent)',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearXP}
              disabled={isClearingXP}
              className="flex-1 border-4 border-orange-500 bg-orange-500 px-4 py-3 font-heading text-xs text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isClearingXP ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  CLEARING...
                </>
              ) : (
                'CLEAR ALL XP'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="DELETE ACCOUNT"
      >
        <div className="space-y-6">
          <p className="font-body text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Are you sure you want to permanently delete your account? All your data will be erased. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 border-2 px-4 py-3 font-body text-sm"
              style={{
                borderColor: 'var(--color-border-accent)',
                backgroundColor: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="flex-1 border-4 border-red-500 bg-red-500 px-4 py-3 font-heading text-xs text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              DELETE
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
