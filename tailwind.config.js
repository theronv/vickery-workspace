/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vd: {
          bg: '#0d0f14',
          surface: '#1a1d24',
          border: '#2a2d35',
          accent: '#f97316',
          'text-primary': '#f9fafb',
          'text-secondary': '#9ca3af',
          'text-dim': '#6b7280',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      fontFamily: {
        display: ['"Cabinet Grotesk"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}
