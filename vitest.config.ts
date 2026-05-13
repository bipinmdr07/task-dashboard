import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['test/stores/**/*.spec.ts', 'test/composables/**/*.spec.ts'],
  },
})
