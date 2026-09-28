# 3D models (glTF)

Every model in Tiny Isle is built from simple shapes in code, so the game needs no asset files. You can replace any of them with a proper low-poly model, one at a time, without touching game code.

## How it works

1. Put `.glb` (or `.gltf`) files in `public/models/`.
2. List them in `public/models/manifest.json` against a **slot**.
3. Reload. Listed slots use your model; everything else keeps its procedural model. If a file fails to load, the game logs a warning and falls back automatically.

```json
{
  "prop/tree": { "file": "kenney/tree_oak.glb", "scale": 1.4, "rotationY": 30 },
  "crop/pumpkin/ripe": { "file": "quaternius/pumpkin.glb", "scale": 0.6, "offsetY": 0.05 },
  "visitor/hazel": { "file": "blender/hedgehog.glb" }
}
```

| Field       | Meaning                                                                   |
| ----------- | ------------------------------------------------------------------------- |
| `file`      | Path inside `public/models/`. Must be relative and end in `.glb`/`.gltf`. |
| `scale`     | Uniform scale. Models from different packs come in very different sizes.  |
| `rotationY` | Degrees around the vertical axis. Characters should face +Z.              |
| `offsetY`   | Lift or sink the model (world units; one tile = 1 unit).                  |

### Slots

| Slot                       | Notes                                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crop/<crop>/<stage>`      | crop: `carrot` `tomato` `strawberry` `sunflower` `pumpkin`; stage: `seed` `sprout` `growing` `ripe`. Sits on a 1×1 tile, about 0.1–1.2 units tall. |
| `decoration/<id>`          | `flowerbed` `bench` `birdbath` `windchime` `gnome`. About 1 tile wide.                                                                             |
| `visitor/<id>`             | `hazel` (hedgehog), `pip` (bluebird), `moss` (old traveller). About 0.5–1.6 units tall.                                                            |
| `prop/tree`, `prop/market` | The fruit tree (~3 units tall) and the market stand (~2×1 tiles).                                                                                  |
| `pet/cat`                  | The companion cat (~0.6 units long).                                                                                                               |

The farmer and cottage stay procedural for now: the farmer carries a watering can and the cottage window glows at dusk, which need named parts. See the roadmap.

## Where to get models

| Source                                                                   | License                          | Good for                    |
| ------------------------------------------------------------------------ | -------------------------------- | --------------------------- |
| [Kenney](https://kenney.nl/assets) (Nature Kit, Farm Kit, Furniture Kit) | CC0                              | Crops, trees, fences, props |
| [Quaternius](https://quaternius.com) (Ultimate Nature, Farm, Animals)    | CC0                              | Trees, crops, cute animals  |
| [Poly Pizza](https://poly.pizza)                                         | Mixed (check each: CC0 or CC-BY) | One-off props               |
| Your own in [Blender](https://www.blender.org)                           | Yours                            | Anything                    |

Always check the license of each model and record it in [CREDITS.md](../CREDITS.md). CC-BY models require attribution.

## Exporting from Blender

- **File → Export → glTF 2.0**, format **glTF Binary (.glb)**.
- Include: **Selected objects**; Transform: **+Y Up** (the default).
- Apply modifiers; apply scale (**Ctrl+A → Scale**) before exporting.
- Put the model's base at the origin, facing **+Z**.
- Keep it light: under ~5k triangles and one small texture (or vertex colours) per model.
- Flat, matte materials match the game's look: roughness 1, metallic 0.

## Performance

- The glTF loader is only downloaded when the manifest lists at least one model (~460 KB gzipped, cached by the service worker after first use).
- Each file loads once; repeated crops are instanced from the same data.
- Models under `public/models/` are cached for offline play on first use.
