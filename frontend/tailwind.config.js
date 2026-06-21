/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Thème Rétro/Néon
        retro: {
          primary: '#FF00FF',
          secondary: '#00FFFF',
          accent: '#FFFF00',
          bg: '#1a0033',
          text: '#FFFFFF',
        },
        // Thème Pop Coloré
        pop: {
          primary: '#FF69B4',
          secondary: '#FFD700',
          accent: '#00CED1',
          bg: '#FFFFFF',
          text: '#333333',
        },
        // Thème Élégant Sombre
        elegant: {
          primary: '#8B5CF6',
          secondary: '#EC4899',
          accent: '#F59E0B',
          bg: '#0F172A',
          text: '#F1F5F9',
        },
      },
    },
  },
  plugins: [],
}
