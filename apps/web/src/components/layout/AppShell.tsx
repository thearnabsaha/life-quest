'use client';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
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
          'min-h-screen transition-[padding,background-color] duration-300',
          /* Safe-area-aware padding from globals.css */
          'pt-topbar',
          'pb-bottomnav',
          'pl-0 pr-0 md:pr-0',
          isExpanded ? 'md:pl-60' : 'md:pl-16',
        )}
        style={{ backgroundColor: 'var(--color-bg-base)' }}
      >
        {/* Mobile: tighter padding | Desktop: normal */}
        <div className="max-w-7xl mx-auto py-4 px-3 md:py-6 md:px-6">
          {children}
        </div>
      </main>
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
