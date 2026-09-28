import type { Store } from '../state/store';
import {
  selectBloomInfo,
  selectCoins,
  selectDay,
  selectWeather,
  type BloomInfo,
} from '../state/selectors';
import { shallowEqual } from '../state/store';
import { type Component, h } from './dom';

export const createHud = (
  store: Store,
  handlers: { onSettings: () => void; onHelp: () => void },
): Component => {
  const coins = h('span', { class: 'hud-value', 'data-testid': 'coins' });
  const day = h('span', { class: 'hud-value', 'data-testid': 'day' });
  const weather = h('span', { class: 'hud-icon', 'aria-hidden': 'true' });
  const bloomName = h('span', { class: 'hud-small', 'data-testid': 'bloom-name' });
  const bloomFill = h('span', { class: 'bloom-fill' });
  const bloomBar = h(
    'span',
    {
      class: 'bloom-bar',
      role: 'progressbar',
      'aria-label': 'Island bloom',
      'aria-valuemin': 0,
      'aria-valuemax': 100,
    },
    bloomFill,
  );

  const el = h(
    'div',
    { class: 'hud' },
    h(
      'div',
      { class: 'pill', title: 'Coins' },
      h('span', { class: 'coin', 'aria-hidden': 'true' }),
      coins,
      h('span', { class: 'hud-small' }, 'coins'),
    ),
    h('div', { class: 'pill' }, h('span', { class: 'hud-small' }, 'Bloom'), bloomBar, bloomName),
    h(
      'div',
      { class: 'pill hud-right' },
      weather,
      h('span', {}, 'Day '),
      day,
      h(
        'button',
        { class: 'icon-btn', 'aria-label': 'How to play', onclick: handlers.onHelp },
        '?',
      ),
      h(
        'button',
        {
          class: 'icon-btn',
          'aria-label': 'Settings',
          'data-testid': 'settings-button',
          onclick: handlers.onSettings,
        },
        '⚙',
      ),
    ),
  );

  const renderBloom = (b: BloomInfo): void => {
    bloomName.textContent = b.name;
    const pct = Math.round(b.progress * 100);
    bloomFill.style.width = `${pct}%`;
    bloomBar.setAttribute('aria-valuenow', String(pct));
  };

  const offs = [
    store.select(selectCoins, (c) => (coins.textContent = String(c)), { fireImmediately: true }),
    store.select(selectDay, (d) => (day.textContent = String(d)), { fireImmediately: true }),
    store.select(
      selectWeather,
      (w) => {
        weather.textContent = w === 'rain' ? '🌧' : '☀';
        weather.title = w === 'rain' ? 'Rainy' : 'Clear';
      },
      { fireImmediately: true },
    ),
    store.select(selectBloomInfo, renderBloom, { equals: shallowEqual, fireImmediately: true }),
  ];

  return { el, dispose: () => offs.forEach((o) => o()) };
};
