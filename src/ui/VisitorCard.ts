import { actions } from '../state/actions';
import { selectVisitorInfo, type VisitorInfo } from '../state/selectors';
import { shallowEqual, type Store } from '../state/store';
import { type Component, h } from './dom';
import { CROP_ICONS } from './text';

export interface VisitorCard extends Component {
  highlight(): void;
}

export const createVisitorCard = (store: Store): VisitorCard => {
  const name = h('strong', {});
  const text = h('p', {});
  const progress = h('small', { 'data-testid': 'visitor-progress' });
  const give = h(
    'button',
    {
      class: 'btn btn-primary',
      'data-testid': 'visitor-give',
      onclick: () => store.dispatch(actions.fulfillVisitor()),
    },
    'Give',
  );
  const el = h(
    'aside',
    { class: 'visitor-card', 'aria-live': 'polite', 'data-testid': 'visitor-card', hidden: true },
    name,
    text,
    h('div', { class: 'row-actions' }, progress, give),
  );

  const render = (info: VisitorInfo | null): void => {
    el.hidden = !info;
    if (!info) return;
    name.textContent = info.name;
    text.textContent = `“${info.greeting}”`;
    progress.textContent = `${CROP_ICONS[info.crop]} ${Math.min(info.have, info.quantity)} / ${info.quantity}`;
    give.disabled = !info.canFulfill;
  };

  const off = store.select(selectVisitorInfo, render, {
    equals: shallowEqual,
    fireImmediately: true,
  });

  return {
    el,
    highlight: () => {
      el.classList.remove('pulse');
      el.getBoundingClientRect(); // force a reflow so the CSS animation restarts
      el.classList.add('pulse');
    },
    dispose: off,
  };
};
