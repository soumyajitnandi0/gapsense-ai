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
        background: '#FAF9F6', // Soft pearl/cream base
        foreground: '#1B1C1D', // Deep charcoal for contrast 
        card: {
          DEFAULT: '#FFFFFF', // Clean white for cards
          foreground: '#1B1C1D',
          dark: '#1C1E1D', // For the dark inverted cards (like Onboarding Tasks)
          darkForeground: '#FFFFFF'
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#1B1C1D'
        },
        primary: {
          DEFAULT: '#F4D03F', // Premium soft yellow
          foreground: '#1B1C1D'
        },
        secondary: {
          DEFAULT: '#EAEAE0', // Soft grey-cream
          foreground: '#1B1C1D'
        },
        muted: {
          DEFAULT: '#F0F0EA',
          foreground: '#757876' // Muted text 
        },
        accent: {
          DEFAULT: '#FFF3CD',
          foreground: '#1B1C1D'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'rgba(0, 0, 0, 0.06)',
        input: 'rgba(0, 0, 0, 0.05)',
        ring: '#F4D03F',
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.6)',
          hover: 'rgba(255, 255, 255, 0.8)',
          border: 'rgba(255, 255, 255, 0.8)'
        }
      },
      borderRadius: {
        lg: '1.5rem', // Larger radiuses for premium feel
        md: '1rem',
        sm: '0.75rem',
        pill: '9999px'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif']
      },
      backgroundImage: {
        'soft-glow': 'radial-gradient(circle at 30% 20%, rgba(244, 208, 63, 0.15) 0%, rgba(250, 249, 246, 0) 60%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.05)',
        'premium-hover': '0 20px 40px -10px rgba(0,0,0,0.08)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255,255,255,0.8)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
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
  plugins: [require("tailwindcss-animate")],
};
