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
        background: '#0a0a0a',
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
    },
  },
  plugins: [],
};

export default config;
