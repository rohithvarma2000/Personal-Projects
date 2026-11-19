/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050807',
        panel: '#0A100D',
        line: '#14211a',
        matrix: { DEFAULT: '#00FF41', dim: '#00C853', deep: '#00692a' },
        mute: '#8aa598',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: { neon: '0 0 28px -6px rgba(0,255,65,.45)' },
    },
  },
  plugins: [],
}
