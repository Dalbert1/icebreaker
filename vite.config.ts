import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
//
// `base` is configurable for an eventual GitHub Pages deploy (served from a
// sub-path like /icebreaker/). For local + LAN dev it stays '/'.
const base = process.env.VITE_BASE ?? '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  server: {
    // host: true exposes the dev server on the LAN so a phone on the same
    // Wi-Fi can reach it at http://<your-machine-ip>:5173
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
