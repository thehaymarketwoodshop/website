import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sf-pro)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-sf-display)', 'var(--font-sf-pro)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Brand palette ───────────────────────────────
        brand: {
          charcoal:  '#1C1C1C',  // primary text / logo
          ivory:     '#FAF8F5',  // background
          walnut:    '#6B4A2D',  // accent / primary CTA
          oak:       '#A67C52',  // secondary wood tone
          stone:     '#CFCAC4',  // UI lines / borders
          // Lighter tints for hover states & backgrounds
          'walnut-light': '#8B6242',
          'walnut-dark':  '#4E3420',
          'ivory-dark':   '#F0EDE8',
        },
        // ── Legacy woodshop scale (kept for backward compat) ──
        woodshop: {
          50:  '#FAF8F5',
          100: '#F0EDE8',
          200: '#CFCAC4',
          300: '#B8AFA7',
          400: '#A67C52',
          500: '#8B6242',
          600: '#6B4A2D',
          700: '#4E3420',
          800: '#3A2718',
          900: '#1C1C1C',
          950: '#0E0E0E',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
