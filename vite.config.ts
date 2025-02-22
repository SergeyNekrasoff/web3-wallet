import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { env } from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': env,
  },
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      components: fileURLToPath(new URL('./src/components', import.meta.url)),
    },
  },
})
