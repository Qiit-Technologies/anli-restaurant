import type { Config } from 'tailwindcss';

export default {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: 'hsl(var(--brand))',
                hexbrand: '#ff8629',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                'orion-blue': '#007BFF',
                blue: '#4B96FE',
                midBlue: '#0466C8',
                darkblue: '#040D21',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
            },
            height: {
                header: '1300px',
                card: '670px',
                newsletter: '400px',
            },
            width: {
                logo: '150px',
                container: '1200px',
                large: '1440px',
                email: '450px',
            },
            fontFamily: {
                Poppins: 'Poppins',
            },
            backgroundImage: {
                gradient:
                    'linear-gradient(150deg, #FFFFFF, #FF872A, #07B8FE, #CBF1FF)',
                gray: 'linear-gradient(to bottom right, #5A5F6C, #0E1629)',
                rose: 'linear-gradient(to bottom right, #D4899C, #040D21)',
            },
            backgroundColor: {
                btnDark: '#007BFF',
                btnLight: '#fff',
            },
            animation: {
                slideInRight: 'slideInRight 0.3s ease-out',
                slideOutRight: 'slideOutRight 0.3s ease-in',
                'bg-shine': 'bg-shine 2.1s linear infinite',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
            keyframes: {
                slideInRight: {
                    '0%': {
                        transform: 'translateX(100%)',
                        opacity: '0',
                    },
                    '100%': {
                        transform: 'translateX(0)',
                        opacity: '1',
                    },
                },
                slideOutRight: {
                    '0%': {
                        transform: 'translateX(0)',
                        opacity: '1',
                    },
                    '100%': {
                        transform: 'translateX(100%)',
                        opacity: '0',
                    },
                },
                'bg-shine': {
                    from: {
                        backgroundPosition: '0 0',
                    },
                    to: {
                        backgroundPosition: '-200% 0',
                    },
                },
                'accordion-down': {
                    from: {
                        height: '0',
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
                        height: '0',
                    },
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [],
} satisfies Config;
