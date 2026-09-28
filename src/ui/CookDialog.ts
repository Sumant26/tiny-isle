import { RECIPE_IDS, RECIPES } from '../core/config';
import type { CropId } from '../core/types';
import { actions } from '../state/actions';
import type { Store } from '../state/store';
import { h } from './dom';

export class CookDialog {
  readonly root: HTMLElement;
  private readonly list: HTMLElement;

  constructor(
    private readonly store: Store,
    onClose: () => void,
  ) {
    this.list = h('div', { class: 'recipe-list' });

    const closeBtn = h('button', { class: 'dialog-close', 'data-testid': 'cook-close' }, '✕');
    closeBtn.addEventListener('click', onClose);

    this.root = h(
      'dialog',
      { class: 'panel dialog-cook', 'data-testid': 'cook-dialog' },
      h('div', { class: 'dialog-header' }, h('h2', {}, '🍳 Cottage Kitchen'), closeBtn),
      h('p', { class: 'dialog-desc' }, 'Turn your fresh island harvest into heartwarming recipes.'),
      this.list,
    );

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) onClose();
    });
  }

  show(): void {
    const s = this.store.getState();
    this.list.innerHTML = '';

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
        this.show(); // refresh
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

      this.list.appendChild(card);
    });

    const dlg = this.root as HTMLDialogElement;
    if (typeof dlg.showModal === 'function') dlg.showModal();
  }

  hide(): void {
    const dlg = this.root as HTMLDialogElement;
    if (typeof dlg.close === 'function') dlg.close();
  }

  get isOpen(): boolean {
    return (this.root as HTMLDialogElement).open;
  }
}
