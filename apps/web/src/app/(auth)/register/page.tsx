'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, password, displayName);
      router.push('/');
    } catch {
      // Error is set in store
    }
  };

  const displayError = validationError ?? error;

  return (
    <div className="border-2 border-white bg-zinc-900 p-8 shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
      <h1 className="font-heading text-xl text-neonPurple mb-8 text-center tracking-wide">
        CREATE YOUR HUNTER
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="displayName"
            className="mb-2 block font-body text-sm font-medium text-white"
          >
            DISPLAY NAME
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            className="w-full border-2 border-white bg-zinc-900 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonPurple"
            placeholder="The Chosen One"
          />
        </div>

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
            className="w-full border-2 border-white bg-zinc-900 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonPurple"
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
            autoComplete="new-password"
            className="w-full border-2 border-white bg-zinc-900 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonPurple"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block font-body text-sm font-medium text-white"
          >
            CONFIRM PASSWORD
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full border-2 border-white bg-zinc-900 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonPurple"
            placeholder="••••••••"
          />
        </div>

        {displayError && (
          <p className="font-body text-sm text-neonPink" role="alert">
            {displayError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border-4 border-neonPurple bg-neonPurple px-6 py-4 font-heading text-sm text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
        >
          {isLoading ? 'LOADING...' : 'REGISTER'}
        </button>
      </form>

      <p className="mt-6 text-center font-body text-sm text-zinc-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-neonBlue underline transition-colors hover:text-neonGreen"
        >
          Enter the dungeon
        </Link>
      </p>
    </div>
  );
}
