import { ACHIEVEMENTS, FISH, FISH_IDS, RECIPE_IDS, RECIPES } from '../core/config';
import type { Store } from '../state/store';
import { h } from './dom';

export class JournalDialog {
  readonly root: HTMLElement;
  private readonly logList: HTMLElement;
  private readonly achievementsList: HTMLElement;
  private readonly collectionList: HTMLElement;

  constructor(
    private readonly store: Store,
    onClose: () => void,
  ) {
    this.logList = h('div', { class: 'journal-entries' });
    this.achievementsList = h('div', { class: 'journal-achievements' });
    this.collectionList = h('div', { class: 'journal-collection' });

    const closeBtn = h('button', { class: 'dialog-close', 'data-testid': 'journal-close' }, '✕');
    closeBtn.addEventListener('click', onClose);

    this.root = h(
      'dialog',
      { class: 'panel dialog-journal', 'data-testid': 'journal' },
      h('div', { class: 'dialog-header' }, h('h2', {}, '📖 Island Journal'), closeBtn),
      h('h3', {}, 'Chronicles'),
      this.logList,
      h('h3', {}, '🏆 Achievements'),
      this.achievementsList,
      h('h3', {}, '🍲 Cookbook & 🎣 Fish Collection'),
      this.collectionList,
    );

    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) onClose();
    });
  }

  show(): void {
    const s = this.store.getState();
    this.logList.innerHTML = '';
    (s.journal ?? [])
      .slice(-8)
      .reverse()
      .forEach((entry) => {
        this.logList.appendChild(h('p', { class: 'journal-entry' }, `• ${entry}`));
      });

    this.achievementsList.innerHTML = '';
    const unlocked = new Set(s.achievements ?? []);
    ACHIEVEMENTS.forEach((a) => {
      const has = unlocked.has(a.id);
      this.achievementsList.appendChild(
        h(
          'div',
          { class: `achievement-badge ${has ? 'unlocked' : 'locked'}` },
          h('span', { class: 'badge-icon' }, has ? a.icon : '🔒'),
          h(
            'div',
            { class: 'badge-info' },
            h('strong', {}, a.title),
            h('small', {}, a.description),
          ),
        ),
      );
    });

    this.collectionList.innerHTML = '';
    const cooked = s.cookedInventory ?? {};
    RECIPE_IDS.forEach((id) => {
      const r = RECIPES[id];
      const count = cooked[id] ?? 0;
      this.collectionList.appendChild(h('span', { class: 'tag' }, `${r.name}: ${count}`));
    });
    const fish = s.fishInventory ?? {};
    FISH_IDS.forEach((id) => {
      const f = FISH[id];
      const count = fish[id] ?? 0;
      this.collectionList.appendChild(h('span', { class: 'tag' }, `${f.name}: ${count}`));
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
