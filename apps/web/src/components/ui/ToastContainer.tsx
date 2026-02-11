'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToastStore } from '@/stores/useToastStore';

const ICON_MAP = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
};

const COLOR_MAP = {
  error: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  success: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
  },
  info: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = ICON_MAP[toast.type];
          const colors = COLOR_MAP[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`flex items-start gap-2 px-4 py-3 border-2 ${colors.border} ${colors.bg} backdrop-blur-sm`}
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${colors.icon}`} strokeWidth={2} />
              <p className={`font-body text-sm flex-1 ${colors.text}`}>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-0.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
