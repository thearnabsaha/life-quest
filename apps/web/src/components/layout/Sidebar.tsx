'use client';

import { useState, useCallback } from 'react';
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
  MoreHorizontal,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from './SidebarContext';

/* ===== Nav items definition ===== */
const allNavItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/xp', icon: Zap, label: 'XP Logs' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/radar', icon: Radar, label: 'Stats Radar' },
  { href: '/goals', icon: Target, label: 'Challenges' },
  { href: '/shop', icon: ShoppingBag, label: 'XP Shop' },
  { href: '/rulebook', icon: BookOpen, label: 'Rulebook' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

/* Mobile: 4 primary tabs + "More" button */
const PRIMARY_TABS = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/habits', icon: CheckSquare, label: 'Habits' },
  { href: '/xp', icon: Zap, label: 'XP' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
] as const;

/* Items shown in the "More" drawer */
const MORE_ITEMS = [
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/radar', icon: Radar, label: 'Stats Radar' },
  { href: '/goals', icon: Target, label: 'Challenges' },
  { href: '/shop', icon: ShoppingBag, label: 'XP Shop' },
  { href: '/rulebook', icon: BookOpen, label: 'Rulebook' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
] as const;

/* ===== Mobile Tab ===== */
function MobileTab({
  icon: Icon,
  label,
  isActive,
  onClick,
  href,
}: {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      {/* Active indicator */}
      {isActive && (
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
          style={{
            width: '18px',
            height: '2px',
            backgroundColor: 'var(--color-accent)',
            boxShadow: '0 0 8px var(--color-accent-glow)',
          }}
        />
      )}
      <Icon
        style={{
          width: '22px',
          height: '22px',
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
          transition: 'color 0.15s',
        }}
        strokeWidth={isActive ? 2.2 : 1.5}
      />
      <span
        style={{
          fontSize: '10px',
          lineHeight: '13px',
          marginTop: '2px',
          fontWeight: isActive ? 600 : 400,
          color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
          opacity: isActive ? 1 : 0.6,
          transition: 'all 0.15s',
        }}
      >
        {label}
      </span>
    </>
  );

  const cls = 'mobile-tab flex flex-col items-center justify-center flex-1 relative';
  const style = { minHeight: '52px' };

  if (href) {
    return (
      <Link href={href} className={cls} style={style}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {inner}
    </button>
  );
}

/* ===== More Drawer ===== */
function MoreDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] md:hidden"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Drawer sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[61] md:hidden rounded-t-2xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderTop: '1px solid var(--color-border)',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span
            className="font-heading text-[10px] tracking-wider"
            style={{ color: 'var(--color-text-muted)' }}
          >
            MORE
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ backgroundColor: 'color-mix(in srgb, var(--color-border) 30%, transparent)' }}
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Grid of nav items */}
        <div className="grid grid-cols-4 gap-1 px-3 pb-2">
          {MORE_ITEMS.map(({ href, icon: Icon, label }) => {
            const isActive =
              pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl active:scale-95 transition-transform"
                style={{
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)'
                    : 'transparent',
                }}
              >
                <Icon
                  className="w-6 h-6"
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)',
                  }}
                />
                <span
                  className="text-center"
                  style={{
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
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

/* ===== Main Sidebar Component ===== */
export function Sidebar() {
  const pathname = usePathname();
  const { isExpanded, toggle } = useSidebar();
  const [moreOpen, setMoreOpen] = useState(false);

  const toggleMore = useCallback(() => setMoreOpen((v) => !v), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  // Check if current path is one of the "More" items
  const isMoreActive = MORE_ITEMS.some(
    ({ href }) => pathname === href || (href !== '/' && pathname.startsWith(href)),
  );

  return (
    <>
      {/* ===== Mobile Bottom Tab Bar — 5 items max ===== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div
          className="flex items-stretch"
          style={{
            paddingBottom: 'max(2px, env(safe-area-inset-bottom))',
          }}
        >
          {PRIMARY_TABS.map(({ href, icon, label }) => {
            const isActive =
              pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <MobileTab
                key={href}
                href={href}
                icon={icon}
                label={label}
                isActive={isActive}
              />
            );
          })}

          {/* More button */}
          <MobileTab
            icon={MoreHorizontal}
            label="More"
            isActive={moreOpen || isMoreActive}
            onClick={toggleMore}
          />
        </div>
      </nav>

      {/* More drawer */}
      <MoreDrawer open={moreOpen} onClose={closeMore} pathname={pathname} />

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
          {allNavItems.map(({ href, icon, label }) => {
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
