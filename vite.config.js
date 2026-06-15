import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND = 'https://francomaliship-backend-1.onrender.com';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/nanei': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
        // Réécrire les cookies Set-Cookie pour les domainer sur localhost
        cookieDomainRewrite: 'localhost',
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          http: ['axios'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
});
