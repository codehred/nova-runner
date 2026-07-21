import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './config/gameConfig';
import { api } from './services/api';
import { setSession, getSession } from './services/session';
import { eventBus } from './services/eventBus';
import { setInitialSceneOverride } from './services/gameIntent';

// --- Referencias DOM ---
const screens = {
  landing: document.getElementById('landing') as HTMLElement,
  auth: document.getElementById('auth-overlay') as HTMLElement,
  game: document.getElementById('game-screen') as HTMLElement,
};

const btnPlay = document.getElementById('btn-play') as HTMLButtonElement;
const btnLeaderboard = document.getElementById('btn-leaderboard') as HTMLButtonElement;
const btnCloseAuth = document.getElementById('btn-close-auth') as HTMLButtonElement;
const btnGuest = document.getElementById('btn-guest') as HTMLButtonElement;
const btnExitGame = document.getElementById('btn-exit-game') as HTMLButtonElement;
const hudUser = document.getElementById('hud-user') as HTMLElement;

const tabLogin = document.getElementById('tab-login') as HTMLButtonElement;
const tabRegister = document.getElementById('tab-register') as HTMLButtonElement;
const formLogin = document.getElementById('form-login') as HTMLFormElement;
const formRegister = document.getElementById('form-register') as HTMLFormElement;
const loginError = document.getElementById('login-error') as HTMLElement;
const registerError = document.getElementById('register-error') as HTMLElement;

let game: Phaser.Game | null = null;

function showScreen(screen: keyof typeof screens): void {
  Object.entries(screens).forEach(([key, el]) => {
    el.classList.toggle('hidden', key !== screen);
  });
}

function updateHud(): void {
  const session = getSession();
  hudUser.textContent = session ? `Jugando como ${session.user.username}` : 'Modo invitado';
}

function launchGame(): void {
  updateHud();
  showScreen('game');

  if (!game) {
    game = new Phaser.Game(gameConfig);
  }
}

function destroyGame(): void {
  if (game) {
    game.destroy(true);
    game = null;
  }
}

// --- Navegación landing → auth / juego ---
btnPlay.addEventListener('click', () => {
  if (getSession()) {
    launchGame();
  } else {
    showScreen('auth');
  }
});

btnLeaderboard.addEventListener('click', () => {
  setInitialSceneOverride('LeaderboardScene');
  launchGame();
});

btnCloseAuth.addEventListener('click', () => showScreen('landing'));

btnGuest.addEventListener('click', () => {
  setSession(null);
  launchGame();
});

function exitToLanding(): void {
  destroyGame();
  showScreen('landing');
}

btnExitGame.addEventListener('click', exitToLanding);

// --- Tabs de autenticación ---
function activateTab(tab: 'login' | 'register'): void {
  tabLogin.classList.toggle('active', tab === 'login');
  tabRegister.classList.toggle('active', tab === 'register');
  formLogin.classList.toggle('hidden', tab !== 'login');
  formRegister.classList.toggle('hidden', tab !== 'register');
}

tabLogin.addEventListener('click', () => activateTab('login'));
tabRegister.addEventListener('click', () => activateTab('register'));

// --- Formularios ---
formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';

  const email = (document.getElementById('login-email') as HTMLInputElement).value;
  const password = (document.getElementById('login-password') as HTMLInputElement).value;

  try {
    const { token, user } = await api.login(email, password);
    setSession({ token, user });
    launchGame();
  } catch (err) {
    loginError.textContent = err instanceof Error ? err.message : 'Error al iniciar sesión';
  }
});

formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.textContent = '';

  const username = (document.getElementById('register-username') as HTMLInputElement).value;
  const email = (document.getElementById('register-email') as HTMLInputElement).value;
  const password = (document.getElementById('register-password') as HTMLInputElement).value;

  try {
    const { token, user } = await api.register(username, email, password);
    setSession({ token, user });
    launchGame();
  } catch (err) {
    registerError.textContent = err instanceof Error ? err.message : 'Error al registrarse';
  }
});

// --- Reacciona a eventos emitidos desde el juego (ej. futuras integraciones: analytics, sonido, etc.) ---
eventBus.on('game:over', ({ score }) => {
  // Punto de extensión: aquí se podrían disparar notificaciones,
  // confetti, o analítica de producto sin acoplar el juego al DOM.
  console.info(`Partida finalizada con ${score} puntos`);
});

// El botón "← Volver al inicio" del ranking (dentro del canvas de Phaser)
// pide salir por completo al landing, en vez de quedarse dando vueltas
// dentro de las escenas internas del juego.
eventBus.on('ui:exit-to-landing', () => exitToLanding());

// Estado inicial
showScreen('landing');
