import { expect, test } from '@playwright/test';
import { openGame } from './helpers';

// These tests need the real service worker, which the other specs block.
test.use({ serviceWorkers: 'allow' });

test.describe('installable app (PWA)', () => {
  test('links a valid web app manifest', async ({ page, request }) => {
    await openGame(page);
    const href = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(href).toBeTruthy();
    const manifest = (await (await request.get(href!)).json()) as {
      name: string;
      display: string;
      icons: { sizes: string; purpose?: string }[];
    };
    expect(manifest.name).toBe('Tiny Isle');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.map((i) => i.sizes)).toEqual(
      expect.arrayContaining(['192x192', '512x512']),
    );
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  });

  test('works offline after the first visit', async ({ page, context }) => {
    await openGame(page);
    // First visit installs the service worker; the next load is served through it.
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
    expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
    await expect(page.getByTestId('coins')).toBeVisible();
    await context.setOffline(false);
  });
});
