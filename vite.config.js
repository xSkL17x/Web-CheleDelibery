// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,  // frontend para desarrollo    
    proxy: {
      '/usuario': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false, // Es 'false' porque en local usamos HTTP y no HTTPS
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/config': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/negocios': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist', // La carpeta que tu server.js va a leer en producción
    emptyOutDir: true, // Limpia la carpeta antes de construir
  }
});