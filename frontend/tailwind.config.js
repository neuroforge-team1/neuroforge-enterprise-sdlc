/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Command console" palette — deep slate base with a signal-blue
        // accent, distinct per role status colors used across the dashboard.
        ink: '#0F1720',
        panel: '#151E2B',
        panelBorder: '#232E3F',
        signal: '#3E7BFA',
        signalMuted: '#274574',
        success: '#3FB68B',
        warning: '#E0A63E',
        danger: '#E15B5B',
        muted: '#8592A6',
      },
      fontFamily: {
        display: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
