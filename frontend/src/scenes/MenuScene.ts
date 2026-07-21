import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { Starfield } from '../entities/Starfield';
import { consumeInitialSceneOverride } from '../services/gameIntent';

export class MenuScene extends Phaser.Scene {
  private starfield!: Starfield;

  constructor() {
    super('MenuScene');
  }

  create(): void {
   
    const override = consumeInitialSceneOverride();
    if (override === 'LeaderboardScene') {
      this.scene.start('LeaderboardScene');
      return;
    }

    this.starfield = new Starfield(this, GAME_WIDTH, GAME_HEIGHT);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, 'NOVA RUNNER', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '48px',
        color: '#7cf5ff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setShadow(0, 0, '#7cf5ff', 12, true, true);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 - 10,
        'Flechas / WASD para moverte · ESPACIO para disparar\nEsquiva los asteroides o destrúyelos antes de que te alcancen',
        {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '15px',
          color: '#9aa0c3',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    const startButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, '▶  JUGAR', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#05060f',
        backgroundColor: '#ffd166',
        padding: { x: 26, y: 12 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: startButton,
      scale: { from: 1, to: 1.04 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    startButton.on('pointerover', () => startButton.setStyle({ backgroundColor: '#ffe08a' }));
    startButton.on('pointerout', () => startButton.setStyle({ backgroundColor: '#ffd166' }));

    startButton.on('pointerdown', () => this.startGame());
    this.input.keyboard?.once('keydown-SPACE', () => this.startGame());
  }

  update(): void {
    this.starfield?.update(0.5);
  }

  private startGame(): void {
    this.scene.start('GameScene');
  }
}
