'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { FloatingActionButton } from './FloatingActionButton';
import { SidebarProvider, useSidebar } from './SidebarContext';
import { GameEffects } from '@/components/game/GameEffects';
import { AIChatBar } from '@/components/ai/AIChatBar';
import clsx from 'clsx';

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();

  return (
    <>
      <GameEffects />
      <Sidebar />
      <TopBar />
      <main
        className={clsx(
          'min-h-screen bg-[#0a0a0a] transition-[padding] duration-200',
          'pt-14',
          'pl-0 pb-20 md:pb-8 pr-4',
          isExpanded ? 'md:pl-60' : 'md:pl-16'
        )}
      >
        <div className="max-w-7xl mx-auto py-6 px-4 md:px-6">
          {children}
        </div>
      </main>
      <FloatingActionButton />
      <AIChatBar />
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
