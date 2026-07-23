import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'images/*.{gif,jpg}'],
      manifest: {
        name: 'Doge 2048',
        short_name: 'Doge 2048',
        description: 'A doge-themed version of the classic 2048 puzzle.',
        theme_color: '#8627df',
        background_color: '#f8f2fd',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/doge2048/',
        icons: [
          {
            src: '/icons/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icons/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  base:"/doge2048/"
})