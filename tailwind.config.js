/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // POINTX app tokens (sampled from live app screenshots)
        surface: '#f4f2f9',
        'surface-dim': '#e9e5f2',
        'surface-bright': '#ffffff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f9f8fc',
        'surface-container': '#efecf5',
        'surface-container-high': '#e4dff0',
        'surface-container-highest': '#d8d2e8',
        'on-surface': '#1f1147',
        'on-surface-variant': '#6b6480',
        outline: '#9a93ad',
        'outline-variant': '#ddd8e8',

        // Primary = POINTX purple; accent = POINTX magenta/pink
        primary: '#3b1670',
        'on-primary': '#ffffff',
        'primary-container': '#2a0a5e',
        'primary-fixed': '#ede6fa',
        'primary-fixed-dim': '#d6c8f2',
        accent: '#d6186b',
        'accent-soft': '#fde7f0',

        background: '#f4f2f9',
        'on-background': '#1f1147',

        // POINTX brand aliases
        px: {
          purple: '#3b1670',
          'purple-deep': '#2a0a5e',
          'purple-soft': '#ede6fa',
          magenta: '#8a1562',
          pink: '#d6186b',
          'pink-soft': '#fde7f0',
          'badge-red': '#dc4a6c',
          navy: '#1f1147',
          gold: '#f0b53a',
          'gold-soft': '#fdf3dc',
          orange: '#f08c2e',
          green: '#1aa35a',
          'green-soft': '#e5f6ec',
          grey: '#9a93ad',
        },
        ink: '#1f1147',
        muted: '#6b6480',
        canvas: '#f4f2f9',
        card: '#ffffff',
        success: '#1aa35a',
        warning: '#e07b1a',
        danger: '#d0021b',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        heading: ['Prompt', 'Inter', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(31,17,71,0.06), 0 4px 14px rgba(31,17,71,0.05)',
        float: '0 8px 22px rgba(31,17,71,0.22)',
        frame: '0 30px 80px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(214,24,107,0.45)' },
          '50%': { boxShadow: '0 0 0 12px rgba(214,24,107,0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
