import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless'; // <-- ADD THIS

export default defineConfig({
  output: 'server',
  adapter: vercel(), // <-- REQUIRED FOR SSR ON VERCEL
  integrations: [react()],
});
