import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // Split heavy, interaction-only dependencies (jsPDF) into their own
    // chunk so they never touch the initial critical-render bundle.
    rollupOptions: {
      output: {
        manualChunks: {
          pdf: ['jspdf'],
        },
      },
    },
  },
})
