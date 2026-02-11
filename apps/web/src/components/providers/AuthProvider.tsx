'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      loadUser();
    }
  }, [loadUser, isInitialized]);

  return <>{children}</>;
}
