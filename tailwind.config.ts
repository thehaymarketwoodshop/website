import type { Config } from 'tailwindcss';

// Lets CSS-variable colours accept Tailwind opacity modifiers (bg-background/85).
const v = (name: string) => `color-mix(in srgb, var(--${name}) calc(<alpha-value> * 100%), transparent)`;

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        display: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        background: v('background'),
        foreground: v('foreground'),
        muted: v('muted'),
        accent: { DEFAULT: v('accent'), deep: v('accent-deep'), soft: v('accent-soft') },
        border: v('border'),
        surface: { DEFAULT: v('surface'), alt: v('surface-alt') },
        'on-dark': { DEFAULT: v('on-dark'), muted: v('on-dark-muted') },
        // Legacy names still used by the shop and invoice pages
        brand: {
          charcoal: 'var(--foreground)',
          ivory: 'var(--background)',
          walnut: 'var(--accent)',
          oak: '#A67C52',
          stone: 'var(--border)',
          'walnut-light': '#74502F',
          'walnut-dark': 'var(--accent-deep)',
          'ivory-dark': 'var(--surface)',
        },
        woodshop: {
          50: '#F5F1EA', 100: '#EAE3D7', 200: '#D8CFC1', 300: '#B8AFA7', 400: '#A67C52',
          500: '#74502F', 600: '#5C3D26', 700: '#3A2616', 800: '#2A1C12', 900: '#24211E', 950: '#1B1613',
        },
      },
      transitionTimingFunction: { 'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
};

export default config;
