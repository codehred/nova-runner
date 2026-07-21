import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export const scoresRouter = Router();

const submitScoreSchema = z.object({
  score: z.number().int().nonnegative().max(10_000_000, 'Puntaje fuera de rango'),
  durationMs: z.number().int().nonnegative().max(3_600_000, 'Duración fuera de rango'),
});

interface LeaderboardRow {
  username: string;
  score: number;
  duration_ms: number;
  created_at: string;
}

/**
 * Envío de puntaje. Requiere autenticación para evitar entradas anónimas
 * y facilitar el historial de "mejores partidas" por usuario.
 *
 * Nota sobre anti-cheat: esta es una validación básica de rango
 * (protección de superficie mínima). Un sistema productivo real
 * añadiría heurísticas server-side (ej. score máximo alcanzable
 * según duration_ms) o replay validation; se documenta como
 * mejora futura en README.
 */
scoresRouter.post('/', requireAuth, (req: AuthRequest, res, next) => {
  try {
    const { score, durationMs } = submitScoreSchema.parse(req.body);

    db.prepare('INSERT INTO scores (user_id, score, duration_ms) VALUES (?, ?, ?)').run(
      req.user!.userId,
      score,
      durationMs
    );

    res.status(201).json({ message: 'Puntaje registrado correctamente' });
  } catch (err) {
    next(err);
  }
});

scoresRouter.get('/leaderboard', (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 100);

    const rows = db
      .prepare(
        `SELECT u.username as username, s.score as score, s.duration_ms as duration_ms, s.created_at as created_at
         FROM scores s
         JOIN users u ON u.id = s.user_id
         ORDER BY s.score DESC
         LIMIT ?`
      )
      .all(limit) as LeaderboardRow[];

    res.json({
      leaderboard: rows.map((row, index) => ({
        rank: index + 1,
        username: row.username,
        score: row.score,
        durationMs: row.duration_ms,
        createdAt: row.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});
