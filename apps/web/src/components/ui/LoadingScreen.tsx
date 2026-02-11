'use client';

import { motion } from 'framer-motion';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-[#0a0a0a]">
      <motion.h1
        className="font-heading text-xl md:text-2xl text-neonGreen"
        animate={{
          textShadow: [
            '0 0 8px rgba(57, 255, 20, 0.5)',
            '0 0 20px rgba(57, 255, 20, 0.9)',
            '0 0 8px rgba(57, 255, 20, 0.5)',
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        LOADING...
      </motion.h1>

      <div className="w-full max-w-xs border-2 border-white bg-zinc-900 p-1">
        <motion.div
          className="h-4 border-2 border-neonGreen bg-neonGreen"
          initial={{ width: '0%' }}
          animate={{
            width: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <p className="font-body text-xs text-zinc-500 uppercase tracking-widest">
        Preparing your quest...
      </p>
    </div>
  );
}
