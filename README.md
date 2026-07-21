# 🚀 NovaRunner

Space arcade shooter built with **Phaser 3** on the frontend and a **full stack REST API** on the backend (Node.js/Express/TypeScript + SQLite). Includes user authentication, progress persistence and a global leaderboard.

![status](https://img.shields.io/badge/backend-9%2F9%20tests%20passing-brightgreen)
![status](https://img.shields.io/badge/typescript-strict-blue)
![status](https://img.shields.io/badge/build-passing-brightgreen)

---

## Characteristics

- Complete arcade game in Phaser 3 + TypeScript: movement, shooting, progressive difficulty, power-ups, particles and screen shake.
- Real authentication with JWT (registration/login) and passwords hashed with bcrypt.

Persistent global leaderboard in SQLite.

Custom-designed landing page and authentication flow (dark space theme), no UI frameworks.

All game textures are generated code-wise (no external assets to download).

Backend integration tests (Jest + Supertest) — running on CI-ready.

Dockerfiles + `docker-compose` to launch everything with a single command.

Documented architecture (`docs/ARCHITECTURE.md`) and documented API contract (`docs/API.md`).

--

## Technical Stack

| Layer | Technologies |

---|---|

| Game | Phaser 3, TypeScript, Vite |

| Web Frontend | HTML5, CSS3 (no frameworks), Fetch API |

| Backend | Node.js, Express, TypeScript |
| Database | SQLite (`better-sqlite3`) |
| Auth | JWT (`jsonwebtoken`), `bcryptjs` |
| Validation | Zod |
| Security | Helmet, CORS, rate limiting |
| Testing | Jest, Supertest, ts-jest |
| Infrastructure | Docker, docker-compose, nginx |

---

## 📂 Project Structure

```
nova-runner/
├── backend/
│ ├── src/
│ │ ├── routes/ # auth, users, scores
│ │ ├── middleware/ # auth (JWT), error handling
│ │ ├── app.ts # Express composition (testable)
│ │ ├── server.ts # entry point
│ │ ├── db.ts # SQLite + migrations
│ │ ├── jwt.ts / config.ts / logger.ts
│ ├── tests/ # integration tests (Jest + Supertest)
│ └── Dockerfile
├── frontend/
│ ├── src/
│ │ ├── scenes/ # Boot, Preload, Menu, Game, GameOver, Leaderboard
│ │ ├── entities/ # Player, AsteroidSpawner, Starfield
│ │ ├── services/ # api.ts, session.ts, eventBus.ts
│ │ ├── main.ts # DOM orchestrator (landing/auth/game)
│ │ └── style.css
│ ├── index.html
│ └── Dockerfile
├── docs/
│ ├── ARCHITECTURE.md
│ └── API.md
└── docker-compose.yml
```

---

## How to run it

### Option A — Docker

```bash
docker compose up --build
```

- Backend available at `http://localhost:4000`
- Frontend available at `http://localhost:8080`

### Option B — Local, without Docker

**Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev # http://localhost:4000
```

**Frontend** (in another terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev # http://localhost:5173
```

---

## Tests

```bash
cd backend
npm test
```

Current coverage: registration, login, password/email validation, authenticated score submission, rejection of out-of-range scores, and correct leaderboard order.

---

## Game Controls

| Action | Key |

---|---|

Move | Arrow keys or `WASD` |

Shoot | `Space` |

Temporary Shield | Catch it on the fly (cyan power-up) |

Objective: Survive as long as possible by dodging or destroying asteroids. The score increases with survival time and with each asteroid destroyed.

---

## Additional Documentation

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — design decisions, layers, and data flow.

- [`docs/API.md`](./docs/API.md) — complete REST API contract.

---

## Roadmap (documented future improvements)

- [ ] Optional migration to PostgreSQL + Prisma for multi-instance deployments.
- [ ] Server-side anti-cheat (score validation based on duration).
- [ ] Real-time leaderboard via WebSockets.
- [ ] End-to-end tests (Playwright) of the complete landing → auth → game flow.
- [ ] Code splitting by scene with dynamic `import()`.
