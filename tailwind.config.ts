import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0F172A', 50: '#f0f4ff', 100: '#e0eaff', 500: '#1e3a5f', 700: '#0F172A', 900: '#060d1a' },
        amber: { DEFAULT: '#F59E0B', 400: '#FBBF24', 500: '#F59E0B', 600: '#D97706' },
        cream: '#F8F5F0',
        'warm-white': '#F8F5F0',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.375rem' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
