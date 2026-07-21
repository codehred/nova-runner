import Phaser from 'phaser';

interface AsteroidVariant {
  key: string;
  speedRange: [number, number];
  points: number;
  hitboxScale: number;
}

const VARIANTS: AsteroidVariant[] = [
  { key: 'asteroid_s', speedRange: [220, 300], points: 30, hitboxScale: 0.6 },
  { key: 'asteroid_m', speedRange: [150, 220], points: 20, hitboxScale: 0.65 },
  { key: 'asteroid_l', speedRange: [90, 150], points: 10, hitboxScale: 0.7 },
];

/**
 * Controla el spawn de asteroides con dificultad progresiva:
 * a medida que pasa el tiempo, el intervalo entre spawns disminuye
 * (con un piso mínimo) para incrementar la presión sobre el jugador.
 */
export class AsteroidSpawner {
  readonly group: Phaser.Physics.Arcade.Group;
  private scene: Phaser.Scene;
  private width: number;
  private height: number;
  private elapsedMs = 0;
  private nextSpawnAt = 0;
  private readonly minInterval = 350;
  private readonly maxInterval = 1100;

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.group = scene.physics.add.group();
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;

    if (this.elapsedMs >= this.nextSpawnAt) {
      this.spawnOne();
      this.scheduleNext();
    }

    this.group.children.each((child) => {
      const asteroid = child as Phaser.Physics.Arcade.Image;
      if (asteroid.x < -80) {
        asteroid.destroy();
      }
      return true;
    });
  }

  private scheduleNext(): void {
    // La dificultad escala con el tiempo transcurrido, con un piso de intervalo mínimo.
    const difficultyFactor = Math.min(this.elapsedMs / 60000, 1); // se satura a 1 min
    const interval = Phaser.Math.Linear(this.maxInterval, this.minInterval, difficultyFactor);
    this.nextSpawnAt = this.elapsedMs + interval + Phaser.Math.Between(-100, 100);
  }

  private spawnOne(): void {
    const variant = Phaser.Utils.Array.GetRandom(VARIANTS);
    const y = Phaser.Math.Between(30, this.height - 30);
    const speed = Phaser.Math.Between(...variant.speedRange);

    const asteroid = this.group.create(this.width + 60, y, variant.key) as Phaser.Physics.Arcade.Image;
    asteroid.setData('points', variant.points);
    asteroid.setCircle((asteroid.width * variant.hitboxScale) / 2);
    asteroid.setOffset(
      asteroid.width * ((1 - variant.hitboxScale) / 2),
      asteroid.height * ((1 - variant.hitboxScale) / 2)
    );

    const body = asteroid.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(-speed, Phaser.Math.Between(-20, 20));
    body.setAllowGravity(false);

    this.scene.tweens.add({
      targets: asteroid,
      angle: Phaser.Math.Between(-360, 360),
      duration: Phaser.Math.Between(2000, 5000),
      repeat: -1,
    });
  }

  reset(): void {
    this.group.clear(true, true);
    this.elapsedMs = 0;
    this.nextSpawnAt = 0;
  }
}
