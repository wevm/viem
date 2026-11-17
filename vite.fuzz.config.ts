import { defineConfig } from 'vp'
import config from './vite.config.js'

export default defineConfig({
  ...config,
  test: {
    ...config.test,
    projects: [
      {
        extends: true,
        test: {
          name: 'fuzz-unit',
          include: ['src/tempo/**/*.fuzz.test.ts'],
          retry: 0,
          testTimeout: 60_000,
        },
      },
      {
        extends: true,
        test: {
          name: 'fuzz-integration',
          include: ['src/tempo/**/*.fuzz-int.test.ts'],
          retry: 0,
          hookTimeout: 180_000,
          testTimeout: 180_000,
        },
      },
    ],
  },
})
