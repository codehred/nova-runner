import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

async function registerAndGetToken(username: string, email: string): Promise<string> {
  const res = await request(app).post('/api/auth/register').send({
    username,
    email,
    password: 'password123',
  });
  return res.body.token as string;
}

describe('POST /api/scores', () => {
  it('rechaza el envío de puntaje sin autenticación', async () => {
    const res = await request(app).post('/api/scores').send({ score: 100, durationMs: 5000 });
    expect(res.status).toBe(401);
  });

  it('registra un puntaje válido para un usuario autenticado', async () => {
    const token = await registerAndGetToken('score_user', 'score@example.com');

    const res = await request(app)
      .post('/api/scores')
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 4200, durationMs: 65000 });

    expect(res.status).toBe(201);
  });

  it('rechaza puntajes fuera de rango', async () => {
    const token = await registerAndGetToken('score_user2', 'score2@example.com');

    const res = await request(app)
      .post('/api/scores')
      .set('Authorization', `Bearer ${token}`)
      .send({ score: -5, durationMs: 1000 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/scores/leaderboard', () => {
  it('devuelve el top de puntajes ordenado descendentemente', async () => {
    const tokenA = await registerAndGetToken('leader_a', 'leader_a@example.com');
    const tokenB = await registerAndGetToken('leader_b', 'leader_b@example.com');

    await request(app)
      .post('/api/scores')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ score: 1500, durationMs: 30000 });

    await request(app)
      .post('/api/scores')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ score: 9000, durationMs: 90000 });

    const res = await request(app).get('/api/scores/leaderboard?limit=5');

    expect(res.status).toBe(200);
    expect(res.body.leaderboard.length).toBeGreaterThanOrEqual(2);
    expect(res.body.leaderboard[0].score).toBeGreaterThanOrEqual(res.body.leaderboard[1].score);
  });
});
