import { h } from './dom';

export class PhotoMode {
  readonly root: HTMLElement;
  private active = false;

  constructor(
    private readonly uiRoot: HTMLElement,
    private readonly canvas: HTMLCanvasElement | null,
    private readonly onToggle: (active: boolean) => void,
  ) {
    const snapBtn = h(
      'button',
      { class: 'primary-btn photo-snap-btn', 'data-testid': 'photo-snap' },
      '📸 Take Picture',
    );
    const exitBtn = h(
      'button',
      { class: 'secondary-btn photo-exit-btn', 'data-testid': 'photo-exit' },
      '✕ Exit Photo Mode',
    );

    snapBtn.addEventListener('click', () => this.takeSnapshot());
    exitBtn.addEventListener('click', () => this.exit());

    this.root = h('div', { class: 'photo-mode-bar' }, snapBtn, exitBtn);
    this.root.style.display = 'none';
  }

  enter(): void {
    this.active = true;
    this.uiRoot.classList.add('photo-mode-active');
    this.root.style.display = 'flex';
    this.onToggle(true);
  }

  exit(): void {
    this.active = false;
    this.uiRoot.classList.remove('photo-mode-active');
    this.root.style.display = 'none';
    this.onToggle(false);
  }

  get isActive(): boolean {
    return this.active;
  }

  private takeSnapshot(): void {
    if (!this.canvas) return;
    try {
      const dataUrl = this.canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `tiny-isle-photo-${Date.now()}.png`;
      a.click();
    } catch {
      console.warn('Unable to export canvas snapshot');
    }
  }
}
