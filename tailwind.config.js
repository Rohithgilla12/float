/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'JetBrains Mono', 'Menlo', 'monospace'],
      },
      // Editor text follows one body size, set by the editor as --editor-text-size.
      // Headings and code keep their original ratio to the 13px default.
      fontSize: {
        'editor-h1': 'calc(var(--editor-text-size, 13px) * 20 / 13)',
        'editor-h2': 'calc(var(--editor-text-size, 13px) * 16 / 13)',
        'editor-h3': 'calc(var(--editor-text-size, 13px) * 14 / 13)',
        'editor-body': 'var(--editor-text-size, 13px)',
        'editor-code': 'calc(var(--editor-text-size, 13px) * 12 / 13)',
      },
      transitionTimingFunction: {
        'raycast': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.15)',
      },
    },
  },
  plugins: [],
}
