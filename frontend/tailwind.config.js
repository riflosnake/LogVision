/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#0f172a', // Dark background
          800: '#1e293b', // Card backgrounds
          700: '#334155', // Input backgrounds
          600: '#475569', // Borders
          500: '#64748b', // Muted text
          400: '#94a3b8', // Secondary text
          300: '#cbd5e1', // Primary text
          200: '#e2e8f0', // Highlighted text
          100: '#f1f5f9', // Background accents
          50: '#f8fafc', // Lightest backgrounds
        },
        blue: {
          700: '#1d4ed8', // Primary button
          600: '#2563eb', // Primary button hover
          500: '#3b82f6', // Primary active
          400: '#60a5fa', // Primary accent
        },
        red: {
          500: '#ef4444', // Error
        },
        amber: {
          500: '#f59e0b', // Warning
        },
        green: {
          500: '#22c55e', // Success
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};