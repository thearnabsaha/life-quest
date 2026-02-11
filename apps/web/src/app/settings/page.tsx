'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { Mail, Key, Zap, Palette, Volume2, Download, Upload, Trash2, RotateCcw, Info, Loader2 } from 'lucide-react';

const APP_VERSION = '0.1.0';

function SectionCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border-2 border-white bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] ${className}`}
    >
      <h2 className="font-heading text-xs text-neonGreen mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { resetProfile } = useProfileStore();

  const [autoXP, setAutoXP] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [sound, setSound] = useState(false);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
  }, [user, router]);

  const handleChangePassword = () => {
    console.log('Change password requested');
  };

  const handleExportData = () => {
    console.log('Export data');
  };

  const handleImportData = () => {
    console.log('Import data');
  };

  const handleResetProgress = async () => {
    setIsResetting(true);
    try {
      await resetProfile();
      setResetModalOpen(false);
      // Reload the page to refresh all stores
      window.location.href = '/';
    } catch {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteModalOpen(false);
    useAuthStore.getState().logout();
    router.replace('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="font-heading text-base md:text-lg text-neonGreen">SETTINGS</h1>

        {/* Account */}
        <SectionCard title="ACCOUNT">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-zinc-600 bg-zinc-800">
                <Mail className="h-5 w-5 text-zinc-400" strokeWidth={2} />
              </div>
              <div>
                <p className="font-body text-xs text-zinc-500 uppercase">Email</p>
                <p className="font-body text-sm text-white">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleChangePassword}
              className="flex items-center gap-2 border-2 border-white bg-zinc-800 px-4 py-3 font-body text-sm text-white transition-colors hover:bg-zinc-700"
            >
              <Key className="h-4 w-4" strokeWidth={2} />
              Change Password
            </button>
          </div>
        </SectionCard>

        {/* Game Settings */}
        <SectionCard title="GAME SETTINGS">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-neonYellow" strokeWidth={2} />
                <span className="font-body text-sm text-white">Auto XP calculation</span>
              </div>
              <Toggle checked={autoXP} onChange={setAutoXP} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-neonPurple" strokeWidth={2} />
                <span className="font-body text-sm text-white">Animations</span>
              </div>
              <Toggle checked={animations} onChange={setAnimations} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-neonBlue" strokeWidth={2} />
                <span className="font-body text-sm text-white">Sound effects</span>
              </div>
              <Toggle checked={sound} onChange={setSound} />
            </div>
          </div>
        </SectionCard>

        {/* Data */}
        <SectionCard title="DATA">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-2 border-2 border-neonBlue bg-zinc-800 px-4 py-3 font-body text-sm text-neonBlue transition-colors hover:bg-neonBlue/10"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              Export Data
            </button>
            <button
              type="button"
              onClick={handleImportData}
              className="flex items-center gap-2 border-2 border-neonBlue bg-zinc-800 px-4 py-3 font-body text-sm text-neonBlue transition-colors hover:bg-neonBlue/10"
            >
              <Upload className="h-4 w-4" strokeWidth={2} />
              Import Data
            </button>
          </div>
        </SectionCard>

        {/* Danger Zone */}
        <div className="border-4 border-red-500 bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(239,68,68,0.5)]">
          <h2 className="font-heading text-xs text-red-500 mb-4">DANGER ZONE</h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="flex items-center gap-2 border-2 border-neonYellow bg-zinc-800 px-4 py-3 font-body text-sm text-neonYellow transition-colors hover:bg-neonYellow/10"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              Reset Progress
            </button>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="flex items-center gap-2 border-4 border-red-500 bg-red-500 px-4 py-3 font-heading text-xs text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
              Delete Account
            </button>
          </div>
        </div>

        {/* About */}
        <SectionCard title="ABOUT">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-neonGreen" strokeWidth={2} />
              <span className="font-body text-sm text-white">Life Quest v{APP_VERSION}</span>
            </div>
            <p className="font-body text-xs text-zinc-500">
              Gamify your life with quests, XP, and achievements. Built with Next.js, Zustand, and lots of neon.
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
            <p className="font-body text-sm text-zinc-300 mb-2">
              This will <span className="text-red-400 font-bold">permanently delete</span> ALL your data:
            </p>
            <ul className="font-body text-xs text-zinc-400 space-y-1 ml-4 list-disc">
              <li>All categories and subcategories</li>
              <li>All habits and completions</li>
              <li>All XP logs and history</li>
              <li>All challenges/goals</li>
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
              className="flex-1 border-2 border-white bg-zinc-800 px-4 py-3 font-body text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
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

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="DELETE ACCOUNT"
      >
        <div className="space-y-6">
          <p className="font-body text-sm text-zinc-300">
            Are you sure you want to permanently delete your account? All your data will be erased. This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 border-2 border-white bg-zinc-800 px-4 py-3 font-body text-sm text-white hover:bg-zinc-700"
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
