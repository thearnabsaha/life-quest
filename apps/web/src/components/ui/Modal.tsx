'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative my-8 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="max-h-[85vh] overflow-y-auto border-[3px] border-white bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_#39ff14]"
                style={{ boxShadow: '8px 8px 0px 0px #39ff14' }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-xs text-white md:text-sm">
                    {title}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="border-[2px] border-white bg-zinc-800 p-2 text-white transition-all hover:bg-zinc-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    style={{ boxShadow: '3px 3px 0px 0px #fff' }}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" strokeWidth={3} />
                  </button>
                </div>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
