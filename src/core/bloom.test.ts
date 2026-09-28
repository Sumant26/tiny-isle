import { describe, expect, it } from 'vitest';
import { bloomLevel, bloomLevelName, bloomProgress } from './bloom';

describe('bloom', () => {
  it('maps points to levels', () => {
    expect(bloomLevel(0)).toBe(0);
    expect(bloomLevel(9)).toBe(0);
    expect(bloomLevel(10)).toBe(1);
    expect(bloomLevel(100)).toBe(5);
    expect(bloomLevel(1000)).toBe(5);
  });

  it('names levels and clamps out-of-range', () => {
    expect(bloomLevelName(0)).toBe('Quiet');
    expect(bloomLevelName(5)).toBe('Thriving');
    expect(bloomLevelName(99)).toBe('Thriving');
    expect(bloomLevelName(-3)).toBe('Quiet');
  });

  it('reports progress towards the next level', () => {
    expect(bloomProgress(0)).toBe(0);
    expect(bloomProgress(5)).toBe(0.5);
    expect(bloomProgress(10)).toBe(0);
    expect(bloomProgress(150)).toBe(1);
  });
});
