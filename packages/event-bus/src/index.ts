import { DomainEventSchema, type DomainEvent, type DomainEventType } from "@repo/contracts";

const browserEventName = "permission-mfe:event";
const busDisabledKey = "__permissionMfeBusDisabled";

declare global {
  interface Window {
    __permissionMfeBusDisabled?: boolean;
  }
}

type EventFor<Type extends DomainEventType> = Extract<DomainEvent, { type: Type }>;

export type PublishResult = {
  ok: boolean;
  reason?: string;
};

function getWindow(): Window | null {
  return typeof window === "undefined" ? null : window;
}

export function isEventBusEnabled(): boolean {
  const currentWindow = getWindow();

  return currentWindow ? currentWindow[busDisabledKey] !== true : false;
}

export function setEventBusEnabled(enabled: boolean, reason?: string): PublishResult {
  const currentWindow = getWindow();

  if (!currentWindow) {
    return { ok: false, reason: "Event bus is only available in a browser." };
  }

  currentWindow[busDisabledKey] = !enabled;

  const event = DomainEventSchema.parse({
    type: "BUS_STATUS_CHANGED",
    payload: { enabled, reason },
  });

  currentWindow.dispatchEvent(new CustomEvent(browserEventName, { detail: event }));

  return { ok: true };
}

export function publishDomainEvent(event: DomainEvent): PublishResult {
  const currentWindow = getWindow();
  const parsedEvent = DomainEventSchema.parse(event);

  if (!currentWindow) {
    return { ok: false, reason: "Event bus is only available in a browser." };
  }

  if (!isEventBusEnabled() && parsedEvent.type !== "BUS_STATUS_CHANGED") {
    return { ok: false, reason: "Event bus failure is currently simulated." };
  }

  currentWindow.dispatchEvent(new CustomEvent(browserEventName, { detail: parsedEvent }));

  return { ok: true };
}

export function subscribeToDomainEvent<Type extends DomainEventType>(
  type: Type,
  handler: (event: EventFor<Type>) => void,
): () => void {
  const currentWindow = getWindow();

  if (!currentWindow) {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<unknown>;
    const result = DomainEventSchema.safeParse(customEvent.detail);

    if (!result.success || result.data.type !== type) {
      return;
    }

    handler(result.data as EventFor<Type>);
  };

  currentWindow.addEventListener(browserEventName, listener);

  return () => currentWindow.removeEventListener(browserEventName, listener);
}
