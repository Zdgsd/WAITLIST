import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor libraries
          vendor: ['react', 'react-dom'],
          // Animation libraries
          animation: ['framer-motion'],
          // Backend services
          supabase: ['@supabase/supabase-js'],
          // UI components used across multiple scenes
          ui: [
            './components/ui/Button',
            './components/ui/Chip',
            './components/ui/SceneHeader',
            './components/ui/SkipButton'
          ],
          // Hooks used across multiple components
          hooks: [
            './hooks/usePrefersReducedMotion',
            './hooks/useSocialMediaOptimization',
            './hooks/useTypewriter'
          ],
          // Effects used across multiple scenes
          effects: [
            './components/effects/CRTEffect',
            './components/effects/CRTWrapper',
            './components/effects/DynamicGradient',
            './components/effects/LensFlares',
            './components/effects/VHSNoise',
            './components/effects/SceneTransition'
          ]
        },
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
    minify: 'esbuild',
    brotliSize: true
  },
  server: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})