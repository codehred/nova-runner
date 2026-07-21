import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger';

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Middleware de error de 4 argumentos: Express lo reconoce como
 * error handler por su firma, sin importar que no se use `next`.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: err.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    });
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error('Error no controlado', { error: err instanceof Error ? err.stack : err });
  res.status(500).json({ error: 'Error interno del servidor' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
