import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: '/react-soci-auth/',
  plugins: [react()],
  resolve: {
    alias: {
      'react-soci-auth': resolve(__dirname, '../src/index.ts'),
    },
  },
});
