# 🚀 Nova Runner

Shooter arcade espacial construido con **Phaser 3** en el frontend y una **API REST full stack** en el backend (Node.js/Express/TypeScript + SQLite). Incluye autenticación de usuarios, persistencia de progreso y un leaderboard global — pensado como proyecto de portafolio que demuestra desarrollo end-to-end, no solo el juego.

![status](https://img.shields.io/badge/backend-9%2F9%20tests%20passing-brightgreen)
![status](https://img.shields.io/badge/typescript-strict-blue)
![status](https://img.shields.io/badge/build-passing-brightgreen)

---

## ✨ Características

- 🎮 Juego arcade completo en Phaser 3 + TypeScript: movimiento, disparo, dificultad progresiva, power-ups, partículas y screen shake.
- 🔐 Autenticación real con JWT (registro/login) y contraseñas hasheadas con bcrypt.
- 🏆 Leaderboard global persistente en SQLite.
- 🎨 Landing page y flujo de auth con diseño propio (tema espacial oscuro), sin frameworks de UI.
- 🖼️ Todas las texturas del juego se generan por código (sin assets externos que descargar).
- ✅ Tests de integración del backend (Jest + Supertest) — corriendo en CI-ready.
- 🐳 Dockerfiles + `docker-compose` para levantar todo con un solo comando.
- 📐 Arquitectura documentada (`docs/ARCHITECTURE.md`) y contrato de API documentado (`docs/API.md`).

---

## 🧱 Stack técnico

| Capa | Tecnologías |
|---|---|
| Juego | Phaser 3, TypeScript, Vite |
| Frontend web | HTML5, CSS3 (sin frameworks), Fetch API |
| Backend | Node.js, Express, TypeScript |
| Base de datos | SQLite (`better-sqlite3`) |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |
| Validación | Zod |
| Seguridad | Helmet, CORS, rate limiting |
| Testing | Jest, Supertest, ts-jest |
| Infraestructura | Docker, docker-compose, nginx |

---

## 📂 Estructura del proyecto

```
nova-runner/
├── backend/
│   ├── src/
│   │   ├── routes/          # auth, users, scores
│   │   ├── middleware/      # auth (JWT), manejo de errores
│   │   ├── app.ts           # composición de Express (testeable)
│   │   ├── server.ts        # entry point
│   │   ├── db.ts            # SQLite + migraciones
│   │   ├── jwt.ts / config.ts / logger.ts
│   ├── tests/                # tests de integración (Jest + Supertest)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── scenes/           # Boot, Preload, Menu, Game, GameOver, Leaderboard
│   │   ├── entities/          # Player, AsteroidSpawner, Starfield
│   │   ├── services/           # api.ts, session.ts, eventBus.ts
│   │   ├── main.ts             # orquestador DOM (landing/auth/juego)
│   │   └── style.css
│   ├── index.html
│   └── Dockerfile
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
└── docker-compose.yml
```

---

## 🚀 Cómo ejecutarlo

### Opción A — Docker (recomendada, un solo comando)

```bash
docker compose up --build
```

- Backend disponible en `http://localhost:4000`
- Frontend disponible en `http://localhost:8080`

### Opción B — Local, sin Docker

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # http://localhost:4000
```

**Frontend** (en otra terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # http://localhost:5173
```

---

## 🧪 Tests

```bash
cd backend
npm test
```

Cobertura actual: registro, login, validaciones de contraseña/email, envío de puntaje autenticado, rechazo de puntajes fuera de rango y orden correcto del leaderboard.

---

## 🎯 Controles del juego

| Acción | Tecla |
|---|---|
| Mover | Flechas o `WASD` |
| Disparar | `Espacio` |
| Escudo temporal | Recógelo al vuelo (power-up cian) |

Objetivo: sobrevive el mayor tiempo posible esquivando o destruyendo asteroides. El puntaje sube con el tiempo sobrevivido y con cada asteroide destruido.

---

## 📖 Documentación adicional

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — decisiones de diseño, capas y flujo de datos.
- [`docs/API.md`](./docs/API.md) — contrato completo de la API REST.

---

## 🗺️ Roadmap (mejoras futuras documentadas a propósito)

- [ ] Migración opcional a PostgreSQL + Prisma para despliegues multi-instancia.
- [ ] Anti-cheat server-side (validación de score alcanzable según duración).
- [ ] Leaderboard en tiempo real vía WebSockets.
- [ ] Tests end-to-end (Playwright) del flujo completo landing → auth → partida.
- [ ] Code-splitting por escena con `import()` dinámico.

---

## 👩‍💻 Autoría

Proyecto desarrollado como pieza de portafolio para demostrar desarrollo full stack (API REST, autenticación, base de datos, testing, containerización) integrado con desarrollo de videojuegos en Phaser 3.
