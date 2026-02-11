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
        className="relative w-12 h-6 border-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
        style={{
          borderColor: checked ? 'var(--color-accent)' : 'var(--color-border-subtle)',
          focusRingColor: 'var(--color-accent)',
        }}
      >
        <div
          className="absolute inset-0 transition-colors duration-200"
          style={{
            backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
          }}
        />
        <motion.div
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[2px] left-[2px] w-[18px] h-[18px] border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          style={{
            borderColor: checked ? 'var(--color-bg-base)' : 'var(--color-border-accent)',
            backgroundColor: checked ? 'var(--color-bg-base)' : 'var(--color-border-accent)',
          }}
        />
      </button>
      {label && (
        <span className="font-body text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
