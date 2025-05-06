import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    root: path.resolve(__dirname, 'front'), 
    publicDir: path.resolve(__dirname, 'public'),
    server: {
        port: 3000
    },
    build: {
        outDir: '../dist-site',
        emptyOutDir: true
    }
})
