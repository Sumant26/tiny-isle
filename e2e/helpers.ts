import { expect, type Page } from '@playwright/test';

/** Opens the game with a clean save and waits until the scene is ready. */
export const openGame = async (
  page: Page,
  { fresh = true, skipHelp = true } = {},
): Promise<void> => {
  if (fresh) {
    await page.addInitScript(
      ({ skip }) => {
        if (sessionStorage.getItem('__e2e_init')) return;
        sessionStorage.setItem('__e2e_init', '1');
        localStorage.clear();
        if (skip) localStorage.setItem('tiny-isle/help-seen', '1');
      },
      { skip: skipHelp },
    );
  }
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
};

/** Runs the game's own click pipeline (walk + use tool) on a plot tile. */
export const clickTile = (page: Page, index: number): Promise<string> =>
  page.evaluate((i) => window.__tinyIsle.clickTile(i), index);

export const state = <T>(page: Page, pick: string): Promise<T> =>
  page.evaluate((expr) => {
    const s = window.__tinyIsle.game.store.getState() as unknown as Record<string, unknown>;
    return expr.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], s);
  }, pick) as Promise<T>;
