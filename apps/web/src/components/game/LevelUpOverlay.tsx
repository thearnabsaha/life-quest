'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface LevelUpOverlayProps {
  newLevel: number;
  newRank: string;
  onDismiss: () => void;
  isVisible: boolean;
}

const SPARKLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function LevelUpOverlay({
  newLevel,
  newRank,
  onDismiss,
  isVisible,
}: LevelUpOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[10000] flex cursor-pointer items-center justify-center bg-black/80"
          onClick={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* White flash */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.3,
              times: [0, 0.2, 1],
            }}
          />

          {/* Sparkles / particles */}
          <div className="absolute inset-0 flex items-center justify-center">
            {SPARKLE_ANGLES.map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const distance = 120 + (i % 3) * 25;
              return (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rotate-45 bg-neonYellow"
                  style={{
                    boxShadow: '0 0 12px #ffe600, 0 0 24px #ffe600',
                  }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: Math.cos(rad) * distance,
                    y: Math.sin(rad) * distance,
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.4 + i * 0.08,
                    ease: 'easeOut',
                  }}
                />
              );
            })}
          </div>

          {/* Main content */}
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* LEVEL UP! text */}
            <motion.h1
              className="font-heading text-2xl md:text-4xl text-neonYellow"
              style={{
                textShadow:
                  '0 0 10px #ffe600, 0 0 20px #ffe600, 0 0 40px #ffe600',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.35,
              }}
            >
              LEVEL UP!
            </motion.h1>

            {/* New level number */}
            <motion.div
              className="font-heading text-5xl md:text-7xl text-neonYellow"
              style={{
                textShadow:
                  '0 0 10px #ffe600, 0 0 30px #ffe600, 0 0 60px #ffe600',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.6,
              }}
            >
              LV.{newLevel}
            </motion.div>

            {/* New rank */}
            <motion.div
              className="rounded border-2 border-neonYellow px-4 py-2 font-heading text-lg text-neonYellow"
              style={{
                textShadow: '0 0 8px #ffe600',
                boxShadow: '0 0 20px rgba(255, 230, 0, 0.3)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.9,
              }}
            >
              RANK: {newRank}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
