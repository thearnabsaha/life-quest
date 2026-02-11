'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      router.push('/');
    } catch {
      // Error is set in store
    }
  };

  return (
    <div className="border-2 border-white bg-zinc-900 p-8 shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
      <h1 className="font-heading text-xl text-neonGreen mb-8 text-center tracking-wide">
        ENTER THE DUNGEON
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-body text-sm font-medium text-white"
          >
            EMAIL
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full border-2 border-white bg-zinc-900 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonGreen"
            placeholder="hunter@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block font-body text-sm font-medium text-white"
          >
            PASSWORD
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border-2 border-white bg-zinc-900 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonGreen"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="font-body text-sm text-neonPink" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border-4 border-neonGreen bg-neonGreen px-6 py-4 font-heading text-sm text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        >
          {isLoading ? 'LOADING...' : 'LOGIN'}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-zinc-400">
        No account?{' '}
        <Link
          href="/register"
          className="text-neonBlue underline transition-colors hover:text-neonGreen"
        >
          Create your hunter
        </Link>
      </p>
    </div>
  );
}
