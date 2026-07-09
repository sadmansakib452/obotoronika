/** @type {import('tailwindcss').Config} */

const containerQuery = require('@tailwindcss/container-queries')
const animate = require('tailwindcss-animate')

export default {
  darkMode: ['class'],
  content: ['./app/**/*.{js,vue,ts}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      keyframes: {
        'accordion-down': {
          from: {
            height: 0,
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: 0,
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      colors: {
        'orange': {
          50: '#FFF5E6',
          100: '#FFE6BF',
          200: '#FFD599',
          300: '#FFC473',
          400: '#FC6A03',
          500: '#FC6A03',
          600: '#FC6A03',
          700: '#CC7201',
          800: '#995600',
          900: '#FF8E01',
        },
        'primary': {
          DEFAULT: '#FC6A03',
          light: '#FC6A03',
          dark: '#FC6A03',
          foreground: 'hsl(var(--primary-foreground))',
        },
        'dark': '#151520',
        'theme-border': '#232533',
        'light-text': '#06070C',
        'dark-text': '#CDCDE6',
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        'card': {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'popover': {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        'secondary': {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'muted': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'accent': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        'destructive': {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'border': 'hsl(var(--border))',
        'input': 'hsl(var(--input))',
        'ring': 'hsl(var(--ring))',
        'chart': {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        Homenaje: ['Homenaje', 'sans-serif'],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    containerQuery,
    animate,
    function ({ addUtilities }) {
      addUtilities({
        '.obotoronika-text-color': {
          '@apply text-gray-700 dark:text-dark-text': {},
        },
        '.obotoronika-border-color': {
          '@apply border-gray-200 dark:border-[#232533]': {},
        },
        '.obotoronika-title': {
          '@apply text-gray-900 dark:text-[#CDCDD3]': {},
        },
        '.obotoronika-text': {
          '@apply text-gray-700 dark:text-[#92929F]': {},
        },
        '.obotoronika-muted-text': {
          '@apply text-gray-500 dark:text-gray-400': {},
        },
      })
    },
    require('tailwindcss-animate'),
  ],
}
