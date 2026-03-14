/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  theme: {
    extend: {
      colors: {
        'primary-black': '#1A1A1A',
        'primary-orange': '#FF4500',
        'primary-red': '#FF0000',
        'primary-white': '#FFFFFF',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle, #1A1A1A, #FF4500)',
        'gradient-linear': 'linear-gradient(90deg, #1A1A1A, #FF4500)',
      },
    },
  },
  plugins: [],
};