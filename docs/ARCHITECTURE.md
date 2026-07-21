# Arquitectura — Nova Runner

## Visión general

Nova Runner es una aplicación full stack compuesta por dos servicios independientes que se comunican por HTTP/JSON:

```
┌─────────────────────────┐        HTTPS/JSON        ┌──────────────────────────┐
│        Frontend         │ ────────────────────────▶ │         Backend         │
│  Vite + TypeScript +    │ ◀──────────────────────── │  Node.js + Express +    │
│  Phaser 3 (SPA)         │                            │  TypeScript + SQLite    │
└─────────────────────────┘                            └──────────────────────────┘
```

Esta separación permite:
- Desplegar el juego como sitio estático (CDN, Netlify, Vercel, nginx) independientemente del API.
- Escalar o reemplazar el backend sin tocar el cliente (mismo contrato HTTP).
- Ejecutar el backend de forma aislada, testeable con `supertest` sin depender de un navegador.

## Backend

### Capas

```
routes/        → define endpoints HTTP y validación de entrada (Zod)
middleware/     → auth (JWT), manejo centralizado de errores
db.ts           → conexión SQLite + migraciones idempotentes
jwt.ts          → firma/verificación de tokens
config.ts       → configuración tipada leída de variables de entorno
app.ts          → composición de la app Express (testeable sin levantar puerto)
server.ts       → punto de entrada que sí levanta el servidor HTTP
```

### Decisiones de diseño

- **`app.ts` separado de `server.ts`**: permite testear la app completa con `supertest`
  sin abrir un socket real, haciendo los tests rápidos y deterministas.
- **SQLite + `better-sqlite3`**: operaciones síncronas (sin overhead de callbacks/promesas
  para queries simples), cero configuración de infraestructura, ideal para un proyecto
  de portafolio que debe poder clonarse y ejecutarse en segundos. Migrar a PostgreSQL
  implicaría solo cambiar `db.ts` y las queries parametrizadas — el resto de la app
  no conoce detalles de la base de datos.
- **JWT sin estado**: el backend no mantiene sesiones en memoria/DB, lo que simplifica
  escalar horizontalmente (cualquier instancia puede verificar cualquier token).
- **Validación con Zod en el borde (routes)**: los controladores nunca reciben datos
  sin validar; los errores de validación se transforman automáticamente en HTTP 400
  vía el middleware de errores central.
- **`ApiError` + middleware de error único**: evita `try/catch` repetido con lógica de
  status code dispersa; cada ruta simplemente `throw new ApiError(404, '...')`.

### Seguridad aplicada

| Medida | Dónde |
|---|---|
| Hash de contraseñas (bcrypt, 12 rounds) | `routes/auth.ts` |
| JWT firmado con secreto de entorno | `jwt.ts` |
| Rate limiting (300 req / 15 min por IP) | `app.ts` |
| Headers de seguridad (Helmet) | `app.ts` |
| CORS restringido a origen configurado | `app.ts` |
| Validación estricta de entrada (Zod) | `routes/*.ts` |
| Límite de tamaño de body (10kb) | `app.ts` |

## Frontend

### Capas

```
config/gameConfig.ts   → configuración central de Phaser (dimensiones, escenas, física)
scenes/                 → una clase por pantalla del juego (Boot, Preload, Menu, Game, GameOver, Leaderboard)
entities/                → clases reutilizables (Player, AsteroidSpawner, Starfield) desacopladas de una escena específica
services/                → api.ts (cliente HTTP), session.ts (persistencia de sesión), eventBus.ts (juego → DOM)
main.ts                  → orquestador de la capa DOM (landing, auth, montaje/desmontaje del juego)
```

### Decisiones de diseño

- **Texturas generadas por código, no imágenes**: `PreloadScene` dibuja todos los
  sprites con `Phaser.Graphics.generateTexture`. Esto elimina la dependencia de
  assets externos (licencias, tamaño de repo, tiempos de carga) y demuestra manejo
  de la API gráfica de Phaser.
- **Separación DOM / Canvas**: el landing, login/registro y HUD superior son HTML/CSS
  real (mejor accesibilidad, SEO, formularios nativos), mientras que el juego en sí
  vive dentro del `<canvas>` de Phaser. `main.ts` monta y destruye `Phaser.Game` bajo
  demanda para no consumir recursos antes de que el usuario decida jugar.
- **`eventBus.ts`**: comunica el mundo Phaser con el mundo DOM sin acoplarlos
  directamente (por ejemplo, para futuras integraciones de analítica o sonido fuera
  del canvas).
- **Entidades como clases, no funciones sueltas en la escena**: `Player`,
  `AsteroidSpawner` y `Starfield` encapsulan su propio estado y lógica de update,
  lo que mantiene `GameScene` legible y cada pieza testeable/reemplazable de forma
  aislada.
- **Dificultad progresiva basada en tiempo transcurrido**: `AsteroidSpawner` reduce
  el intervalo de spawn linealmente hasta un piso, en vez de saltos abruptos.

## Flujo de una partida

1. `MenuScene` espera input → `GameScene.create()` inicializa jugador, spawner y HUD.
2. Cada `update()`: se procesa input, se actualiza el spawner, se detectan
   colisiones (bala↔asteroide, jugador↔asteroide, jugador↔power-up).
3. Al perder la última vida, `GameScene` emite `game:over` por el `eventBus` y
   transiciona a `GameOverScene`, pasando `score` y `durationMs` como datos de escena.
4. `GameOverScene` intenta enviar el puntaje al backend (`POST /api/scores`) si hay
   sesión activa; en modo invitado solo lo informa en pantalla.

## Posibles evoluciones (fuera del alcance actual, documentadas a propósito)

- Migrar SQLite → PostgreSQL + Prisma para despliegues multi-instancia.
- Anti-cheat server-side más robusto (validar que `score` sea alcanzable dado `durationMs`).
- WebSockets para leaderboard en tiempo real.
- Code-splitting adicional por escena con `import()` dinámico.
- Tests end-to-end con Playwright cubriendo el flujo landing → auth → partida.
