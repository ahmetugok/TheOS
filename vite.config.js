import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'TheOS',
        short_name: 'TheOS',
        description: 'Kişisel işletim sistemi — kimlik, alışkanlık ve seri takibi',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0b',
        theme_color: '#0a0a0b',
        orientation: 'portrait-primary',
        lang: 'tr',
        icons: [72, 96, 128, 144, 152, 192, 384, 512].map(s => ({
          src: `/icons/icon-${s}.png`,
          sizes: `${s}x${s}`,
          type: 'image/png',
          purpose: 'any maskable',
        })),
      },
    }),
  ],
  server: {
    port: 5200,
  },
})
