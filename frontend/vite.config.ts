import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and related libraries into a separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split React Query into its own chunk
          'react-query': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          // Split React Bootstrap and icons
          'ui-vendor': ['react-bootstrap', 'react-icons'],
          // Split other large dependencies
          'utils-vendor': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB while chunks are split
  },
})
