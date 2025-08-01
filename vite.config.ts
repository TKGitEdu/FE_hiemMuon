//src/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // base: '/FE_hiemMuon/', // Thêm dòng này, thay bằng tên repo của bạn nếu khác
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7147',
        changeOrigin: true,
        secure: false
      }
    }
  },
})
