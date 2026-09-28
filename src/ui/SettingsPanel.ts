import { actions } from '../state/actions';
import { selectSettings } from '../state/selectors';
import type { Store } from '../state/store';
import { type Component, h } from './dom';

export interface SettingsHandlers {
  onExport: () => void;
  onImport: (file: File) => void;
  onNewGame: () => void;
}

export interface SettingsPanel extends Component {
  toggle(): void;
  close(): void;
  readonly isOpen: boolean;
}

export const createSettingsPanel = (store: Store, handlers: SettingsHandlers): SettingsPanel => {
  const mute = h('input', { type: 'checkbox', id: 'opt-mute', 'data-testid': 'mute' });
  mute.addEventListener('change', () =>
    store.dispatch(actions.updateSettings({ muted: mute.checked })),
  );
  const volume = h('input', {
    type: 'range',
    min: 0,
    max: 100,
    step: 1,
    id: 'opt-volume',
    'aria-label': 'Volume',
    'data-testid': 'volume',
  });
  volume.addEventListener('input', () =>
    store.dispatch(actions.updateSettings({ volume: Number(volume.value) / 100 })),
  );
  const file = h('input', {
    type: 'file',
    accept: 'application/json,.json',
    hidden: true,
    'data-testid': 'import-input',
  });
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    if (f) handlers.onImport(f);
    file.value = '';
  });

  // Two-step confirm instead of window.confirm(), which blocks the render loop.
  let armed = false;
  const newGame = h('button', { class: 'btn btn-danger', 'data-testid': 'new-game' }, 'New island');
  newGame.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      newGame.textContent = 'Tap again to start over';
      return;
    }
    armed = false;
    newGame.textContent = 'New island';
    handlers.onNewGame();
    close();
  });

  const el = h(
    'section',
    {
      class: 'panel settings',
      role: 'dialog',
      'aria-label': 'Settings',
      'data-testid': 'settings',
      hidden: true,
    },
    h(
      'header',
      { class: 'panel-head' },
      h('h2', {}, 'Settings'),
      h(
        'button',
        { class: 'icon-btn', 'aria-label': 'Close settings', onclick: () => close() },
        '✕',
      ),
    ),
    h(
      'div',
      { class: 'panel-body' },
      h('label', { class: 'row', for: 'opt-mute' }, h('span', {}, 'Mute sound'), mute),
      h('label', { class: 'row', for: 'opt-volume' }, h('span', {}, 'Volume'), volume),
      h(
        'div',
        { class: 'row' },
        h('span', {}, 'Save file'),
        h(
          'div',
          { class: 'row-actions' },
          h(
            'button',
            { class: 'btn', 'data-testid': 'export', onclick: handlers.onExport },
            'Export',
          ),
          h(
            'button',
            { class: 'btn', 'data-testid': 'import', onclick: () => file.click() },
            'Import',
          ),
        ),
      ),
      h('div', { class: 'row' }, h('span', {}, 'Start over'), newGame),
      file,
    ),
  );

  const off = store.select(
    selectSettings,
    (s) => {
      mute.checked = s.muted;
      volume.value = String(Math.round(s.volume * 100));
    },
    { fireImmediately: true },
  );

  let isOpen = false;
  const close = (): void => {
    isOpen = false;
    el.hidden = true;
    armed = false;
    newGame.textContent = 'New island';
  };

  return {
    el,
    toggle: () => {
      isOpen = !isOpen;
      el.hidden = !isOpen;
    },
    close,
    get isOpen() {
      return isOpen;
    },
    dispose: off,
  };
};
