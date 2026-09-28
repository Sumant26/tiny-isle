import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import { babylonChunks } from './build/babylonChunks.ts';

const chunks = babylonChunks();
const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as {
  version: string;
};

export default defineConfig({
  // Relative base so the build works on GitHub Pages sub-paths and itch.io.
  base: './',
  define: {
    // Tags crash reports with the release that release-please published.
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version),
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    chunks.plugin,
    VitePWA({
      // We show our own "update available" toast instead of reloading silently.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Tiny Isle',
        short_name: 'Tiny Isle',
        description: 'A cozy gardening game on a tiny floating island.',
        theme_color: '#F6E9D7',
        background_color: '#F6E9D7',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        scope: './',
        categories: ['games', 'entertainment'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the whole game (Babylon included) so it plays fully offline.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,json}'],
        // Opt-in/optional chunks are cached on first use instead of downloaded for everyone.
        globIgnores: ['**/sentry-*.js', '**/gltf-*.js'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/assets\/(sentry|gltf)-[\w-]+\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'optional-code', expiration: { maxEntries: 10 } },
          },
          {
            // Downloaded 3D models (see docs/ASSETS.md).
            urlPattern: /\/models\/.*\.(glb|gltf|bin|png|jpg)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'models', expiration: { maxEntries: 200 } },
          },
        ],
      },
    }),
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
    chunkSizeWarningLimit: 2500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Engine code the game uses: its own long-cached chunk (game code changes more often).
            { name: 'babylon', test: (id: string) => chunks.group(id) === 'babylon' },
            // Optional, lazily loaded features get their own chunks (see workbox globIgnores).
            { name: 'gltf', test: (id: string) => chunks.group(id) === 'gltf' },
            { name: 'sentry', test: /node_modules[\\/]@sentry/ },
          ],
        },
      },
    },
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
