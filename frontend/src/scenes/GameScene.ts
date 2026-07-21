import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { Starfield } from '../entities/Starfield';
import { Player } from '../entities/Player';
import { AsteroidSpawner } from '../entities/AsteroidSpawner';
import { eventBus } from '../services/eventBus';

const STARTING_LIVES = 3;
const SHIELD_SPAWN_CHANCE_PER_SEC = 0.03;

export class GameScene extends Phaser.Scene {
  private starfield!: Starfield;
  private player!: Player;
  private asteroidSpawner!: AsteroidSpawner;
  private bullets!: Phaser.Physics.Arcade.Group;
  private powerups!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  private score = 0;
  private lives = STARTING_LIVES;
  private elapsedMs = 0;
  private isGameOver = false;

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.score = 0;
    this.lives = STARTING_LIVES;
    this.elapsedMs = 0;
    this.isGameOver = false;

    this.starfield = new Starfield(this, GAME_WIDTH, GAME_HEIGHT);
    this.player = new Player(this, 90, GAME_HEIGHT / 2);
    this.asteroidSpawner = new AsteroidSpawner(this, GAME_WIDTH, GAME_HEIGHT);
    this.bullets = this.physics.add.group();
    this.powerups = this.physics.add.group();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      left: this.input.keyboard!.addKey('A'),
      right: this.input.keyboard!.addKey('D'),
      up: this.input.keyboard!.addKey('W'),
      down: this.input.keyboard!.addKey('S'),
    };
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.scoreText = this.add
      .text(16, 14, 'Puntaje: 0', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '18px',
        color: '#eef1ff',
      })
      .setDepth(20);

    this.livesText = this.add
      .text(GAME_WIDTH - 16, 14, this.livesDisplay(), {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '18px',
        color: '#ff6b6b',
      })
      .setOrigin(1, 0)
      .setDepth(20);

    this.physics.add.overlap(this.bullets, this.asteroidSpawner.group, this.onBulletHitsAsteroid, undefined, this);
    this.physics.add.overlap(this.player.sprite, this.asteroidSpawner.group, this.onPlayerHitsAsteroid, undefined, this);
    this.physics.add.overlap(this.player.sprite, this.powerups, this.onPlayerHitsPowerup, undefined, this);
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    this.elapsedMs += delta;
    this.starfield.update(1);
    this.player.update(this.cursors, this.wasd);
    this.asteroidSpawner.update(delta);
    this.maybeSpawnPowerup(delta);
    this.cleanupOffscreen();

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.tryShoot();
    }

    // Puntaje base por tiempo sobrevivido (aprox. 10 puntos/seg).
    this.addScore(Math.round(delta * 0.01));
  }

  private tryShoot(): void {
    if (!this.player.canShoot(this.time.now)) return;

    const bullet = this.bullets.create(
      this.player.sprite.x + 26,
      this.player.sprite.y,
      'bullet'
    ) as Phaser.Physics.Arcade.Image;

    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(520);
  }

  private onBulletHitsAsteroid: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (bulletObj, asteroidObj) => {
    const bullet = bulletObj as Phaser.Physics.Arcade.Image;
    const asteroid = asteroidObj as Phaser.Physics.Arcade.Image;

    const points = (asteroid.getData('points') as number) ?? 10;
    this.addScore(points);
    this.spawnExplosion(asteroid.x, asteroid.y);

    bullet.destroy();
    asteroid.destroy();
  };

  private onPlayerHitsAsteroid: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, asteroidObj) => {
    const asteroid = asteroidObj as Phaser.Physics.Arcade.Image;

    if (this.player.hasShield()) {
      this.spawnExplosion(asteroid.x, asteroid.y);
      asteroid.destroy();
      return;
    }

    this.spawnExplosion(asteroid.x, asteroid.y);
    asteroid.destroy();
    this.loseLife();
  };

  private onPlayerHitsPowerup: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_playerObj, powerupObj) => {
    const powerup = powerupObj as Phaser.Physics.Arcade.Image;
    powerup.destroy();
    this.player.activateShield(5000);
  };

  private maybeSpawnPowerup(deltaMs: number): void {
    const chance = SHIELD_SPAWN_CHANCE_PER_SEC * (deltaMs / 1000);
    if (Math.random() > chance) return;

    const y = Phaser.Math.Between(30, GAME_HEIGHT - 30);
    const powerup = this.powerups.create(GAME_WIDTH + 40, y, 'shield_powerup') as Phaser.Physics.Arcade.Image;
    const body = powerup.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocityX(-140);
  }

  private cleanupOffscreen(): void {
    this.bullets.children.each((child) => {
      const bullet = child as Phaser.Physics.Arcade.Image;
      if (bullet.x > GAME_WIDTH + 40) bullet.destroy();
      return true;
    });

    this.powerups.children.each((child) => {
      const powerup = child as Phaser.Physics.Arcade.Image;
      if (powerup.x < -40) powerup.destroy();
      return true;
    });
  }

  private spawnExplosion(x: number, y: number): void {
    const particles = this.add.particles(x, y, 'particle', {
      speed: { min: 60, max: 180 },
      lifespan: 400,
      scale: { start: 1, end: 0 },
      quantity: 12,
      tint: [0xff5ec4, 0xffd166, 0x7cf5ff],
    });
    this.time.delayedCall(420, () => particles.destroy());
  }

  private addScore(amount: number): void {
    this.score += amount;
    this.scoreText.setText(`Puntaje: ${this.score}`);
    eventBus.emit('game:score-updated', { score: this.score });
  }

  private loseLife(): void {
    this.lives -= 1;
    this.livesText.setText(this.livesDisplay());
    this.cameras.main.shake(200, 0.01);
    this.cameras.main.flash(120, 255, 80, 80);

    if (this.lives <= 0) {
      this.endGame();
    }
  }

  private livesDisplay(): string {
    return '❤'.repeat(Math.max(this.lives, 0)) + '♡'.repeat(STARTING_LIVES - Math.max(this.lives, 0));
  }

  private endGame(): void {
    this.isGameOver = true;
    eventBus.emit('game:over', { score: this.score, durationMs: this.elapsedMs });
    this.time.delayedCall(600, () => {
      this.scene.start('GameOverScene', { score: this.score, durationMs: this.elapsedMs });
    });
  }
}
