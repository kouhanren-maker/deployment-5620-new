import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Render 部署优化版：
// 1. base: './' → 让所有静态资源路径使用相对路径，避免在 Django 下 404
// 2. 构建优化 chunk 拆分不变
// 3. server.proxy 仅开发时使用，本地调试正常

export default defineConfig({
  plugins: [react()],
  base: './',  // ✅ 关键修改：使用相对路径（防止白屏）
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          state: ['zustand'],
          styled: ['styled-components']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // ✅ 仅用于本地开发
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
