/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#030712',       // Midnight depth
          panel: 'rgba(17, 24, 39, 0.75)', // Smoked glass
          border: 'rgba(255, 255, 255, 0.08)', // High-end thin bezel
          green: '#10b981',    // Emerald stock
          amber: '#f59e0b',    // Warning low stock
          rose: '#ef4444',     // Critical expired
          indigo: '#6366f1',   // AI Orchestrator
          violet: '#8b5cf6',   // Smart prediction
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-green': 'glowGreen 2s infinite alternate',
        'glow-amber': 'glowAmber 2s infinite alternate',
        'glow-rose': 'glowRose 2s infinite alternate',
      },
      keyframes: {
        glowGreen: {
          '0%': { boxShadow: '0 0 4px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 16px rgba(16, 185, 129, 0.6)' },
        },
        glowAmber: {
          '0%': { boxShadow: '0 0 4px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 16px rgba(245, 158, 11, 0.6)' },
        },
        glowRose: {
          '0%': { boxShadow: '0 0 4px rgba(239, 68, 68, 0.2)' },
          '100%': { boxShadow: '0 0 16px rgba(239, 68, 68, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
