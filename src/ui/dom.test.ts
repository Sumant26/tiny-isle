// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { h } from './dom';

describe('h', () => {
  it('creates elements with attributes, classes, styles, data and children', () => {
    const onclick = vi.fn();
    const el = h(
      'button',
      {
        class: 'x',
        style: { color: 'red' },
        dataset: { id: '1' },
        'aria-label': 'Go',
        disabled: true,
        hidden: false,
        title: undefined,
        onclick,
      },
      'Hi',
      3,
      null,
      false,
      h('span', {}, '!'),
    );
    expect(el.className).toBe('x');
    expect(el.style.color).toBe('red');
    expect(el.dataset.id).toBe('1');
    expect(el.getAttribute('aria-label')).toBe('Go');
    expect(el.hasAttribute('disabled')).toBe(true);
    expect(el.hasAttribute('hidden')).toBe(false);
    expect(el.textContent).toBe('Hi3!');
    el.click();
    expect(onclick).not.toHaveBeenCalled(); // disabled buttons don't fire click
    el.removeAttribute('disabled');
    el.click();
    expect(onclick).toHaveBeenCalled();
  });

  it('works with no props', () => {
    expect(h('div').outerHTML).toBe('<div></div>');
  });
});
