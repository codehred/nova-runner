type EventMap = {
  'game:over': { score: number; durationMs: number };
  'game:score-updated': { score: number };
  'ui:exit-to-landing': Record<string, never>;
};

type Listener<K extends keyof EventMap> = (payload: EventMap[K]) => void;

class EventBus {
  private target = new EventTarget();

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.target.dispatchEvent(new CustomEvent(event, { detail: payload }));
  }

  on<K extends keyof EventMap>(event: K, listener: Listener<K>): void {
    this.target.addEventListener(event, ((e: CustomEvent<EventMap[K]>) =>
      listener(e.detail)) as EventListener);
  }
}

export const eventBus = new EventBus();
