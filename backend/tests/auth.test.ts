import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('POST /api/auth/register', () => {
  it('registra un nuevo usuario y devuelve un token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'karol_dev',
      email: 'karol@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('karol_dev');
  });

  it('rechaza contraseñas demasiado cortas', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'otro_user',
      email: 'otro@example.com',
      password: '123',
    });

    expect(res.status).toBe(400);
  });

  it('rechaza correos duplicados', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'user_uno',
      email: 'duplicado@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/register').send({
      username: 'user_dos',
      email: 'duplicado@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      username: 'login_user',
      email: 'login@example.com',
      password: 'password123',
    });
  });

  it('inicia sesión con credenciales válidas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rechaza contraseña incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'incorrecta',
    });

    expect(res.status).toBe(401);
  });
});
