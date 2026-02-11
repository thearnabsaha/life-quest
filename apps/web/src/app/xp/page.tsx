'use client';

import { useEffect, useState } from 'react';
import type { XPType } from '@life-quest/types';
import { X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useXPStore } from '@/stores/useXPStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useProfileStore } from '@/stores/useProfileStore';

const XP_TYPES: { value: XPType; label: string }[] = [
  { value: 'MANUAL', label: 'MANUAL' },
  { value: 'AUTO', label: 'AUTO' },
  { value: 'BONUS', label: 'BONUS' },
  { value: 'STREAK', label: 'STREAK' },
];

const LIMIT = 20;

export default function XPPage() {
  const { logs, total, page, isLoading, fetchLogs, logXP, deleteLog } = useXPStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { categories, fetchCategories } = useCategoryStore();
  const { fetchProfile } = useProfileStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<XPType>('MANUAL');
  const [source, setSource] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLogs(1);
    fetchProfile();
  }, [fetchCategories, fetchLogs, fetchProfile]);

  const handleLogXP = async (e: React.FormEvent) => {
    e.preventDefault();
    const xpAmount = parseInt(amount, 10);
    if (isNaN(xpAmount) || xpAmount <= 0) return;
    setIsSubmitting(true);
    try {
      await logXP(
        xpAmount,
        type,
        categoryId || undefined,
        source.trim() || undefined
      );
      setAmount('');
      setSource('');
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) fetchLogs(page - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(total / LIMIT);
    if (page < totalPages) fetchLogs(page + 1);
  };

  const handleDeleteLog = async (logId: string) => {
    setDeletingId(logId);
    try {
      await deleteLog(logId);
      // Re-fetch profile to update XP in header/profile
      fetchProfile();
    } catch {
      // handled by store
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return null;
    return categories.find((c) => c.id === id)?.name ?? null;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AppShell>
      <div className="space-y-8">
        <h1 className="font-heading text-xl text-neonGreen md:text-2xl">
          XP LOGS
        </h1>

        {/* Log XP manually card */}
        <div
          className="border-[3px] border-white bg-zinc-900 p-6"
          style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
        >
          <h2 className="mb-4 font-heading text-sm uppercase tracking-wider text-white">
            Log XP manually
          </h2>
          <form onSubmit={handleLogXP} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="xp-amount"
                  className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Amount
                </label>
                <input
                  id="xp-amount"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none focus:ring-2 focus:ring-neonGreen"
                  style={{ boxShadow: '4px 4px 0px 0px #fff' }}
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor="xp-type"
                  className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Type
                </label>
                <select
                  id="xp-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as XPType)}
                  className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
                  style={{ boxShadow: '4px 4px 0px 0px #fff' }}
                >
                  {XP_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="xp-source"
                  className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Source (optional)
                </label>
                <input
                  id="xp-source"
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white placeholder:text-zinc-500 focus:outline-none"
                  style={{ boxShadow: '4px 4px 0px 0px #fff' }}
                  placeholder="Description"
                />
              </div>
              <div>
                <label
                  htmlFor="xp-category"
                  className="mb-2 block font-body text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  Category (optional)
                </label>
                <select
                  id="xp-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border-[2px] border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
                  style={{ boxShadow: '4px 4px 0px 0px #fff' }}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={
                isSubmitting || !amount || parseInt(amount, 10) <= 0
              }
              className="w-full border-[2px] border-white bg-neonGreen px-6 py-4 font-body text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-[#2dd610] disabled:opacity-50 sm:w-auto"
              style={{ boxShadow: '4px 4px 0px 0px #fff' }}
            >
              {isSubmitting ? 'Logging...' : 'LOG XP'}
            </button>
          </form>
        </div>

        {/* XP History */}
        <div>
          <h2 className="mb-4 font-heading text-sm uppercase tracking-wider text-white">
            XP History
          </h2>
          {isLoading && logs.length === 0 ? (
            <div
              className="border-[3px] border-white bg-zinc-900 p-12 text-center"
              style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
            >
              <p className="font-body text-zinc-400">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div
              className="border-[3px] border-white bg-zinc-900 p-12 text-center"
              style={{ boxShadow: '6px 6px 0px 0px #39ff14' }}
            >
              <p className="font-body text-zinc-400">No XP logs yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="group flex flex-wrap items-center gap-2 border-[2px] border-white bg-zinc-900 p-4"
                  style={{ boxShadow: '4px 4px 0px 0px #333' }}
                >
                  <span className="font-heading text-xs text-neonGreen">
                    +{log.amount} XP
                  </span>
                  <span
                    className="border-[2px] border-zinc-600 px-2 py-0.5 font-mono text-xs text-zinc-400"
                    style={{ boxShadow: '2px 2px 0px 0px #333' }}
                  >
                    {log.type}
                  </span>
                  {log.source && (
                    <span className="font-body text-sm text-white">
                      {log.source}
                    </span>
                  )}
                  {log.categoryId && getCategoryName(log.categoryId) && (
                    <span className="font-body text-xs text-zinc-400">
                      {getCategoryName(log.categoryId)}
                    </span>
                  )}
                  <span className="ml-auto font-body text-xs text-zinc-500">
                    {formatDate(log.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteLog(log.id)}
                    disabled={deletingId === log.id}
                    className="ml-2 flex h-7 w-7 items-center justify-center border-2 border-red-500/60 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/30 hover:border-red-500 disabled:opacity-40 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete this XP entry"
                  >
                    {deletingId === log.id ? (
                      <span className="block h-3 w-3 animate-spin border-2 border-red-400 border-t-transparent rounded-full" />
                    ) : (
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          {total > LIMIT && (
            <div className="mt-4 flex items-center justify-between border-[2px] border-white bg-zinc-900 p-4">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page <= 1 || isLoading}
                className="border-[2px] border-white bg-zinc-800 px-4 py-2 font-body text-sm font-semibold text-white disabled:opacity-50"
                style={{ boxShadow: '3px 3px 0px 0px #fff' }}
              >
                Previous
              </button>
              <span className="font-body text-sm text-zinc-400">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={page >= totalPages || isLoading}
                className="border-[2px] border-white bg-zinc-800 px-4 py-2 font-body text-sm font-semibold text-white disabled:opacity-50"
                style={{ boxShadow: '3px 3px 0px 0px #fff' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
