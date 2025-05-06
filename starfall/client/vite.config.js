import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname),
  server: {
    port: 5173
  },
  build: {
    outDir: '../../dist-babylon-client',
    emptyOutDir: true
  }
})
