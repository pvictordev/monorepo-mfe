import type { Session } from "./types";

type Listener = (session: Session | null) => void;

export const createSessionStore = (initialSession: Session | null = null) => {
  let session = initialSession;
  const listeners = new Set<Listener>();

  return {
    get: () => session,
    set: (nextSession: Session | null) => {
      session = nextSession;
      listeners.forEach((listener) => listener(session));
    },
    subscribe: (listener: Listener) => {
      listeners.add(listener);
      listener(session);

      return () => {
        listeners.delete(listener);
      };
    },
  };
};
