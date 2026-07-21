/**
 * Permite que la capa DOM (main.ts) le indique al juego qué pantalla
 * debe mostrar apenas termine de arrancar, sin forzar transiciones de
 * escena desde fuera del ciclo de vida de Phaser (lo cual causaba
 * condiciones de carrera: dos escenas activas al mismo tiempo).
 */
let initialSceneOverride: 'LeaderboardScene' | null = null;

export function setInitialSceneOverride(scene: 'LeaderboardScene' | null): void {
  initialSceneOverride = scene;
}

export function consumeInitialSceneOverride(): 'LeaderboardScene' | null {
  const value = initialSceneOverride;
  initialSceneOverride = null;
  return value;
}
