import { actions } from '../state/actions';
import type { Store } from '../state/store';
import { h } from './dom';

export class FishDialog {
  readonly root: HTMLElement;
  private readonly marker: HTMLElement;
  private readonly actionBtn: HTMLElement;
  private animTimer: number | null = null;
  private pos = 0;
  private dir = 1;
  private state: 'ready' | 'reeling' = 'ready';

  constructor(
    private readonly store: Store,
    onClose: () => void,
  ) {
    this.marker = h('div', { class: 'fishing-target' });
    const bar = h('div', { class: 'fishing-bar' }, this.marker);
    this.actionBtn = h(
      'button',
      { class: 'primary-btn fish-action-btn', 'data-testid': 'fish-cast' },
      'Cast Line 🎣',
    );

    const closeBtn = h('button', { class: 'dialog-close', 'data-testid': 'fish-close' }, '✕');
    closeBtn.addEventListener('click', () => {
      this.stop();
      onClose();
    });

    this.root = h(
      'dialog',
      { class: 'panel dialog-fish', 'data-testid': 'fish-dialog' },
      h('div', { class: 'dialog-header' }, h('h2', {}, '🐟 Pond Fishing'), closeBtn),
      h(
        'p',
        { class: 'dialog-desc' },
        'Watch the ripples and tap when the fish is in the sweet spot!',
      ),
      bar,
      this.actionBtn,
    );

    this.actionBtn.addEventListener('click', () => this.handleAction());

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) {
        this.stop();
        onClose();
      }
    });
  }

  private handleAction(): void {
    if (this.state === 'ready') {
      this.state = 'reeling';
      this.actionBtn.textContent = 'Catch! 🎯';
      this.startBarAnimation();
    } else {
      this.stop();
      // Check if pos is inside target sweet spot (around 40% - 60%)
      if (this.pos >= 35 && this.pos <= 65) {
        this.store.dispatch(actions.fish());
        this.actionBtn.textContent = 'Fish Caught! 🎉';
      } else {
        this.actionBtn.textContent = 'Missed! Try again 💦';
      }
      this.state = 'ready';
      setTimeout(() => {
        if (this.isOpen) this.actionBtn.textContent = 'Cast Line 🎣';
      }, 1500);
    }
  }

  private startBarAnimation(): void {
    this.pos = 0;
    this.dir = 1;
    const animate = () => {
      this.pos += this.dir * 2.5;
      if (this.pos > 95) {
        this.pos = 95;
        this.dir = -1;
      } else if (this.pos < 0) {
        this.pos = 0;
        this.dir = 1;
      }
      this.marker.style.left = `${this.pos}%`;
      this.animTimer = requestAnimationFrame(animate);
    };
    this.animTimer = requestAnimationFrame(animate);
  }

  private stop(): void {
    if (this.animTimer) {
      cancelAnimationFrame(this.animTimer);
      this.animTimer = null;
    }
  }

  show(): void {
    this.state = 'ready';
    this.actionBtn.textContent = 'Cast Line 🎣';
    this.marker.style.left = '50%';
    const dlg = this.root as HTMLDialogElement;
    if (typeof dlg.showModal === 'function') dlg.showModal();
  }

  hide(): void {
    this.stop();
    const dlg = this.root as HTMLDialogElement;
    if (typeof dlg.close === 'function') dlg.close();
  }

  get isOpen(): boolean {
    return (this.root as HTMLDialogElement).open;
  }
}
