/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces — pure white per brief, warm paper for cards
        paper: "#FFFFFF",
        husk: "#F7F5F0",
        grain: {
          50: "#FBF7ED",
          100: "#F3E9CE",
          200: "#E6D3A1",
          300: "#D6B876",
          400: "#C49A4E",
          500: "#AC7F35", // primary rice/amber accent
          600: "#8C6529",
          700: "#6B4C1F",
          800: "#4A3416",
          900: "#2B1E0D",
        },
        ink: {
          50: "#F5F4F2",
          100: "#E7E4DE",
          400: "#736A5E",
          600: "#4A4238",
          800: "#2A241D",
          900: "#1A1712",
        },
        // Infestation status semantics
        safe: "#1E8E5A",
        moderate: "#C97A1F",
        critical: "#C0392B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(26,23,18,0.04), 0 4px 16px rgba(26,23,18,0.05)",
      },
      backgroundImage: {
        weave:
          "repeating-linear-gradient(45deg, rgba(172,127,53,0.05) 0, rgba(172,127,53,0.05) 1px, transparent 1px, transparent 8px)",
      },
    },
  },
  plugins: [],
};
