import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:         '#0A0A0A',
        surface:    '#141414',
        surface2:   '#1E1E1E',
        surface3:   '#262626',
        accent:     '#C8FF00',
        'accent-dim': 'rgba(200,255,0,0.12)',
        text:       '#F5F5F5',
        muted:      '#6B6B6B',
        subtle:     '#3D3D3D',
        success:    '#22C55E',
        warning:    '#F59E0B',
        danger:     '#EF4444',
        blue:       '#3B82F6',
        border:     '#1E1E1E',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      animation: {
        'slide-up':  'slide-up 0.35s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in':   'fade-in 0.25s ease both',
        'spin-slow': 'spin-slow 3s linear infinite',
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'pulse-accent': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':       { opacity: '1',   transform: 'scale(1.05)' },
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

export default config
