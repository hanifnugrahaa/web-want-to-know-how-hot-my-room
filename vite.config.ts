import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Bisa diakses dari network
    port: 5173, // Port default Vite
    open: true // Buka browser otomatis
  }
})