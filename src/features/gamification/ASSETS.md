# Adventure Battle — Assets

Runtime assets live in `public/assets/gamification/`:

```
public/assets/gamification/
├── hero/
│   ├── hero-idle.webp / hero-attack.webp / hero-hurt.webp / hero-victory.webp / hero-exhausted.webp   (Rara)
│   ├── bimo/  idle.webp attack.webp hurt.webp victory.webp exhausted.webp
│   └── tari/  idle.webp attack.webp hurt.webp victory.webp exhausted.webp
├── monsters/
│   ├── purple-dragon/  idle.webp attack.webp hurt.webp defeat.webp
│   ├── slime/          idle.webp attack.webp hurt.webp defeat.webp
│   └── fox/            idle.webp attack.webp hurt.webp defeat.webp
├── effects/                  (optional — effects are CSS, see below)
└── backgrounds/
    ├── fantasy-arena-day.webp     (Naga Ungu)
    ├── fantasy-forest-day.webp    (Slime Daun)
    ├── fantasy-field-day.webp     (Rubah Oranye)
    ├── fantasy-arena-night.webp   (spare / unused)
    └── fantasy-castle-dusk.webp   (spare / unused)
```

Characters, monsters and their arenas are registered in `battle.config.ts`
(`HEROES` / `MONSTERS`). Adding a character = add its pose files + one entry
in that file; the settings-screen pickers and the result summary pick it up
automatically.

## Provenance

- **Rara + Naga Ungu**: cropped from the owner's supplied concept sheets
  ("Cute Chibi Quiz Battle Gamekit") with edge-connected background removal.
- **Bimo, Tari, Slime Daun, Rubah Oranye**: production sheets generated in the
  same art style, then cut with the same pipeline. The full source sheets are
  kept in `docs/gamification-sheets/` so poses can be re-cropped later.
  Known quirk: the fox's attack pose lost most of its motion-blur tail during
  background removal.
- Backgrounds are crops of the concept sheets' background thumbnails
  (upscaled; they sit under a 40%-opacity overlay in the stage, so softness
  is not noticeable).

## Replacing an asset

1. Export the pose as a **transparent PNG or WebP**, full body, front
   three-quarter view, same face / outfit / colours / proportions as the
   other poses of that character.
2. Use a **square canvas (480×480 recommended)** with the same character scale
   in every pose, feet near the bottom edge.
3. Save it over the file with the **exact same filename** — no code change
   needed.
4. If an asset is missing or fails to load, the UI falls back to an emoji
   character and the quiz keeps working.

## Effects

Slash / fire projectiles, sparkles, combo badge, stage shake and damage
numbers are rendered in **pure CSS** (`BattleStage.tsx`, `DamageEffect.tsx`
and the `battle-*` classes in `src/app/globals.css`) — no raster effect files
are required at runtime.
