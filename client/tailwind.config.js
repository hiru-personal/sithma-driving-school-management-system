/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Design System Palette (from Reference Image)
        blackPine: '#152026',
        deepOcean: '#1B3D59',
        windstorm: '#6A97C0',
        meltingIce: '#B3D5F1',
        avalanche: '#D4EEF8',
        sunBeam: '#F3EED8',

        // Semantic Role Aliases
        primary: {
          DEFAULT: '#1B3D59', // Deep Ocean
          dark: '#152026',    // Black Pine
          deep: '#152026',    // Black Pine
          hover: '#152026',   // Black Pine
          light: '#D4EEF8',   // Avalanche
          ice: '#B3D5F1',     // Melting Ice
        },
        secondary: {
          DEFAULT: '#6A97C0', // Windstorm
          hover: '#1B3D59',   // Deep Ocean
          light: '#B3D5F1',   // Melting Ice
        },
        navy: {
          50: '#F8FCFE',
          100: '#D4EEF8',     // Avalanche
          200: '#B3D5F1',     // Melting Ice
          300: '#6A97C0',     // Windstorm
          400: '#4F7FA8',
          500: '#356891',
          600: '#235177',
          700: '#1B3D59',     // Deep Ocean
          800: '#18344B',
          900: '#152026',     // Black Pine
          950: '#0E171C'
        },
        accent: {
          DEFAULT: '#1B3D59', // Deep Ocean
          dark: '#152026',    // Black Pine
          blue: '#6A97C0',    // Windstorm
          royal: '#1B3D59',   // Deep Ocean
          indigo: '#1B3D59',  // Deep Ocean
          ice: '#B3D5F1',     // Melting Ice
          soft: '#D4EEF8',    // Avalanche
          warm: '#F3EED8',    // Sun Beam
          light: '#D4EEF8'    // Avalanche
        },
        success: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#ECFDF5'
        },
        warning: {
          DEFAULT: '#F3EED8', // Sun Beam
          dark: '#152026',
          light: '#F3EED8',
          text: '#152026',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#FEF2F2'
        },
        neutralBg: '#FFFFFF',
        cardBg: '#FFFFFF',
        textMain: '#152026', // Black Pine
        textMuted: '#6A97C0', // Windstorm
        borderColor: '#D4EEF8' // Avalanche
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Sinhala"', '"Noto Sans Tamil"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(21, 32, 38, 0.05)',
        card: '0 2px 8px rgba(21, 32, 38, 0.06)',
        cardHover: '0 8px 20px rgba(27, 61, 89, 0.08)',
        modal: '0 20px 40px rgba(21, 32, 38, 0.12)'
      },
      borderRadius: {
        card: '12px'
      }
    },
  },
  plugins: [],
}
