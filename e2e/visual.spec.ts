import { expect, type Page, test } from '@playwright/test';

/**
 * Screenshot comparison tests. The game boots with `?visual`, which freezes time,
 * seeds all randomness and starts from a fixed island, so every run draws the
 * same pixels. Baselines live in e2e/__screenshots__ and are generated in CI's
 * Docker image (see docs/TESTING.md → "Visual tests").
 */

const open = async (page: Page, width = 1100, height = 700): Promise<void> => {
  // Web fonts load at unpredictable times; use the system fallback font instead.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.setViewportSize({ width, height });
  await page.goto('/?visual');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
};

/**
 * Loads a lush, fully-decorated garden, finishes pop-in animations and draws a frame.
 * Runs inside the page, so it must be self-contained.
 */
const showLushGarden = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const hook = window.__tinyIsle;
    const s = hook.game.store.getState();
    const crops = ['carrot', 'tomato', 'strawberry', 'sunflower', 'pumpkin'] as const;
    const tiles = s.plot.tiles.map((_, i) => ({
      tilled: i < 20,
      watered: i % 3 === 0,
      crop: i < 18 ? { id: crops[i % 5]!, growth: i < 10 ? 9 : i % 3 } : null,
    }));
    hook.game.store.dispatch(
      hook.actions.load({
        ...s,
        coins: 128,
        day: 12,
        bloom: 48,
        plot: { ...s.plot, tiles },
        unlockedCrops: [...crops],
        decorations: ['bench', 'flowerbed', 'birdbath', 'windchime', 'gnome'],
        visitor: { id: 'pip', arrivedOnDay: 12 },
        inventory: { ...s.inventory, produce: { ...s.inventory.produce, tomato: 1 } },
      }),
    );
    hook.settle();
  });

test.describe('visual', () => {
  test('a fresh island', async ({ page }) => {
    await open(page);
    await page.evaluate(() => window.__tinyIsle.settle());
    await expect(page).toHaveScreenshot('fresh-island.png');
  });

  test('a lush garden with decorations and a visitor', async ({ page }) => {
    await open(page);
    await showLushGarden(page);
    await expect(page).toHaveScreenshot('lush-garden.png');
  });

  test('dusk lighting', async ({ page }) => {
    await open(page);
    await showLushGarden(page);
    await page.evaluate(() => {
      window.__tinyIsle.game.renderer.lighting.set('dusk');
      window.__tinyIsle.settle();
    });
    await expect(page).toHaveScreenshot('dusk.png');
  });

  test('market stand', async ({ page }) => {
    await open(page);
    await showLushGarden(page);
    await page.evaluate(() => window.__tinyIsle.game.ui.shop.open('seeds'));
    await expect(page.getByTestId('shop')).toHaveScreenshot('market-seeds.png');
  });

  test('phone layout', async ({ page }) => {
    await open(page, 375, 700);
    await page.evaluate(() => window.__tinyIsle.settle());
    await expect(page).toHaveScreenshot('phone.png');
  });
});
