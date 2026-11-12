# Adventure Battle — Assets

Runtime assets live in `public/assets/gamification/`:

```
public/assets/gamification/
├── hero/
│   ├── hero-idle.webp        (required)
│   ├── hero-attack.webp      (required)
│   ├── hero-hurt.webp        (required)
│   ├── hero-victory.webp     (required)
│   └── hero-exhausted.webp   (required — sheet pose labelled "Defeat")
├── monsters/
│   └── purple-dragon/
│       ├── idle.webp         (required)
│       ├── attack.webp       (required)
│       ├── hurt.webp         (required)
│       └── defeat.webp       (required)
├── effects/                  (optional — see below)
└── backgrounds/
    ├── fantasy-arena-day.webp    (used by BattleStage)
    └── fantasy-arena-night.webp  (optional alternative)
```

## Where the current assets came from

The current character images are **crops of the supplied concept sheets**
("Cute Chibi Quiz Battle Gamekit"), cut out with an edge-connected background
removal pass. They are good, consistent placeholders with the exact character
design from the concept art, but they are not hand-made production sprites:
edges can show slight fringing at very large sizes, and the hero attack pose
lost its yellow swirl and the dragon attack pose lost its fire breath during
background removal (both were bright-on-white).

## Replacing an asset

1. Export the pose as a **transparent PNG or WebP**, full body, front
   three-quarter view, same face / hair / costume / colours / proportions as
   the other poses.
2. Use a **square canvas (480×480 recommended)** with the same character scale
   in every pose, feet near the bottom edge.
3. Save it over the file with the **exact same filename** above — no code
   change is needed. Paths are centralised in `battle.config.ts`
   (`HERO_ASSETS` / `MONSTER_ASSETS` / `BATTLE_BACKGROUND`).
4. If an asset is missing or fails to load, the UI falls back to an emoji
   character (🦸‍♀️ / 🐉) and the quiz keeps working.

## Effects

Slash / sparkle / dust / damage numbers are currently rendered in **pure CSS**
(`DamageEffect.tsx` + the `battle-*` classes in `src/app/globals.css`), because
the concept-sheet effects were bright-on-white and did not survive background
removal cleanly. To use raster effects later, drop transparent files in as
`effects/impact.webp`, `effects/slash.webp`, `effects/sparkle.webp`,
`effects/dust.webp` and render them from `DamageEffect` — no gameplay code
needs to change.
