import { BALANCE, BLOOM_LEVEL_NAMES } from './config';

export const bloomLevel = (points: number): number => {
  let level = 0;
  BALANCE.bloomLevels.forEach((threshold, i) => {
    if (points >= threshold) level = i;
  });
  return level;
};

export const bloomLevelName = (level: number): string =>
  BLOOM_LEVEL_NAMES[Math.max(0, Math.min(level, BLOOM_LEVEL_NAMES.length - 1))] ?? 'Quiet';

/** Progress 0..1 towards the next level (1 at max level). */
export const bloomProgress = (points: number): number => {
  const level = bloomLevel(points);
  const current = BALANCE.bloomLevels[level] ?? 0;
  const next = BALANCE.bloomLevels[level + 1];
  if (next === undefined) return 1;
  return (points - current) / (next - current);
};
