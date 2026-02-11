'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  useRulebookStore,
} from '@/stores/useRulebookStore';
import {
  BookOpen,
  Save,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  TrendingUp,
  Award,
  Shield,
  Star,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ========== Static Rulebook Documentation ==========
const RULEBOOK_SECTIONS = [
  {
    id: 'xp-basics',
    title: 'XP Basics',
    icon: Zap,
    color: '#39ff14',
    content: [
      { label: 'YES/NO Completion', value: 'Base XP reward (default: 10 XP)' },
      { label: 'HOURS Logged', value: 'Base XP × Hours (max 8h multiplier)' },
      { label: 'MANUAL XP', value: 'Enter exact XP amount per completion' },
      { label: 'XP Auto-Aggregation', value: 'Habit → SubCategory → Category → Profile' },
    ],
  },
  {
    id: 'streak-bonus',
    title: 'Streak Bonuses',
    icon: Star,
    color: '#ffe600',
    content: [
      { label: '1-day streak', value: '+0 bonus' },
      { label: '3-day streak', value: '+2 bonus XP' },
      { label: '7-day streak', value: '+5 bonus XP' },
      { label: '14-day streak', value: '+10 bonus XP' },
      { label: '30-day streak', value: '+25 bonus XP' },
      { label: '60+ day streak', value: '+50 bonus XP' },
    ],
  },
  {
    id: 'levels',
    title: 'Level Progression',
    icon: TrendingUp,
    color: '#00d4ff',
    content: [
      { label: 'Formula', value: 'Level = floor(sqrt(TotalXP / 100))' },
      { label: 'Level 1', value: '100 XP required' },
      { label: 'Level 5', value: '2,500 XP required' },
      { label: 'Level 10', value: '10,000 XP required' },
      { label: 'Level 20', value: '40,000 XP required' },
      { label: 'Level 50', value: '250,000 XP required' },
    ],
  },
  {
    id: 'ranks',
    title: 'Rank Thresholds',
    icon: Award,
    color: '#bf00ff',
    content: [
      { label: 'E-Rank', value: 'Level 0-4 — Novice Hunter' },
      { label: 'D-Rank', value: 'Level 5-9 — Apprentice' },
      { label: 'C-Rank', value: 'Level 10-19 — Warrior' },
      { label: 'B-Rank', value: 'Level 20-29 — Elite' },
      { label: 'A-Rank', value: 'Level 30-39 — Master' },
      { label: 'S-Rank', value: 'Level 40-49 — Legend' },
      { label: 'SS-Rank', value: 'Level 50-59 — Mythic' },
      { label: 'SSS-Rank', value: 'Level 60+ — Shadow Monarch' },
    ],
  },
  {
    id: 'artifacts',
    title: 'Artifact Unlock Thresholds',
    icon: Shield,
    color: '#ff2d95',
    content: [
      { label: 'COMMON', value: '500 XP — Basic artifacts' },
      { label: 'RARE', value: '2,000 XP — Rare artifacts' },
      { label: 'EPIC', value: '10,000 XP — Epic artifacts' },
      { label: 'LEGENDARY', value: '50,000 XP — Legendary artifacts' },
      { label: 'MYTHIC', value: '200,000 XP — Mythic artifacts' },
    ],
  },
  {
    id: 'shop',
    title: 'XP Shop Economy',
    icon: Zap,
    color: '#39ff14',
    content: [
      { label: 'Currency', value: 'XP acts as currency for purchases' },
      { label: 'Purchase', value: 'Deducts XP from your total balance' },
      { label: 'Refund', value: 'Refundable items return XP to balance' },
      { label: 'Categories', value: 'Artifacts, Titles, Avatar Upgrades, Custom Rewards' },
      { label: 'Rarity Tiers', value: 'Common → Rare → Epic → Legendary → Mythic' },
    ],
  },
];

function EditableKeyValueTable({
  data,
  onChange,
  keyLabel,
  valueLabel,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
  valueType = 'text',
}: {
  data: Record<string, string | number>;
  onChange: (data: Record<string, string | number>) => void;
  keyLabel: string;
  valueLabel: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  valueType?: 'text' | 'number';
}) {
  const entries = Object.entries(data);
  const [, forceUpdate] = useState({});

  const handleKeyChange = (oldKey: string, newKey: string) => {
    if (newKey === oldKey) return;
    const next = { ...data };
    delete next[oldKey];
    next[newKey] = data[oldKey];
    onChange(next);
  };

  const handleValueChange = (key: string, value: string | number) => {
    onChange({
      ...data,
      [key]: valueType === 'number' ? parseFloat(String(value)) || 0 : value,
    });
  };

  const handleAdd = () => {
    onChange({ ...data, '': valueType === 'number' ? 0 : '' });
    forceUpdate({});
  };

  const handleRemove = (key: string) => {
    const next = { ...data };
    delete next[key];
    onChange(next);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-2 border-zinc-700">
        <thead>
          <tr className="bg-zinc-800">
            <th className="border-b-2 border-zinc-700 p-2 text-left font-heading text-[10px] text-neonGreen">
              {keyLabel}
            </th>
            <th className="border-b-2 border-zinc-700 p-2 text-left font-heading text-[10px] text-neonGreen">
              {valueLabel}
            </th>
            <th className="w-12 border-b-2 border-zinc-700 bg-zinc-800" />
          </tr>
        </thead>
        <tbody>
          {entries.map(([k, v], i) => (
            <tr key={k || `row-${i}`} className={i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-950'}>
              <td className="border-b border-zinc-800 p-2">
                <input
                  type="text"
                  value={k}
                  onChange={(e) => handleKeyChange(k, e.target.value)}
                  className="w-full border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-neonGreen"
                  placeholder={keyPlaceholder}
                />
              </td>
              <td className="border-b border-zinc-800 p-2">
                <input
                  type={valueType}
                  value={String(v)}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleValueChange(k, valueType === 'number' ? (parseFloat(val) || 0) : val);
                  }}
                  className="w-full border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm text-white focus:outline-none focus:ring-1 focus:ring-neonGreen"
                  placeholder={valuePlaceholder}
                />
              </td>
              <td className="border-b border-zinc-800 p-2 text-center">
                <button
                  type="button"
                  onClick={() => handleRemove(k)}
                  className="font-heading text-[10px] text-neonPink hover:underline"
                >
                  DEL
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 border-2 border-zinc-700 bg-zinc-800 px-4 py-2 font-heading text-[10px] text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
      >
        + ADD ROW
      </button>
    </div>
  );
}

export default function RulebookPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const { config, fetchRulebook, updateRulebook, resetRulebook, isLoading } = useRulebookStore();

  const [activeTab, setActiveTab] = useState<'documentation' | 'editor'>('documentation');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(RULEBOOK_SECTIONS.map((s) => s.id)));

  // Editor state
  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [xpLevelFormula, setXpLevelFormula] = useState('');
  const [levelRankMap, setLevelRankMap] = useState<Record<string, string>>({});
  const [rankTitles, setRankTitles] = useState<Record<string, string>>({});
  const [artifactThresholds, setArtifactThresholds] = useState<Record<string, string>>({});
  const [statMultipliers, setStatMultipliers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) { router.replace('/login'); return; }
    fetchRulebook();
  }, [user, isInitialized, router, fetchRulebook]);

  useEffect(() => {
    if (config) {
      setMode(config.mode);
      setXpLevelFormula(config.xpLevelFormula);
      setLevelRankMap(config.levelRankMap || {});
      setRankTitles(config.rankTitles || {});
      setArtifactThresholds(config.artifactThresholds || {});
      setStatMultipliers(config.statMultipliers || {});
    }
  }, [config]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return RULEBOOK_SECTIONS;
    const q = searchQuery.toLowerCase();
    return RULEBOOK_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.some(
          (c) => c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isInitialized || !user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRulebook({ mode, xpLevelFormula, levelRankMap, rankTitles, artifactThresholds, statMultipliers });
    } finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!resetConfirm) { setResetConfirm(true); return; }
    setSaving(true);
    try { await resetRulebook(); setResetConfirm(false); }
    finally { setSaving(false); }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-neonYellow" />
            <h1 className="font-heading text-xl md:text-2xl text-neonYellow">
              RULEBOOK CODEX
            </h1>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-2 border-white">
          <button
            type="button"
            onClick={() => setActiveTab('documentation')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-heading text-xs transition-all border-r-2 border-white ${
              activeTab === 'documentation'
                ? 'bg-neonYellow text-black'
                : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            DOCUMENTATION
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-heading text-xs transition-all ${
              activeTab === 'editor'
                ? 'bg-neonYellow text-black'
                : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            ADMIN EDITOR
          </button>
        </div>

        {activeTab === 'documentation' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules, mechanics, thresholds..."
                className="w-full border-2 border-white bg-zinc-950 pl-10 pr-4 py-3 font-body text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-neonYellow"
                style={{ boxShadow: '4px 4px 0px 0px rgba(255,230,0,0.3)' }}
              />
            </div>

            {/* Accordion Sections */}
            {filteredSections.length === 0 ? (
              <div className="border-2 border-zinc-700 bg-zinc-900 p-8 text-center">
                <p className="font-body text-zinc-400">No matching rules found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const Icon = section.icon;
                  return (
                    <div key={section.id} className="border-2 border-zinc-700 bg-zinc-900 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" style={{ color: section.color }} />
                          <span className="font-heading text-sm text-white">{section.title}</span>
                          <span
                            className="px-2 py-0.5 border font-mono text-[10px]"
                            style={{ borderColor: section.color, color: section.color }}
                          >
                            {section.content.length}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="border-t border-zinc-800 px-5 py-4">
                              <div className="space-y-3">
                                {section.content.map((item, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start justify-between gap-4 border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0"
                                  >
                                    <span className="font-body text-sm font-medium text-white">
                                      {item.label}
                                    </span>
                                    <span className="font-mono text-xs text-right" style={{ color: section.color }}>
                                      {item.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="border-2 border-zinc-700 bg-zinc-900 p-6">
              <h2 className="mb-4 font-heading text-sm text-neonGreen">MODE</h2>
              <div className="flex border-2 border-white">
                <button
                  type="button"
                  onClick={() => setMode('AUTO')}
                  className={`flex-1 border-r-2 border-white px-6 py-4 font-heading text-sm transition-colors ${
                    mode === 'AUTO' ? 'bg-neonGreen text-black' : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  AUTO MODE
                </button>
                <button
                  type="button"
                  onClick={() => setMode('MANUAL')}
                  className={`flex-1 px-6 py-4 font-heading text-sm transition-colors ${
                    mode === 'MANUAL' ? 'bg-neonGreen text-black' : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  MANUAL MODE
                </button>
              </div>
            </div>

            {isLoading && !config ? (
              <div className="border-2 border-zinc-700 bg-zinc-900 p-12 text-center">
                <p className="font-body text-zinc-400">Loading rulebook...</p>
              </div>
            ) : (
              <>
                <div className="border-2 border-zinc-700 bg-zinc-900 p-6">
                  <h2 className="mb-4 font-heading text-sm text-neonBlue">XP → LEVEL FORMULA</h2>
                  <p className="mb-2 font-body text-xs text-zinc-400">
                    {mode === 'AUTO' ? 'Fixed in AUTO mode. Switch to MANUAL to edit.' : 'Use variables: totalXP. Example: floor(sqrt(totalXP / 100))'}
                  </p>
                  <input
                    type="text"
                    value={xpLevelFormula}
                    onChange={(e) => setXpLevelFormula(e.target.value)}
                    readOnly={mode === 'AUTO'}
                    className="w-full border-2 border-zinc-600 bg-zinc-950 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-neonBlue"
                    placeholder="floor(sqrt(totalXP / 100))"
                  />
                </div>

                <div className="border-2 border-zinc-700 bg-zinc-900 p-6">
                  <h2 className="mb-4 font-heading text-sm text-neonPink">LEVEL → RANK MAPPING</h2>
                  <EditableKeyValueTable data={levelRankMap} onChange={(d) => setLevelRankMap(d as Record<string, string>)} keyLabel="Level" valueLabel="Rank" keyPlaceholder="10" valuePlaceholder="D" />
                </div>

                <div className="border-2 border-zinc-700 bg-zinc-900 p-6">
                  <h2 className="mb-4 font-heading text-sm text-neonPurple">RANK TITLES</h2>
                  <EditableKeyValueTable data={rankTitles} onChange={(d) => setRankTitles(d as Record<string, string>)} keyLabel="Rank" valueLabel="Title" keyPlaceholder="S" valuePlaceholder="Expert" />
                </div>

                <div className="border-2 border-zinc-700 bg-zinc-900 p-6">
                  <h2 className="mb-4 font-heading text-sm text-neonYellow">ARTIFACT THRESHOLDS</h2>
                  <EditableKeyValueTable data={artifactThresholds} onChange={(d) => setArtifactThresholds(d as Record<string, string>)} keyLabel="XP Threshold" valueLabel="Rarity" keyPlaceholder="500" valuePlaceholder="Common" />
                </div>

                <div className="border-2 border-zinc-700 bg-zinc-900 p-6">
                  <h2 className="mb-4 font-heading text-sm text-neonGreen">STAT MULTIPLIERS</h2>
                  <EditableKeyValueTable data={statMultipliers as Record<string, string | number>} onChange={(d) => setStatMultipliers(d as Record<string, number>)} keyLabel="Type" valueLabel="Multiplier" keyPlaceholder="streak" valuePlaceholder="1.5" valueType="number" />
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 border-2 border-neonGreen bg-neonGreen px-6 py-3 font-heading text-sm text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className={`flex items-center gap-2 border-2 px-6 py-3 font-heading text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 ${
                      resetConfirm
                        ? 'border-neonPink bg-neonPink text-black'
                        : 'border-zinc-600 bg-zinc-900 text-white hover:border-white'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {resetConfirm ? 'CLICK AGAIN TO CONFIRM' : 'RESET TO DEFAULTS'}
                  </button>
                  {resetConfirm && (
                    <button
                      type="button"
                      onClick={() => setResetConfirm(false)}
                      className="border-2 border-zinc-600 bg-zinc-800 px-4 py-2 font-body text-sm text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
