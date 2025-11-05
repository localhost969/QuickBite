import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'sans-serif',
      ],
      display: [
        'Sora',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'sans-serif',
      ],
      mono: [
        '"JetBrains Mono"',
        '"Courier New"',
        'monospace',
      ],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1.2' }],
      '6xl': ['3.75rem', { lineHeight: '1.2' }],
      '7xl': ['4.5rem', { lineHeight: '1.2' }],
    },
    letterSpacing: {
      tighter: '-0.03em',
      tight: '-0.015em',
      normal: '0em',
      wide: '0.015em',
      wider: '0.03em',
      widest: '0.05em',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      primary: {
        '50': '#f3f5fb',
        '100': '#e8ebf7',
        '200': '#c8d1ef',
        '300': '#a8b7e7',
        '400': '#6b7eb8',
        '500': '#3d4fa3',
        '600': '#1a2d7a',
        '700': '#011152',
        '800': '#010a2e',
        '900': '#050623',
      },
      navy: {
        '50': '#f3f5fb',
        '100': '#e8ebf7',
        '200': '#c8d1ef',
        '300': '#a8b7e7',
        '400': '#6b7eb8',
        '500': '#3d4fa3',
        '600': '#1a2d7a',
        '700': '#011152',
        '800': '#010a2e',
        '900': '#050623',
      },
      gray: {
        '50': '#f9fafb',
        '100': '#f3f4f6',
        '200': '#e5e7eb',
        '300': '#d1d5db',
        '400': '#9ca3af',
        '500': '#6b7280',
        '600': '#4b5563',
        '700': '#374151',
        '800': '#1f2937',
        '900': '#111827',
      },
    },
    extend: {
      backgroundColor: {
        'white': '#ffffff',
      },
      textColor: {
        'primary': '#011152',
      },
    },
  },
  plugins: [],
};

export default config;
