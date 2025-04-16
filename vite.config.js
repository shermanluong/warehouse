import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['pickpack.onrender.com'],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
