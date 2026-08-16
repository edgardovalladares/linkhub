/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        material: {
          primary: '#DC2626',      // Red primary accent
          primaryDark: '#B91C1C',  // Dark Red hover
          primaryLight: '#FEE2E2', // Light Red tint
          secondary: '#EA4335',
          tertiary: '#FBBC05',
          neutral: '#34A853',
          surface: '#FFFFFF',
          accent: '#F8F9FA',
          dark: '#3C4043',
          offblack: '#202124',
          cyan: '#00BCD4',
          stroke: '#E8EAED',
        },
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      fontFamily: {
        sans: ['Jost', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Saira', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'material-sm': '0 2px 8px rgba(0,0,0,0.06)',
        'material-md': '0 4px 16px rgba(220,38,38,0.12)',
        'material-lg': '0 8px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
