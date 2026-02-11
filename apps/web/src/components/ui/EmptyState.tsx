'use client';

import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="border-2 border-zinc-700 bg-zinc-900 p-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center border-2 border-zinc-600 bg-zinc-800 text-zinc-500">
          {icon ?? (
            <FolderOpen className="h-10 w-10" strokeWidth={1.5} />
          )}
        </div>

        <h3 className="font-heading text-xs text-white uppercase">{title}</h3>
        <p className="font-body text-sm text-zinc-400 max-w-sm">{description}</p>

        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="border-4 border-neonGreen bg-neonGreen px-6 py-3 font-heading text-xs text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
