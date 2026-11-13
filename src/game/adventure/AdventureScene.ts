
import * as Phaser from "phaser";
import { getHeroById } from "@/features/gamification/battle.config";

type VirtualDirection = "left" | "right" | "jump";

export interface AdventureEncounter {
  id: string;
  name: string;
  kind: "normal" | "elite" | "boss";
  emoji: string;
}

const ENCOUNTERS: AdventureEncounter[] = [
  { id: "forest-slime", name: "Slime Hutan", kind: "normal", emoji: "🌱" },
  { id: "forest-fox", name: "Rubah Penjaga", kind: "elite", emoji: "🦊" },
  { id: "forest-guardian", name: "Penjaga Hutan", kind: "boss", emoji: "🐻" },
];

export default class AdventureScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<VirtualDirection, Phaser.Input.Keyboard.Key>;

  private encounterCount: number;
  private heroId: string;
  private heroIdleTexture = "hero-idle-1";
  private heroMoveTexture = "hero-walk-1";
  private heroHurtTexture = "hero-idle-1";
  private heroVictoryTexture = "hero-idle-1";
  private heroExhaustedTexture = "hero-idle-1";
  private heroPoseTimer: Phaser.Time.TimerEvent | null = null;
  private isAdventureStopped = false;
  private encounterSprites: Phaser.Physics.Arcade.Sprite[] = [];
  private readonly monsterPoseKeys = [
    { attack: "adventure-monster-slime-attack", hurt: "adventure-monster-slime-hurt", defeat: "adventure-monster-slime-defeat" },
    { attack: "adventure-monster-fox-attack", hurt: "adventure-monster-fox-hurt", defeat: "adventure-monster-fox-defeat" },
    { attack: "adventure-monster-guardian-attack", hurt: "adventure-monster-guardian-hurt", defeat: "adventure-monster-guardian-defeat" },
  ];
  private encounterLabels: Phaser.GameObjects.Text[] = [];
  private activeEncounterId: string | null = null;
  private encounterPaused = false;
  private nextEncounterIndex = 0;
  private bossAttackTimer: Phaser.Time.TimerEvent | null = null;
  private bossAttackWarningTimer: Phaser.Time.TimerEvent | null = null;
  private audioContext: AudioContext | null = null;
  private soundEnabled = true;

  private virtual: Record<VirtualDirection, boolean> = {
    left: false,
    right: false,
    jump: false,
  };

  private readonly worldWidth = 2600;
  private readonly worldHeight = 640;
  private readonly moveSpeed = 230;
  // Max jump height is about 216px with gravity 1100, enough for the highest 205px platform with a small margin.
  private readonly jumpVelocity = -690;

  constructor(encounterCount = ENCOUNTERS.length, heroId = "bimo") {
    super("AdventureScene");
    this.encounterCount = Phaser.Math.Clamp(encounterCount, 1, ENCOUNTERS.length);
    this.heroId = ["rara", "bimo", "tari"].includes(heroId) ? heroId : "bimo";
  }

  preload() {
    // Reuse the exact asset paths used by the character preview and battle UI.
    const hero = getHeroById(this.heroId);
    Object.entries(hero.assets).forEach(([pose, assetPath]) => {
      this.load.image(`adventure-hero-${pose}`, assetPath);
    });

    const monsterAssets = [
      { key: "slime", folder: "slime" },
      { key: "fox", folder: "fox" },
      { key: "guardian", folder: "purple-dragon" },
    ];

    monsterAssets.forEach(({ key, folder }) => {
      ["idle", "attack", "hurt", "defeat"].forEach((pose) => {
        this.load.image(
          `adventure-monster-${key}${pose === "idle" ? "" : `-${pose}`}`,
          `/assets/gamification/monsters/${folder}/${pose}.webp`,
        );
      });
    });

    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      console.error("Adventure asset gagal dimuat:", file.key, file.src);
    });
  }

  create() {
    this.createTextures();
    this.heroIdleTexture = this.textures.exists("adventure-hero-idle")
      ? "adventure-hero-idle"
      : "hero-idle-1";
    // Keep the selected character's real artwork while moving; movement is
    // communicated by body tilt instead of swapping to an attack pose.
    this.heroMoveTexture = this.heroIdleTexture;
    this.heroHurtTexture = this.textures.exists("adventure-hero-hurt")
      ? "adventure-hero-hurt"
      : this.heroIdleTexture;
    this.heroVictoryTexture = this.textures.exists("adventure-hero-victory")
      ? "adventure-hero-victory"
      : this.heroIdleTexture;
    this.heroExhaustedTexture = this.textures.exists("adventure-hero-exhausted")
      ? "adventure-hero-exhausted"
      : this.heroIdleTexture;
    this.createWorld();

    this.player = this.physics.add.sprite(120, 430, this.heroIdleTexture);

    this.player.setDisplaySize(76, 88);
    // Anchor the artwork at its feet so transparent padding in character sprites
    // does not make Velo appear to float above the platform.
    this.player.setOrigin(0.5, 1);
    if (this.heroId === "rara") {
      // Velo's artwork has extra transparent space below the feet.
      // Shift only the artwork down while keeping its physics body in place.
      this.player.setY(this.player.y + 8);
      (this.player.body as Phaser.Physics.Arcade.Body).setOffset(0, -8);
    }
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.02);
    this.player.setDepth(10);

    this.physics.add.collider(this.player, this.platforms);
    this.createEncounters();
    this.createHazardsAndPowerUps();

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.wasd = {
      left: this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.A,
      ),
      right: this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.D,
      ),
      jump: this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE,
      ),
    };

    this.cameras.main.setBounds(
      0,
      0,
      this.worldWidth,
      this.worldHeight,
    );

    this.cameras.main.startFollow(
      this.player,
      true,
      0.08,
      0.08,
    );

    this.cameras.main.setDeadzone(180, 90);

    this.game.events.on(
      "virtual-control",
      this.handleVirtualControl,
      this,
    );
    this.input.on("pointerdown", this.unlockAudio, this);
    this.input.keyboard?.on("keydown", this.unlockAudio, this);
    this.game.events.on("resolve-encounter", this.handleResolveEncounter, this);
    this.game.events.on("toggle-sound", this.handleToggleSound, this);
    this.game.events.on("stop-adventure", this.handleStopAdventure, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(
        "virtual-control",
        this.handleVirtualControl,
        this,
      );
      this.input.off("pointerdown", this.unlockAudio, this);
      this.input.keyboard?.off("keydown", this.unlockAudio, this);
      void this.audioContext?.close();
      this.audioContext = null;
      this.game.events.off("resolve-encounter", this.handleResolveEncounter, this);
      this.game.events.off("toggle-sound", this.handleToggleSound, this);
      this.game.events.off("stop-adventure", this.handleStopAdventure, this);
      this.heroPoseTimer?.remove(false);
      this.heroPoseTimer = null;
    });

    this.createHud();
    this.player.setTexture(this.heroIdleTexture);
  }

  private handleToggleSound(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  private handleVirtualControl(
    direction: VirtualDirection,
    pressed: boolean,
  ) {
    if (pressed) this.unlockAudio();
    this.virtual[direction] = pressed;
  }

  private unlockAudio() {
    if (typeof window === "undefined" || !("AudioContext" in window)) return;

    try {
      this.audioContext ??= new AudioContext();
      if (this.audioContext.state === "suspended") {
        void this.audioContext.resume().catch(() => undefined);
      }
    } catch {
      // Audio is an enhancement; gameplay remains available if it is unsupported.
    }
  }

  private playTone(
    frequency: number,
    duration: number,
    waveform: OscillatorType = "sine",
    volume = 0.045,
  ) {
    const context = this.audioContext;
    if (!this.soundEnabled || !context || context.state !== "running") return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime;

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  private playPickupSound() {
    this.playTone(660, 0.1, "sine");
    this.time.delayedCall(85, () => this.playTone(880, 0.13, "sine"));
  }

  private createTextures() {
    this.createHeroFrame("hero-idle-1", 0, 0);
    this.createHeroFrame("hero-idle-2", 1, 0);
    this.createHeroFrame("hero-walk-1", -3, -2);
    this.createHeroFrame("hero-walk-2", 3, 2);
    this.createHeroFrame("hero-jump-frame", 0, -5);

    const platform = this.make.graphics({ x: 0, y: 0 });

    platform.fillStyle(0x754523, 1);
    platform.fillRoundedRect(0, 5, 180, 23, 7);

    platform.fillStyle(0x65a30d, 1);
    platform.fillRoundedRect(0, 0, 180, 12, 6);

    platform.fillStyle(0x84cc16, 1);
    platform.fillRoundedRect(8, 2, 164, 4, 2);

    platform.generateTexture("forest-platform", 180, 28);
    platform.destroy();

    this.createMonsterTexture("monster-slime", 0x65a30d);
    this.createMonsterTexture("monster-fox", 0xea580c);
    this.createMonsterTexture("monster-guardian", 0x7c3aed);

    const hazard = this.make.graphics({ x: 0, y: 0 });
    hazard.fillStyle(0x7f1d1d, 1);
    hazard.fillTriangle(4, 38, 24, 0, 44, 38);
    hazard.fillStyle(0xfca5a5, 1);
    hazard.fillTriangle(17, 30, 24, 12, 31, 30);
    hazard.generateTexture("forest-hazard", 48, 40);
    hazard.destroy();

    const heart = this.make.graphics({ x: 0, y: 0 });
    heart.fillStyle(0xec4899, 1);
    heart.fillCircle(13, 13, 12);
    heart.fillCircle(31, 13, 12);
    heart.fillTriangle(2, 18, 42, 18, 22, 42);
    heart.generateTexture("pickup-heart", 44, 44);
    heart.destroy();

    const shield = this.make.graphics({ x: 0, y: 0 });
    shield.fillStyle(0x2563eb, 1);
    shield.fillPoints([
      { x: 22, y: 0 }, { x: 42, y: 7 }, { x: 38, y: 29 },
      { x: 22, y: 43 }, { x: 6, y: 29 }, { x: 2, y: 7 },
    ], true);
    shield.lineStyle(3, 0xbfdbfe, 1);
    shield.strokePoints([
      { x: 22, y: 5 }, { x: 36, y: 10 }, { x: 33, y: 27 },
      { x: 22, y: 37 }, { x: 11, y: 27 }, { x: 8, y: 10 },
    ], true);
    shield.generateTexture("pickup-shield", 44, 44);
    shield.destroy();
  }

  private createHeroFrame(
    key: string,
    legOffset: number,
    armOffset: number,
  ) {
    const hero = this.make.graphics({ x: 0, y: 0 });

    // Legs
    hero.fillStyle(0x1e3a8a, 1);
    hero.fillRoundedRect(13 + legOffset, 48, 9, 15, 4);
    hero.fillRoundedRect(26 - legOffset, 48, 9, 15, 4);

    // Shoes
    hero.fillStyle(0x78350f, 1);
    hero.fillRoundedRect(10 + legOffset, 59, 13, 6, 3);
    hero.fillRoundedRect(25 - legOffset, 59, 13, 6, 3);

    // Arms
    hero.fillStyle(0xffd7b5, 1);
    hero.fillRoundedRect(5, 27 + armOffset, 8, 20, 4);
    hero.fillRoundedRect(35, 27 - armOffset, 8, 20, 4);

    // Body
    hero.fillStyle(0x2563eb, 1);
    hero.fillRoundedRect(10, 22, 28, 32, 8);

    // Shirt detail
    hero.fillStyle(0x60a5fa, 1);
    hero.fillRoundedRect(21, 26, 6, 22, 3);

    // Face
    hero.fillStyle(0xffd7b5, 1);
    hero.fillCircle(24, 15, 13);

    // Hair
    hero.fillStyle(0x713f12, 1);
    hero.fillRoundedRect(11, 3, 26, 9, 5);
    hero.fillCircle(13, 9, 5);

    // Cap
    hero.fillStyle(0x1e3a8a, 1);
    hero.fillRoundedRect(8, 0, 32, 7, 4);

    // Cap decoration
    hero.fillStyle(0xf472b6, 1);
    hero.fillCircle(37, 8, 5);

    // Eyes
    hero.fillStyle(0x172554, 1);
    hero.fillCircle(20, 16, 1.8);
    hero.fillCircle(29, 16, 1.8);

    // Smile
    hero.lineStyle(1.5, 0x9a3412, 1);
    hero.beginPath();
    hero.arc(24, 19, 4, 0.2, Math.PI - 0.2, false);
    hero.strokePath();

    hero.generateTexture(key, 48, 66);
    hero.destroy();
  }

  private createAnimations() {
    this.anims.create({
      key: "hero-idle",
      frames: [
        { key: "hero-idle-1" },
        { key: "hero-idle-2" },
      ],
      frameRate: 2,
      repeat: -1,
    });

    this.anims.create({
      key: "hero-walk",
      frames: [
        { key: "hero-walk-1" },
        { key: "hero-walk-2" },
      ],
      frameRate: 9,
      repeat: -1,
    });

    this.anims.create({
      key: "hero-jump",
      frames: [{ key: "hero-jump-frame" }],
      frameRate: 1,
      repeat: 0,
    });
  }

  private createWorld() {
    // Sky background
    const sky = this.add.graphics();

    sky.fillGradientStyle(
      0x38bdf8,
      0x38bdf8,
      0xd9f99d,
      0xd9f99d,
      1,
    );

    sky.fillRect(0, 0, this.worldWidth, this.worldHeight);
    sky.setScrollFactor(0);
    sky.setDepth(-20);

    // Distant mountains and hills
    const distantHills = this.add.graphics();

    for (let x = 0; x < this.worldWidth + 400; x += 420) {
      distantHills.fillStyle(0x86b96a, 1);
      distantHills.fillEllipse(x + 160, 470, 460, 190);

      distantHills.fillStyle(0x6b9e62, 1);
      distantHills.fillEllipse(x + 350, 500, 480, 170);
    }

    distantHills.setScrollFactor(0.2);
    distantHills.setDepth(-10);

    // Clouds
    const clouds = this.add.graphics();

    for (let x = 0; x < this.worldWidth + 500; x += 520) {
      clouds.fillStyle(0xffffff, 0.78);
      clouds.fillCircle(x + 60, 110, 22);
      clouds.fillCircle(x + 90, 95, 30);
      clouds.fillCircle(x + 125, 110, 23);
      clouds.fillRoundedRect(x + 55, 105, 95, 30, 15);
    }

    clouds.setScrollFactor(0.12);
    clouds.setDepth(-5);

    // Forest trees
    const trees = this.add.graphics();

    for (let x = 50; x < this.worldWidth + 200; x += 260) {
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

    this.platforms = this.physics.add.staticGroup();

    // Main ground
    this.addPlatform(0, 570, 900);
    this.addPlatform(1010, 570, 650);
    this.addPlatform(1770, 570, 830);

    // Floating platforms
    this.addPlatform(360, 455);
    this.addPlatform(650, 380);
    this.addPlatform(1120, 455);
    this.addPlatform(1430, 380);
    this.addPlatform(1900, 455);
    this.addPlatform(2200, 365);

    // Foreground ground decoration
    const ground = this.add.graphics();

    ground.fillStyle(0x4d7c0f, 1);
    ground.fillRect(0, 598, this.worldWidth, 42);

    ground.fillStyle(0x65a30d, 1);

    for (let x = 0; x < this.worldWidth; x += 45) {
      ground.fillTriangle(
        x,
        602,
        x + 12,
        590,
        x + 20,
        602,
      );
    }

    ground.setDepth(2);

    this.physics.world.setBounds(
      0,
      0,
      this.worldWidth,
      this.worldHeight,
    );

    this.createFireflies();
  }

  private createFireflies() {
    for (let i = 0; i < 18; i += 1) {
      const x = 120 + i * 135;
      const y = 280 + ((i * 47) % 180);

      const firefly = this.add.circle(
        x,
        y,
        3,
        0xfef08a,
        0.85,
      );

      firefly.setDepth(4);

      this.tweens.add({
        targets: firefly,
        y: y - 25 - (i % 3) * 8,
        alpha: 0.2,
        duration: 1400 + (i % 4) * 350,
        yoyo: true,
        repeat: -1,
        delay: i * 90,
        ease: "Sine.easeInOut",
      });
    }
  }

  private addPlatform(
    x: number,
    y: number,
    width = 180,
  ) {
    const pieces = Math.ceil(width / 180);

    for (let i = 0; i < pieces; i += 1) {
      const pieceWidth = Math.min(180, width - i * 180);

      const piece = this.platforms.create(
        x + i * 180 + pieceWidth / 2,
        y,
        "forest-platform",
      ) as Phaser.Physics.Arcade.Sprite;

      piece.setDisplaySize(pieceWidth, 28);
      piece.refreshBody();
    }
  }


  private createMonsterTexture(key: string, color: number) {
    const graphic = this.make.graphics({ x: 0, y: 0 });
    graphic.fillStyle(0x1f2937, 0.18);
    graphic.fillEllipse(48, 82, 76, 13);
    graphic.fillStyle(color, 1);
    graphic.fillRoundedRect(15, 24, 66, 54, 24);
    graphic.fillCircle(30, 24, 17);
    graphic.fillCircle(66, 24, 17);
    graphic.fillStyle(0xffffff, 1);
    graphic.fillCircle(34, 44, 7);
    graphic.fillCircle(62, 44, 7);
    graphic.fillStyle(0x172554, 1);
    graphic.fillCircle(36, 45, 3);
    graphic.fillCircle(60, 45, 3);
    graphic.fillStyle(0x7f1d1d, 1);
    graphic.fillRoundedRect(39, 60, 18, 5, 2);

    if (key === "monster-guardian") {
      graphic.fillStyle(0xfbbf24, 1);
      graphic.fillTriangle(24, 25, 34, 0, 44, 25);
      graphic.fillTriangle(42, 22, 54, 4, 64, 22);
      graphic.fillTriangle(62, 25, 73, 0, 82, 25);
      graphic.fillStyle(0xfef3c7, 1);
      graphic.fillCircle(34, 14, 3);
      graphic.fillCircle(54, 12, 3);
      graphic.fillCircle(73, 14, 3);
    }
    graphic.generateTexture(key, 96, 90);
    graphic.destroy();
  }

  private createEncounters() {
    const positions = [760, 1510, 2320];
    const fallbackTextureKeys = ["monster-slime", "monster-fox", "monster-guardian"];
    const textureKeys = ["adventure-monster-slime", "adventure-monster-fox", "adventure-monster-guardian"];

    ENCOUNTERS.slice(0, this.encounterCount).forEach((encounter, index) => {
      const monster = this.physics.add.sprite(
        positions[index],
        510,
        this.textures.exists(textureKeys[index]) ? textureKeys[index] : fallbackTextureKeys[index],
      );
      monster.setDisplaySize(index === 2 ? 138 : 104, index === 2 ? 128 : 100);
      monster.setImmovable(true);
      monster.body.allowGravity = false;
      monster.setDepth(9);
      monster.setData("encounter", encounter);
      this.encounterSprites.push(monster);

      const label = this.add.text(positions[index], 445, encounter.name, {
        fontFamily: "Arial",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#24452d",
        strokeThickness: 4,
      }).setOrigin(0.5).setDepth(11);
      this.encounterLabels.push(label);

      this.physics.add.overlap(
        this.player,
        monster,
        this.triggerEncounter,
        undefined,
        this,
      );

      this.tweens.add({
        targets: monster,
        y: 500,
        duration: 850 + index * 100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      const idleScaleX = monster.scaleX;
      const idleScaleY = monster.scaleY;
      this.tweens.add({
        targets: monster,
        scaleX: idleScaleX * 1.045,
        scaleY: idleScaleY * 0.96,
        duration: 620 + index * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
  }

  private triggerEncounter = (
    _player: unknown,
    monsterObject: unknown,
  ) => {
    if (this.encounterPaused) return;
    if (!(monsterObject instanceof Phaser.GameObjects.GameObject)) return;

    const monster = monsterObject as Phaser.Physics.Arcade.Sprite;
    const encounter = monster.getData("encounter") as AdventureEncounter | undefined;
    if (!encounter || encounter.id !== ENCOUNTERS[this.nextEncounterIndex]?.id) return;

    this.encounterPaused = true;
    this.heroPoseTimer?.remove(false);
    this.heroPoseTimer = null;
    this.activeEncounterId = encounter.id;
    if (encounter.kind === "boss") this.startBossAttackCycle();
    this.player.setVelocity(0, 0);
    this.player.setTexture(this.heroIdleTexture);
    this.virtual = { left: false, right: false, jump: false };
    this.physics.world.pause();
    this.playTone(encounter.kind === "boss" ? 180 : 420, 0.16, "triangle");
    this.game.events.emit("monster-encounter", encounter);
  };

  private startBossAttackCycle() {
    this.stopBossAttackCycle();
    this.bossAttackTimer = this.time.addEvent({
      delay: 12000,
      loop: true,
      callback: () => {
        if (!this.encounterPaused || this.activeEncounterId !== "forest-guardian") return;
        const boss = this.encounterSprites[2];
        if (boss?.active && this.textures.exists("adventure-monster-guardian-attack")) {
          boss.setTexture("adventure-monster-guardian-attack");
        }
        boss?.setTint(0xfca5a5);
        if (boss) {
          this.tweens.add({
            targets: boss,
            scaleX: boss.scaleX * 1.1,
            scaleY: boss.scaleY * 1.1,
            duration: 450,
            yoyo: true,
            ease: "Quad.easeOut",
          });
        }
        this.playTone(240, 0.24, "square", 0.035);
        this.game.events.emit("boss-attack-warning");
        this.bossAttackWarningTimer = this.time.delayedCall(2500, () => {
          if (!this.encounterPaused || this.activeEncounterId !== "forest-guardian") return;
          const boss = this.encounterSprites[2];
          if (boss?.active) {
            this.tweens.killTweensOf(boss);
            if (this.textures.exists("adventure-monster-guardian-attack")) {
              boss.setTexture("adventure-monster-guardian-attack");
            }
            boss.setTint(0xf87171);
            this.tweens.add({
              targets: boss,
              x: boss.x - 15,
              angle: -9,
              duration: 90,
              yoyo: true,
              repeat: 1,
              onComplete: () => {
                boss.setAngle(0);
                boss.clearTint();
                if (boss.active && this.textures.exists("adventure-monster-guardian")) {
                  boss.setTexture("adventure-monster-guardian");
                }
              },
            });
          }
          this.showHeroPose(this.heroHurtTexture, 600);
          this.playTone(115, 0.32, "sawtooth", 0.06);
          this.game.events.emit("boss-attack");
        });
      },
    });
  }

  private stopBossAttackCycle() {
    this.bossAttackTimer?.remove(false);
    this.bossAttackWarningTimer?.remove(false);
    this.bossAttackTimer = null;
    this.bossAttackWarningTimer = null;
    this.encounterSprites[2]?.clearTint();
    this.game.events.emit("boss-attack-warning-clear");
  }

  private handleStopAdventure = () => {
    this.stopBossAttackCycle();
    this.isAdventureStopped = true;
    this.heroPoseTimer?.remove(false);
    this.player?.setVelocity(0, 0);
    this.player?.setTexture(this.heroExhaustedTexture);
    this.physics.world.pause();
  };

  private showHeroPose(texture: string, duration = 450) {
    if (!this.player?.active) return;

    this.heroPoseTimer?.remove(false);
    this.player.setTexture(texture);
    this.heroPoseTimer = this.time.delayedCall(duration, () => {
      if (this.player?.active && !this.isAdventureStopped) {
        this.player.setTexture(this.heroIdleTexture);
      }
      this.heroPoseTimer = null;
    });
  }

  private handleResolveEncounter(encounterId: string) {
    if (!this.encounterPaused || encounterId !== this.activeEncounterId) return;
    this.stopBossAttackCycle();
    this.heroPoseTimer?.remove(false);
    this.heroPoseTimer = null;

    const index = ENCOUNTERS.findIndex((encounter) => encounter.id === encounterId);
    const defeatedMonster = this.encounterSprites[index];
    if (defeatedMonster?.active) {
      const poseKeys = this.monsterPoseKeys[index];
      if (poseKeys && this.textures.exists(poseKeys.hurt)) {
        defeatedMonster.setTexture(poseKeys.hurt);
      }
      this.tweens.killTweensOf(defeatedMonster);
      this.playTone(660, 0.13, "sine");
      this.time.delayedCall(100, () => this.playTone(880, 0.16, "sine"));
      for (let particleIndex = 0; particleIndex < 12; particleIndex += 1) {
        const sparkle = this.add.circle(
          defeatedMonster.x,
          defeatedMonster.y,
          Phaser.Math.Between(3, 6),
          [0xfde047, 0x86efac, 0xc4b5fd][particleIndex % 3],
        ).setDepth(15);
        this.tweens.add({
          targets: sparkle,
          x: sparkle.x + Phaser.Math.Between(-70, 70),
          y: sparkle.y + Phaser.Math.Between(-65, 20),
          alpha: 0,
          scale: 0.2,
          duration: 500 + Phaser.Math.Between(0, 220),
          onComplete: () => sparkle.destroy(),
        });
      }
    }
    if (defeatedMonster?.active) {
      const poseKeys = this.monsterPoseKeys[index];
      this.time.delayedCall(260, () => {
        if (defeatedMonster.active && poseKeys && this.textures.exists(poseKeys.defeat)) {
          defeatedMonster.setTexture(poseKeys.defeat);
          defeatedMonster.setAlpha(0.9);
        }
      });
      this.time.delayedCall(760, () => defeatedMonster.destroy());
    }
    this.encounterLabels[index]?.destroy();
    this.nextEncounterIndex += 1;
    this.activeEncounterId = null;
    this.encounterPaused = false;

    if (this.nextEncounterIndex >= this.encounterCount) {
      this.player.setTexture(this.heroVictoryTexture);
      this.game.events.emit("adventure-complete");
      return;
    }

    this.player.setX(Math.min(this.player.x + 90, this.worldWidth - 80));
    this.physics.world.resume();
  }

  private createHazardsAndPowerUps() {
    const hazards = [480, 1260, 2040];
    hazards.forEach((x) => {
      const obstacle = this.physics.add.sprite(x, 535, "forest-hazard");
      obstacle.setDisplaySize(42, 36);
      obstacle.setImmovable(true);
      obstacle.body.allowGravity = false;
      obstacle.setDepth(8);
      this.physics.add.overlap(this.player, obstacle, this.triggerHazard, undefined, this);
    });

    const pickups: Array<{ x: number; kind: "heart" | "shield" }> = [
      { x: 1040, kind: "heart" },
      { x: 1810, kind: "shield" },
      { x: 2180, kind: "heart" },
    ];

    pickups.forEach(({ x, kind }) => {
      const item = this.physics.add.sprite(
        x,
        510,
        kind === "heart" ? "pickup-heart" : "pickup-shield",
      );
      item.setDisplaySize(36, 36);
      item.setImmovable(true);
      item.body.allowGravity = false;
      item.setDepth(8);
      item.setData("pickup-kind", kind);
      this.tweens.add({
        targets: item,
        y: 495,
        duration: 750,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      this.physics.add.overlap(this.player, item, this.collectPowerUp, undefined, this);
    });
  }

  private triggerHazard = (_player: unknown, hazardObject: unknown) => {
    if (this.encounterPaused) return;
    if (!(hazardObject instanceof Phaser.GameObjects.GameObject)) return;
    const hazard = hazardObject as Phaser.Physics.Arcade.Sprite;
    if (!hazard.active) return;
    hazard.destroy();
    this.showHeroPose(this.heroHurtTexture, 450);
    this.playTone(165, 0.22, "sawtooth", 0.05);
    this.game.events.emit("adventure-hazard");
  };

  private collectPowerUp = (_player: unknown, itemObject: unknown) => {
    if (this.encounterPaused) return;
    if (!(itemObject instanceof Phaser.GameObjects.GameObject)) return;
    const item = itemObject as Phaser.Physics.Arcade.Sprite;
    if (!item.active) return;
    const kind = item.getData("pickup-kind");
    if (kind !== "heart" && kind !== "shield") return;
    item.destroy();
    this.playPickupSound();
    this.game.events.emit("adventure-pickup", kind);
  }

  private createHud() {
    this.add
      .text(24, 22, "ENCHANTED FOREST", {
        fontFamily: "Arial",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#24533a",
        strokeThickness: 5,
      })
      .setScrollFactor(0)
      .setDepth(20);

    this.add
      .text(24, 50, "Jelajahi hutan dan temukan petualanganmu!", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#ffffff",
        stroke: "#24533a",
        strokeThickness: 3,
      })
      .setScrollFactor(0)
      .setDepth(20);
  }

  update() {
    if (this.isAdventureStopped) {
      this.player?.setVelocity(0, 0);
      return;
    }

    if (this.encounterPaused) {
      this.player?.setVelocityX(0);
      return;
    }

    if (!this.player?.body || !this.cursors || !this.wasd) {
      return;
    }

    const left =
      this.cursors.left.isDown ||
      this.wasd.left.isDown ||
      this.virtual.left;

    const right =
      this.cursors.right.isDown ||
      this.wasd.right.isDown ||
      this.virtual.right;

    const jump =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.jump) ||
      this.virtual.jump;

    // Proximity fallback: start an encounter even if Arcade overlap misses a sprite body.
    const nextMonster = this.encounterSprites[this.nextEncounterIndex];
    if (nextMonster?.active) {
      const playerBounds = this.player.getBounds();
      const monsterBounds = nextMonster.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, monsterBounds)) {
        this.triggerEncounter(this.player, nextMonster);
        return;
      }
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (left === right) {
      this.player.setVelocityX(0);
    } else {
      this.player.setVelocityX(left ? -this.moveSpeed : this.moveSpeed);
      this.player.setFlipX(left);
    }

    if (jump && body.blocked.down) {
      this.player.setVelocityY(this.jumpVelocity);
      this.playTone(480, 0.09, "triangle", 0.035);
    }

    if (jump) {
      this.virtual.jump = false;
    }

    // Jangan timpa pose hurt selama animasi reaksinya masih berlangsung.
    if (!this.heroPoseTimer) {
      if (!body.blocked.down) {
        this.player.setTexture(this.heroMoveTexture);
        this.player.setAngle(Phaser.Math.Clamp(body.velocity.y / 55, -10, 10));
      } else if (left !== right) {
        // Pose idle dipadukan dengan ayunan badan untuk memberi kesan berjalan.
        this.player.setTexture(this.heroIdleTexture);
        this.player.setAngle(Math.sin(this.time.now / 75) * 5);
      } else {
        this.player.setTexture(this.heroIdleTexture);
        this.player.setAngle(0);
      }
    }
  }
}
