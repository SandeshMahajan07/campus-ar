
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Set base to './' so it works on any domain or subfolder (like GitHub Pages)
  base: './', 
  server: {
    host: true,
    port: 5173
  }
});
