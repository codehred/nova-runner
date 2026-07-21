import { Router } from 'express';
import { db } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

export const usersRouter = Router();

interface UserProfileRow {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface StatsRow {
  best_score: number | null;
  games_played: number;
}

usersRouter.get('/me', requireAuth, (req: AuthRequest, res, next) => {
  try {
    const user = db
      .prepare('SELECT id, username, email, created_at FROM users WHERE id = ?')
      .get(req.user!.userId) as UserProfileRow | undefined;

    if (!user) {
      throw new ApiError(404, 'Usuario no encontrado');
    }

    const stats = db
      .prepare(
        'SELECT MAX(score) as best_score, COUNT(*) as games_played FROM scores WHERE user_id = ?'
      )
      .get(user.id) as StatsRow;

    res.json({
      user,
      stats: {
        bestScore: stats.best_score ?? 0,
        gamesPlayed: stats.games_played,
      },
    });
  } catch (err) {
    next(err);
  }
});
