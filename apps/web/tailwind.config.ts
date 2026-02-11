import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      sm: '390px',
      md: '768px',
      lg: '1280px',
      xl: '1920px',
    },
    extend: {
      colors: {
        background: 'var(--color-bg-base)',
        surface: 'var(--color-bg-surface)',
        card: 'var(--color-bg-card)',
        elevated: 'var(--color-bg-elevated)',
        accent: 'var(--color-accent)',
        'accent-2': 'var(--color-accent-2)',
        'accent-glow': 'var(--color-accent-glow)',
        'theme-border': 'var(--color-border)',
        'theme-border-subtle': 'var(--color-border-subtle)',
        'theme-border-accent': 'var(--color-border-accent)',
        'theme-text': 'var(--color-text-primary)',
        'theme-muted': 'var(--color-text-muted)',
        // Keep original neon colors for explicit use
        neonGreen: '#39ff14',
        neonPink: '#ff2d95',
        neonBlue: '#00d4ff',
        neonYellow: '#ffe600',
        neonPurple: '#bf00ff',
      },
      fontFamily: {
        heading: ['"Press Start 2P"', 'cursive'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'theme': 'var(--color-shadow)',
        'glow': '0 0 12px var(--color-accent-glow)',
        'glow-sm': '0 0 8px var(--color-accent-glow)',
        'glow-lg': '0 0 24px var(--color-accent-glow)',
      },
    },
  },
  plugins: [],
};

export default config;
