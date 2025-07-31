// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite' // <--- REMOVE OR COMMENT OUT THIS LINE

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // tailwindcss(), // <--- REMOVE OR COMMENT OUT THIS LINE
  ],
})