import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the SW when new content is available
      workbox: {
        // Define runtime caching for external resources
        runtimeCaching: [
          {
            // Cache Postcode API requests
            urlPattern: ({ url }) => url.origin === 'https://api.postcodes.io',
            handler: 'CacheFirst', // Postcodes rarely change, so CacheFirst is efficient
            options: {
              cacheName: 'postcode-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache OpenStreetMap Tiles
            urlPattern: ({ url }) => url.hostname.includes('tile.openstreetmap.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 200, // Limits space used on device
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Find a UK National Grid Reference',
        short_name: 'NGR finder',
        description: 'A app that helps you find the national grid reference for a postcode location',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'postcodeFaviocon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'postcodeFaviocon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Recommended for better icon fit on Android
          }
        ]
      }
    })
  ],
  base: '/postcode-lookup/'
})



