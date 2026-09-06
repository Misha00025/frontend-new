/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  // Базовый путь приложения. По умолчанию '/' (отдельный поддомен).
  // Для деплоя под путём (например /game-systems) задайте VITE_BASE (build-arg / env).
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@tdn/shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url)),
    },
  },
  server: {
    port: 3001,
  },
  build: {
    outDir: 'build',
  },
});
