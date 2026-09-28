import type { ToolId } from '../core/types';
import { actions } from '../state/actions';
import { selectSeed, selectSeedCount, selectTool } from '../state/selectors';
import { shallowEqual, type Store } from '../state/store';
import { type Component, h } from './dom';
import { CROP_ICONS, TOOL_INFO } from './text';

const TOOLS: ToolId[] = ['hoe', 'seeds', 'water', 'basket'];

export const createHotbar = (
  store: Store,
  handlers: { onSleep: () => void; onShop: () => void },
): Component => {
  const buttons = new Map<ToolId, HTMLButtonElement>();
  const seedIcon = h('span', { class: 'seed-icon' });
  const seedCount = h('span', { class: 'slot-count', 'data-testid': 'seed-count' });

  for (const tool of TOOLS) {
    const info = TOOL_INFO[tool];
    const btn = h(
      'button',
      {
        class: 'slot',
        'aria-label': `${info.label} (${info.key})`,
        title: `${info.label} (${info.key})`,
        'data-testid': `tool-${tool}`,
        onclick: () => store.dispatch(actions.selectTool(tool)),
      },
      tool === 'seeds' ? seedIcon : info.icon,
      tool === 'seeds' ? seedCount : null,
      h('span', { class: 'slot-key', 'aria-hidden': 'true' }, info.key),
    );
    buttons.set(tool, btn);
  }

  const cycle = h(
    'button',
    {
      class: 'slot slot-narrow',
      'aria-label': 'Next seed (E)',
      title: 'Next seed (E)',
      'data-testid': 'cycle-seed',
      onclick: () => store.dispatch(actions.cycleSeed(1)),
    },
    '›',
  );
  const shop = h(
    'button',
    {
      class: 'slot',
      'aria-label': 'Go to market (B)',
      title: 'Market (B)',
      'data-testid': 'shop-button',
      onclick: handlers.onShop,
    },
    '🏪',
  );
  const sleep = h(
    'button',
    {
      class: 'slot slot-sleep',
      'aria-label': 'Sleep until morning (Z)',
      title: 'Sleep (Z)',
      'data-testid': 'sleep-button',
      onclick: handlers.onSleep,
    },
    '🌙',
  );

  const el = h(
    'nav',
    { class: 'hotbar', 'aria-label': 'Tools' },
    ...buttons.values(),
    cycle,
    h('span', { class: 'divider' }),
    shop,
    sleep,
  );

  const offs = [
    store.select(
      selectTool,
      (tool) => {
        for (const [t, b] of buttons) {
          b.classList.toggle('on', t === tool);
          b.setAttribute('aria-pressed', String(t === tool));
        }
      },
      { fireImmediately: true },
    ),
    store.select(
      (s) => ({ crop: selectSeed(s), count: selectSeedCount(s, selectSeed(s)) }),
      ({ crop, count }) => {
        seedIcon.textContent = CROP_ICONS[crop];
        seedCount.textContent = String(count);
      },
      { equals: shallowEqual, fireImmediately: true },
    ),
  ];

  return { el, dispose: () => offs.forEach((o) => o()) };
};
