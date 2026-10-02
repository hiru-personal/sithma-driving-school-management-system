/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3F72AF',
          dark: '#112D4E',
          deep: '#0B2447',
          hover: '#19376D',
          light: '#DBE2EF'
        },
        navy: {
          50: '#FAFBFC',
          100: '#DBE2EF',
          200: '#A5D7E8',
          300: '#A9B5DF',
          400: '#7886C7',
          500: '#576CBC',
          600: '#3F72AF',
          700: '#205295',
          800: '#19376D',
          900: '#112D4E',
          950: '#0B2447'
        },
        accent: {
          DEFAULT: '#112D4E',
          dark: '#0B2447',
          blue: '#2C74B3',
          royal: '#3F72AF',
          indigo: '#576CBC',
          ice: '#A5D7E8',
          light: '#DBE2EF'
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#ECFDF5'
        },
        warning: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
          light: '#FFFBEB'
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#FEF2F2'
        },
        neutralBg: '#FAFBFC',
        cardBg: '#FFFFFF',
        textMain: '#112D4E',
        textMuted: '#4A5568',
        borderColor: '#E2E8F0'
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Sinhala"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        cardHover: '0 8px 20px rgba(0, 0, 0, 0.08)',
        modal: '0 20px 40px rgba(0, 0, 0, 0.12)'
      },
      borderRadius: {
        card: '12px'
      }
    },
  },
  plugins: [],
}
