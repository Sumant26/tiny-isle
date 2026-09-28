import { type Component, h } from './dom';

export interface HelpPanel extends Component {
  show(): void;
  hide(): void;
  readonly isOpen: boolean;
}

export const createHelpPanel = (onDismiss: () => void = () => undefined): HelpPanel => {
  const el = h(
    'section',
    {
      class: 'panel help',
      role: 'dialog',
      'aria-label': 'How to play',
      'data-testid': 'help',
      hidden: true,
    },
    h('header', { class: 'panel-head' }, h('h2', {}, 'Welcome to Tiny Isle')),
    h(
      'div',
      { class: 'panel-body' },
      h(
        'p',
        {},
        'Bring your little island back to life, one seed at a time. There is no rush and no way to fail.',
      ),
      h(
        'ol',
        {},
        h('li', {}, 'Pick the ', h('b', {}, 'hoe'), ' and click a patch in the garden to till it.'),
        h('li', {}, 'Plant ', h('b', {}, 'seeds'), ', then ', h('b', {}, 'water'), ' them.'),
        h('li', {}, 'Press ', h('b', {}, '🌙 Sleep'), '. Watered crops grow overnight.'),
        h(
          'li',
          {},
          'Harvest ripe crops with the ',
          h('b', {}, 'basket'),
          ' and sell them at the 🏪 market.',
        ),
        h('li', {}, 'Help visitors and buy decorations to make your island bloom.'),
      ),
      h(
        'p',
        { class: 'keys' },
        'Keys: 1–4 tools · Q/E change seed · WASD walk · Space use · Z sleep · B market · M mute. Drag to look around.',
      ),
      h(
        'button',
        {
          class: 'btn btn-primary',
          'data-testid': 'help-close',
          onclick: () => {
            hide();
            onDismiss();
          },
        },
        "Let's garden",
      ),
    ),
  );
  let isOpen = false;
  const hide = (): void => {
    isOpen = false;
    el.hidden = true;
  };
  return {
    el,
    show: () => {
      isOpen = true;
      el.hidden = false;
    },
    hide,
    get isOpen() {
      return isOpen;
    },
    dispose: () => undefined,
  };
};

export interface DayOverlay extends Component {
  /** Fades to a "Day N" card; resolves once the screen is covered. */
  cover(label: string): Promise<void>;
  reveal(): Promise<void>;
}

export const createDayOverlay = (
  wait: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): DayOverlay => {
  const label = h('span', { 'data-testid': 'day-overlay-label' });
  const el = h('div', { class: 'day-overlay', 'aria-hidden': 'true' }, label);
  return {
    el,
    cover: async (text) => {
      label.textContent = text;
      el.classList.add('show');
      await wait(450);
    },
    reveal: async () => {
      el.classList.remove('show');
      await wait(450);
    },
    dispose: () => undefined,
  };
};

export const createFallback = (message: string): HTMLElement =>
  h('div', { class: 'fallback', role: 'alert' }, h('h1', {}, 'Tiny Isle'), h('p', {}, message));

export interface ActionPrompt extends Component {
  /** Shows a message with one action button until the player acts or dismisses it. */
  show(text: string, actionLabel: string, onAction: () => void): void;
  hide(): void;
  readonly isOpen: boolean;
}

export const createActionPrompt = (): ActionPrompt => {
  const text = h('span', { 'data-testid': 'prompt-text' });
  const action = h('button', { class: 'btn btn-primary', 'data-testid': 'prompt-action' });
  const dismiss = h('button', { class: 'icon-btn', 'aria-label': 'Dismiss' }, '✕');
  const el = h(
    'div',
    { class: 'action-prompt', role: 'status', hidden: true, 'data-testid': 'prompt' },
    text,
    action,
    dismiss,
  );
  let handler: () => void = () => undefined;
  let isOpen = false;
  const hide = (): void => {
    isOpen = false;
    el.hidden = true;
  };
  action.addEventListener('click', () => {
    hide();
    handler();
  });
  dismiss.addEventListener('click', hide);
  return {
    el,
    show: (message, label, onAction) => {
      text.textContent = message;
      action.textContent = label;
      handler = onAction;
      isOpen = true;
      el.hidden = false;
    },
    hide,
    get isOpen() {
      return isOpen;
    },
    dispose: () => undefined,
  };
};
