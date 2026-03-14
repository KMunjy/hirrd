import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C58E8',
        'primary-light': '#B099FF',
        'primary-dark': '#4E30B8',
        secondary: '#38C6D4',
        'bg-base': '#F4F2FF',
        'bg-surface': '#FAFAFF',
        'bg-card': '#FFFFFF',
        success: '#3AAE72',
        warning: '#C4962A',
        error: '#C0504A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7C58E8, #38C6D4)',
        'gradient-hero': 'linear-gradient(145deg, #EDE8FF, #F4F2FF, #E6F9FF)',
      },
    },
  },
  plugins: [],
}

export default config
