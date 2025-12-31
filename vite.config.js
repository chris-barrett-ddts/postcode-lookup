import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // This helper ensures the manifest is generated correctly with the base path
      includeManifestIcons: true,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'], // Cache all local assets
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://api.postcodes.io',
            handler: 'CacheFirst',
            options: {
              cacheName: 'postcode-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: ({ url }) => url.hostname.includes('tile.openstreetmap.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles-cache',
              expiration: {
                maxEntries: 1000, // Increased as map tiles are numerous
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Find a UK National Grid Reference',
        short_name: 'NGR Finder',
        description: 'Convert UK postcodes to National Grid References offline.',
        theme_color: '#166534', // Matches your green-800 theme
        background_color: '#f8fafc', // Matches slate-50
        display: 'standalone',
        scope: '/postcode-lookup/',
        start_url: '/postcode-lookup/',
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
            purpose: 'any'
          },
          {
            src: 'postcodeFaviocon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  base: '/postcode-lookup/'
})