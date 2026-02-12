'use client';

import { useRef, useEffect } from 'react';
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
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', short: 'Home' },
  { href: '/profile', icon: User, label: 'Profile', short: 'Profile' },
  { href: '/categories', icon: FolderOpen, label: 'Categories', short: 'Cats' },
  { href: '/habits', icon: CheckSquare, label: 'Habits', short: 'Habits' },
  { href: '/xp', icon: Zap, label: 'XP', short: 'XP' },
  { href: '/calendar', icon: Calendar, label: 'Calendar', short: 'Calendar' },
  { href: '/radar', icon: Radar, label: 'Stats Radar', short: 'Radar' },
  { href: '/goals', icon: Target, label: 'Challenges', short: 'Goals' },
  { href: '/shop', icon: ShoppingBag, label: 'XP Shop', short: 'Shop' },
  { href: '/rulebook', icon: BookOpen, label: 'Rulebook', short: 'Rules' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics', short: 'Stats' },
  { href: '/settings', icon: Settings, label: 'Settings', short: 'Config' },
] as const;

/* ===== Mobile Tab Item ===== */
function MobileTab({
  href,
  icon: Icon,
  label,
  isActive,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'mobile-tab',
        'flex flex-col items-center justify-center shrink-0 relative',
        'rounded-xl transition-all duration-200 active:scale-95',
      )}
      style={{
        width: '60px',
        height: '54px',
      }}
    >
      {/* Active pill indicator */}
      {isActive && (
        <span
          className="absolute top-[2px] left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '20px',
            height: '3px',
            backgroundColor: 'var(--color-accent)',
            boxShadow: '0 0 6px var(--color-accent-glow)',
          }}
        />
      )}

      {/* Icon container */}
      <div
        className={clsx(
          'flex items-center justify-center rounded-lg transition-all duration-200',
          isActive ? 'w-8 h-8' : 'w-7 h-7',
        )}
        style={{
          backgroundColor: isActive
            ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)'
            : 'transparent',
        }}
      >
        <Icon
          className={clsx(
            'transition-all duration-200',
            isActive ? 'w-[18px] h-[18px]' : 'w-4 h-4',
          )}
          strokeWidth={isActive ? 2.4 : 1.6}
          style={{
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
          }}
        />
      </div>

      {/* Label */}
      <span
        className={clsx(
          'font-body leading-none mt-[2px] transition-all duration-200',
          isActive ? 'opacity-100' : 'opacity-60',
        )}
        style={{
          fontSize: '8.5px',
          fontWeight: isActive ? 600 : 400,
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
          letterSpacing: '0.03em',
        }}
      >
        {label}
      </span>
    </Link>
  );
}

/* ===== Desktop Sidebar Link ===== */
function DesktopNavLink({
  href,
  icon: Icon,
  label,
  isActive,
  isExpanded,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
}) {
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
        backgroundColor: isActive
          ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
          : 'transparent',
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

/* ===== Sidebar (Mobile + Desktop) ===== */
export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebar();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active item into view on mobile
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [pathname]);

  return (
    <>
      {/* ===== Mobile Bottom Tab Bar ===== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          /* Frosted glass effect */
          backgroundColor: 'color-mix(in srgb, var(--color-bg-surface) 92%, transparent)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderTop: '1px solid color-mix(in srgb, var(--color-border) 60%, transparent)',
        }}
      >
        <div
          ref={scrollRef}
          className="flex items-center overflow-x-auto scrollbar-hide"
          style={{
            padding: '4px 8px',
            paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
            gap: '2px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {navItems.map(({ href, icon, short }) => {
            const isActive =
              pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <div key={href} data-active={isActive ? 'true' : undefined}>
                <MobileTab
                  href={href}
                  icon={icon}
                  label={short}
                  isActive={isActive}
                />
              </div>
            );
          })}
        </div>
      </nav>

      {/* ===== Desktop Sidebar ===== */}
      <aside
        className={clsx(
          'fixed left-0 top-0 z-40 h-full border-r-2 theme-transition',
          'hidden md:flex flex-col transition-all duration-200 ease-out',
          isExpanded ? 'w-60' : 'w-16',
        )}
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
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
              <DesktopNavLink
                key={href}
                href={href}
                icon={icon}
                label={label}
                isActive={isActive}
                isExpanded={isExpanded}
              />
            );
          })}
        </nav>
      </aside>
    </>
  );
}
