import { RECIPE_IDS, RECIPES } from '../core/config';
import type { CropId } from '../core/types';
import { actions } from '../state/actions';
import type { Store } from '../state/store';
import { h } from './dom';

type CottageTab = 'kitchen' | 'hearth' | 'bed' | 'books' | 'tidy' | 'tea';

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
      this.createTabBtn('hearth', '🔥 Fireplace'),
      this.createTabBtn('bed', '🛏️ Bed'),
      this.createTabBtn('books', '📚 Books'),
      this.createTabBtn('tidy', '🧹 Tidy'),
      this.createTabBtn('tea', '🫖 Tea'),
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

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h(
          'p',
          { class: 'dialog-desc' },
          'Turn your fresh garden harvests into hearty, nourishing recipes.',
        ),
        list,
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
        'button',
        { class: 'primary-btn hearth-btn', 'data-testid': 'kindle-fire' },
        this.fireLit ? 'Tender the Fire ✨' : 'Light Fireplace 🔥',
      ),
    );

    fireCard.querySelector('button')?.addEventListener('click', () => {
      this.fireLit = true;
      this.store.dispatch(actions.cottageActivity('kindle_fire'));
      this.renderCurrentTab();
    });

    this.bodyEl.appendChild(
      h(
        'div',
        { class: 'cottage-view' },
        h(
          'p',
          { class: 'dialog-desc' },
          'The heart of your cottage: a stone fireplace for cozy evenings.',
        ),
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
        'button',
        { class: 'primary-btn sleep-bed-btn', 'data-testid': 'cottage-sleep' },
        'Rest & Sleep for the Night 🌙',
      ),
    );

    bedCard.querySelector('button')?.addEventListener('click', () => {
      this.hide();
      this.onSleep?.();
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
        'button',
        { class: 'primary-btn tea-btn', 'data-testid': 'brew-tea' },
        'Brew Herbal Tea 🍵',
      ),
    );

    teaCard.querySelector('button')?.addEventListener('click', () => {
      this.store.dispatch(actions.cottageActivity('brew_tea'));
      const btn = teaCard.querySelector('button');
      if (btn) btn.textContent = 'Enjoying Warm Chamomile Tea 🫖 (+2 Bloom)';
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
