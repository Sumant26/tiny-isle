import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

const chromium = {
  ...devices['Desktop Chrome'],
  launchOptions: {
    // Software WebGL so the 3D scene renders on CI machines without a GPU.
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    ...(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}),
  },
};

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  // Baselines are per platform; only the Linux ones (made in CI's Docker image) are committed.
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}-{platform}{ext}',
  expect: {
    // Software rendering is slow; a stable screenshot can take several seconds.
    timeout: 30_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // The PWA service worker would cache between tests; the PWA spec opts back in.
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'chromium', use: chromium, testIgnore: /visual\.spec\.ts/ },
    {
      name: 'visual',
      use: { ...chromium, viewport: { width: 1100, height: 700 } },
      testMatch: /visual\.spec\.ts/,
    },
  ],
  webServer: {
    // The e2e build keeps the debug hook (window.__tinyIsle) that tests drive the game through.
    command: `npx vite build --mode e2e && npx vite preview --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
