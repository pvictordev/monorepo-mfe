import { mount, unmount } from "svelte";
import RemoteCounter from "./RemoteCounter.svelte";

export type RemoteCounterProps = {
  initialCount?: number;
};

export function mountRemoteCounter(target: HTMLElement, props: RemoteCounterProps = {}) {
  const instance = mount(RemoteCounter, {
    target,
    props,
  });

  return () => unmount(instance);
}
