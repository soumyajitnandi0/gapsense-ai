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
    			lime: {
    				'400': '#a3e635',
    				'500': '#84cc16'
    			},
    			background: '#050707',
    			foreground: '#f7f9fc',
    			card: {
    				DEFAULT: 'rgba(255, 255, 255, 0.03)',
    				foreground: '#f7f9fc'
    			},
    			popover: {
    				DEFAULT: '#0a0a0a',
    				foreground: '#f7f9fc'
    			},
    			primary: {
    				DEFAULT: '#3e9cff',
    				foreground: '#ffffff'
    			},
    			secondary: {
    				DEFAULT: '#5eead4',
    				foreground: '#050707'
    			},
    			muted: {
    				DEFAULT: 'rgba(255, 255, 255, 0.05)',
    				foreground: '#99a3af'
    			},
    			accent: {
    				DEFAULT: 'rgba(62, 156, 255, 0.1)',
    				foreground: '#3e9cff'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'rgba(255, 255, 255, 0.08)',
    			input: 'rgba(255, 255, 255, 0.08)',
    			ring: '#3e9cff',
    			chart: {
    				'1': '#3e9cff',
    				'2': '#5eead4',
    				'3': '#99a3af',
    				'4': '#1e293b',
    				'5': '#0f172a'
    			},
    			glass: {
    				DEFAULT: 'rgba(255, 255, 255, 0.03)',
    				hover: 'rgba(255, 255, 255, 0.06)',
    				border: 'rgba(255, 255, 255, 0.08)'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
    			pill: '9999px'
    		},
    		fontFamily: {
    			sans: [
    				'var(--font-inter)',
    				'sans-serif'
    			],
    			heading: [
    				'var(--font-manrope)',
    				'sans-serif'
    			]
    		},
    		backgroundImage: {
    			'orbit-gradient': 'radial-gradient(circle at center, rgba(62, 156, 255, 0.15) 0%, rgba(5, 7, 7, 0) 70%)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
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
