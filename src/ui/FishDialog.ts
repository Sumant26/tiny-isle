import { FISH } from '../core/config';
import type { FishId } from '../core/types';
import { actions } from '../state/actions';
import type { Store } from '../state/store';
import { h } from './dom';

const SWEET_SPOT_MIN = 20;
const SWEET_SPOT_MAX = 80;

export class FishDialog {
  readonly root: HTMLElement;
  private readonly marker: HTMLElement;
  private readonly sweetSpot: HTMLElement;
  private readonly actionBtn: HTMLElement;
  private readonly statusMsg: HTMLElement;
  private animTimer: number | null = null;
  private pos = 50;
  private dir = 1;
  private state: 'ready' | 'reeling' = 'ready';

  constructor(
    private readonly store: Store,
    onClose: () => void,
  ) {
    this.marker = h('div', { class: 'fishing-marker' }, '🐟');
    this.sweetSpot = h('div', { class: 'fishing-sweet-spot' }, h('span', {}, '🎯 Catch Zone'));
    const bar = h('div', { class: 'fishing-bar' }, this.sweetSpot, this.marker);
    const barContainer = h('div', { class: 'fishing-bar-container' }, bar);

    this.actionBtn = h(
      'button',
      { class: 'primary-btn fish-action-btn', 'data-testid': 'fish-cast' },
      'Cast Line 🎣',
    );

    this.statusMsg = h('p', { class: 'fishing-status' }, 'Tap Cast Line to start!');

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
        'A relaxing pond mini-game. Cast your line and tap when the fish is in the green zone!',
      ),
      barContainer,
      this.actionBtn,
      this.statusMsg,
    );

    this.actionBtn.addEventListener('click', () => this.handleAction());
    barContainer.addEventListener('click', () => this.handleAction());

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) {
        this.stop();
        onClose();
      }
    });

    this.root.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.handleAction();
      }
    });
  }

  private handleAction(): void {
    if (this.state === 'ready') {
      this.state = 'reeling';
      this.statusMsg.textContent = 'Wait for the fish to enter the green zone...';
      this.actionBtn.textContent = 'Reel In! 🎣';
      this.startBarAnimation();
    } else {
      this.stop();
      const inZone = this.pos >= SWEET_SPOT_MIN && this.pos <= SWEET_SPOT_MAX;
      if (inZone) {
        const prevFish = { ...(this.store.getState().fishInventory ?? {}) };
        this.store.dispatch(actions.fish());
        const nextFish = this.store.getState().fishInventory ?? {};

        // Find which fish was caught
        let caughtName = 'a fish';
        for (const [id, count] of Object.entries(nextFish) as [FishId, number][]) {
          if (count > (prevFish[id] ?? 0)) {
            caughtName = FISH[id].name;
            break;
          }
        }

        this.statusMsg.textContent = `🎉 Great catch! You reeled in a ${caughtName}!`;
        this.actionBtn.textContent = 'Caught! 🌟';
      } else {
        this.statusMsg.textContent = '💦 Missed! Give it another cast!';
        this.actionBtn.textContent = 'Try Again 🎣';
      }

      this.actionBtn.classList.remove('ready-to-catch');
      this.sweetSpot.classList.remove('active');
      this.marker.classList.remove('in-zone');
      this.state = 'ready';

      setTimeout(() => {
        if (this.isOpen && this.state === 'ready') {
          this.actionBtn.textContent = 'Cast Line 🎣';
        }
      }, 1800);
    }
  }

  private startBarAnimation(): void {
    this.pos = 10;
    this.dir = 1;
    const animate = () => {
      // Gentle, calm speed
      this.pos += this.dir * 0.9;
      if (this.pos > 92) {
        this.pos = 92;
        this.dir = -1;
      } else if (this.pos < 8) {
        this.pos = 8;
        this.dir = 1;
      }

      const inZone = this.pos >= SWEET_SPOT_MIN && this.pos <= SWEET_SPOT_MAX;
      if (inZone) {
        this.sweetSpot.classList.add('active');
        this.marker.classList.add('in-zone');
        this.actionBtn.classList.add('ready-to-catch');
        this.actionBtn.textContent = 'CATCH NOW! 🎯';
      } else {
        this.sweetSpot.classList.remove('active');
        this.marker.classList.remove('in-zone');
        this.actionBtn.classList.remove('ready-to-catch');
        this.actionBtn.textContent = 'Reel In! 🎣';
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
    this.actionBtn.classList.remove('ready-to-catch');
    this.statusMsg.textContent = 'Tap Cast Line (or press Space) to start!';
    this.pos = 50;
    this.marker.style.left = '50%';
    this.sweetSpot.classList.remove('active');
    this.marker.classList.remove('in-zone');
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
