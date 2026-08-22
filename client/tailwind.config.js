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
          DEFAULT: '#0B5FA5',
          dark: '#073B68',
          light: '#EAF3FB',
          hover: '#094E87'
        },
        accent: {
          DEFAULT: '#F2A93B',
          dark: '#D88E22',
          light: '#FEF6E9'
        },
        success: {
          DEFAULT: '#2E9E6B',
          dark: '#248257',
          light: '#EBF7F1'
        },
        warning: {
          DEFAULT: '#E0A32E',
          dark: '#B8821F',
          light: '#FCF6E8'
        },
        danger: {
          DEFAULT: '#D64545',
          dark: '#B03333',
          light: '#FAECEC'
        },
        neutralBg: 'transparent',
        cardBg: '#FFFFFF',
        textMain: '#1A2433',
        textMuted: '#5A6779',
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
