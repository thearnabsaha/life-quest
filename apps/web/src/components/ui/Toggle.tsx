'use client';

import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <label
      className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 border-2 border-white shrink-0 focus:outline-none focus:ring-2 focus:ring-neonGreen focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
      >
        <div
          className={`absolute inset-0 transition-colors duration-200 ${
            checked ? 'bg-neonGreen' : 'bg-zinc-800'
          }`}
        />
        <motion.div
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[2px] left-[2px] w-[18px] h-[18px] border-2 border-white bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        />
      </button>
      {label && (
        <span className="font-body text-sm text-white uppercase tracking-wider">
          {label}
        </span>
      )}
    </label>
  );
}
