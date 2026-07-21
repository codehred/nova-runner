import Phaser from 'phaser';


export class Starfield {
  private layers: Phaser.GameObjects.TileSprite[] = [];

  constructor(scene: Phaser.Scene, width: number, height: number) {
    const layerConfigs = [
      { key: 'starfield_far', alpha: 0.5 },
      { key: 'starfield_mid', alpha: 0.7 },
      { key: 'starfield_near', alpha: 1 },
    ];

    layerConfigs.forEach(({ key, alpha }) => {
      const layer = scene.add
        .tileSprite(0, 0, width, height, key)
        .setOrigin(0, 0)
        .setAlpha(alpha)
        .setDepth(-10);
      this.layers.push(layer);
    });
  }

  update(speedMultiplier = 1): void {
    this.layers.forEach((layer, i) => {
      layer.tilePositionX += (i + 1) * 0.6 * speedMultiplier;
    });
  }
}
