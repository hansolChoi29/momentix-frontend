import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C9A84C',
        'gold-light': '#E8CC88',
        'gold-dim': '#8A6F30',
        obsidian: '#0A0A0B',
        charcoal: '#111114',
        surface: '#18181C',
        'surface-2': '#222228',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        headline: ['Playfair Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
