/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Figma design system — strictly monochrome interface chrome
        'background': '#ffffff',
        'surface': '#ffffff',
        'surface-bright': '#ffffff',
        'surface-dim': '#f0f0f0',
        'surface-variant': '#f0f0f0',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f8f8f8',
        'surface-container': '#f4f4f4',
        'surface-container-high': '#efefef',
        'surface-container-highest': '#e8e8e8',
        'on-surface': '#000000',
        'on-surface-variant': '#555555',
        'on-background': '#000000',
        'inverse-surface': '#000000',
        'inverse-on-surface': '#ffffff',
        'primary': '#000000',
        'primary-dim': '#333333',
        'primary-container': '#f0f0f0',
        'primary-fixed': '#f0f0f0',
        'primary-fixed-dim': '#e0e0e0',
        'on-primary': '#ffffff',
        'on-primary-fixed': '#000000',
        'on-primary-container': '#000000',
        'secondary': '#000000',
        'secondary-dim': '#333333',
        'secondary-container': 'rgba(0,0,0,0.06)',
        'secondary-fixed': '#f0f0f0',
        'secondary-fixed-dim': '#e0e0e0',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#000000',
        'on-secondary-fixed': '#000000',
        'tertiary': '#555555',
        'tertiary-dim': '#777777',
        'tertiary-container': '#f8f8f8',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#000000',
        'outline': '#888888',
        'outline-variant': '#dddddd',
        'surface-tint': '#000000',
        'inverse-primary': '#ffffff',
        'error': '#cc0000',
        'error-container': '#ffdddd',
        'on-error': '#ffffff',
        'on-error-container': '#990000',
        // Glass effects — Figma signature
        'glass-dark': 'rgba(0,0,0,0.08)',
        'glass-light': 'rgba(255,255,255,0.16)',
        // Legacy tokens (used by parked 3D components)
        'bg': '#F8F7F4',
        'bg-dark': '#0F0F0D',
        'text': '#1A1A18',
        'text-muted': '#6B6B67',
        'accent': '#C8B89A',
        'border': '#E2E0DA',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'SF Pro Display', 'system-ui', 'helvetica', 'sans-serif'],
        mono: ['var(--font-space-mono)', 'SF Mono', 'Menlo', 'monospace'],
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '2px',
        subtle: '6px',
        md: '8px',
        comfortable: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        pill: '50px',
        full: '9999px',
      },
      letterSpacing: {
        label: '0.54px',      // figmaMono uppercase labels
        'mono-sm': '0.6px',   // figmaMono small tags
        display: '-1.72px',   // hero display text
        section: '-0.96px',   // section headings
        body: '-0.14px',      // body text
        tight: '-0.26px',     // sub-headings
      },
    },
  },
  plugins: [],
}
