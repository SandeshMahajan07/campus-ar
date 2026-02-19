
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Using './' ensures that assets are loaded relative to index.html 
  // no matter what subfolder the site is hosted in.
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generates source maps for easier debugging
    sourcemap: true,
  }
});
