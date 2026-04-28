import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(projectRoot, 'index.html'),
        ko: resolve(projectRoot, 'ko/index.html'),
        ja: resolve(projectRoot, 'ja/index.html'),
      },
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\', '/')
          if (id.includes('node_modules')) return 'vendor'
          if (normalizedId.includes('/src/data/allPokemonRoster')) return 'roster-data'
        },
      },
    },
  },
})
