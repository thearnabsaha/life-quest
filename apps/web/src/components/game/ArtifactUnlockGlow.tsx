'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { ArtifactRarity } from '@life-quest/types';

const RARITY_COLORS: Record<ArtifactRarity, string> = {
  COMMON: '#ffffff',
  RARE: '#00d4ff',
  EPIC: '#bf00ff',
  LEGENDARY: '#ffe600',
  MYTHIC: '#ff2d95',
};

interface ArtifactUnlockGlowProps {
  artifactName: string;
  rarity: ArtifactRarity;
  onDismiss: () => void;
  isVisible: boolean;
}

export function ArtifactUnlockGlow({
  artifactName,
  rarity,
  onDismiss,
  isVisible,
}: ArtifactUnlockGlowProps) {
  const color = RARITY_COLORS[rarity] ?? RARITY_COLORS.COMMON;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9998] flex cursor-pointer items-center justify-center bg-black/90"
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Pulsing glow backdrop */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${color}20 0%, transparent 70%)`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0.3, 0.8, 0.5],
              scale: [0.5, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.5, 1],
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Intensifying glow rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="pointer-events-none absolute h-96 w-96 rounded-full border-2"
              style={{
                borderColor: color,
                boxShadow: `0 0 30px ${color}, 0 0 60px ${color}40`,
              }}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: [0, 0.6, 0.3],
                scale: [0.3, 1.5, 1.2],
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.2,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Center content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {/* Artifact name reveal */}
            <motion.h2
              className="max-w-md text-center font-heading text-xl md:text-2xl"
              style={{
                color,
                textShadow: `0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 150,
                damping: 15,
                delay: 1,
              }}
            >
              {artifactName}
            </motion.h2>

            <motion.span
              className="rounded border px-3 py-1 font-heading text-xs"
              style={{
                borderColor: color,
                color,
                boxShadow: `0 0 15px ${color}60`,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              {rarity}
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
