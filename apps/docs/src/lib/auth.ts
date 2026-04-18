import { createSessionStore } from "@repo/shared";
import type { Session } from "@repo/shared";
import { writable } from "svelte/store";

const sessionStore = createSessionStore(null);
const session = writable<Session | null>(null);

sessionStore.subscribe((value) => {
  session.set(value);
});

export { session };
export const setSession = (value: Session | null) => sessionStore.set(value);
