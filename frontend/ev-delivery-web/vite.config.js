import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/vehicles': 'http://localhost:5001',
      '/api': 'http://localhost:3000',
    },
  },
});
