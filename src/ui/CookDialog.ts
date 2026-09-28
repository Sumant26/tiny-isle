import { FISH_IDS, MUSIC_TRACKS, MUSIC_TRACK_IDS, RECIPE_IDS, RECIPES } from '../core/config';
import type { CropId } from '../core/types';
import { actions } from '../state/actions';
import type { Store } from '../state/store';
import { h } from './dom';

type CottageTab = 'kitchen' | 'hearth' | 'bed' | 'jukebox' | 'books' | 'tidy' | 'tea';

export class CookDialog {
  readonly root: HTMLElement;
  private readonly bodyEl: HTMLElement;
  private currentTab: CottageTab = 'kitchen';
  private fireLit = false;

  constructor(
    private readonly store: Store,
    onClose: () => void,
    private readonly onSleep?: () => void,
  ) {
    this.bodyEl = h('div', { class: 'cottage-body' });

    const closeBtn = h('button', { class: 'dialog-close', 'data-testid': 'cook-close' }, '✕');
    closeBtn.addEventListener('click', onClose);

    const tabsNav = h(
      'nav',
      { class: 'cottage-tabs' },
      this.createTabBtn('kitchen', '🍳 Kitchen'),
      this.createTabBtn('bed', '🛏️ Bed'),
      this.createTabBtn('hearth', '🔥 Fireplace'),
      this.createTabBtn('tea', '🫖 Table & Tea'),
      this.createTabBtn('books', '📚 Bookshelf'),
      this.createTabBtn('tidy', '🧹 Tidy'),
      this.createTabBtn('jukebox', '🎵 Jukebox'),
    );

    this.root = h(
      'dialog',
      { class: 'panel dialog-cottage', 'data-testid': 'cook-dialog' },
      h('div', { class: 'dialog-header' }, h('h2', {}, '🏡 Cozy Cottage House'), closeBtn),
      tabsNav,
      this.bodyEl,
    );

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) onClose();
    });
  }

  private createTabBtn(tab: CottageTab, label: string): HTMLElement {
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
      this.renderCurrentTab();
    });
    return btn;
  }

  private renderCurrentTab(): void {
    this.bodyEl.innerHTML = '';
    switch (this.currentTab) {
      case 'kitchen':
        this.renderKitchen();
        break;
      case 'hearth':
        this.renderHearth();
        break;
      case 'bed':
        this.renderBed();
        break;
      case 'jukebox':
        this.renderJukebox();
        break;
      case 'books':
        this.renderBooks();
        break;
      case 'tidy':
        this.renderTidy();
        break;
      case 'tea':
        this.renderTea();
        break;
    }
  }

  private renderKitchen(): void {
    const s = this.store.getState();
    const list = h('div', { class: 'recipe-list' });

    // Section 1: Cook new dishes
    RECIPE_IDS.forEach((id) => {
      const recipe = RECIPES[id];
      let canCook = true;
      const ingTexts: string[] = [];

      for (const [crop, needed] of Object.entries(recipe.ingredients) as [CropId, number][]) {
        const have = s.inventory.produce[crop];
        if (have < needed) canCook = false;
        ingTexts.push(`${have}/${needed} ${crop}`);
      }

      const cookBtn = h(
        'button',
        {
          class: 'primary-btn cook-btn',
          disabled: !canCook,
          'data-testid': `cook-${recipe.id}`,
        },
        canCook ? 'Cook 🍲' : 'Need ingredients',
      );

      cookBtn.addEventListener('click', () => {
        this.store.dispatch(actions.cook(recipe.id));
        this.renderCurrentTab();
      });

      const card = h(
        'div',
        { class: 'recipe-card' },
        h(
          'div',
          { class: 'recipe-info' },
          h('strong', {}, recipe.name),
          h('p', { class: 'recipe-desc' }, recipe.description),
          h('small', { class: 'ingredients' }, `Ingredients: ${ingTexts.join(', ')}`),
        ),
        cookBtn,
      );

      list.appendChild(card);
    });

    // Section 2: Eat Prepared Dishes & Fish
    const eatList = h('div', { class: 'eat-list' });

    RECIPE_IDS.forEach((id) => {
      const count = s.cookedInventory?.[id] ?? 0;
      if (count > 0) {
        const recipe = RECIPES[id];
        const eatBtn = h(
          'button',
          { class: 'primary-btn eat-btn', 'data-testid': `eat-${id}` },
          'Eat 🍴',
        );
        eatBtn.addEventListener('click', () => {
          this.store.dispatch(actions.eatMeal(id));
          this.renderCurrentTab();
        });
        eatList.appendChild(
          h(
            'div',
            { class: 'recipe-card' },
            h(
              'div',
              { class: 'recipe-info' },
              h('strong', {}, `${recipe.name} × ${count}`),
              h('p', { class: 'recipe-desc' }, 'Ready to eat for bloom & energy.'),
            ),
            eatBtn,
          ),
        );
      }
    });

    FISH_IDS.forEach((f) => {
      const count = s.fishInventory?.[f] ?? 0;
      if (count > 0) {
        const eatBtn = h(
          'button',
          { class: 'primary-btn eat-btn', 'data-testid': `eat-fish-${f}` },
          'Eat 🐟',
        );
        eatBtn.addEventListener('click', () => {
          this.store.dispatch(actions.eatFish(f));
          this.renderCurrentTab();
        });
        eatList.appendChild(
          h(
            'div',
            { class: 'recipe-card' },
            h(
              'div',
              { class: 'recipe-info' },
              h('strong', {}, `Fresh ${f.charAt(0).toUpperCase() + f.slice(1)} × ${count}`),
              h('p', { class: 'recipe-desc' }, 'Pond catch ready to enjoy (+2 Bloom).'),
            ),
            eatBtn,
          ),
        );
      }
    });

    if (!eatList.hasChildNodes()) {
      eatList.appendChild(
        h(
          'p',
          { class: 'empty' },
          'No prepared meals or fresh fish ready to eat. Cook a recipe above or catch fish from the pond!',
        ),
      );
    }

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h('h3', {}, '🍳 Cook Dishes'),
        h(
          'p',
          { class: 'dialog-desc' },
          'Turn fresh garden harvests into hearty, nourishing recipes.',
        ),
        list,
        h('h3', {}, '🍴 Dine & Eat Food'),
        eatList,
      ),
    );
  }

  private renderHearth(): void {
    const fireCard = h(
      'div',
      { class: `hearth-card ${this.fireLit ? 'burning' : ''}` },
      h('div', { class: 'hearth-flame' }, this.fireLit ? '🔥' : '🪵'),
      h('h3', {}, this.fireLit ? 'Warm Crackling Hearth' : 'Stone Fireplace'),
      h(
        'p',
        {},
        this.fireLit
          ? 'The hearth fire is glowing brightly, filling the cottage with soothing warmth and golden light.'
          : 'Stack fresh birch logs and kindle a comforting fire to warm up the room.',
      ),
      h(
        'div',
        { class: 'hearth-actions' },
        h(
          'button',
          { class: 'primary-btn hearth-btn', 'data-testid': 'kindle-fire' },
          this.fireLit ? 'Tender the Fire ✨' : 'Light Fireplace 🔥',
        ),
        h(
          'button',
          { class: 'primary-btn sit-btn', 'data-testid': 'sit-hearth' },
          'Sit by Fireplace 🪑',
        ),
      ),
    );

    fireCard.querySelector('[data-testid="kindle-fire"]')?.addEventListener('click', () => {
      this.fireLit = true;
      this.store.dispatch(actions.cottageActivity('kindle_fire'));
      this.renderCurrentTab();
    });

    fireCard.querySelector('[data-testid="sit-hearth"]')?.addEventListener('click', () => {
      this.store.dispatch(actions.cottageActivity('sit_hearth'));
      const btn = fireCard.querySelector<HTMLButtonElement>('[data-testid="sit-hearth"]');
      if (btn) btn.textContent = 'Sitting Cozy by Fireplace ☕';
    });

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h('p', { class: 'dialog-desc' }, 'Relax by the stone hearth and watch glowing embers.'),
        fireCard,
      ),
    );
  }

  private renderBed(): void {
    const bedCard = h(
      'div',
      { class: 'bed-card' },
      h('div', { class: 'bed-icon' }, '🛏️'),
      h('h3', {}, 'Quilted Cottage Bed'),
      h(
        'p',
        {},
        'A soft feathered bed with handmade floral quilts. Rest here to end the day and wake up refreshed to a new morning.',
      ),
      h(
        'div',
        { class: 'bed-actions' },
        h(
          'button',
          { class: 'primary-btn sleep-bed-btn', 'data-testid': 'cottage-sleep' },
          'Rest & Sleep for the Night 🌙',
        ),
        h(
          'button',
          { class: 'primary-btn nap-btn', 'data-testid': 'cottage-nap' },
          'Afternoon Nap 😴 (+2 Bloom)',
        ),
      ),
    );

    bedCard.querySelector('[data-testid="cottage-sleep"]')?.addEventListener('click', () => {
      this.hide();
      this.onSleep?.();
    });

    bedCard.querySelector('[data-testid="cottage-nap"]')?.addEventListener('click', () => {
      this.store.dispatch(actions.cottageActivity('take_nap'));
      const btn = bedCard.querySelector<HTMLButtonElement>('[data-testid="cottage-nap"]');
      if (btn) btn.textContent = 'Woke up Refreshed from Nap! ✨';
    });

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h('p', { class: 'dialog-desc' }, 'Take a restful nap or sleep through the cozy night.'),
        bedCard,
      ),
    );
  }

  private renderJukebox(): void {
    const s = this.store.getState();
    const active = s.activeMusicTrack ?? 'morning_breeze';

    const tracksList = h('div', { class: 'jukebox-tracks' });
    MUSIC_TRACK_IDS.forEach((id) => {
      const def = MUSIC_TRACKS[id];
      const isCurrent = active === id;

      const trackBtn = h(
        'button',
        {
          class: `primary-btn track-btn ${isCurrent ? 'track-playing' : ''}`,
          'data-testid': `track-${id}`,
        },
        isCurrent ? '▶ Playing' : 'Select',
      );

      trackBtn.addEventListener('click', () => {
        this.store.dispatch(actions.setMusicTrack(id));
        this.renderCurrentTab();
      });

      const trackCard = h(
        'div',
        { class: `track-card ${isCurrent ? 'active-track' : ''}` },
        h(
          'div',
          { class: 'track-info' },
          h('span', { class: 'track-icon' }, def.icon),
          h(
            'div',
            { class: 'track-text' },
            h('strong', {}, def.title),
            h('small', {}, def.description),
          ),
        ),
        trackBtn,
      );
      tracksList.appendChild(trackCard);
    });

    const jukeboxCard = h(
      'div',
      { class: 'jukebox-card' },
      h(
        'div',
        { class: 'jukebox-header' },
        h('span', { class: 'jukebox-icon' }, '🎵'),
        h('h3', {}, 'Vintage Cottage Gramophone'),
      ),
      h('p', {}, 'Select relaxing procedural melodies to soundtrack your peaceful island days.'),
      tracksList,
    );

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h('p', { class: 'dialog-desc' }, 'Cottage vinyl soundscapes & cozy ambiance.'),
        jukeboxCard,
      ),
    );
  }

  private renderBooks(): void {
    const almanac = h(
      'div',
      { class: 'book-card' },
      h('div', { class: 'book-icon' }, '📖'),
      h('h3', {}, 'Island Chronicles & Almanac'),
      h(
        'div',
        { class: 'book-content' },
        h(
          'p',
          {},
          '🌱 Chapter 1: Water your crops daily to help them flourish across the seasons.',
        ),
        h(
          'p',
          {},
          '🌸 Chapter 2: Bloom grows from farming, cooking, fishing and helping island visitors.',
        ),
        h('p', {}, '🐟 Chapter 3: Mirror pond fish love calm, sunny ripples and gentle timing.'),
      ),
      h(
        'button',
        { class: 'primary-btn read-btn', 'data-testid': 'read-book' },
        'Read a Chapter 📚',
      ),
    );

    almanac.querySelector('button')?.addEventListener('click', () => {
      this.store.dispatch(actions.cottageActivity('read_book'));
      const btn = almanac.querySelector('button');
      if (btn) btn.textContent = 'Finished Reading 📖 (+3 Bloom)';
    });

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h(
          'p',
          { class: 'dialog-desc' },
          'Explore forgotten island tales and helpful farming lore.',
        ),
        almanac,
      ),
    );
  }

  private renderTidy(): void {
    const tidyCard = h(
      'div',
      { class: 'tidy-card' },
      h('div', { class: 'tidy-icon' }, '🧹'),
      h('h3', {}, 'Tidy & Clean the Cottage'),
      h(
        'p',
        {},
        'Sweep the wooden floorboards, polish the windowpanes, and place freshly picked wildflowers on the table.',
      ),
      h(
        'button',
        { class: 'primary-btn tidy-btn', 'data-testid': 'clean-cottage' },
        'Sweep & Polish Cottage ✨',
      ),
    );

    tidyCard.querySelector('button')?.addEventListener('click', () => {
      this.store.dispatch(actions.cottageActivity('clean_cottage'));
      const btn = tidyCard.querySelector('button');
      if (btn) btn.textContent = 'Cottage is Sparkling Clean! 🌸 (+4 Bloom)';
    });

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h('p', { class: 'dialog-desc' }, 'Keep your cottage welcoming and tidy.'),
        tidyCard,
      ),
    );
  }

  private renderTea(): void {
    const teaCard = h(
      'div',
      { class: 'tea-card' },
      h('div', { class: 'tea-icon' }, '🫖'),
      h('h3', {}, 'Rustic Table & Herbal Tea'),
      h(
        'p',
        {},
        'Sit at the carved oak table and brew a soothing pot of garden chamomile and mint tea.',
      ),
      h(
        'div',
        { class: 'tea-actions' },
        h(
          'button',
          { class: 'primary-btn tea-btn', 'data-testid': 'brew-tea' },
          'Brew Herbal Tea 🍵',
        ),
        h(
          'button',
          { class: 'primary-btn sit-table-btn', 'data-testid': 'sit-table' },
          'Sit at Table 🪑',
        ),
      ),
    );

    teaCard.querySelector('[data-testid="brew-tea"]')?.addEventListener('click', () => {
      this.store.dispatch(actions.cottageActivity('brew_tea'));
      const btn = teaCard.querySelector<HTMLButtonElement>('[data-testid="brew-tea"]');
      if (btn) btn.textContent = 'Enjoying Warm Chamomile Tea 🫖 (+2 Bloom)';
    });

    teaCard.querySelector('[data-testid="sit-table"]')?.addEventListener('click', () => {
      this.store.dispatch(actions.cottageActivity('sit_table'));
      const btn = teaCard.querySelector<HTMLButtonElement>('[data-testid="sit-table"]');
      if (btn) btn.textContent = 'Sitting at Oak Dining Table 🪑';
    });

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h('p', { class: 'dialog-desc' }, 'Unwind with a warm herbal brew by the window.'),
        teaCard,
      ),
    );
  }

  show(): void {
    this.renderCurrentTab();
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
