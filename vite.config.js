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



