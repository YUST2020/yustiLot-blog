// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    'nuxt-auth-utils',
    '@vueuse/motion/nuxt',
  ],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  colorMode: {
    classSuffix: ''
  },
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: true,
    viewer: true,
  },
  future: {
    compatibilityVersion: 4,
  },
  app: {
    pageTransition: { name: 'page', mode: 'default' },
    layoutTransition: { name: 'layout', mode: 'default' }
  }
})
