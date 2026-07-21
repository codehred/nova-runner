import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { api, LeaderboardEntry } from '../services/api';
import { eventBus } from '../services/eventBus';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  create(): void {
    this.add
      .text(GAME_WIDTH / 2, 40, 'RANKING GLOBAL', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '26px',
        color: '#ffd166',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const loadingText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Cargando...', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        color: '#9aa0c3',
      })
      .setOrigin(0.5);

    this.loadLeaderboard(loadingText);

    const backButton = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 30, '← Volver al inicio', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '15px',
        color: '#7cf5ff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backButton.on('pointerdown', () => eventBus.emit('ui:exit-to-landing', {}));
  }

  private async loadLeaderboard(loadingText: Phaser.GameObjects.Text): Promise<void> {
    try {
      const { leaderboard } = await api.getLeaderboard(10);
      loadingText.destroy();
      this.renderLeaderboard(leaderboard);
    } catch {
      loadingText.setText('No se pudo cargar el ranking. Verifica que el backend esté activo.');
      loadingText.setColor('#ff6b6b');
    }
  }

  private renderLeaderboard(entries: LeaderboardEntry[]): void {
    if (entries.length === 0) {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Aún no hay puntajes registrados.\n¡Sé el primero!', {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '15px',
          color: '#9aa0c3',
          align: 'center',
        })
        .setOrigin(0.5);
      return;
    }

    const startY = 90;
    entries.forEach((entry, i) => {
      const y = startY + i * 30;
      const color = i === 0 ? '#ffd166' : i === 1 ? '#c9cbe0' : i === 2 ? '#e0a45f' : '#eef1ff';

      this.add.text(120, y, `#${entry.rank}`, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '15px',
        color,
      });

      this.add.text(180, y, entry.username, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '15px',
        color,
      });

      this.add
        .text(GAME_WIDTH - 120, y, `${entry.score} pts`, {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '15px',
          color,
        })
        .setOrigin(1, 0);
    });
  }
}
