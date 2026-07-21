import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

/**
 * En vez de depender de assets externos (imágenes/sprites), todas las
 * texturas se generan en tiempo de ejecución con Phaser.Graphics +
 * generateTexture(). Esto mantiene el proyecto 100% autocontenido,
 * ligero y fácil de clonar/ejecutar sin descargar binarios de arte.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.drawLoadingBar();
    this.generateTextures();
  }

  create(): void {
    this.scene.start('MenuScene');
  }

  private drawLoadingBar(): void {
    const box = this.add.graphics();
    box.fillStyle(0x0d1023, 1);
    box.fillRoundedRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 20, 320, 24, 8);

    const bar = this.add.graphics();
    bar.fillStyle(0x7cf5ff, 1);
    bar.fillRoundedRect(GAME_WIDTH / 2 - 155, GAME_HEIGHT / 2 - 15, 310, 14, 6);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 45, 'Preparando la nave...', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        color: '#9aa0c3',
      })
      .setOrigin(0.5);
  }

  private generateTextures(): void {
    this.generateShipTexture();
    this.generateBulletTexture();
    this.generateAsteroidTextures();
    this.generateParticleTexture();
    this.generateStarfieldTextures();
    this.generateShieldTexture();
  }

  private generateShipTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const w = 48;
    const h = 40;

    // Estela del motor
    g.fillStyle(0xff5ec4, 0.5);
    g.fillTriangle(4, h / 2, 18, h / 2 - 6, 18, h / 2 + 6);

    // Cuerpo principal
    g.fillStyle(0x7cf5ff, 1);
    g.fillTriangle(w - 2, h / 2, 12, 4, 12, h - 4);

    // Detalle de cabina
    g.fillStyle(0x0d1023, 1);
    g.fillCircle(w - 16, h / 2, 5);

    g.generateTexture('ship', w, h);
    g.destroy();
  }

  private generateBulletTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffd166, 1);
    g.fillRoundedRect(0, 0, 14, 5, 2);
    g.generateTexture('bullet', 14, 5);
    g.destroy();
  }

  private generateAsteroidTextures(): void {
    const variants = [
      { key: 'asteroid_s', radius: 14, points: 9 },
      { key: 'asteroid_m', radius: 22, points: 10 },
      { key: 'asteroid_l', radius: 30, points: 12 },
    ];

    variants.forEach(({ key, radius, points }) => {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      const size = radius * 2 + 6;
      const cx = size / 2;
      const cy = size / 2;

      const path: Phaser.Math.Vector2[] = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const jitter = radius * (0.75 + Math.random() * 0.3);
        path.push(new Phaser.Math.Vector2(cx + Math.cos(angle) * jitter, cy + Math.sin(angle) * jitter));
      }

      g.fillStyle(0x3a3f66, 1);
      g.fillPoints(path, true);
      g.lineStyle(2, 0x565c99, 1);
      g.strokePoints(path, true);

      // Cráteres decorativos
      g.fillStyle(0x24274a, 1);
      g.fillCircle(cx - radius * 0.2, cy - radius * 0.15, radius * 0.18);
      g.fillCircle(cx + radius * 0.25, cy + radius * 0.2, radius * 0.12);

      g.generateTexture(key, size, size);
      g.destroy();
    });
  }

  private generateParticleTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }

  
  private generateStarfieldTextures(): void {
    const layers = [
      { key: 'starfield_far', size: 300, count: 40, radius: [0.6, 1.2] as [number, number], alpha: 0.5 },
      { key: 'starfield_mid', size: 300, count: 55, radius: [0.8, 1.6] as [number, number], alpha: 0.7 },
      { key: 'starfield_near', size: 300, count: 35, radius: [1.2, 2.2] as [number, number], alpha: 1 },
    ];

    layers.forEach(({ key, size, count, radius, alpha }) => {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0xffffff, alpha);
      for (let i = 0; i < count; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Phaser.Math.FloatBetween(radius[0], radius[1]);
        g.fillCircle(x, y, r);
      }
      g.generateTexture(key, size, size);
      g.destroy();
    });
  }

  private generateShieldTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.lineStyle(3, 0x7cf5ff, 1);
    g.strokeCircle(16, 16, 13);
    g.fillStyle(0x7cf5ff, 0.15);
    g.fillCircle(16, 16, 13);
    g.generateTexture('shield_powerup', 32, 32);
    g.destroy();
  }
}
