import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#F8F4EE',
        surface:      '#FFFFFF',
        surface2:     '#EEE8DE',
        surface3:     '#E5DDD0',
        accent:       '#4A5C38',
        'accent-dim': 'rgba(74,92,56,0.10)',
        gold:         '#C4933F',
        'gold-dim':   'rgba(196,147,63,0.12)',
        text:         '#1C1916',
        muted:        '#8C7B68',
        subtle:       '#B8A898',
        success:      '#4A7C59',
        warning:      '#C4933F',
        danger:       '#C0392B',
        border:       'rgba(0,0,0,0.08)',
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
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass:  '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        'glass-md': '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.06)',
        accent: '0 4px 20px rgba(74,92,56,0.25)',
        gold:   '0 4px 20px rgba(196,147,63,0.30)',
      },
      animation: {
        'slide-up':     'slide-up 0.35s cubic-bezier(0.4,0,0.2,1) both',
        'fade-in':      'fade-in 0.25s ease both',
        'spin-slow':    'spin-slow 3s linear infinite',
        'pulse-accent': 'pulse-accent 2s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
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
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      screens: { xs: '375px' },
    },
  },
  plugins: [],
}

export default config
