import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig';
import { getSession } from '../services/session';
import { api } from '../services/api';

interface GameOverData {
  score: number;
  durationMs: number;
}

export class GameOverScene extends Phaser.Scene {
  private result!: GameOverData;

  constructor() {
    super('GameOverScene');
  }

  init(data: GameOverData): void {
    this.result = data;
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, 90, 'FIN DE LA PARTIDA', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '30px',
        color: '#ff6b6b',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 150, `Puntaje final: ${this.result.score}`, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '22px',
        color: '#eef1ff',
      })
      .setOrigin(0.5);

    const statusText = this.add
      .text(GAME_WIDTH / 2, 190, 'Guardando puntaje...', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '14px',
        color: '#9aa0c3',
      })
      .setOrigin(0.5);

    this.submitScore(statusText);

    this.createButton(GAME_WIDTH / 2, 280, 'Reintentar', () => this.scene.start('GameScene'));
    this.createButton(GAME_WIDTH / 2, 330, 'Ver ranking global', () => this.scene.start('LeaderboardScene'));
    this.createButton(GAME_WIDTH / 2, 380, 'Menú principal', () => this.scene.start('MenuScene'));
  }

  private async submitScore(statusText: Phaser.GameObjects.Text): Promise<void> {
    const session = getSession();

    if (!session) {
      statusText.setText('Modo invitado: el puntaje no se guardó. Inicia sesión para aparecer en el ranking.');
      return;
    }

    try {
      await api.submitScore(session.token, this.result.score, Math.round(this.result.durationMs));
      statusText.setText('✓ Puntaje guardado en tu perfil');
      statusText.setColor('#7cf5ff');
    } catch {
      statusText.setText('No se pudo guardar el puntaje (revisa tu conexión)');
    }
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add
      .text(x, y, label, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '17px',
        color: '#05060f',
        backgroundColor: '#7cf5ff',
        padding: { x: 18, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#4fd1ff' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#7cf5ff' }));
    button.on('pointerdown', onClick);
  }
}
