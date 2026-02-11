// ===== Theme Definitions =====
// Each theme defines CSS custom properties for the entire UI.

export interface ThemeColors {
  /** Main page background */
  bgBase: string;
  /** Sidebar / topbar background */
  bgSurface: string;
  /** Card / panel background */
  bgCard: string;
  /** Elevated element (button, input) */
  bgElevated: string;
  /** Primary accent */
  accent: string;
  /** Secondary accent */
  accent2: string;
  /** Accent glow (for shadows) */
  accentGlow: string;
  /** Primary border */
  border: string;
  /** Subtle/muted border */
  borderSubtle: string;
  /** Accent border (card outlines) */
  borderAccent: string;
  /** Primary text */
  textPrimary: string;
  /** Muted text */
  textMuted: string;
  /** Card shadow */
  shadow: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colors: ThemeColors;
  /** Preview gradient for the picker */
  preview: string;
}

export const themes: Theme[] = [
  {
    id: 'solo-leveling',
    name: 'Solo Leveling',
    description: 'Arise. Deep indigo void with luminous blue system windows.',
    emoji: '👤',
    preview: 'linear-gradient(135deg, #050510 0%, #0a1628 40%, #1a0a3e 100%)',
    colors: {
      bgBase: '#050510',
      bgSurface: '#0a0a1a',
      bgCard: '#0d1530',
      bgElevated: '#152040',
      accent: '#4dabff',
      accent2: '#9d4edd',
      accentGlow: 'rgba(77, 171, 255, 0.35)',
      border: '#1a2744',
      borderSubtle: '#253560',
      borderAccent: '#4dabff',
      textPrimary: 'rgba(200, 220, 255, 0.95)',
      textMuted: '#5a7aa0',
      shadow: '6px 6px 0px 0px rgba(77, 171, 255, 0.2)',
    },
  },
  {
    id: 'shadow-monarch',
    name: 'Shadow Monarch',
    description: 'Command the shadows. Deep purple void with silver light.',
    emoji: '👑',
    preview: 'linear-gradient(135deg, #080010 0%, #150828 40%, #2a0845 100%)',
    colors: {
      bgBase: '#080010',
      bgSurface: '#0c0618',
      bgCard: '#180d30',
      bgElevated: '#241540',
      accent: '#c0c0d0',
      accent2: '#a855f7',
      accentGlow: 'rgba(168, 85, 247, 0.35)',
      border: '#2a1748',
      borderSubtle: '#3d2060',
      borderAccent: '#a855f7',
      textPrimary: 'rgba(220, 210, 240, 0.95)',
      textMuted: '#7a6899',
      shadow: '6px 6px 0px 0px rgba(168, 85, 247, 0.2)',
    },
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    description: 'The original brutalist neon. Green sparks on dark steel.',
    emoji: '🌃',
    preview: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a0a 40%, #1a0a2a 100%)',
    colors: {
      bgBase: '#0a0a0a',
      bgSurface: '#09090b',
      bgCard: '#18181b',
      bgElevated: '#27272a',
      accent: '#39ff14',
      accent2: '#ff2d95',
      accentGlow: 'rgba(57, 255, 20, 0.3)',
      border: '#27272a',
      borderSubtle: '#3f3f46',
      borderAccent: '#ffffff',
      textPrimary: 'rgba(255, 255, 255, 0.9)',
      textMuted: '#a1a1aa',
      shadow: '6px 6px 0px 0px rgba(255, 255, 255, 0.2)',
    },
  },
  {
    id: 'hunters-gate',
    name: "Hunter's Gate",
    description: 'Step through the gate. Dark void with orange energy cracks.',
    emoji: '🚪',
    preview: 'linear-gradient(135deg, #0a0500 0%, #1a0f00 40%, #2a1500 100%)',
    colors: {
      bgBase: '#0a0500',
      bgSurface: '#0d0800',
      bgCard: '#1c1208',
      bgElevated: '#2a1c10',
      accent: '#ff8c00',
      accent2: '#ff4500',
      accentGlow: 'rgba(255, 140, 0, 0.35)',
      border: '#2a1c0a',
      borderSubtle: '#3d2810',
      borderAccent: '#ff8c00',
      textPrimary: 'rgba(255, 230, 200, 0.95)',
      textMuted: '#8a7050',
      shadow: '6px 6px 0px 0px rgba(255, 140, 0, 0.2)',
    },
  },
  {
    id: 'crimson-knight',
    name: 'Crimson Knight',
    description: 'Blood and steel. Dark crimson with fierce red glow.',
    emoji: '⚔️',
    preview: 'linear-gradient(135deg, #0a0000 0%, #1a0508 40%, #2a0010 100%)',
    colors: {
      bgBase: '#0a0005',
      bgSurface: '#0d0008',
      bgCard: '#1c0810',
      bgElevated: '#2a1018',
      accent: '#ef4444',
      accent2: '#f97316',
      accentGlow: 'rgba(239, 68, 68, 0.35)',
      border: '#2a0a14',
      borderSubtle: '#3d101c',
      borderAccent: '#ef4444',
      textPrimary: 'rgba(255, 220, 220, 0.95)',
      textMuted: '#8a5555',
      shadow: '6px 6px 0px 0px rgba(239, 68, 68, 0.2)',
    },
  },
  {
    id: 'emerald-sage',
    name: 'Emerald Sage',
    description: 'Ancient forest power. Deep green with teal radiance.',
    emoji: '🌿',
    preview: 'linear-gradient(135deg, #000a05 0%, #001a0f 40%, #002a15 100%)',
    colors: {
      bgBase: '#000a05',
      bgSurface: '#000d08',
      bgCard: '#081c12',
      bgElevated: '#102a1a',
      accent: '#10b981',
      accent2: '#06b6d4',
      accentGlow: 'rgba(16, 185, 129, 0.35)',
      border: '#0a2a18',
      borderSubtle: '#103d22',
      borderAccent: '#10b981',
      textPrimary: 'rgba(220, 255, 240, 0.95)',
      textMuted: '#558a70',
      shadow: '6px 6px 0px 0px rgba(16, 185, 129, 0.2)',
    },
  },
  {
    id: 'ocean-abyss',
    name: 'Ocean Abyss',
    description: 'Into the deep. Navy darkness with bioluminescent cyan.',
    emoji: '🌊',
    preview: 'linear-gradient(135deg, #000510 0%, #000f28 40%, #001540 100%)',
    colors: {
      bgBase: '#000510',
      bgSurface: '#000818',
      bgCard: '#081c38',
      bgElevated: '#102848',
      accent: '#06b6d4',
      accent2: '#3b82f6',
      accentGlow: 'rgba(6, 182, 212, 0.35)',
      border: '#0a2040',
      borderSubtle: '#103050',
      borderAccent: '#06b6d4',
      textPrimary: 'rgba(210, 240, 255, 0.95)',
      textMuted: '#507a8a',
      shadow: '6px 6px 0px 0px rgba(6, 182, 212, 0.2)',
    },
  },
  {
    id: 'golden-srank',
    name: 'Golden S-Rank',
    description: 'The pinnacle. Rich dark gold with amber luminescence.',
    emoji: '🏆',
    preview: 'linear-gradient(135deg, #0a0800 0%, #1a1200 40%, #2a1c00 100%)',
    colors: {
      bgBase: '#0a0800',
      bgSurface: '#0d0a00',
      bgCard: '#1c1608',
      bgElevated: '#2a2010',
      accent: '#f59e0b',
      accent2: '#eab308',
      accentGlow: 'rgba(245, 158, 11, 0.35)',
      border: '#2a200a',
      borderSubtle: '#3d3010',
      borderAccent: '#f59e0b',
      textPrimary: 'rgba(255, 240, 210, 0.95)',
      textMuted: '#8a7a50',
      shadow: '6px 6px 0px 0px rgba(245, 158, 11, 0.2)',
    },
  },
  {
    id: 'sakura-dream',
    name: 'Sakura Dream',
    description: 'Petal storm. Dark rose with cherry blossom pink glow.',
    emoji: '🌸',
    preview: 'linear-gradient(135deg, #0a0008 0%, #1a0514 40%, #2a0820 100%)',
    colors: {
      bgBase: '#0a0008',
      bgSurface: '#0d000a',
      bgCard: '#1c0818',
      bgElevated: '#2a1025',
      accent: '#ec4899',
      accent2: '#f472b6',
      accentGlow: 'rgba(236, 72, 153, 0.35)',
      border: '#2a0a1c',
      borderSubtle: '#3d1028',
      borderAccent: '#ec4899',
      textPrimary: 'rgba(255, 220, 240, 0.95)',
      textMuted: '#8a5570',
      shadow: '6px 6px 0px 0px rgba(236, 72, 153, 0.2)',
    },
  },
  {
    id: 'frost-walker',
    name: 'Frost Walker',
    description: 'Ice dominion. Frozen dark with silver-white frost.',
    emoji: '❄️',
    preview: 'linear-gradient(135deg, #050810 0%, #0a1020 40%, #0f1830 100%)',
    colors: {
      bgBase: '#050810',
      bgSurface: '#080c18',
      bgCard: '#101828',
      bgElevated: '#182238',
      accent: '#94a3b8',
      accent2: '#60a5fa',
      accentGlow: 'rgba(148, 163, 184, 0.35)',
      border: '#1a2438',
      borderSubtle: '#253448',
      borderAccent: '#94a3b8',
      textPrimary: 'rgba(230, 240, 255, 0.95)',
      textMuted: '#607088',
      shadow: '6px 6px 0px 0px rgba(148, 163, 184, 0.2)',
    },
  },
];

export function getTheme(id: string): Theme {
  return themes.find((t) => t.id === id) ?? themes[0];
}
