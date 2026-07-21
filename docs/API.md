# API — Nova Runner

Base URL local: `http://localhost:4000/api`

Todas las respuestas son JSON. Los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

---

## Salud del servicio

### `GET /health`

```json
{ "status": "ok", "timestamp": "2026-07-20T12:00:00.000Z" }
```

---

## Autenticación

### `POST /auth/register`

Crea una cuenta nueva y devuelve un token JWT.

**Body**
```json
{
  "username": "uss_dev",
  "email": "uss@example.com",
  "password": "password123"
}
```

Reglas: `username` 3–20 caracteres (letras, números, `_`), `email` válido, `password` mínimo 8 caracteres.

**201 — Respuesta**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": 1, "username": "uss_dev", "email": "uss@example.com" }
}
```

**Errores**: `400` datos inválidos · `409` usuario/correo ya registrado.

---

### `POST /auth/login`

**Body**
```json
{ "email": "uss@example.com", "password": "password123" }
```

**200 — Respuesta**: igual forma que `register`.

**Errores**: `401` credenciales inválidas.

---

## Usuario

### `GET /users/me`

Devuelve el perfil y estadísticas del usuario autenticado.

**200 — Respuesta**
```json
{
  "user": { "id": 1, "username": "uss_dev", "email": "uss@example.com", "created_at": "..." },
  "stats": { "bestScore": 4200, "gamesPlayed": 7 }
}
```

---

## Puntuaciones

### `POST /scores` 

Registra el resultado de una partida.

**Body**
```json
{ "score": 4200, "durationMs": 65000 }
```

Reglas: `score` entero 0–10,000,000 · `durationMs` entero 0–3,600,000 (1 hora).

**201 — Respuesta**
```json
{ "message": "Puntaje registrado correctamente" }
```

---

### `GET /scores/leaderboard?limit=10`

Público, no requiere autenticación. `limit` opcional, máximo 100 (por defecto 10).

**200 — Respuesta**
```json
{
  "leaderboard": [
    { "rank": 1, "username": "uss_dev", "score": 9000, "durationMs": 90000, "createdAt": "..." }
  ]
}
```

---

## Códigos de error comunes

| Código | Significado |
|---|---|
| 400 | Validación de entrada fallida (incluye detalle por campo) |
| 401 | Token ausente, inválido o credenciales incorrectas |
| 404 | Recurso o ruta no encontrada |
| 409 | Conflicto (usuario/correo duplicado) |
| 429 | Límite de peticiones excedido |
| 500 | Error interno no controlado |

Formato de error estándar:
```json
{ "error": "Descripción legible del problema" }
```

Formato de error de validación (Zod):
```json
{
  "error": "Datos de entrada inválidos",
  "details": [{ "path": "email", "message": "Correo electrónico inválido" }]
}
```
