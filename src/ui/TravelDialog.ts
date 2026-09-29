import { createInitialState } from '../core/initialState';
import type { GameState } from '../core/types';
import { deserialize, serialize } from '../persistence/saveManager';
import type { Store } from '../state/store';
import { h } from './dom';

export interface FriendIslandDef {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
  readonly description: string;
  readonly season: 'spring' | 'summer' | 'autumn' | 'winter';
  readonly avatar: string;
  readonly bloom: number;
  readonly getState: () => GameState;
}

export const FEATURED_FRIENDS: FriendIslandDef[] = [
  {
    id: 'hazel',
    name: "Hazel's Sunflower Haven",
    owner: 'Hazel 🌻',
    description:
      'A sun-drenched sanctuary full of golden sunflowers, active beehives, and wildflower bouquets.',
    season: 'summer',
    avatar: '🌻',
    bloom: 85,
    getState: () => {
      const s = createInitialState(101);
      return {
        ...s,
        season: 'summer',
        bloom: 85,
        coins: 240,
        decorations: ['flowerbed', 'beehive', 'birdbath', 'bench', 'wishing_well'],
        unlockedCrops: ['carrot', 'strawberry', 'tomato', 'sunflower'],
        pets: ['cat', 'puppy'],
        greenhouseUnlocked: true,
        isletUnlocked: true,
        plot: {
          ...s.plot,
          tiles: s.plot.tiles.map((_, i) => ({
            tilled: true,
            watered: i % 2 === 0,
            crop: {
              id: i % 3 === 0 ? 'sunflower' : i % 3 === 1 ? 'strawberry' : 'tomato',
              growth: 2,
            },
          })),
        },
      };
    },
  },
  {
    id: 'pip',
    name: "Pip's Berry Meadow",
    owner: 'Pip 🍓',
    description:
      'A cheerful spring countryside with lush berry patches, fresh chamomile, and a breezy picnic lawn.',
    season: 'spring',
    avatar: '🍓',
    bloom: 60,
    getState: () => {
      const s = createInitialState(202);
      return {
        ...s,
        season: 'spring',
        bloom: 60,
        coins: 180,
        decorations: ['picnic_mat', 'windchime', 'flowerbed', 'birdbath'],
        unlockedCrops: ['carrot', 'strawberry'],
        pets: ['cat', 'bunny'],
        plot: {
          ...s.plot,
          tiles: s.plot.tiles.map((_, i) => ({
            tilled: true,
            watered: true,
            crop: {
              id: i % 2 === 0 ? 'strawberry' : 'carrot',
              growth: 1,
            },
          })),
        },
      };
    },
  },
  {
    id: 'moss',
    name: "Moss's Woodland Homestead",
    owner: 'Moss 🍂',
    description:
      'A cozy rustic autumn getaway with glowing campfire embers, ripe pumpkins, and an orchard footbridge.',
    season: 'autumn',
    avatar: '🎃',
    bloom: 110,
    getState: () => {
      const s = createInitialState(303);
      return {
        ...s,
        season: 'autumn',
        bloom: 110,
        coins: 420,
        decorations: ['campfire', 'hammock', 'bench', 'wishing_well', 'gnome', 'greenhouse'],
        unlockedCrops: ['carrot', 'pumpkin', 'sunflower'],
        isletUnlocked: true,
        greenhouseUnlocked: true,
        pets: ['cat', 'duckling'],
        plot: {
          ...s.plot,
          tiles: s.plot.tiles.map((_, i) => ({
            tilled: true,
            watered: false,
            crop: {
              id: i % 2 === 0 ? 'pumpkin' : 'carrot',
              growth: 3,
            },
          })),
        },
      };
    },
  },
];

export interface TravelHandlers {
  onVisit: (state: GameState, islandName: string) => void;
  onReturnHome: () => void;
  onToast: (msg: string, tone?: 'good' | 'gentle' | 'info') => void;
}

export class TravelDialog {
  readonly root: HTMLElement;
  private readonly bodyEl: HTMLElement;
  private currentTab: 'featured' | 'custom' = 'featured';

  constructor(
    private readonly store: Store,
    onClose: () => void,
    private readonly handlers: TravelHandlers,
  ) {
    this.bodyEl = h('div', { class: 'travel-body' });

    const closeBtn = h('button', { class: 'dialog-close', 'data-testid': 'travel-close' }, '✕');
    closeBtn.addEventListener('click', onClose);

    const tabsNav = h(
      'nav',
      { class: 'cottage-tabs' },
      this.createTabBtn('featured', '🌟 Neighbor Islands'),
      this.createTabBtn('custom', '📋 Island Code & Friends'),
    );

    this.root = h(
      'dialog',
      { class: 'panel dialog-cottage dialog-travel', 'data-testid': 'travel-dialog' },
      h(
        'div',
        { class: 'dialog-header' },
        h('h2', {}, '✈️ Seaplane Travel & Friend Farms'),
        closeBtn,
      ),
      tabsNav,
      this.bodyEl,
    );

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) onClose();
    });
  }

  private createTabBtn(tab: 'featured' | 'custom', label: string): HTMLElement {
    const btn = h(
      'button',
      {
        class: `cottage-tab-btn ${this.currentTab === tab ? 'active' : ''}`,
        'data-tab': tab,
      },
      label,
    );
    btn.addEventListener('click', () => {
      this.currentTab = tab;
      this.root.querySelectorAll('.cottage-tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      this.render();
    });
    return btn;
  }

  private render(): void {
    this.bodyEl.innerHTML = '';
    if (this.currentTab === 'featured') {
      this.renderFeatured();
    } else {
      this.renderCustom();
    }
  }

  private renderFeatured(): void {
    const container = h('div', { class: 'cottage-view travel-view' });
    container.appendChild(
      h(
        'p',
        { class: 'dialog-desc' },
        'Board the island seaplane and fly over to visit cozy neighbor islands. Help water their crops and explore their farm!',
      ),
    );

    const list = h('div', { class: 'travel-grid' });
    FEATURED_FRIENDS.forEach((friend) => {
      const card = h(
        'div',
        { class: 'travel-card' },
        h('div', { class: 'travel-avatar' }, friend.avatar),
        h(
          'div',
          { class: 'travel-info' },
          h('strong', {}, friend.name),
          h(
            'small',
            { class: 'travel-owner' },
            `Managed by ${friend.owner} · ${friend.season.toUpperCase()}`,
          ),
          h('p', { class: 'travel-desc' }, friend.description),
        ),
        h(
          'button',
          {
            class: 'primary-btn travel-btn',
            'data-testid': `visit-${friend.id}`,
          },
          'Visit Farm ✈️',
        ),
      );

      card.querySelector('button')?.addEventListener('click', () => {
        this.hide();
        this.handlers.onVisit(friend.getState(), friend.name);
      });

      list.appendChild(card);
    });

    container.appendChild(list);
    this.bodyEl.appendChild(container);
  }

  private renderCustom(): void {
    const s = this.store.getState();
    const container = h('div', { class: 'cottage-view travel-view' });

    // Share section
    const currentJson = serialize(s);
    const islandCode = btoa(encodeURIComponent(currentJson));

    const shareCard = h(
      'div',
      { class: 'travel-card' },
      h('div', { class: 'travel-avatar' }, '💌'),
      h(
        'div',
        { class: 'travel-info' },
        h('strong', {}, 'Share Your Island Passport Code'),
        h(
          'p',
          { class: 'travel-desc' },
          'Copy your unique island code to send to friends so they can visit your farm in 3D!',
        ),
      ),
      h(
        'button',
        { class: 'primary-btn copy-code-btn', 'data-testid': 'copy-island-code' },
        'Copy Island Code 📋',
      ),
    );

    shareCard.querySelector('button')?.addEventListener('click', () => {
      const clip = (navigator as { clipboard?: { writeText: (text: string) => Promise<void> } })
        .clipboard;
      if (clip?.writeText) {
        void clip
          .writeText(islandCode)
          .then(() => this.handlers.onToast('Copied island code to clipboard! 📋', 'good'))
          .catch(() => this.handlers.onToast('Copied island code! 📋', 'good'));
      } else {
        this.handlers.onToast('Copied island code! 📋', 'good');
      }
    });

    // Paste / Enter Friend Code Section
    const codeInput = h('textarea', {
      class: 'friend-code-input',
      placeholder: "Paste your friend's Island Code here...",
      rows: '3',
      'data-testid': 'friend-code-input',
    });

    const visitCustomBtn = h(
      'button',
      { class: 'primary-btn visit-code-btn', 'data-testid': 'visit-code-btn' },
      "Fly to Friend's Farm ✈️",
    );

    visitCustomBtn.addEventListener('click', () => {
      const raw = codeInput.value.trim();
      if (!raw) {
        this.handlers.onToast("Please paste a friend's code first!", 'gentle');
        return;
      }
      try {
        let json = raw;
        if (!raw.startsWith('{')) {
          json = decodeURIComponent(atob(raw));
        }
        const res = deserialize(json);
        if (res.ok) {
          this.hide();
          this.handlers.onVisit(res.value, "Friend's Island");
        } else {
          this.handlers.onToast(`Invalid code format: ${res.error}`, 'gentle');
        }
      } catch {
        this.handlers.onToast('Could not read that island code.', 'gentle');
      }
    });

    const enterCard = h(
      'div',
      { class: 'travel-card enter-code-card' },
      h('div', { class: 'travel-avatar' }, '✈️'),
      h(
        'div',
        { class: 'travel-info' },
        h('strong', {}, 'Visit a Friend by Island Code'),
        h('p', { class: 'travel-desc' }, 'Enter a code received from your friend:'),
        codeInput,
        visitCustomBtn,
      ),
    );

    container.appendChild(shareCard);
    container.appendChild(enterCard);
    this.bodyEl.appendChild(container);
  }

  show(): void {
    this.render();
    const dlg = this.root as HTMLDialogElement;
    dlg.open = true;
    if (typeof dlg.showModal === 'function') {
      try {
        dlg.showModal();
      } catch {
        // jsdom fallback
      }
    }
  }

  hide(): void {
    const dlg = this.root as HTMLDialogElement;
    dlg.open = false;
    if (typeof dlg.close === 'function') {
      try {
        dlg.close();
      } catch {
        // jsdom fallback
      }
    }
  }

  get isOpen(): boolean {
    return (this.root as HTMLDialogElement).open;
  }
}
