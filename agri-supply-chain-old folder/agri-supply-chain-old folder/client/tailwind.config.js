// tailwind.config.js
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,css,php}',  // Make sure these extensions match your files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#15803d',    // green-700
        secondary: '#4ade80',  // green-400
        background: '#f0fdf4', // light green
      },
    },
  },  
  plugins: [],
};
