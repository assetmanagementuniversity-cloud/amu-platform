/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AMU Brand Colors (Section 9.2)
        amu: {
          navy: '#0A2F5C',      // Primary - logos, headings, strong emphasis
          white: '#FFFFFF',     // Base background - pure white
          slate: '#5D7290',     // Accent - quotes, icons, subtle borders
          sky: '#D9E6F2',       // Highlight - boxes, labels, subtle backgrounds
          charcoal: '#2F2F2F',  // Text - body text, paragraphs
        },
        // Semantic color aliases
        primary: '#0A2F5C',
        background: '#FFFFFF',
        accent: '#5D7290',
        highlight: '#D9E6F2',
        foreground: '#2F2F2F',
      },
      fontFamily: {
        // AMU Typography (Section 9.3)
        heading: ['Montserrat', 'sans-serif'],      // Titles, headings
        body: ['Open Sans', 'sans-serif'],          // Body text
        callout: ['Poppins', 'sans-serif'],         // Callouts, quotes
        system: ['Roboto', 'sans-serif'],           // System text, footers
        // Default sans-serif uses body font
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // AMU Type Hierarchy (Section 9.3)
        'amu-title': ['24pt', { lineHeight: '1.2', fontWeight: '400' }],
        'amu-heading': ['18pt', { lineHeight: '1.3', fontWeight: '400' }],
        'amu-callout': ['13pt', { lineHeight: '1.5', fontWeight: '400' }],
        'amu-body': ['12pt', { lineHeight: '1.6', fontWeight: '400' }],
        'amu-footer': ['10pt', { lineHeight: '1.4', fontWeight: '400' }],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'thinking-progress': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'thinking-progress': 'thinking-progress 2s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
