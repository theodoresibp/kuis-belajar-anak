
import * as Phaser from "phaser";

type VirtualDirection = "left" | "right" | "jump";

export default class AdventureScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<VirtualDirection, Phaser.Input.Keyboard.Key>;

  private virtual: Record<VirtualDirection, boolean> = {
    left: false,
    right: false,
    jump: false,
  };

  private readonly worldWidth = 2600;
  private readonly worldHeight = 640;
  private readonly moveSpeed = 230;
  private readonly jumpVelocity = -470;

  constructor() {
    super("AdventureScene");
  }

  create() {
    this.createTextures();
    this.createAnimations();
    this.createWorld();

    this.player = this.physics.add.sprite(
      120,
      430,
      "hero-idle-1",
    );

    this.player.setDisplaySize(48, 66);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.02);
    this.player.setDepth(10);

    this.physics.add.collider(this.player, this.platforms);

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

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(
        "virtual-control",
        this.handleVirtualControl,
        this,
      );
    });

    this.createHud();
    this.player.play("hero-idle");
  }

  private handleVirtualControl(
    direction: VirtualDirection,
    pressed: boolean,
  ) {
    this.virtual[direction] = pressed;
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

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    if (left === right) {
      this.player.setVelocityX(0);
    } else {
      this.player.setVelocityX(left ? -this.moveSpeed : this.moveSpeed);
      this.player.setFlipX(left);
    }

    if (jump && body.blocked.down) {
      this.player.setVelocityY(this.jumpVelocity);
    }

    if (jump) {
      this.virtual.jump = false;
    }

    // Character animation state
    if (!body.blocked.down) {
      if (this.player.anims.currentAnim?.key !== "hero-jump") {
        this.player.play("hero-jump", true);
      }
    } else if (left !== right) {
      if (this.player.anims.currentAnim?.key !== "hero-walk") {
        this.player.play("hero-walk", true);
      }
    } else if (this.player.anims.currentAnim?.key !== "hero-idle") {
      this.player.play("hero-idle", true);
    }
  }
}
