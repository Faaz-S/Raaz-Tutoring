module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0d3b66',      // deep teal
        secondary: '#faa307',    // vibrant orange
        accent: '#f4d35e',       // warm yellow
        
        bgDark: '#1f2833'        // dark background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Merriweather', 'serif'],
        doodle: ['"Permanent Marker"', 'cursive']
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
};