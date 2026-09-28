import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works on GitHub Pages sub-paths and itch.io.
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 2500,
    rolldownOptions: {
      output: {
        // Keep the engine in its own long-cached chunk; game code changes often, Babylon rarely.
        codeSplitting: {
          groups: [{ name: 'babylon', test: /node_modules[\\/]@babylonjs/ }],
        },
      },
    },
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
