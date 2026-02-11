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
            ? 'border-b-2 shadow-glow-sm'
            : 'hover:bg-[var(--color-bg-elevated)]/50'
        )}
        style={{
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
          borderColor: isActive ? 'var(--color-accent)' : 'transparent',
        }}
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
      )}
      style={{
        borderColor: isActive ? 'var(--color-accent)' : 'transparent',
        backgroundColor: isActive ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
        color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
        boxShadow: isActive ? '0 0 12px var(--color-accent-glow)' : 'none',
      }}
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
        <div
          className="border-t-2 flex items-center justify-around py-2 px-2 theme-transition"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
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
          'fixed left-0 top-0 z-40 h-full border-r-2 theme-transition',
          'hidden md:flex flex-col transition-all duration-200 ease-out',
          isExpanded ? 'w-60' : 'w-16'
        )}
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center h-14 w-full border-b-2 transition-colors"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} strokeWidth={2} />
        ) : (
          <ChevronRight className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} strokeWidth={2} />
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
