'use client';

import { createContext, useContext, useState, useCallback } from 'react';

type SidebarContextType = {
  isExpanded: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const toggle = useCallback(() => setIsExpanded((prev) => !prev), []);
  return (
    <SidebarContext.Provider value={{ isExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}
