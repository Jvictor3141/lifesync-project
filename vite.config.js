import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const srcPath = fileURLToPath(new URL('./src', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }

          if (id.includes('@fullcalendar')) {
            return 'calendar-vendor';
          }

          if (id.includes('recharts')) {
            return 'charts-vendor';
          }

          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }

          if (
            id.includes('node_modules/react/')
            || id.includes('node_modules/react-dom/')
            || id.includes('node_modules/scheduler/')
          ) {
            return 'react-core';
          }

          return 'vendor';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(srcPath),
    },
  },
})
