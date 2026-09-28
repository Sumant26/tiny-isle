import { CROP_IDS, CROPS, DECORATION_IDS, DECORATIONS, FISH, FISH_IDS } from '../core/config';
import type { GameState } from '../core/types';
import { actions } from '../state/actions';
import type { Store } from '../state/store';
import { type Component, h } from './dom';
import { CROP_ICONS } from './text';

export type ShopTab = 'seeds' | 'decor' | 'sell';

export interface ShopPanel extends Component {
  open(tab?: ShopTab): void;
  close(): void;
  readonly isOpen: boolean;
  readonly tab: ShopTab;
}

/** Market stand: buy seeds and decorations, sell produce. Re-renders only while open. */
export const createShopPanel = (store: Store): ShopPanel => {
  let tab: ShopTab = 'seeds';
  let isOpen = false;
  const body = h('div', { class: 'panel-body' });
  const tabs = new Map<ShopTab, HTMLButtonElement>();
  const tabBar = h('div', { class: 'tabs', role: 'tablist' });
  for (const [id, label] of [
    ['seeds', 'Seeds'],
    ['decor', 'Decor'],
    ['sell', 'Sell'],
  ] as const) {
    const b = h(
      'button',
      {
        class: 'tab',
        role: 'tab',
        'data-testid': `shop-tab-${id}`,
        onclick: () => {
          tab = id;
          render();
        },
      },
      label,
    );
    tabs.set(id, b);
    tabBar.append(b);
  }
  const closeBtn = h(
    'button',
    { class: 'icon-btn', 'aria-label': 'Close market', onclick: () => close() },
    '✕',
  );
  const el = h(
    'section',
    {
      class: 'panel shop',
      role: 'dialog',
      'aria-label': 'Market stand',
      'data-testid': 'shop',
      hidden: true,
    },
    h('header', { class: 'panel-head' }, h('h2', {}, 'Market stand'), closeBtn),
    tabBar,
    body,
  );

  const row = (label: string, detail: string, ...actionsEls: HTMLElement[]): HTMLElement =>
    h(
      'div',
      { class: 'row' },
      h('div', { class: 'row-text' }, h('strong', {}, label), h('small', {}, detail)),
      h('div', { class: 'row-actions' }, ...actionsEls),
    );

  const btn = (
    label: string,
    onClick: () => void,
    disabled: boolean,
    testId: string,
  ): HTMLButtonElement =>
    h('button', { class: 'btn', onclick: onClick, disabled, 'data-testid': testId }, label);

  const renderSeeds = (s: GameState): HTMLElement[] =>
    CROP_IDS.map((c) => {
      const def = CROPS[c];
      const unlocked = s.unlockedCrops.includes(c);
      if (!unlocked) return row(`${CROP_ICONS[c]} ???`, 'Grow your island to unlock');
      return row(
        `${CROP_ICONS[c]} ${def.name}`,
        `${def.seedCost} coins · ${def.growthDays} days · you have ${s.inventory.seeds[c]}`,
        btn(
          'Buy 1',
          () => store.dispatch(actions.buySeeds(c, 1)),
          s.coins < def.seedCost,
          `buy-${c}-1`,
        ),
        btn(
          'Buy 5',
          () => store.dispatch(actions.buySeeds(c, 5)),
          s.coins < def.seedCost * 5,
          `buy-${c}-5`,
        ),
      );
    });

  const renderDecor = (s: GameState): HTMLElement[] => {
    const items = DECORATION_IDS.map((d) => {
      const def = DECORATIONS[d];
      const owned = s.decorations.includes(d);
      return row(
        def.name,
        owned ? 'On your island' : `${def.cost} coins · +${def.bloomPoints} bloom`,
        btn(
          owned ? 'Owned' : 'Buy',
          () => store.dispatch(actions.buyDecoration(d)),
          owned || s.coins < def.cost,
          `buy-${d}`,
        ),
      );
    });

    if (s.plot.height < 7) {
      const nextHeight = s.plot.height + 1;
      const cost = nextHeight === 5 ? 50 : nextHeight === 6 ? 100 : 180;
      const reqBloom = nextHeight === 5 ? 20 : nextHeight === 6 ? 45 : 70;
      const canExpand = s.bloom >= reqBloom && s.coins >= cost;
      items.unshift(
        row(
          `🏡 Expand Garden (Row ${nextHeight})`,
          s.bloom < reqBloom
            ? `Requires ${reqBloom} Bloom points`
            : `${cost} coins · +5 bloom points`,
          btn('Expand', () => store.dispatch(actions.expandPlot()), !canExpand, 'expand-plot'),
        ),
      );
    }

    return items;
  };

  const renderSell = (s: GameState): HTMLElement[] => {
    const cropRows = CROP_IDS.filter((c) => s.inventory.produce[c] > 0).map((c) =>
      row(
        `${CROP_ICONS[c]} ${CROPS[c].name} × ${s.inventory.produce[c]}`,
        `${CROPS[c].sellPrice} coins each`,
        btn('Sell 1', () => store.dispatch(actions.sell(c, 1)), false, `sell-${c}-1`),
      ),
    );
    const fishRows = FISH_IDS.filter((f) => (s.fishInventory?.[f] ?? 0) > 0).map((f) =>
      row(
        `🐟 ${FISH[f].name} × ${s.fishInventory?.[f]}`,
        `${FISH[f].sellPrice} coins each`,
        btn('Sell 1', () => store.dispatch(actions.sellFish(f, 1)), false, `sell-fish-${f}-1`),
      ),
    );
    const rows = [...cropRows, ...fishRows];
    if (!rows.length)
      return [
        h(
          'p',
          { class: 'empty' },
          'Nothing to sell yet. Harvest crops or catch fish from the pond!',
        ),
      ];
    return [
      ...rows,
      h(
        'div',
        { class: 'row-footer' },
        btn('Sell everything', () => store.dispatch(actions.sellAll()), false, 'sell-all'),
      ),
    ];
  };

  const render = (): void => {
    if (!isOpen) return;
    for (const [id, b] of tabs) {
      b.classList.toggle('on', id === tab);
      b.setAttribute('aria-selected', String(id === tab));
    }
    const s = store.getState();
    const content =
      tab === 'seeds' ? renderSeeds(s) : tab === 'decor' ? renderDecor(s) : renderSell(s);
    body.replaceChildren(...content);
  };

  const off = store.subscribe(render);

  const open = (t?: ShopTab): void => {
    if (t) tab = t;
    isOpen = true;
    el.hidden = false;
    render();
  };
  const close = (): void => {
    isOpen = false;
    el.hidden = true;
  };

  return {
    el,
    open,
    close,
    get isOpen() {
      return isOpen;
    },
    get tab() {
      return tab;
    },
    dispose: off,
  };
};
