import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import aliases from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), aliases()],
})
