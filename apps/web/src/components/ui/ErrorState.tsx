'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="border-4 border-neonPink bg-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(255,45,149,0.5)]">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center border-4 border-neonPink bg-neonPink/10">
          <AlertTriangle className="h-8 w-8 text-neonPink" strokeWidth={2} />
        </div>

        <h2 className="font-heading text-sm text-neonPink">GAME OVER</h2>
        <p className="font-body text-sm text-zinc-300 max-w-md">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="border-4 border-neonPink bg-neonPink px-6 py-4 font-heading text-sm text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
          >
            RETRY
          </button>
        )}
      </div>
    </div>
  );
}
