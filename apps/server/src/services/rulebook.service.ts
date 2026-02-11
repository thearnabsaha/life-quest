import { readDb, writeDb, cuid } from '../lib/db';
import type { RulebookConfig } from '@life-quest/types';

const DEFAULT_LEVEL_RANK_MAP: Record<string, string> = {
  '10': 'D',
  '20': 'C',
  '30': 'B',
  '45': 'A',
  '60': 'S',
  '80': 'SS',
  '100': 'SSS',
};

const DEFAULT_RANK_TITLES: Record<string, string> = {
  E: 'Novice',
  D: 'Aspiring',
  C: 'Rising Star',
  B: 'Adventurer',
  A: 'Veteran',
  S: 'Expert',
  SS: 'Master',
  SSS: 'Legend',
};

const DEFAULT_ARTIFACT_THRESHOLDS: Record<string, string> = {
  '500': 'Common',
  '2000': 'Rare',
  '5000': 'Epic',
  '15000': 'Legendary',
  '50000': 'Mythic',
};

const DEFAULT_STAT_MULTIPLIERS: Record<string, number> = {
  streak: 1.5,
  bonus: 2.0,
  manual: 1.0,
  auto: 1.0,
};

function parseJsonRecord(str: string): Record<string, string | number> {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function createDefaultConfig(userId: string) {
  const now = new Date().toISOString();
  return {
    id: cuid(),
    userId,
    mode: 'AUTO',
    xpLevelFormula: 'floor(sqrt(totalXP / 100))',
    levelRankMap: JSON.stringify(DEFAULT_LEVEL_RANK_MAP),
    rankTitles: JSON.stringify(DEFAULT_RANK_TITLES),
    artifactThresholds: JSON.stringify(DEFAULT_ARTIFACT_THRESHOLDS),
    statMultipliers: JSON.stringify(DEFAULT_STAT_MULTIPLIERS),
    updatedAt: now,
  };
}

export async function getRulebook(userId: string): Promise<RulebookConfig> {
  const db = readDb();
  const configs = db.rulebookConfigs ?? [];
  let config = configs.find((c) => c.userId === userId);

  if (!config) {
    config = createDefaultConfig(userId);
    db.rulebookConfigs = configs;
    db.rulebookConfigs.push(config);
    writeDb(db);
  }

  return {
    id: config.id,
    userId: config.userId,
    mode: config.mode === 'MANUAL' ? 'MANUAL' : 'AUTO',
    xpLevelFormula: config.xpLevelFormula,
    levelRankMap: (parseJsonRecord(config.levelRankMap) || DEFAULT_LEVEL_RANK_MAP) as Record<string, string>,
    rankTitles: (parseJsonRecord(config.rankTitles) || DEFAULT_RANK_TITLES) as Record<string, string>,
    artifactThresholds: (parseJsonRecord(config.artifactThresholds) || DEFAULT_ARTIFACT_THRESHOLDS) as Record<string, string>,
    statMultipliers: (parseJsonRecord(config.statMultipliers) || DEFAULT_STAT_MULTIPLIERS) as Record<string, number>,
  };
}

export interface UpdateRulebookData {
  mode?: 'AUTO' | 'MANUAL';
  xpLevelFormula?: string;
  levelRankMap?: Record<string, string>;
  rankTitles?: Record<string, string>;
  artifactThresholds?: Record<string, string>;
  statMultipliers?: Record<string, number>;
}

export async function updateRulebook(
  userId: string,
  data: UpdateRulebookData
): Promise<RulebookConfig> {
  const db = readDb();
  db.rulebookConfigs = db.rulebookConfigs ?? [];
  const idx = db.rulebookConfigs.findIndex((c) => c.userId === userId);

  let config = db.rulebookConfigs[idx];
  if (!config) {
    config = createDefaultConfig(userId);
    db.rulebookConfigs.push(config);
  }

  const now = new Date().toISOString();
  if (data.mode !== undefined) config.mode = data.mode;
  if (data.xpLevelFormula !== undefined) config.xpLevelFormula = data.xpLevelFormula;
  if (data.levelRankMap !== undefined) config.levelRankMap = JSON.stringify(data.levelRankMap);
  if (data.rankTitles !== undefined) config.rankTitles = JSON.stringify(data.rankTitles);
  if (data.artifactThresholds !== undefined)
    config.artifactThresholds = JSON.stringify(data.artifactThresholds);
  if (data.statMultipliers !== undefined)
    config.statMultipliers = JSON.stringify(data.statMultipliers);
  config.updatedAt = now;

  if (idx >= 0) {
    db.rulebookConfigs[idx] = config;
  }

  writeDb(db);

  return {
    id: config.id,
    userId: config.userId,
    mode: config.mode === 'MANUAL' ? 'MANUAL' : 'AUTO',
    xpLevelFormula: config.xpLevelFormula,
    levelRankMap: (parseJsonRecord(config.levelRankMap) || DEFAULT_LEVEL_RANK_MAP) as Record<string, string>,
    rankTitles: (parseJsonRecord(config.rankTitles) || DEFAULT_RANK_TITLES) as Record<string, string>,
    artifactThresholds: (parseJsonRecord(config.artifactThresholds) || DEFAULT_ARTIFACT_THRESHOLDS) as Record<string, string>,
    statMultipliers: (parseJsonRecord(config.statMultipliers) || DEFAULT_STAT_MULTIPLIERS) as Record<string, number>,
  };
}

export async function resetRulebook(userId: string): Promise<RulebookConfig> {
  const db = readDb();
  db.rulebookConfigs = db.rulebookConfigs ?? [];
  const idx = db.rulebookConfigs.findIndex((c) => c.userId === userId);
  const config = createDefaultConfig(userId);

  if (idx >= 0) {
    db.rulebookConfigs[idx] = config;
  } else {
    db.rulebookConfigs.push(config);
  }

  writeDb(db);

  return {
    id: config.id,
    userId: config.userId,
    mode: 'AUTO',
    xpLevelFormula: config.xpLevelFormula,
    levelRankMap: DEFAULT_LEVEL_RANK_MAP,
    rankTitles: DEFAULT_RANK_TITLES,
    artifactThresholds: DEFAULT_ARTIFACT_THRESHOLDS,
    statMultipliers: DEFAULT_STAT_MULTIPLIERS,
  };
}
