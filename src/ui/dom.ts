type Child = Node | string | number | null | undefined | false;
type Props = Record<string, unknown> & {
  class?: string;
  style?: Partial<CSSStyleDeclaration> | string;
  dataset?: Record<string, string>;
};

const toAttr = (v: unknown): string =>
  typeof v === 'string' || typeof v === 'number' ? String(v) : JSON.stringify(v);

/** Minimal hyperscript helper: h('button', { class: 'x', onclick }, 'Label'). */
export const h = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Props = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') el.className = toAttr(value);
    else if (key === 'style') {
      if (typeof value === 'string') el.style.cssText = value;
      else if (typeof value === 'object') Object.assign(el.style, value);
    } else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2), value as EventListener);
    } else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, toAttr(value));
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'number' ? String(c) : c);
  }
  return el;
};

export interface Component {
  readonly el: HTMLElement;
  dispose(): void;
}
