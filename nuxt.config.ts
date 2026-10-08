
const APPNAME = 'walktober'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: [
    '@/assets/css/style.css',
  ],
  modules: [
    '@nuxt/icon', '@vite-pwa/nuxt'
  ],
  // buildModules: [
  //   '@nuxtjs/pwa',
  // ],

  // Set Security Headers required for SharedArrayBuffer & WASM Multi-threading
  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    }
  },

  // Enable headers in Vite local dev server
  vite: {
    worker: { format: 'es' },
    optimizeDeps: { exclude: ['onnxruntime-web'] },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    }
  }
})
