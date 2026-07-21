import Phaser from 'phaser';

const SPEED = 260;
const SHOOT_COOLDOWN_MS = 260;

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private lastShotAt = 0;
  private shieldActive = false;
  private shieldGraphic: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.sprite = scene.physics.add.sprite(x, y, 'ship');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setSize(30, 20);
    this.sprite.setOffset(9, 10);

    this.shieldGraphic = scene.add.circle(x, y, 26, 0x7cf5ff, 0.15);
    this.shieldGraphic.setStrokeStyle(2, 0x7cf5ff, 0.8);
    this.shieldGraphic.setVisible(false);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasd: Record<string, Phaser.Input.Keyboard.Key>): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    const left = cursors.left?.isDown || wasd.left.isDown;
    const right = cursors.right?.isDown || wasd.right.isDown;
    const up = cursors.up?.isDown || wasd.up.isDown;
    const down = cursors.down?.isDown || wasd.down.isDown;

    if (left) body.setVelocityX(-SPEED);
    if (right) body.setVelocityX(SPEED);
    if (up) body.setVelocityY(-SPEED);
    if (down) body.setVelocityY(SPEED);

    body.velocity.normalize().scale(SPEED * (left || right || up || down ? 1 : 0));

    this.shieldGraphic.setPosition(this.sprite.x, this.sprite.y);
  }

  canShoot(now: number): boolean {
    if (now - this.lastShotAt < SHOOT_COOLDOWN_MS) return false;
    this.lastShotAt = now;
    return true;
  }

  activateShield(durationMs: number): void {
    this.shieldActive = true;
    this.shieldGraphic.setVisible(true);
    this.scene.time.delayedCall(durationMs, () => {
      this.shieldActive = false;
      this.shieldGraphic.setVisible(false);
    });
  }

  hasShield(): boolean {
    return this.shieldActive;
  }

  destroy(): void {
    this.shieldGraphic.destroy();
    this.sprite.destroy();
  }
}
