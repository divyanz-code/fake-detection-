/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support premium dark theme
  theme: {
    extend: {
      colors: {
        darkBg: "#0F172A",
        darkCard: "#1E293B",
        brandPrimary: "#6366F1", // Indigo
        brandAccent: "#8B5CF6", // Violet
        brandSuccess: "#10B981", // Emerald
        brandDanger: "#EF4444", // Red
      }
    },
  },
  plugins: [],
}
