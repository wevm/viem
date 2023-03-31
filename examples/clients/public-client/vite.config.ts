import { defineConfig } from 'vite'
import aliases from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [aliases()],
  build: {
    target: 'esnext',
  },
})
