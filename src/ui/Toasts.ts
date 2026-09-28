import type { Store } from '../state/store';
import { type Component, h } from './dom';
import { messageForEvent, type Tone } from './text';

export interface Toasts extends Component {
  show(text: string, tone?: Tone): void;
}

/** Gentle messages in an aria-live region. Repeated messages are collapsed. */
export const createToasts = (
  store: Store,
  {
    durationMs = 2600,
    max = 3,
    schedule = (fn: () => void, ms: number): unknown => setTimeout(fn, ms),
  }: { durationMs?: number; max?: number; schedule?: (fn: () => void, ms: number) => unknown } = {},
): Toasts => {
  const el = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });

  const show = (text: string, tone: Tone = 'info'): void => {
    const last = el.lastElementChild;
    if (last?.textContent === text) return;
    const toast = h('div', { class: `toast toast-${tone}` }, text);
    el.append(toast);
    while (el.childElementCount > max) el.firstElementChild?.remove();
    schedule(() => toast.remove(), durationMs);
  };

  const off = store.onEvent((e) => {
    const m = messageForEvent(e);
    if (m) show(m.text, m.tone);
  });

  return { el, show, dispose: off };
};
