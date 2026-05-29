import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      vm: path.resolve(__dirname, './src/utils/vm-mock.ts')
    }
  },
  plugins: [
    tailwindcss(),
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util'], 
    }),
  ],
  base: './'
})