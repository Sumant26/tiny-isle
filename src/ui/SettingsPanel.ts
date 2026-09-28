import { actions } from '../state/actions';
import { selectSettings } from '../state/selectors';
import type { Store } from '../state/store';
import { type Component, h } from './dom';

export interface SettingsHandlers {
  onExport: () => void;
  onImport: (file: File) => void;
  onNewGame: () => void;
  onJournal?: () => void;
  onCook?: () => void;
  onFish?: () => void;
  onPhotoMode?: () => void;
  /** Present only when the build supports crash reporting. */
  crashReports?: {
    isEnabled: () => boolean;
    onChange: (enabled: boolean) => void;
  };
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

  const musicVolume = h('input', {
    type: 'range',
    min: 0,
    max: 100,
    step: 1,
    id: 'opt-music',
    'aria-label': 'Music Volume',
    'data-testid': 'music-volume',
  });
  musicVolume.addEventListener('input', () =>
    store.dispatch(actions.updateSettings({ musicVolume: Number(musicVolume.value) / 100 })),
  );

  const highContrast = h('input', {
    type: 'checkbox',
    id: 'opt-contrast',
    'data-testid': 'high-contrast',
  });
  highContrast.addEventListener('change', () => {
    store.dispatch(actions.updateSettings({ highContrast: highContrast.checked }));
    document.body.classList.toggle('high-contrast', highContrast.checked);
  });

  const largeText = h('input', {
    type: 'checkbox',
    id: 'opt-largetext',
    'data-testid': 'large-text',
  });
  largeText.addEventListener('change', () => {
    store.dispatch(actions.updateSettings({ largeText: largeText.checked }));
    document.body.classList.toggle('large-text', largeText.checked);
  });

  const colorblind = h('input', {
    type: 'checkbox',
    id: 'opt-colorblind',
    'data-testid': 'colorblind',
  });
  colorblind.addEventListener('change', () => {
    store.dispatch(actions.updateSettings({ colorblindMode: colorblind.checked }));
    document.body.classList.toggle('colorblind-mode', colorblind.checked);
  });

  const langSelect = h(
    'select',
    { id: 'opt-lang', class: 'select-input', 'data-testid': 'language-select' },
    h('option', { value: 'en' }, 'English'),
    h('option', { value: 'es' }, 'Español'),
    h('option', { value: 'fr' }, 'Français'),
    h('option', { value: 'ja' }, '日本語'),
    h('option', { value: 'de' }, 'Deutsch'),
  );
  langSelect.addEventListener('change', () => {
    store.dispatch(actions.updateSettings({ language: langSelect.value }));
  });

  const crash = handlers.crashReports;
  const crashToggle = h('input', {
    type: 'checkbox',
    id: 'opt-crash',
    'data-testid': 'crash-reports',
  });
  crashToggle.checked = crash?.isEnabled() ?? false;
  crashToggle.addEventListener('change', () => crash?.onChange(crashToggle.checked));
  const crashRow = crash
    ? h(
        'label',
        { class: 'row', for: 'opt-crash' },
        h(
          'span',
          { class: 'row-text' },
          h('span', {}, 'Share crash reports'),
          h('small', {}, 'Anonymous error details only. No saves or personal data.'),
        ),
        crashToggle,
      )
    : null;

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
      h('h2', {}, 'Settings & Accessibility'),
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
      h('label', { class: 'row', for: 'opt-volume' }, h('span', {}, 'Sound effects'), volume),
      h('label', { class: 'row', for: 'opt-music' }, h('span', {}, 'Music volume'), musicVolume),
      h('label', { class: 'row', for: 'opt-lang' }, h('span', {}, 'Language / Idioma'), langSelect),
      h(
        'label',
        { class: 'row', for: 'opt-contrast' },
        h('span', {}, 'High contrast mode'),
        highContrast,
      ),
      h(
        'label',
        { class: 'row', for: 'opt-largetext' },
        h('span', {}, 'Large text mode'),
        largeText,
      ),
      h(
        'label',
        { class: 'row', for: 'opt-colorblind' },
        h('span', {}, 'Colorblind crop markers'),
        colorblind,
      ),
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
      crashRow,
      h('div', { class: 'row' }, h('span', {}, 'Start over'), newGame),
      file,
    ),
  );

  const off = store.select(
    selectSettings,
    (s) => {
      mute.checked = s.muted;
      volume.value = String(Math.round(s.volume * 100));
      musicVolume.value = String(Math.round((s.musicVolume ?? 0.4) * 100));
      highContrast.checked = s.highContrast ?? false;
      largeText.checked = s.largeText ?? false;
      colorblind.checked = s.colorblindMode ?? false;
      langSelect.value = s.language ?? 'en';
      document.body.classList.toggle('high-contrast', s.highContrast ?? false);
      document.body.classList.toggle('large-text', s.largeText ?? false);
      document.body.classList.toggle('colorblind-mode', s.colorblindMode ?? false);
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
