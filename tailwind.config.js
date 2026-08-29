/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#F42566",
          deep: "#E11D48",
          soft: "#FFF7F6",
          cream: "#FDF8F7",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#1C161B",
          page: "#FFF7F6",
          pageDark: "#130F12",
        },
        line: {
          soft: "rgba(255, 228, 230, 0.7)",
          dark: "#2D222A",
        },
        fiqh: {
          hayz: "#E11D48",
          tuhr: "#10B981",
          istihadha: "#F59E0B",
          spotting: "#854D0E",
          fasid: "#94A3B8",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)",
        "card-hover":
          "0 4px 6px -1px rgb(15 23 42 / 0.06), 0 2px 4px -2px rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};
