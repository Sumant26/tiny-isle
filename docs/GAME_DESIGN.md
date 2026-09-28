# Game design

**Pillars:** calm, always-forward progress, small delights. Nothing is ever lost and there is no failure state.

## Core loop (one in-game day, ~3–5 minutes)

1. Wake up and see what grew.
2. Tend: till, plant, water, harvest.
3. Sell at the market or gift to visitors.
4. Decorate.
5. Sleep. Dusk falls, fireflies come out, and a new morning starts.

## Crops

| Crop       | Days | Seed | Sells | Bloom | Unlocked by                           |
| ---------- | ---- | ---- | ----- | ----- | ------------------------------------- |
| Carrot     | 2    | 2    | 5     | 1     | Start                                 |
| Tomato     | 3    | 4    | 6     | 1     | Bloom level 1 (regrows after harvest) |
| Strawberry | 3    | 5    | 11    | 2     | Helping Hazel                         |
| Sunflower  | 4    | 6    | 14    | 4     | Bloom level 2                         |
| Pumpkin    | 6    | 10   | 32    | 5     | Helping Old Moss                      |

All numbers live in `src/core/config.ts`.

## Systems

- **Growth:** a crop grows one day per night if its soil was watered. Soil dries overnight.
- **Weather:** 20% chance of rain each morning, which waters all tilled soil.
- **Visitors:** from day 2, a 60% chance each morning that the next visitor arrives (one at a time, in order, only if you can grow what they want).
- **Bloom:** points from harvests, decorations and visitors. Levels: Quiet, Sprouting, Buzzing, Blooming, Flourishing, Thriving. Each level adds butterflies; some unlock crops.
- **Economy:** start with 20 coins and 6 carrot seeds; decorations cost 20–60.

## Tone

Gentle messages ("Not quite ripe. Give it another night."), soft pastel palette, rounded shapes, synthesized soft sounds, reduced-motion support.
