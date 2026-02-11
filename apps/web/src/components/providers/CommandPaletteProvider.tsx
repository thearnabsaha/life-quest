'use client';

import { CommandPalette } from '@/components/ui/CommandPalette';

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
