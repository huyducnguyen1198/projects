// vite.config.js
export const basePath = '/projects/';

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  base: basePath,
  plugins: [svelte()],
  
});