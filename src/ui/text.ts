import { bloomLevelName } from '../core/bloom';
import { CROPS, DECORATIONS } from '../core/config';
import { visitorDef } from '../core/rules/visitors';
import type { CropId, GameEvent, RejectReason, ToolId } from '../core/types';

export const CROP_ICONS: Record<CropId, string> = {
  carrot: '🥕',
  tomato: '🍅',
  strawberry: '🍓',
  sunflower: '🌻',
  pumpkin: '🎃',
};

export const TOOL_INFO: Record<ToolId, { icon: string; label: string; key: string }> = {
  hoe: { icon: '⛏', label: 'Hoe', key: '1' },
  seeds: { icon: '🌱', label: 'Seeds', key: '2' },
  water: { icon: '💧', label: 'Watering can', key: '3' },
  basket: { icon: '🧺', label: 'Basket', key: '4' },
};

export const REJECT_MESSAGES: Record<RejectReason, string> = {
  'not-tilled': 'Till the soil first with the hoe.',
  'already-tilled': 'This soil is already tilled.',
  occupied: 'Something is already growing here.',
  'no-seeds': 'Out of seeds. Visit the market stand!',
  'no-crop': 'Nothing to harvest here yet.',
  'not-ripe': 'Not quite ripe. Give it another night.',
  'already-watered': 'Already watered today.',
  locked: "You haven't unlocked that crop yet.",
  'not-enough-coins': 'Not enough coins for that.',
  'not-enough-produce': "You don't have enough of that.",
  'not-enough-ingredients': 'Not enough ingredients to cook that.',
  'already-owned': 'You already have one of those.',
  'max-size': 'Garden is already at maximum size.',
  'no-visitor': 'Nobody is visiting right now.',
  blocked: "You can't walk there.",
  'out-of-bounds': 'That spot is outside the garden.',
};

export type Tone = 'info' | 'good' | 'gentle';

/** Friendly player-facing text for events. Returns null for events that need no toast. */
export const messageForEvent = (e: GameEvent): { text: string; tone: Tone } | null => {
  switch (e.type) {
    case 'harvested':
      return { text: `+1 ${CROPS[e.crop].name} ${CROP_ICONS[e.crop]}`, tone: 'good' };
    case 'sold':
      return {
        text: `Sold ${e.quantity} ${CROPS[e.crop].name} for ${e.coins} coins`,
        tone: 'good',
      };
    case 'bought-seeds':
      return { text: `Bought ${e.quantity} ${CROPS[e.crop].name} seeds`, tone: 'info' };
    case 'bought-decoration':
      return { text: `${DECORATIONS[e.decoration].name} placed on your island`, tone: 'good' };
    case 'plot-expanded':
      return { text: `Garden expanded! Now ${e.newHeight} rows.`, tone: 'good' };
    case 'cooked':
      return { text: `Cooked ${e.recipe.replace('_', ' ')}! 🍲`, tone: 'good' };
    case 'fish-caught':
      return { text: `Caught a ${e.fish}! 🎣`, tone: 'good' };
    case 'cottage-activity':
      return { text: 'Cozy cottage moment! ✨', tone: 'good' };
    case 'pet-cat':
      return { text: 'Purr... The cat feels loved! 🐱❤️', tone: 'good' };
    case 'achievement-unlocked':
      return { text: `🏆 Achievement: ${e.achievement}`, tone: 'good' };
    case 'day-started':
      return e.weather === 'rain'
        ? { text: `Soft rain today. Welcome to Day ${e.day}!`, tone: 'info' }
        : null;
    case 'visitor-arrived':
      return { text: `${visitorDef(e.visitor).name} has come to visit!`, tone: 'info' };
    case 'visitor-helped':
      return { text: visitorDef(e.visitor).thanks, tone: 'good' };
    case 'bloom-level-up':
      return { text: `Your island is ${bloomLevelName(e.level)}!`, tone: 'good' };
    case 'crop-unlocked':
      return {
        text: `New seeds available: ${CROPS[e.crop].name} ${CROP_ICONS[e.crop]}`,
        tone: 'good',
      };
    case 'rejected':
      return e.reason === 'blocked' ? null : { text: REJECT_MESSAGES[e.reason], tone: 'gentle' };
    case 'tilled':
    case 'planted':
    case 'watered':
    case 'moved':
    case 'journal-entry':
      return null;
  }
};
