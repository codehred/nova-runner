import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db';
import { signToken } from '../jwt';
import { ApiError } from '../middleware/errorHandler';

export const authRouter = Router();

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(20, 'El usuario debe tener máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

interface UserRow {
  id: number;
  username: string;
  email: string;
  password_hash: string;
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const existing = db
      .prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(email, username);

    if (existing) {
      throw new ApiError(409, 'El usuario o correo ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .run(username, email, passwordHash);

    const token = signToken({ userId: Number(result.lastInsertRowid), username });

    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, username, email },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | UserRow
      | undefined;

    if (!user) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new ApiError(401, 'Credenciales inválidas');
    }

    const token = signToken({ userId: user.id, username: user.username });

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});
