/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#0f1419',
          secondary: '#1a1f2e',
          tertiary: '#232a3b',
        },
        accent: {
          cyan: '#00d9ff',
          purple: '#9d00ff',
          orange: '#ff6b35',
          green: '#00ff88',
          gold: '#ffd700',
          gray: '#8899aa',
        },
        danger: '#ff4444',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      borderRadius: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};
