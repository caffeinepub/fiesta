import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                // Single token aliases (legacy)
                navy: 'hsl(var(--navy))',
                'navy-dark': 'hsl(var(--navy-dark))',
                gold: 'hsl(var(--gold))',
                'gold-dark': 'hsl(var(--gold-dark))',
                // Navy scale
                'navy-50':  'hsl(212 100% 97%)',
                'navy-100': 'hsl(212 100% 93%)',
                'navy-200': 'hsl(212 80% 85%)',
                'navy-300': 'hsl(212 70% 70%)',
                'navy-400': 'hsl(212 65% 55%)',
                'navy-500': 'hsl(212 80% 40%)',
                'navy-600': 'hsl(212 90% 32%)',
                'navy-700': 'hsl(212 95% 27%)',
                'navy-800': 'hsl(212 100% 22%)',
                'navy-900': 'hsl(212 100% 18%)',
                'navy-950': 'hsl(212 100% 12%)',
                // Gold scale
                'gold-50':  'hsl(43 100% 97%)',
                'gold-100': 'hsl(43 100% 92%)',
                'gold-200': 'hsl(43 90% 82%)',
                'gold-300': 'hsl(43 80% 70%)',
                'gold-400': 'hsl(43 75% 60%)',
                'gold-500': 'hsl(43 74% 49%)',
                'gold-600': 'hsl(43 74% 40%)',
                'gold-700': 'hsl(43 74% 32%)',
                'gold-800': 'hsl(43 74% 24%)',
                'gold-900': 'hsl(43 74% 16%)',
                // Semantic tokens
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                soft: '0 2px 8px rgba(30, 58, 138, 0.08), 0 1px 3px rgba(30, 58, 138, 0.06)',
                xs: '0 1px 2px 0 rgba(0,0,0,0.05)'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'Georgia', 'serif'],
                playfair: ['Playfair Display', 'Georgia', 'serif']
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
        }
    },
    plugins: [typography, containerQueries, animate]
};
