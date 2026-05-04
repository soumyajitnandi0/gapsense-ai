/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FDFDFB', // Neo off-white
        foreground: '#000000', // Pitch black
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000',
          dark: '#000000',
          darkForeground: '#FFFFFF'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#000000'
        },
        primary: {
          DEFAULT: '#FEF94D', // Neo yellow
          foreground: '#000000'
        },
        secondary: {
          DEFAULT: '#FF7EB9', // Neo pink
          foreground: '#000000'
        },
        muted: {
          DEFAULT: '#EAEAE0',
          foreground: '#666666'
        },
        accent: {
          DEFAULT: '#00FF41', // Terminal green
          foreground: '#000000'
        },
        destructive: {
          DEFAULT: '#FF0000',
          foreground: '#FFFFFF'
        },
        border: '#000000', // Solid black borders
        input: '#000000',
        ring: '#FEF94D',
      },
      borderRadius: {
        lg: '1.5rem',
        md: '1rem',
        sm: '0.75rem',
        pill: '9999px'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px rgba(0,0,0,1)',
        'hard-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
        'hard-xl': '12px 12px 0px 0px rgba(0,0,0,1)',
        'none': '0px 0px 0px 0px rgba(0,0,0,0)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'marquee': 'marquee 25s linear infinite'
      }
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
};
