import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@clipsync/shared-client': path.resolve(__dirname, '../packages/shared-client/src/index.js'),
    },
  },
  base: './',
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Enhanced code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            // State management
            if (id.includes('zustand')) {
              return 'state-vendor';
            }
            // Real-time communication
            if (id.includes('socket.io-client')) {
              return 'socket-vendor';
            }
            // Database libraries
            if (id.includes('idb')) {
              return 'db-vendor';
            }
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            // Other node_modules
            return 'vendor';
          }

          // Feature-based code splitting
          if (id.includes('/src/components/features/developer/')) {
            return 'features-developer';
          }
          if (id.includes('/src/components/features/billing/')) {
            return 'features-billing';
          }
          if (id.includes('/src/components/features/analytics/')) {
            return 'features-analytics';
          }

          // Screen-based code splitting
          if (id.includes('/src/components/screens/')) {
            return 'screens';
          }

          // Utils splitting
          if (id.includes('/src/utils/')) {
            return 'utils';
          }

          // Store splitting
          if (id.includes('/src/store/')) {
            return 'store';
          }
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Minify with enhanced security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Target modern browsers for smaller bundle
    target: 'es2020',
    // Enable source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'socket.io-client'],
  },
})
