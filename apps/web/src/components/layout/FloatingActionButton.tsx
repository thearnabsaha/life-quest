'use client';

import { Plus, Zap, CheckSquare, FileText } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const fabOptions = [
  { id: 'log-xp', label: 'Log XP', icon: Zap },
  { id: 'complete-habit', label: 'Complete Habit', icon: CheckSquare },
  { id: 'add-note', label: 'Add Note', icon: FileText },
] as const;

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (id: string) => {
    console.log(`FAB option clicked: ${id}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3 md:bottom-8 md:right-8">
      <AnimatePresence>
        {isOpen &&
          fabOptions.map(({ id, label, icon: Icon }, index) => (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ delay: index * 0.05, duration: 0.15 }}
              onClick={() => handleOptionClick(id)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-2 border-neonGreen text-neonGreen font-body text-sm whitespace-nowrap shadow-[0_0_12px_rgba(57,255,20,0.3)] hover:bg-neonGreen/20 transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              {label}
            </motion.button>
          ))}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 flex items-center justify-center bg-neonGreen border-2 border-neonGreen text-[#0a0a0a] shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:shadow-[0_0_28px_rgba(57,255,20,0.7)] transition-all duration-200"
        aria-label={isOpen ? 'Close FAB menu' : 'Open FAB menu'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </motion.div>
      </button>
    </div>
  );
}
