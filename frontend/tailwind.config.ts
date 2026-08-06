/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#fafafa',
          dark: '#111111',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1a1a1a',
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#2a2a2a',
        },
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#eff6ff',
        },
        accent: '#3b82f6',
        muted: {
          DEFAULT: '#6b7280',
          dark: '#9ca3af',
        },
        danger: {
          DEFAULT: '#ef4444',
          light: '#fef2f2',
        },
        success: {
          DEFAULT: '#22c55e',
          light: '#f0fdf4',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'modal': '0 20px 25px -5px rgba(0,0,0,0.10), 0 10px 10px -5px rgba(0,0,0,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
