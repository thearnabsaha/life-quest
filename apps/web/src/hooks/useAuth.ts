'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { isAuthenticated } from '@/lib/auth';

export function useAuth() {
  const { user, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      loadUser();
    }
  }, [loadUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
