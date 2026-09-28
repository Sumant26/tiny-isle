import { vi } from 'vitest';

const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() });
const node = () => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn() });

/** Enough of the Web Audio API for the sound engine to run in Node. */
export const createFakeAudioContext = () => {
  const ctx = {
    state: 'running' as AudioContextState,
    currentTime: 0,
    sampleRate: 8000,
    destination: {},
    oscillators: 0,
    sources: 0,
    createGain: vi.fn(() => ({ ...node(), gain: param() })),
    createOscillator: vi.fn(() => {
      ctx.oscillators++;
      return { ...node(), type: 'sine', frequency: param() };
    }),
    createBufferSource: vi.fn(() => {
      ctx.sources++;
      return { ...node(), buffer: null };
    }),
    createBiquadFilter: vi.fn(() => ({ ...node(), type: 'lowpass', frequency: param() })),
    createBuffer: vi.fn((_c: number, length: number) => {
      const data = new Float32Array(length);
      return { getChannelData: () => data };
    }),
    resume: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  };
  return ctx;
};
