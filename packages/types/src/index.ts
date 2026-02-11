// ===== Enums & Literal Types =====

export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

export type XPType = 'MANUAL' | 'AUTO' | 'BONUS' | 'STREAK';

export type HabitType = 'YES_NO' | 'HOURS' | 'MANUAL';

export type ArtifactRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export type QuestType = 'DAILY' | 'WEEKLY' | 'MANUAL';

export type QuestStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

// ===== Core Interfaces =====

export interface User {
  id: string;
  email: string;
  createdAt: string;
  profile: Profile | null;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  avatarTier: number;
  level: number;
  totalXP: number;
  rank: Rank;
  title: string;
  manualLevelOverride: number | null;
  manualXPOverride: number | null;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  sortOrder: number;
}

export interface XPLog {
  id: string;
  userId: string;
  categoryId: string | null;
  amount: number;
  type: XPType;
  source: string | null;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: HabitType;
  xpReward: number;
  streak: number;
  isActive: boolean;
  categoryId: string | null;
  subCategoryId: string | null;
  completions: HabitCompletion[];
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  hoursLogged: number | null;
  xpAwarded: number;
}

export interface CalendarEntry {
  id: string;
  userId: string;
  date: string;
  totalXP: number;
  activities: Record<string, unknown> | null;
}

// ===== Phase 2 Types (stubs) =====

export interface Artifact {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  rarity: ArtifactRarity;
  xpThreshold: number;
  redeemed: boolean;
  unlockedAt: string;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: QuestType;
  status: QuestStatus;
  xpReward: number;
  deadline: string | null;
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  date: string;
}

// ===== Phase 2 Types =====

export type GoalType = 'LONG_TERM' | 'SHORT_TERM';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'FAILED';
export type NotificationType = 'LEVEL_UP' | 'STREAK' | 'GOAL_COMPLETE' | 'ARTIFACT_UNLOCK' | 'REMINDER' | 'SUMMARY';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  type: GoalType;
  status: GoalStatus;
  categoryId: string | null;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  deadline: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface RulebookConfig {
  id: string;
  userId: string;
  mode: 'AUTO' | 'MANUAL';
  xpLevelFormula: string;
  levelRankMap: Record<string, string>;
  rankTitles: Record<string, string>;
  artifactThresholds: Record<string, string>; // XP threshold -> rarity name
  statMultipliers: Record<string, number>;
}

export interface HabitCategoryMap {
  id: string;
  habitId: string;
  categoryId: string;
  contributionPercent: number;
  xpMultiplier: number;
}

// ===== XP Shop Types =====

export interface ShopItem {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  cost: number;
  category: 'ARTIFACT' | 'TITLE' | 'AVATAR' | 'CUSTOM';
  rarity: ArtifactRarity;
  imageUrl: string | null;
  isOwned: boolean;
  isRedeemed: boolean;
  refundable: boolean;
  createdAt: string;
}

export interface RedemptionLog {
  id: string;
  userId: string;
  shopItemId: string;
  cost: number;
  action: 'PURCHASE' | 'REFUND';
  createdAt: string;
}

// ===== Radar Stats =====

export interface RadarStat {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  totalXP: number;
  level: number;
  streak: number;
  last7DaysXP: number;
  last30DaysXP: number;
}

// ===== API Types =====

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
