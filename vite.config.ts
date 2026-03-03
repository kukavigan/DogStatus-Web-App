import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/DogStatus-Web-App/',
  plugins: [react()],
  optimizeDeps: { exclude: ['lucide-react'] },
})