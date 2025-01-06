import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp3|wav)$/i.test(assetInfo.name)) {
            return 'sounds/[name][extname]'
          }
          if (/\.(png|jpe?g|gif|svg|webp)$/i.test(assetInfo.name)) {
            return 'img/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  publicDir: 'public',
  base: '/',
  assetsInclude: ['**/*.gif', '**/*.png', '**/*.jpg', '**/*.mp3', '**/*.js']
})