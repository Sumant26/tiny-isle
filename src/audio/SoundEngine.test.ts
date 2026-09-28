import { describe, expect, it } from 'vitest';
import { createFakeAudioContext } from '../test/fakeAudio';
import { createSoundEngine } from './SoundEngine';

const setup = (opts: { muted?: boolean } = {}) => {
  const fake = createFakeAudioContext();
  const engine = createSoundEngine({
    createContext: () => fake as unknown as AudioContext,
    ...opts,
  });
  return { fake, engine };
};

describe('createSoundEngine', () => {
  it('stays silent until unlocked by a user gesture', () => {
    const { fake, engine } = setup();
    engine.play('coin');
    expect(fake.oscillators).toBe(0);
    expect(engine.ready).toBe(false);
    engine.unlock();
    expect(engine.ready).toBe(true);
    engine.play('coin');
    expect(fake.oscillators).toBe(2);
  });

  it('plays noise-based sounds', () => {
    const { fake, engine } = setup();
    engine.unlock();
    engine.play('water');
    engine.play('till');
    expect(fake.sources).toBe(2);
    expect(fake.createBuffer).toHaveBeenCalledTimes(1); // buffer is cached
  });

  it('respects mute and volume', () => {
    const { fake, engine } = setup({ muted: true });
    engine.unlock();
    engine.play('coin');
    expect(fake.oscillators).toBe(0);
    engine.setMuted(false);
    engine.setVolume(3);
    const master = fake.createGain.mock.results[0]!.value as { gain: { value: number } };
    expect(master.gain.value).toBe(1);
    engine.setVolume(-1);
    expect(master.gain.value).toBe(0);
  });

  it('resumes a suspended context on later unlocks', () => {
    const { fake, engine } = setup();
    engine.unlock();
    fake.state = 'suspended';
    engine.unlock();
    expect(fake.resume).toHaveBeenCalled();
    fake.state = 'running';
    engine.unlock();
    expect(fake.resume).toHaveBeenCalledTimes(1);
  });

  it('degrades silently when audio is unsupported', () => {
    const engine = createSoundEngine({
      createContext: () => {
        throw new Error('no audio');
      },
    });
    engine.unlock();
    expect(engine.ready).toBe(false);
    expect(() => engine.play('coin')).not.toThrow();
  });

  it('closes the context on dispose', () => {
    const { fake, engine } = setup();
    engine.unlock();
    engine.dispose();
    expect(fake.close).toHaveBeenCalled();
    expect(engine.ready).toBe(false);
  });

  it('can be created with defaults', () => {
    expect(createSoundEngine().ready).toBe(false);
  });
});
