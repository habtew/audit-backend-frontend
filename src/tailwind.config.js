/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Scans all React files
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#DBEAFE', // badge-primary
          500: '#3B82F6', // focus:ring-primary-500
          600: '#2563EB', // bg-primary-600
          700: '#1D4ED8', // hover:bg-primary-700
          800: '#1E40AF', // text-primary-800
        },
        success: {
          100: '#DCFCE7', // badge-success
          500: '#22C55E',
          600: '#16A34A', // bg-success-600
          700: '#15803D', // hover:bg-success-700
          800: '#166534', // text-success-800
        },
        warning: {
          100: '#FEF9C3', // badge-warning
          500: '#F59E0B',
          600: '#D97706', // bg-warning-600
          700: '#B45309', // hover:bg-warning-700
          800: '#92400E', // text-warning-800
        },
        error: {
          100: '#FEE2E2', // badge-error
          500: '#EF4444',
          600: '#DC2626', // bg-error-600
          700: '#B91C1C', // hover:bg-error-700
          800: '#991B1B', // text-error-800
        },
      },
    },
  },
  plugins: [],
};