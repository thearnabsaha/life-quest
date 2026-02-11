'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  User,
  FolderOpen,
  CheckSquare,
  Target,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Radar,
  ShoppingBag,
} from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from './SidebarContext';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/xp', icon: Zap, label: 'XP' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/radar', icon: Radar, label: 'Stats Radar' },
  { href: '/goals', icon: Target, label: 'Challenges' },
  { href: '/shop', icon: ShoppingBag, label: 'XP Shop' },
  { href: '/rulebook', icon: BookOpen, label: 'Rulebook' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

function NavLink({
  href,
  icon: Icon,
  label,
  isActive,
  variant,
  isExpanded,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  variant: 'desktop' | 'mobile';
  isExpanded?: boolean;
}) {
  if (variant === 'mobile') {
    return (
      <Link
        href={href}
        className={clsx(
          'flex flex-col items-center justify-center gap-1 py-2 px-3 min-w-[48px]',
          'transition-colors duration-150',
          isActive
            ? 'text-neonGreen border-b-2 border-neonGreen shadow-[0_0_8px_rgba(57,255,20,0.5)]'
            : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
        )}
      >
        <Icon className="w-5 h-5" strokeWidth={2} />
        <span className="font-body text-[10px]">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      title={!isExpanded ? label : undefined}
      className={clsx(
        'flex items-center py-3 mx-2 mb-1 border-l-4 transition-all duration-150',
        isExpanded ? 'gap-3 px-4' : 'justify-center px-0',
        isActive
          ? 'border-neonGreen bg-neonGreen/10 text-neonGreen shadow-[0_0_12px_rgba(57,255,20,0.3)]'
          : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50'
      )}
    >
      <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
      {isExpanded && (
        <span className="font-body text-sm whitespace-nowrap">{label}</span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebar();

  return (
    <>
      {/* Mobile: bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="bg-zinc-950 border-t-2 border-zinc-800 flex items-center justify-around py-2 px-2">
          {navItems.map(({ href, icon, label }) => {
            const isActive =
              pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <NavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                isActive={isActive}
                variant="mobile"
              />
            );
          })}
        </div>
      </nav>

      {/* Desktop: vertical sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 h-full bg-zinc-950 border-r-2 border-zinc-800',
          'hidden md:flex flex-col transition-all duration-200 ease-out',
          isExpanded ? 'w-60' : 'w-16'
        )}
      >
      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center h-14 w-full border-b-2 border-zinc-800 hover:bg-zinc-800/50 transition-colors"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="w-5 h-5 text-zinc-400" strokeWidth={2} />
        ) : (
          <ChevronRight className="w-5 h-5 text-zinc-400" strokeWidth={2} />
        )}
      </button>

      <nav className="flex-1 flex flex-col py-4 overflow-y-auto">
        {navItems.map(({ href, icon, label }) => {
          const isActive =
            pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <NavLink
              key={href}
              href={href}
              icon={icon}
              label={label}
              isActive={isActive}
              variant="desktop"
              isExpanded={isExpanded}
            />
          );
        })}
      </nav>
    </aside>
    </>
  );
}
