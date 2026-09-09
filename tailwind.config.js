import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
    './views/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black: 'rgb(var(--color-black) / <alpha-value>)',
        white: 'rgb(var(--color-white) / <alpha-value>)',
        primary: '#FF5733',
        secondary: '#FFD700',
        chicago: '#41B6E6',
        'background-light': 'rgb(var(--color-bg-light) / <alpha-value>)',
        'background-dark': '#1A1A1A',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'rating-low': '#FF3131',
        'rating-mid': '#FFA500',
        'rating-high': '#22C55E',
      },
      fontFamily: {
        display: ['Fredoka One', 'cursive'],
        sans: ['Quicksand', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
      },
    },
  },
  plugins: [forms, typography, containerQueries, animate],
};
