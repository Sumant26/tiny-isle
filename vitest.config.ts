import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
    environment: 'node',
    // DOM-facing modules opt into jsdom with a `// @vitest-environment jsdom` docblock.
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'build/**/*.ts'],
      exclude: ['**/*.test.ts', 'src/main.ts', 'src/**/index.ts', 'src/test/**', 'src/**/types.ts'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 85, functions: 85, statements: 85, branches: 75 },
    },
  },
});
