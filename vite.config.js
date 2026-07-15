import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    allowedHosts: true
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.png', 'vite.svg'],
      manifest: {
        name: 'DeepWork Flow',
        short_name: 'DeepWork',
        description: 'Focus app for ADHD minds',
        theme_color: '#171717',
        background_color: '#171717',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Iniciar Enfoque',
            short_name: 'Enfoque',
            description: 'Comienza una sesión de enfoque de inmediato',
            url: '/?start=true',
            icons: [{ src: 'pwa-icon.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Ver Métricas',
            short_name: 'Métricas',
            description: 'Revisa tu progreso e historial',
            url: '/?screen=metrics',
            icons: [{ src: 'pwa-icon.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})
