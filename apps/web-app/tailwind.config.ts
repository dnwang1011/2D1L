import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // V4 Theme Extensions (colors, typography based on @V4TechSpec.md)
      // Example colors (to be replaced with actual V4 theme colors)
      colors: {
        primary: '#0A0A0A', // Example: Deep Space Black
        secondary: '#4A90E2', // Example: Celestial Blue
        accent: '#F5A623', // Example: Solar Flare Orange
        textLight: '#EAEAEA',
        textDark: '#333333',
        backgroundLight: '#FFFFFF',
        backgroundDark: '#121212', // Example: Empyrean Void
      },
      fontFamily: {
        // Example fonts (to be replaced with actual V4 theme fonts)
        sans: ['Inter', 'sans-serif'], // Example: Inter
        serif: ['Lora', 'serif'], // Example: Lora for specific text
      },
      // Add other theme customizations: spacing, borderRadius, etc.
    },
  },
  plugins: [],
};
export default config; 