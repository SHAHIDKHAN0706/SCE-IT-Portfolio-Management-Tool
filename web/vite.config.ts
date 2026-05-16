import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is set so the app works when served from a GitHub Pages project URL
// (https://<user>.github.io/SCE-IT-Portfolio-Management-Tool/). It can be
// overridden at build time by setting the VITE_BASE environment variable
// (e.g. VITE_BASE=/ for root-hosted deploys).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/SCE-IT-Portfolio-Management-Tool/',
})
