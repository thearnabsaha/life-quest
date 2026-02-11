'use client';

import { motion } from 'framer-motion';

const NEON_COLORS: Record<string, string> = {
  neonGreen: '#39ff14',
  neonPink: '#ff2d95',
  neonBlue: '#00d4ff',
  neonYellow: '#ffe600',
  neonPurple: '#bf00ff',
};

interface XPBurstAnimationProps {
  amount: number;
  position: { x: number; y: number };
  onComplete: () => void;
  color?: string;
}

const NUM_PARTICLES = 5;
const PARTICLE_POSITIONS = Array.from({ length: NUM_PARTICLES }, (_, i) => ({
  angle: (i / NUM_PARTICLES) * Math.PI * 2 + Math.random() * 0.5,
}));

export function XPBurstAnimation({
  amount,
  position,
  onComplete,
  color = 'neonGreen',
}: XPBurstAnimationProps) {
  const neonColor = NEON_COLORS[color] ?? NEON_COLORS.neonGreen;
  const textShadowGlow = `0 0 10px ${neonColor}, 0 0 20px ${neonColor}, 0 0 40px ${neonColor}`;

  return (
    <motion.div
      className="pointer-events-none fixed z-[9999] font-heading text-sm md:text-base"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        y: -80,
        scale: 1.5,
      }}
      transition={{
        duration: 1.2,
        ease: 'easeOut',
      }}
      onAnimationComplete={onComplete}
    >
      {/* Scatter particles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {PARTICLE_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: neonColor,
              boxShadow: `0 0 8px ${neonColor}`,
            }}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [1, 0.8, 0],
              scale: [0, 1.5, 0.3],
              x: Math.cos(pos.angle) * 60,
              y: Math.sin(pos.angle) * 60 - 20,
            }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
              delay: i * 0.06,
            }}
          />
        ))}
      </div>

      {/* Main XP text */}
      <span
        style={{
          color: neonColor,
          textShadow: textShadowGlow,
        }}
      >
        +{amount} XP
      </span>
    </motion.div>
  );
}
