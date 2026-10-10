const APPNAME = 'walktober'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['@/assets/css/style.css'],
  modules: ['@nuxt/icon', '@vite-pwa/nuxt'],

  app: {
    head: {
      title: APPNAME,
      meta: [
        { name: 'theme-color', content: '#ffffff' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: APPNAME,
      short_name: APPNAME,
      description: APPNAME,
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        { src: 'logo-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'logo-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'logo-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: 'logo-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },

    workbox: {
      navigateFallback: '/',
      // App shell + small assets get precached
      globPatterns: ['**/*.{js,mjs,css,html,png,svg,ico,ttf,woff2}'],
      // Raise the limit (default 2 MiB) in case a big .mjs/.js chunk is precached
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      cleanupOutdatedCaches: true,

      // Big model/runtime files: cached on first use, not at SW install
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.endsWith('.onnx'),
          handler: 'CacheFirst',
          options: {
            cacheName: `${APPNAME}-models`,
            expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
            rangeRequests: true,
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.endsWith('.wasm'),
          handler: 'CacheFirst',
          options: {
            cacheName: `${APPNAME}-wasm`,
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },

    client: {
      installPrompt: true,
    },

    devOptions: {
      enabled: true,       // test the SW during `nuxt dev`
      type: 'module',
      suppressWarnings: true,
    },
  },

  // Set Security Headers required for SharedArrayBuffer & WASM Multi-threading
  routeRules: {
    '/**': {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  },

  // Enable headers in Vite local dev server
  vite: {
    worker: { format: 'es' },
    optimizeDeps: { exclude: ['onnxruntime-web'] },
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  },
})
