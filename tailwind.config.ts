import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Roshanal Brand Colors ────────────────────────────────────────
      colors: {
        brand: {
          navy:    '#0C1A36',
          blue:    '#1641C4',
          red:     '#C8191C',
          white:   '#FFFFFF',
          offwhite:'#F3F5FB',
          border:  '#E8EBF6',
        },
        text: {
          1: '#080E22',
          2: '#1E2540',
          3: '#4A5270',
          4: '#8990AB',
        },
        success: '#0B6B3A',
        warning: '#9C4B10',
        // Alias for shadcn/ui compatibility
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#1641C4',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F3F5FB',
          foreground: '#080E22',
        },
        destructive: {
          DEFAULT: '#C8191C',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F3F5FB',
          foreground: '#4A5270',
        },
        accent: {
          DEFAULT: '#E8EBF6',
          foreground: '#080E22',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#080E22',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#080E22',
        },
        border: '#E8EBF6',
        input: '#E8EBF6',
        ring: '#1641C4',
      },

      // ─── Typography ────────────────────────────────────────────────────
      fontFamily: {
        syne:    ['var(--font-syne)',    'sans-serif'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
        mono:    ['var(--font-jetbrains-mono)', 'monospace'],
      },

      // ─── Responsive Breakpoints ────────────────────────────────────────
      screens: {
        xs:  '375px',
        sm:  '640px',
        md:  '768px',
        lg:  '1024px',
        xl:  '1280px',
        '2xl': '1440px',
      },

      // ─── Spacing & Layout ──────────────────────────────────────────────
      container: {
        center: true,
        padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
        screens: { xl: '1280px', '2xl': '1440px' },
      },

      // ─── Border Radius ─────────────────────────────────────────────────
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // ─── Box Shadows ───────────────────────────────────────────────────
      boxShadow: {
        card:       '0 2px 8px rgba(8,14,34,.06)',
        'card-hover': '0 8px 24px rgba(8,14,34,.10)',
        float:      '0 20px 60px rgba(8,14,34,.15)',
        inner:      'inset 0 2px 4px rgba(8,14,34,.06)',
      },

      // ─── Animations ────────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        shimmer:         'shimmer 2s linear infinite',
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.35s ease-out',
        marquee:         'marquee 20s linear infinite',
        'accordion-down':'accordion-down 0.2s ease-out',
        'accordion-up':  'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}

export default config
