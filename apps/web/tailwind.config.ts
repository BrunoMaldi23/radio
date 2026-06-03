import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        brand: {
          50: '#fff8e8',
          100: '#ffedbf',
          200: '#ffd77a',
          300: '#ffbd35',
          400: '#f7a70b',
          500: '#f29200',
          600: '#c86d00',
          700: '#944a06',
          800: '#4a3217',
          900: '#211f1d',
          950: '#080808',
        },
        accent: {
          50: '#f7f7f7',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#aaa9ab',
          400: '#777679',
          500: '#4f4e52',
          600: '#333335',
          900: '#111111',
        },
        admin: {
          surface: '#f7f4ee',
          sidebar: '#080808',
          sidebarHover: '#211f1d',
          card: '#ffffff',
          border: '#e7dfd1',
          text: '#1f1f1f',
          muted: '#706a61',
        },
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        warm: '0 1px 3px 0 rgba(51, 51, 51, 0.08), 0 1px 2px -1px rgba(242, 146, 0, 0.08)',
        warmMd: '0 4px 6px -1px rgba(51, 51, 51, 0.08), 0 2px 4px -2px rgba(242, 146, 0, 0.08)',
        warmLg: '0 10px 15px -3px rgba(51, 51, 51, 0.1), 0 4px 6px -4px rgba(242, 146, 0, 0.08)',
      },
    }
  },
  plugins: []
};

export default config;
