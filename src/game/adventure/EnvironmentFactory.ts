import * as Phaser from "phaser";

/**
 * EnvironmentFactory — builds the Enchanted Forest world visuals for
 * AdventureScene (Sprint B): parallax layers, tree variants, ground and
 * platform artwork, decorations and light ambient animation.
 *
 * All placement is deterministic (seeded RNG) so the world looks the same
 * on every run and on server/client. If the sprite files fail to load, the
 * factory falls back to the legacy Graphics-drawn scenery, so the game
 * never ends up without a world.
 *
 * Performance budget (Mi Pad 5 target, see STYLE-GUIDE §6): a small,
 * fixed number of ambient tweens; every tween belongs to the scene and is
 * cleaned up automatically when the scene shuts down.
 */

export const ENVIRONMENT_ASSETS: ReadonlyArray<{ key: string; path: string }> = [
  "hills-far",
  "forest-back",
  "forest-mid",
  "tree-tall",
  "tree-round",
  "tree-roots",
  "tree-young",
  "tree-face",
  "tree-mushroom",
  "ground-tile",
  "platform-wood",
  "platform-stone",
  "decor-bush",
  "decor-flowers",
  "decor-mushroom-glow",
  "decor-rock",
  "decor-grass-tuft",
  "decor-butterfly",
].map((key) => ({ key, path: `/assets/adventure/environment/${key}.webp` }));

const TREE_KEYS = [
  "tree-tall",
  "tree-round",
  "tree-roots",
  "tree-face",
  "tree-mushroom",
  "tree-young",
] as const;

/** Target on-screen height range per tree variant. */
const TREE_HEIGHTS: Record<(typeof TREE_KEYS)[number], [number, number]> = {
  "tree-tall": [320, 390],
  "tree-round": [260, 320],
  "tree-roots": [270, 330],
  "tree-face": [280, 340],
  "tree-mushroom": [280, 340],
  "tree-young": [120, 170],
};

const GROUND_DECOR_KEYS = [
  "decor-bush",
  "decor-flowers",
  "decor-mushroom-glow",
  "decor-rock",
  "decor-grass-tuft",
] as const;

export interface GroundSegment {
  x: number;
  width: number;
}

export interface EnvironmentLayout {
  worldWidth: number;
  worldHeight: number;
  /** Top surface Y of the main ground (where trees/decor stand). */
  groundTopY: number;
  groundSegments: GroundSegment[];
  /** X positions that decorations must keep clear of (monsters, hazards, pickups, spawn). */
  avoidX: Array<{ x: number; radius: number }>;
}

/** Small deterministic RNG (mulberry32) — stable world layout per seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class EnvironmentFactory {
  private readonly rng = mulberry32(20261113);

  constructor(private readonly scene: Phaser.Scene) {}

  /** True when the Sprint B sprite set is available; otherwise callers and
   *  this factory use the legacy Graphics fallback. */
  get spritesReady(): boolean {
    return (
      this.scene.textures.exists("hills-far") &&
      this.scene.textures.exists("ground-tile") &&
      this.scene.textures.exists("tree-tall")
    );
  }

  get platformSpritesReady(): boolean {
    return (
      this.scene.textures.exists("platform-wood") &&
      this.scene.textures.exists("platform-stone")
    );
  }

  /* ---------------------------------------------------------------- */
  /* Backdrop: sky, parallax layers, clouds                            */
  /* ---------------------------------------------------------------- */

  createBackdrop(layout: EnvironmentLayout): void {
    const { worldWidth, worldHeight } = layout;
    this.createSky(worldWidth, worldHeight);

    if (!this.spritesReady) {
      this.createLegacyBackdrop(worldWidth);
      return;
    }

    // The strip bottoms deliberately tuck 20-30px BELOW the ground top
    // (556): the ground tiles (depth 2) draw over the strips (negative
    // depths), so no pale sky slot shows through at the ground line — a
    // bright horizontal gap there visually severed every standing object
    // (hero, trees, rocks) from the ground and made them look floaty.
    // Distant hills (parallax 0.2) — pale mountain strip.
    this.placeParallaxStrip("hills-far", {
      scrollFactor: 0.2,
      bottomY: 578,
      displayHeight: 175,
      depth: -14,
      worldWidth,
    });
    // Far forest (parallax 0.45) — small tree line.
    this.placeParallaxStrip("forest-back", {
      scrollFactor: 0.45,
      bottomY: 582,
      displayHeight: 92,
      depth: -12,
      worldWidth,
    });
    // Mid forest (parallax 0.65) — medium tree line.
    this.placeParallaxStrip("forest-mid", {
      scrollFactor: 0.65,
      bottomY: 588,
      displayHeight: 215,
      depth: -11,
      worldWidth,
    });

    this.createClouds(worldWidth);
  }

  private createSky(worldWidth: number, worldHeight: number): void {
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(0x38bdf8, 0x38bdf8, 0xd9f99d, 0xd9f99d, 1);
    sky.fillRect(0, 0, worldWidth, worldHeight);
    sky.setScrollFactor(0);
    sky.setDepth(-20);
  }

  /** Repeats a transparent strip image across the span a parallax layer
   *  needs: worldWidth * factor + one viewport, starting off-screen left. */
  private placeParallaxStrip(
    key: string,
    opts: {
      scrollFactor: number;
      bottomY: number;
      displayHeight: number;
      depth: number;
      worldWidth: number;
    },
  ): void {
    const frame = this.scene.textures.get(key).getSourceImage();
    const scale = opts.displayHeight / frame.height;
    const tileWidth = frame.width * scale;
    const span = opts.worldWidth * opts.scrollFactor + 1100;
    const count = Math.max(1, Math.ceil(span / tileWidth));

    for (let i = 0; i < count; i += 1) {
      const img = this.scene.add.image(i * tileWidth, opts.bottomY, key);
      img.setOrigin(0, 1);
      img.setDisplaySize(tileWidth, opts.displayHeight);
      img.setScrollFactor(opts.scrollFactor);
      img.setDepth(opts.depth);
      // Alternate mirroring hides the seam between repeats.
      if (i % 2 === 1) img.setFlipX(true);
    }
  }

  private createClouds(worldWidth: number): void {
    if (!this.scene.textures.exists("env-cloud")) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 0.92);
      g.fillCircle(45, 38, 24);
      g.fillCircle(78, 28, 32);
      g.fillCircle(112, 38, 25);
      g.fillRoundedRect(40, 34, 100, 30, 15);
      g.generateTexture("env-cloud", 160, 72);
      g.destroy();
    }

    const span = worldWidth * 0.12 + 1100;
    for (let i = 0; i < 7; i += 1) {
      const x = 60 + (span / 7) * i + this.rng() * 90;
      const y = 55 + this.rng() * 120;
      const cloud = this.scene.add.image(x, y, "env-cloud");
      cloud.setScale(0.7 + this.rng() * 0.9);
      cloud.setAlpha(0.75 + this.rng() * 0.25);
      cloud.setScrollFactor(0.12);
      cloud.setDepth(-6);
      this.scene.tweens.add({
        targets: cloud,
        x: x + 26 + this.rng() * 30,
        duration: 5200 + this.rng() * 3800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Ground visuals & platforms                                        */
  /* ---------------------------------------------------------------- */

  /** Grassy dirt surface for one ground segment (visual only — physics
   *  bodies stay exactly where AdventureScene has always put them). */
  createGroundVisual(segment: GroundSegment, groundTopY: number): void {
    if (!this.spritesReady) return;
    const tile = this.scene.add.tileSprite(
      segment.x + segment.width / 2,
      groundTopY + 42,
      segment.width,
      84,
      "ground-tile",
    );
    tile.setTileScale(0.5, 0.5);
    tile.setDepth(2);
  }

  /** Artwork for one floating platform, top aligned to the physics top. */
  createPlatformVisual(
    centerX: number,
    physicsTopY: number,
    width: number,
    kind: "wood" | "stone",
  ): void {
    if (!this.platformSpritesReady) return;
    // A soft shadow on the ground far below sells the platform's height as
    // deliberate instead of a block pasted onto the sky.
    this.addShadow(centerX, this.groundTopY + 5, width * 0.92, 0.38);
    const img = this.scene.add.image(
      centerX,
      physicsTopY - 2,
      kind === "wood" ? "platform-wood" : "platform-stone",
    );
    img.setOrigin(0.5, 0);
    img.setDisplaySize(width + 14, 62);
    img.setDepth(2);
  }

  /* ---------------------------------------------------------------- */
  /* Grounding shadows                                                 */
  /* ---------------------------------------------------------------- */

  /** Mirrors AdventureScene's ground physics top; platform shadows need
   *  it and createPlatformVisual receives no layout. */
  private get groundTopY(): number {
    return 556;
  }

  /** Soft elliptical contact shadow (radial-gradient canvas texture,
   *  generated once). Anchors heroes, monsters and floating platforms to
   *  the surface beneath them. */
  addShadow(
    x: number,
    y: number,
    width: number,
    alpha = 0.5,
  ): Phaser.GameObjects.Image {
    if (!this.scene.textures.exists("shadow-blob")) {
      const canvasTexture = this.scene.textures.createCanvas("shadow-blob", 128, 32);
      if (canvasTexture) {
        const ctx = canvasTexture.getContext();
        const gradient = ctx.createRadialGradient(64, 16, 2, 64, 16, 62);
        gradient.addColorStop(0, "rgba(23, 43, 28, 0.55)");
        gradient.addColorStop(0.7, "rgba(23, 43, 28, 0.26)");
        gradient.addColorStop(1, "rgba(23, 43, 28, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 32);
        canvasTexture.refresh();
      }
    }
    return this.scene.add
      .image(x, y, "shadow-blob")
      .setDisplaySize(width, width * 0.22)
      .setDepth(3)
      .setAlpha(alpha);
  }

  /* ---------------------------------------------------------------- */
  /* Trees & decorations                                               */
  /* ---------------------------------------------------------------- */

  decorateWorld(layout: EnvironmentLayout): void {
    if (!this.spritesReady) return;
    this.placeTrees(layout);
    this.placeGroundDecor(layout);
    this.placeForegroundTufts(layout);
  }

  private isClear(layout: EnvironmentLayout, x: number, extra = 0): boolean {
    return layout.avoidX.every(({ x: ax, radius }) => Math.abs(x - ax) > radius + extra);
  }

  private placeTrees(layout: EnvironmentLayout): void {
    for (const segment of layout.groundSegments) {
      let x = segment.x + 70 + this.rng() * 60;
      const end = segment.x + segment.width - 60;
      while (x < end) {
        if (this.isClear(layout, x, 30)) {
          const key = TREE_KEYS[Math.floor(this.rng() * TREE_KEYS.length)];
          const [minH, maxH] = TREE_HEIGHTS[key];
          const height = minH + this.rng() * (maxH - minH);
          const frame = this.scene.textures.get(key).getSourceImage();
          // Base sunk 16px into the grass band (ground tiles at depth 2
          // draw over the tree's depth 1) so roots/trunks grow out of the
          // ground instead of ending on top of it.
          const tree = this.scene.add.image(x, layout.groundTopY + 16, key);
          tree.setOrigin(0.5, 1);
          tree.setDisplaySize((frame.width / frame.height) * height, height);
          tree.setDepth(1);
          if (this.rng() > 0.5) tree.setFlipX(true);
        }
        x += 165 + this.rng() * 130;
      }
    }
  }

  private placeGroundDecor(layout: EnvironmentLayout): void {
    for (const segment of layout.groundSegments) {
      let x = segment.x + 45 + this.rng() * 70;
      const end = segment.x + segment.width - 40;
      while (x < end) {
        if (this.isClear(layout, x, 6)) {
          const key = GROUND_DECOR_KEYS[Math.floor(this.rng() * GROUND_DECOR_KEYS.length)];
          const height =
            key === "decor-bush" ? 40 + this.rng() * 14 : 26 + this.rng() * 16;
          const frame = this.scene.textures.get(key).getSourceImage();
          // Seated 12px into the grass band so rocks/mushrooms rest IN
          // the ground surface rather than floating on its top edge.
          const item = this.scene.add.image(x, layout.groundTopY + 12, key);
          item.setOrigin(0.5, 1);
          item.setDisplaySize((frame.width / frame.height) * height, height);
          item.setDepth(3);
          if (key === "decor-grass-tuft" || key === "decor-flowers") {
            item.setOrigin(0.5, 1);
            this.scene.tweens.add({
              targets: item,
              angle: { from: -3.5, to: 3.5 },
              duration: 1300 + this.rng() * 900,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
          if (key === "decor-mushroom-glow") {
            this.scene.tweens.add({
              targets: item,
              alpha: { from: 0.75, to: 1 },
              duration: 1100 + this.rng() * 700,
              yoyo: true,
              repeat: -1,
              ease: "Sine.easeInOut",
            });
          }
        }
        x += 120 + this.rng() * 110;
      }
    }
  }

  /** A few grass tufts in front of the player plane for depth. */
  private placeForegroundTufts(layout: EnvironmentLayout): void {
    if (!this.scene.textures.exists("decor-grass-tuft")) return;
    for (const segment of layout.groundSegments) {
      const count = 2;
      for (let i = 0; i < count; i += 1) {
        const x = segment.x + 90 + this.rng() * (segment.width - 180);
        if (!this.isClear(layout, x, 0)) continue;
        const tuft = this.scene.add.image(x, layout.groundTopY + 14, "decor-grass-tuft");
        tuft.setOrigin(0.5, 1);
        tuft.setDisplaySize(52, 62);
        tuft.setDepth(11);
        tuft.setAlpha(0.95);
      }
    }
  }

  /** Small grass tuft on top of some floating platforms. */
  decoratePlatformTop(centerX: number, physicsTopY: number, width: number): void {
    if (!this.spritesReady) return;
    if (this.rng() > 0.55) return;
    const tuft = this.scene.add.image(
      centerX - width / 2 + 22 + this.rng() * (width - 44),
      physicsTopY - 1,
      "decor-grass-tuft",
    );
    tuft.setOrigin(0.5, 1);
    tuft.setDisplaySize(24, 29);
    tuft.setDepth(3);
  }

  /* ---------------------------------------------------------------- */
  /* Ambient life: fireflies, butterflies, drifting leaves             */
  /* ---------------------------------------------------------------- */

  createAmbientLife(layout: EnvironmentLayout): void {
    this.createFireflies(layout);
    this.createButterflies(layout);
    this.createDriftingLeaves(layout);
  }

  private createFireflies(layout: EnvironmentLayout): void {
    for (let i = 0; i < 14; i += 1) {
      const x = 120 + i * ((layout.worldWidth - 200) / 14) + this.rng() * 40;
      const y = 300 + this.rng() * 170;
      const firefly = this.scene.add.circle(x, y, 3, 0xfef08a, 0.85);
      firefly.setDepth(4);
      this.scene.tweens.add({
        targets: firefly,
        y: y - 22 - (i % 3) * 8,
        alpha: 0.2,
        duration: 1400 + (i % 4) * 350,
        yoyo: true,
        repeat: -1,
        delay: i * 90,
        ease: "Sine.easeInOut",
      });
    }
  }

  private createButterflies(layout: EnvironmentLayout): void {
    if (!this.scene.textures.exists("decor-butterfly")) return;
    const spots = [420, 1330, 2050].filter((x) => x < layout.worldWidth - 140);
    spots.forEach((baseX, i) => {
      const butterfly = this.scene.add.image(baseX, 350 + i * 36, "decor-butterfly");
      butterfly.setDisplaySize(46, 41);
      butterfly.setDepth(6);
      this.scene.tweens.add({
        targets: butterfly,
        x: baseX + 90 + i * 25,
        duration: 3400 + i * 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        onYoyo: () => butterfly.setFlipX(true),
        onRepeat: () => butterfly.setFlipX(false),
      });
      this.scene.tweens.add({
        targets: butterfly,
        y: butterfly.y - 42,
        duration: 1250 + i * 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private createDriftingLeaves(layout: EnvironmentLayout): void {
    if (!this.scene.textures.exists("env-leaf")) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x65a30d, 1);
      g.fillEllipse(8, 5, 16, 10);
      g.generateTexture("env-leaf", 16, 10);
      g.destroy();
    }
    for (let i = 0; i < 6; i += 1) {
      const startX = 200 + ((layout.worldWidth - 400) / 6) * i + this.rng() * 120;
      const leaf = this.scene.add.image(startX, 120 + this.rng() * 120, "env-leaf");
      leaf.setDepth(5);
      leaf.setAlpha(0.85);
      this.scene.tweens.add({
        targets: leaf,
        y: 520,
        x: startX + 60 + this.rng() * 60,
        angle: 320,
        duration: 9000 + i * 1600,
        repeat: -1,
        delay: i * 1400,
        ease: "Sine.easeInOut",
      });
    }
  }

  /* ---------------------------------------------------------------- */
  /* Legacy fallback (pre-Sprint B Graphics scenery)                   */
  /* ---------------------------------------------------------------- */

  private createLegacyBackdrop(worldWidth: number): void {
    const distantHills = this.scene.add.graphics();
    for (let x = 0; x < worldWidth + 400; x += 420) {
      distantHills.fillStyle(0x86b96a, 1);
      distantHills.fillEllipse(x + 160, 470, 460, 190);
      distantHills.fillStyle(0x6b9e62, 1);
      distantHills.fillEllipse(x + 350, 500, 480, 170);
    }
    distantHills.setScrollFactor(0.2);
    distantHills.setDepth(-10);

    const clouds = this.scene.add.graphics();
    for (let x = 0; x < worldWidth + 500; x += 520) {
      clouds.fillStyle(0xffffff, 0.78);
      clouds.fillCircle(x + 60, 110, 22);
      clouds.fillCircle(x + 90, 95, 30);
      clouds.fillCircle(x + 125, 110, 23);
      clouds.fillRoundedRect(x + 55, 105, 95, 30, 15);
    }
    clouds.setScrollFactor(0.12);
    clouds.setDepth(-5);

    const trees = this.scene.add.graphics();
    for (let x = 50; x < worldWidth + 200; x += 260) {
      trees.fillStyle(0x76502e, 1);
      trees.fillRect(x + 24, 390, 22, 180);
      trees.fillStyle(0x27734a, 1);
      trees.fillCircle(x + 35, 365, 64);
      trees.fillStyle(0x3f9658, 1);
      trees.fillCircle(x + 5, 390, 42);
      trees.fillCircle(x + 68, 390, 42);
      trees.fillStyle(0x65a30d, 0.9);
      trees.fillCircle(x + 30, 345, 24);
    }
    trees.setScrollFactor(0.72);
    trees.setDepth(1);

    const ground = this.scene.add.graphics();
    ground.fillStyle(0x4d7c0f, 1);
    ground.fillRect(0, 598, worldWidth, 42);
    ground.fillStyle(0x65a30d, 1);
    for (let x = 0; x < worldWidth; x += 45) {
      ground.fillTriangle(x, 602, x + 12, 590, x + 20, 602);
    }
    ground.setDepth(2);
  }
}
