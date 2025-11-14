import type { Config } from 'tailwindcss'

const config: Config = {
 darkMode: ['class'],
 content: [
 './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
 './src/components/**/*.{js,ts,jsx,tsx,mdx}',
 './src/app/**/*.{js,ts,jsx,tsx,mdx}',
 ],
 theme: {
 	extend: {
 		colors: {
 			primary: {
 				navy: '#01164D',
 				'neon-yellow': '#CCE53F',
 				'light-yellow': '#D5E73C',
 				DEFAULT: 'hsl(var(--primary))',
 				foreground: 'hsl(var(--primary-foreground))'
 			},
 			accent: {
 				pink: '#D9208F',
 				teal: '#00BA9C',
 				green: '#62CF6F',
 				'dark-pink': '#85125E',
 				'bright-pink': '#C81D84',
 				'bright-teal': '#00D4B8',
 				DEFAULT: 'hsl(var(--accent))',
 				foreground: 'hsl(var(--accent-foreground))'
 			},
 			neutral: {
 				white: '#FFFFFF',
 				gray: '#F8F9FA',
 				light: '#F8F9FA',
 				'light-gray': '#E9ECEF',
 				'dark-gray': '#6C757D',
 				dark: '#343A40'
 			},
 			background: 'hsl(var(--background))',
 			foreground: 'hsl(var(--foreground))',
 			card: {
 				DEFAULT: 'hsl(var(--card))',
 				foreground: 'hsl(var(--card-foreground))'
 			},
 			popover: {
 				DEFAULT: 'hsl(var(--popover))',
 				foreground: 'hsl(var(--popover-foreground))'
 			},
 			secondary: {
 				DEFAULT: 'hsl(var(--secondary))',
 				foreground: 'hsl(var(--secondary-foreground))'
 			},
 			muted: {
 				DEFAULT: 'hsl(var(--muted))',
 				foreground: 'hsl(var(--muted-foreground))'
 			},
 			destructive: {
 				DEFAULT: 'hsl(var(--destructive))',
 				foreground: 'hsl(var(--destructive-foreground))'
 			},
 			border: 'hsl(var(--border))',
 			input: 'hsl(var(--input))',
 			ring: 'hsl(var(--ring))',
 			chart: {
 				'1': 'hsl(var(--chart-1))',
 				'2': 'hsl(var(--chart-2))',
 				'3': 'hsl(var(--chart-3))',
 				'4': 'hsl(var(--chart-4))',
 				'5': 'hsl(var(--chart-5))'
 			}
 		},
 		fontFamily: {
 			sans: [
 				'var(--font-inter)',
 				'system-ui',
 				'sans-serif'
 			]
 		},
 		fontSize: {
 			xs: [
 				'0.75rem',
 				{
 					lineHeight: '1rem'
 				}
 			],
 			sm: [
 				'0.875rem',
 				{
 					lineHeight: '1.25rem'
 				}
 			],
 			base: [
 				'1rem',
 				{
 					lineHeight: '1.5rem'
 				}
 			],
 			lg: [
 				'1.125rem',
 				{
 					lineHeight: '1.75rem'
 				}
 			],
 			xl: [
 				'1.25rem',
 				{
 					lineHeight: '1.75rem'
 				}
 			],
 			'2xl': [
 				'1.5rem',
 				{
 					lineHeight: '2rem'
 				}
 			],
 			'3xl': [
 				'1.875rem',
 				{
 					lineHeight: '2.25rem'
 				}
 			],
 			'4xl': [
 				'2.25rem',
 				{
 					lineHeight: '2.5rem'
 				}
 			],
 			'5xl': [
 				'3rem',
 				{
 					lineHeight: '1'
 				}
 			],
 			'6xl': [
 				'3.75rem',
 				{
 					lineHeight: '1'
 				}
 			],
 			'7xl': [
 				'4.5rem',
 				{
 					lineHeight: '1'
 				}
 			],
 			'8xl': [
 				'6rem',
 				{
 					lineHeight: '1'
 				}
 			],
 			'9xl': [
 				'8rem',
 				{
 					lineHeight: '1'
 				}
 			]
 		},
 		spacing: {
 			'18': '4.5rem',
 			'88': '22rem',
 			'128': '32rem'
 		},
 		maxWidth: {
 			'8xl': '88rem',
 			'9xl': '96rem'
 		},
 		animation: {
 			'fade-in-up': 'fadeInUp 0.6s ease-out',
 			'fade-in': 'fadeIn 0.6s ease-out',
 			'slide-in-left': 'slideInLeft 0.6s ease-out',
 			'slide-in-right': 'slideInRight 0.6s ease-out',
 			'scale-in': 'scaleIn 0.4s ease-out',
 			'marquee': 'marquee var(--duration) linear infinite',
 			'marquee-vertical': 'marquee-vertical var(--duration) linear infinite'
 		},
 		keyframes: {
 			fadeInUp: {
 				'0%': {
 					opacity: '0',
 					transform: 'translateY(30px)'
 				},
 				'100%': {
 					opacity: '1',
 					transform: 'translateY(0)'
 				}
 			},
 			fadeIn: {
 				'0%': {
 					opacity: '0'
 				},
 				'100%': {
 					opacity: '1'
 				}
 			},
 			slideInLeft: {
 				'0%': {
 					opacity: '0',
 					transform: 'translateX(-30px)'
 				},
 				'100%': {
 					opacity: '1',
 					transform: 'translateX(0)'
 				}
 			},
 			slideInRight: {
 				'0%': {
 					opacity: '0',
 					transform: 'translateX(30px)'
 				},
 				'100%': {
 					opacity: '1',
 					transform: 'translateX(0)'
 				}
 			},
 			scaleIn: {
 				'0%': {
 					opacity: '0',
 					transform: 'scale(0.9)'
 				},
 				'100%': {
 					opacity: '1',
 					transform: 'scale(1)'
 				}
 			},
 			marquee: {
 				from: { transform: 'translateX(0)' },
 				to: { transform: 'translateX(calc(-100% - var(--gap)))' }
 			},
 			'marquee-vertical': {
 				from: { transform: 'translateY(0)' },
 				to: { transform: 'translateY(calc(-100% - var(--gap)))' }
 			}
 		},
 		borderRadius: {
 			lg: 'var(--radius)',
 			md: 'calc(var(--radius) - 2px)',
 			sm: 'calc(var(--radius) - 4px)'
 		}
 	}
 },
 plugins: [require("tailwindcss-animate")],
}
export default config