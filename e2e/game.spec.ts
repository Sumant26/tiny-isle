import { expect, test } from '@playwright/test';
import { clickTile, openGame, state } from './helpers';

test.describe('Tiny Isle', () => {
  test('boots, draws the island and shows the HUD', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await openGame(page);
    await expect(page.getByTestId('coins')).toHaveText('20');
    await expect(page.getByTestId('day')).toHaveText('1');
    await expect(page.getByRole('navigation', { name: 'Tools' })).toBeVisible();

    // The canvas has actually been drawn on: a flat clear colour compresses to a tiny PNG,
    // a rendered island with lighting and shadows does not.
    await page.waitForTimeout(500);
    const png = await page.locator('canvas').screenshot();
    expect(png.byteLength).toBeGreaterThan(30_000);
    expect(errors).toEqual([]);
  });

  test('shows the how-to-play panel once', async ({ page }) => {
    await openGame(page, { skipHelp: false });
    await expect(page.getByTestId('help')).toBeVisible();
    await page.getByTestId('help-close').click();
    await expect(page.getByTestId('help')).toBeHidden();
    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
    await expect(page.getByTestId('help')).toBeHidden();
  });

  test('plays a full day: till, plant, water, sleep, grow', async ({ page }) => {
    await openGame(page);
    await page.getByTestId('tool-hoe').click();
    expect(await clickTile(page, 0)).toBe('used');
    await page.getByTestId('tool-seeds').click();
    expect(await clickTile(page, 0)).toBe('used');
    await expect(page.getByTestId('seed-count')).toHaveText('5');
    await page.getByTestId('tool-water').click();
    expect(await clickTile(page, 0)).toBe('used');
    expect(await state(page, 'plot.tiles.0')).toMatchObject({ tilled: true, watered: true });

    await page.getByTestId('sleep-button').click();
    await expect(page.getByTestId('day')).toHaveText('2', { timeout: 30_000 });
    expect(await state<number>(page, 'plot.tiles.0.crop.growth')).toBe(1);
  });

  test('clicking the 3D scene walks the farmer and tills the soil', async ({ page }) => {
    await openGame(page);
    const tile = await page.evaluate(() => window.__tinyIsle.projectCell({ x: 6, z: 5 }));
    expect(tile).not.toBeNull();
    const box = (await page.locator('canvas').boundingBox())!;
    await page.mouse.click(box.x + tile!.x, box.y + tile!.y);
    await expect
      .poll(() => state<boolean>(page, 'plot.tiles.8.tilled'), { timeout: 45_000 })
      .toBe(true);
  });

  test('keyboard shortcuts select tools and open the market', async ({ page }) => {
    await openGame(page);
    await page.keyboard.press('3');
    await expect(page.getByTestId('tool-water')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('b');
    await expect(page.getByTestId('shop')).toBeVisible({ timeout: 45_000 });
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('shop')).toBeHidden();
  });

  test('buys seeds at the market', async ({ page }) => {
    await openGame(page);
    await page.evaluate(() => window.__tinyIsle.game.ui.shop.open('seeds'));
    await page.getByTestId('buy-carrot-5').click();
    await expect(page.getByTestId('coins')).toHaveText('10');
    await expect(page.getByTestId('seed-count')).toHaveText('11');
  });

  test('progress survives a reload', async ({ page }) => {
    await openGame(page);
    await page.getByTestId('tool-hoe').click();
    await clickTile(page, 3);
    await page.getByTestId('sleep-button').click();
    await expect(page.getByTestId('day')).toHaveText('2', { timeout: 30_000 });
    await page.reload();
    await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
    await expect(page.getByTestId('day')).toHaveText('2');
    expect(await state<boolean>(page, 'plot.tiles.3.tilled')).toBe(true);
  });

  test('settings can start a new island', async ({ page }) => {
    await openGame(page);
    await page.evaluate(() =>
      window.__tinyIsle.game.store.dispatch(window.__tinyIsle.actions.sleep()),
    );
    await expect(page.getByTestId('day')).toHaveText('2');
    await page.getByTestId('settings-button').click();
    await page.getByTestId('new-game').click();
    await page.getByTestId('new-game').click();
    await expect(page.getByTestId('day')).toHaveText('1');
  });

  test('fits a phone screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await openGame(page);
    const bar = (await page.getByRole('navigation', { name: 'Tools' }).boundingBox())!;
    expect(bar.x).toBeGreaterThanOrEqual(0);
    expect(bar.x + bar.width).toBeLessThanOrEqual(375);
  });
});
