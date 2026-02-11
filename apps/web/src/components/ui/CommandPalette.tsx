'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  FolderOpen,
  CheckSquare,
  Target,
  Calendar,
  Settings,
  Zap,
  FolderPlus,
  SquarePlus,
  Radar,
  ShoppingBag,
  BarChart3,
  Bell,
  BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
  { value: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { value: 'nav-profile', label: 'Profile', icon: User, href: '/profile' },
  { value: 'nav-categories', label: 'Categories', icon: FolderOpen, href: '/categories' },
  { value: 'nav-habits', label: 'Habits', icon: CheckSquare, href: '/habits' },
  { value: 'nav-goals', label: 'Challenges', icon: Target, href: '/goals' },
  { value: 'nav-xp', label: 'XP Logs', icon: Zap, href: '/xp' },
  { value: 'nav-calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { value: 'nav-radar', label: 'Radar Stats', icon: Radar, href: '/radar' },
  { value: 'nav-analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { value: 'nav-shop', label: 'Shop', icon: ShoppingBag, href: '/shop' },
  { value: 'nav-notifications', label: 'Notifications', icon: Bell, href: '/notifications' },
  { value: 'nav-rulebook', label: 'Rulebook', icon: BookOpen, href: '/rulebook' },
  { value: 'nav-settings', label: 'Settings', icon: Settings, href: '/settings' },
] as const;

const ACTION_ITEMS = [
  { value: 'action-log-xp', label: 'Log XP', icon: Zap, href: '/', action: 'log-xp' },
  { value: 'action-complete-habit', label: 'Complete Habit', icon: CheckSquare, href: '/habits', action: 'complete-habit' },
  { value: 'action-add-category', label: 'Add Category', icon: FolderPlus, href: '/categories', action: 'add-category' },
  { value: 'action-add-habit', label: 'Add Habit', icon: SquarePlus, href: '/habits', action: 'add-habit' },
  { value: 'action-add-goal', label: 'Add Challenge', icon: Target, href: '/goals', action: 'add-goal' },
] as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false);
      const nav = NAV_ITEMS.find((n) => n.value === value);
      const action = ACTION_ITEMS.find((a) => a.value === value);
      if (nav) {
        router.push(nav.href);
      } else if (action) {
        router.push(action.href);
      }
    },
    [router]
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/80"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-xl"
            >
              <Command
                className="border-4 border-white bg-[#0a0a0a] shadow-[8px_8px_0px_0px_rgba(255,255,255,0.3)]"
                onValueChange={handleSelect}
                label="Command Palette"
              >
                <Command.Input
                  placeholder="Search commands..."
                  className="w-full border-b-4 border-white bg-transparent px-6 py-5 font-body text-lg text-white placeholder:text-zinc-500 focus:outline-none"
                />
                <Command.List className="max-h-[320px] overflow-y-auto border-t-2 border-zinc-800 p-2">
                  <Command.Empty className="py-8 text-center font-body text-sm text-zinc-500">
                    No commands found.
                  </Command.Empty>
                  <Command.Group heading="Navigate" className="mb-2">
                    {NAV_ITEMS.map(({ value, label, icon: Icon }) => (
                      <Command.Item
                        key={value}
                        value={value}
                        keywords={[label]}
                        className="flex items-center gap-3 border-2 border-transparent px-4 py-3 font-body text-sm text-white data-[selected=true]:border-neonGreen data-[selected=true]:bg-neonGreen/10 data-[selected=true]:text-neonGreen"
                      >
                        <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                        {label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Group heading="Actions" className="mb-2">
                    {ACTION_ITEMS.map(({ value, label, icon: Icon }) => (
                      <Command.Item
                        key={value}
                        value={value}
                        keywords={[label]}
                        className="flex items-center gap-3 border-2 border-transparent px-4 py-3 font-body text-sm text-white data-[selected=true]:border-neonGreen data-[selected=true]:bg-neonGreen/10 data-[selected=true]:text-neonGreen"
                      >
                        <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                        {label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
