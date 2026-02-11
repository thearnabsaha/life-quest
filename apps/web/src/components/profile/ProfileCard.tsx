'use client';

import type { Profile } from '@life-quest/types';
import { AvatarDisplay } from './AvatarDisplay';
import { XPBar } from './XPBar';
import { RankDisplay } from './RankDisplay';
import { LevelBadge } from './LevelBadge';

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const displayName = profile.displayName || 'Hunter';

  return (
    <div className="border-2 border-white bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_#39ff14]">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar - left */}
        <div className="flex-shrink-0">
          <AvatarDisplay
            avatarTier={profile.avatarTier}
            level={profile.level}
            size="lg"
          />
        </div>

        {/* Name, Rank, Level - center */}
        <div className="flex-1 flex flex-col items-center md:items-start gap-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="font-heading text-xl md:text-2xl text-white">
              {displayName}
            </h1>
            <LevelBadge level={profile.level} rank={profile.rank} size="sm" />
          </div>
          <RankDisplay rank={profile.rank} title={profile.title} size="md" />
        </div>
      </div>

      {/* XP Bar - bottom, full width */}
      <div className="mt-6">
        <XPBar
          totalXP={profile.totalXP}
          manualLevelOverride={profile.manualLevelOverride}
          manualXPOverride={profile.manualXPOverride}
        />
      </div>
    </div>
  );
}
