'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/useAuthStore';
import { useShopStore } from '@/stores/useShopStore';
import { useProfileStore } from '@/stores/useProfileStore';
import type { ShopItem, ArtifactRarity } from '@life-quest/types';
import {
  Plus,
  ShoppingBag,
  Zap,
  Undo2,
  Trash2,
  Package,
  Crown,
  Sparkles,
  Star,
  Diamond,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RARITY_COLORS: Record<ArtifactRarity, { border: string; bg: string; text: string; glow: string }> = {
  COMMON: { border: 'border-zinc-500', bg: 'bg-zinc-800', text: 'text-zinc-300', glow: '' },
  RARE: { border: 'border-neonBlue', bg: 'bg-neonBlue/10', text: 'text-neonBlue', glow: 'shadow-[0_0_12px_rgba(0,212,255,0.3)]' },
  EPIC: { border: 'border-neonPurple', bg: 'bg-neonPurple/10', text: 'text-neonPurple', glow: 'shadow-[0_0_16px_rgba(191,0,255,0.4)]' },
  LEGENDARY: { border: 'border-neonYellow', bg: 'bg-neonYellow/10', text: 'text-neonYellow', glow: 'shadow-[0_0_20px_rgba(255,230,0,0.4)]' },
  MYTHIC: { border: 'border-neonPink', bg: 'bg-neonPink/10', text: 'text-neonPink', glow: 'shadow-[0_0_24px_rgba(255,45,149,0.5)]' },
};

const RARITY_ICONS: Record<ArtifactRarity, typeof Star> = {
  COMMON: Package,
  RARE: Star,
  EPIC: Sparkles,
  LEGENDARY: Crown,
  MYTHIC: Diamond,
};

const CATEGORY_OPTIONS = ['ARTIFACT', 'TITLE', 'AVATAR', 'CUSTOM'] as const;
const RARITY_OPTIONS: ArtifactRarity[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];

function ShopItemCard({
  item,
  xpBalance,
  onPurchase,
  onRefund,
  onDelete,
  onEdit,
}: {
  item: ShopItem;
  xpBalance: number;
  onPurchase: (id: string) => void;
  onRefund: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ShopItem) => void;
}) {
  const [purchaseGlow, setPurchaseGlow] = useState(false);
  const rarity = (item.rarity as ArtifactRarity) || 'COMMON';
  const style = RARITY_COLORS[rarity];
  const RarityIcon = RARITY_ICONS[rarity];
  const canAfford = xpBalance >= item.cost;

  const handlePurchase = () => {
    onPurchase(item.id);
    setPurchaseGlow(true);
    setTimeout(() => setPurchaseGlow(false), 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`relative border-2 ${style.border} ${style.bg} p-5 transition-all ${style.glow} ${
        purchaseGlow ? 'animate-pulse ring-4 ring-neonGreen/60' : ''
      }`}
    >
      {/* Rarity badge */}
      <div className={`absolute top-0 right-0 px-2 py-1 border-l-2 border-b-2 ${style.border} font-heading text-[8px] ${style.text}`}>
        {rarity}
      </div>

      {/* Icon */}
      <div className="mb-3 flex items-center gap-2">
        <RarityIcon className={`w-6 h-6 ${style.text}`} strokeWidth={2} />
        <span className="font-body text-xs text-zinc-500 uppercase">{item.category}</span>
      </div>

      {/* Name */}
      <h3 className="font-heading text-sm text-white mb-1">{item.name}</h3>
      {item.description && (
        <p className="font-body text-xs text-zinc-400 mb-3 line-clamp-2">{item.description}</p>
      )}

      {/* Cost */}
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-neonGreen" />
        <span className="font-mono text-lg font-bold text-neonGreen">
          {item.cost.toLocaleString()}
        </span>
        <span className="font-body text-xs text-zinc-500">XP</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {item.isOwned ? (
          <>
            <div className="flex-1 border-2 border-neonGreen bg-neonGreen/20 px-3 py-2 text-center font-heading text-[10px] text-neonGreen">
              OWNED
            </div>
            {item.refundable && (
              <button
                type="button"
                onClick={() => onRefund(item.id)}
                className="border-2 border-neonYellow bg-zinc-900 px-3 py-2 font-heading text-[10px] text-neonYellow hover:bg-neonYellow/10 transition-colors"
                title="Refund"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={!canAfford}
            className={`flex-1 border-2 px-3 py-2 font-heading text-[10px] transition-all ${
              canAfford
                ? 'border-neonGreen bg-neonGreen text-black hover:shadow-[0_0_12px_rgba(57,255,20,0.5)] active:translate-y-[1px]'
                : 'border-zinc-600 bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {canAfford ? 'PURCHASE' : 'NEED MORE XP'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="border-2 border-zinc-600 bg-zinc-900 px-3 py-2 text-zinc-400 hover:text-white hover:border-white transition-colors"
          title="Edit"
        >
          <span className="font-heading text-[10px]">EDIT</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="border-2 border-zinc-600 bg-zinc-900 px-2 py-2 text-zinc-400 hover:text-neonPink hover:border-neonPink transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

function ShopItemForm({
  isOpen,
  onClose,
  item,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: ShopItem | null;
  onSave: (data: Partial<ShopItem>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(100);
  const [category, setCategory] = useState<typeof CATEGORY_OPTIONS[number]>('CUSTOM');
  const [rarity, setRarity] = useState<ArtifactRarity>('COMMON');
  const [refundable, setRefundable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description ?? '');
      setCost(item.cost);
      setCategory(item.category as typeof CATEGORY_OPTIONS[number]);
      setRarity(item.rarity as ArtifactRarity);
      setRefundable(item.refundable);
    } else {
      setName('');
      setDescription('');
      setCost(100);
      setCategory('CUSTOM');
      setRarity('COMMON');
      setRefundable(true);
    }
    setError(null);
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (cost < 0) { setError('Cost must be >= 0'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim() || null, cost, category, rarity, refundable });
      onClose();
    } catch { setError('Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'EDIT ITEM' : 'CREATE SHOP ITEM'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="border-2 border-neonPink bg-neonPink/10 p-3 font-body text-sm text-neonPink">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block font-body text-xs uppercase tracking-wider text-zinc-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none focus:ring-2 focus:ring-neonGreen"
            placeholder="Legendary Sword of Wisdom"
          />
        </div>

        <div>
          <label className="mb-1 block font-body text-xs uppercase tracking-wider text-zinc-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-2 border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none focus:ring-2 focus:ring-neonGreen resize-none"
            rows={2}
            placeholder="A mystical reward..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-body text-xs uppercase tracking-wider text-zinc-400">Cost (XP)</label>
            <input
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(parseInt(e.target.value) || 0)}
              className="w-full border-2 border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-body text-xs uppercase tracking-wider text-zinc-400">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof CATEGORY_OPTIONS[number])}
              className="w-full border-2 border-white bg-zinc-950 px-4 py-3 font-body text-white focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block font-body text-xs uppercase tracking-wider text-zinc-400">Rarity</label>
          <div className="flex flex-wrap gap-2">
            {RARITY_OPTIONS.map((r) => {
              const s = RARITY_COLORS[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRarity(r)}
                  className={`border-2 px-3 py-2 font-heading text-[10px] transition-all ${
                    rarity === r
                      ? `${s.border} ${s.bg} ${s.text}`
                      : 'border-zinc-700 bg-zinc-900 text-zinc-500 hover:border-zinc-500'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setRefundable(!refundable)}
            className={`w-12 h-6 border-2 transition-all ${
              refundable ? 'border-neonGreen bg-neonGreen' : 'border-zinc-600 bg-zinc-800'
            }`}
          >
            <div
              className={`w-4 h-4 border border-black bg-white transition-transform ${
                refundable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="font-body text-sm text-zinc-400">Refundable</span>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border-2 border-white bg-zinc-800 px-4 py-3 font-body text-sm font-semibold text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 border-2 border-white bg-neonGreen px-4 py-3 font-body text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? 'Saving...' : item ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PurchaseConfirmModal({
  isOpen,
  onClose,
  item,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: ShopItem | null;
  onConfirm: () => void;
}) {
  if (!item) return null;
  const rarity = (item.rarity as ArtifactRarity) || 'COMMON';
  const style = RARITY_COLORS[rarity];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="CONFIRM PURCHASE">
      <div className="space-y-4">
        <div className={`border-2 ${style.border} ${style.bg} p-4`}>
          <h3 className={`font-heading text-sm ${style.text}`}>{item.name}</h3>
          <p className="font-body text-xs text-zinc-400 mt-1">{item.description}</p>
        </div>
        <div className="flex items-center justify-center gap-2 py-2">
          <Zap className="w-5 h-5 text-neonGreen" />
          <span className="font-mono text-2xl text-neonGreen font-bold">
            {item.cost.toLocaleString()}
          </span>
          <span className="font-body text-zinc-400">XP</span>
        </div>
        <p className="font-body text-xs text-zinc-500 text-center">
          This will deduct {item.cost} XP from your balance.
          {item.refundable ? ' This item is refundable.' : ' This item is NOT refundable.'}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border-2 border-white bg-zinc-800 px-4 py-3 font-body text-sm text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 border-2 border-neonGreen bg-neonGreen px-4 py-3 font-heading text-sm text-black hover:shadow-[0_0_12px_rgba(57,255,20,0.5)]"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { items, isLoading: shopLoading, fetchItems, createItem, updateItem, deleteItem, purchaseItem, refundItem } = useShopStore();
  const { profile, fetchProfile } = useProfileStore();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'OWNED' | 'AVAILABLE'>('ALL');

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.replace('/login'); return; }
    fetchItems();
    fetchProfile();
  }, [user, isInitialized, router, fetchItems, fetchProfile]);

  const xpBalance = profile?.totalXP ?? 0;

  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'OWNED': return items.filter((i) => i.isOwned);
      case 'AVAILABLE': return items.filter((i) => !i.isOwned);
      default: return items;
    }
  }, [items, filter]);

  const ownedCount = useMemo(() => items.filter((i) => i.isOwned).length, [items]);

  const handleSave = async (data: Partial<ShopItem>) => {
    if (editingItem) {
      await updateItem(editingItem.id, data);
    } else {
      await createItem(data);
    }
  };

  const handlePurchase = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) setConfirmItem(item);
  };

  const confirmPurchase = async () => {
    if (!confirmItem) return;
    try {
      await purchaseItem(confirmItem.id);
      await fetchProfile();
    } catch { /* handled by store */ }
    setConfirmItem(null);
  };

  const handleRefund = async (id: string) => {
    await refundItem(id);
    await fetchProfile();
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };

  if (!isInitialized || !user) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-xl md:text-2xl text-neonPurple">
              XP SHOP
            </h1>
            <p className="font-body text-xs text-zinc-500 mt-1">
              Redeem your hard-earned XP for rewards
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingItem(null); setFormOpen(true); }}
            className="flex items-center gap-2 border-2 border-white bg-neonGreen px-6 py-3 font-body text-sm font-bold uppercase text-black transition-all hover:shadow-[0_0_12px_rgba(57,255,20,0.4)] active:translate-y-[2px]"
            style={{ boxShadow: '6px 6px 0px 0px #fff' }}
          >
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        </div>

        {/* XP Balance + Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-neonGreen bg-zinc-900 p-5 shadow-[4px_4px_0px_0px_#39ff14]"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-neonGreen" />
              <p className="font-body text-xs uppercase tracking-wider text-zinc-400">XP Balance</p>
            </div>
            <p className="mt-2 font-heading text-3xl text-neonGreen">
              {xpBalance.toLocaleString()}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border-2 border-neonPurple bg-zinc-900 p-5 shadow-[4px_4px_0px_0px_#bf00ff]"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neonPurple" />
              <p className="font-body text-xs uppercase tracking-wider text-zinc-400">Items Available</p>
            </div>
            <p className="mt-2 font-heading text-3xl text-neonPurple">{items.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border-2 border-neonYellow bg-zinc-900 p-5 shadow-[4px_4px_0px_0px_#ffe600]"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-neonYellow" />
              <p className="font-body text-xs uppercase tracking-wider text-zinc-400">Items Owned</p>
            </div>
            <p className="mt-2 font-heading text-3xl text-neonYellow">{ownedCount}</p>
          </motion.div>
        </div>

        {/* Filter Toggle */}
        <div className="flex border-2 border-white">
          {(['ALL', 'AVAILABLE', 'OWNED'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-1 px-4 py-3 font-heading text-[10px] border-r-2 border-white last:border-r-0 transition-all ${
                filter === f
                  ? 'bg-neonPurple text-black'
                  : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Shop Grid */}
        {shopLoading && items.length === 0 ? (
          <div className="border-2 border-white bg-zinc-900 p-16 text-center">
            <div className="inline-block h-6 w-6 animate-spin border-2 border-neonPurple border-t-transparent rounded-full mb-3" />
            <p className="font-body text-sm text-zinc-400">Loading shop items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="border-2 border-white bg-zinc-900 p-12 text-center shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)]">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="font-body text-zinc-400 mb-2">
              {filter === 'ALL'
                ? 'No items in the shop yet.'
                : filter === 'OWNED'
                  ? 'You don\'t own any items yet.'
                  : 'All items have been purchased!'}
            </p>
            <p className="font-body text-xs text-zinc-500">
              Click &quot;Add Item&quot; to create custom rewards.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  xpBalance={xpBalance}
                  onPurchase={handlePurchase}
                  onRefund={handleRefund}
                  onDelete={handleDelete}
                  onEdit={(i) => { setEditingItem(i); setFormOpen(true); }}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <ShopItemForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null); }}
        item={editingItem}
        onSave={handleSave}
      />

      <PurchaseConfirmModal
        isOpen={!!confirmItem}
        onClose={() => setConfirmItem(null)}
        item={confirmItem}
        onConfirm={confirmPurchase}
      />
    </AppShell>
  );
}
