// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true, vueDevTools: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
    shim: false,
  },
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
  },
  vite: {
    build: {
      // Keep each page's styles in its own chunk so they load only when the route is visited
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          // Pull the shared Vue runtime into one vendor chunk; every page chunk
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
          },
        },
      },
    },
  },
})
