// vite.config.ts
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// Auto base:
// - In GitHub Actions, GITHUB_REPOSITORY is "owner/repo" → base="/repo/"
// - Locally you can override with: VITE_BASE_PATH=/my-repo/ npm run build
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.VITE_BASE_PATH || (repo ? `/${repo}/` : '/')

export default defineConfig({
  base,
  plugins: [
    vue({ template: { transformAssetUrls } }),
    vuetify({
      autoImport: true,
      styles: { configFile: 'src/styles/settings.scss' },
    }),
  ],
  // Prefer import.meta.env.VITE_* at runtime; this keeps libs that touch process.env happy
  define: { 'process.env': {} },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  server: { port: 4000 },

  // Optional: trim prod bundles a bit
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
