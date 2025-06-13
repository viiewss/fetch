// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // auth endpoints
      '/auth': {
        target: 'https://frontend-take-home-service.fetch.com',
        changeOrigin: true,
        secure: false,
        // cookieDomainRewrite: 'localhost', // uncomment if the cookie's Domain attr blocks localhost
      },
      // dog endpoints
      '/dogs': {
        target: 'https://frontend-take-home-service.fetch.com',
        changeOrigin: true,
        secure: false,
      },
      // location endpoints (if you use them)
      '/locations': {
        target: 'https://frontend-take-home-service.fetch.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
