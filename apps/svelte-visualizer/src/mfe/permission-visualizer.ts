import { mount, unmount } from "svelte";
import PermissionVisualizer from "../lib/PermissionVisualizer.svelte";

export type PermissionVisualizerProps = {
  apiBase?: string;
  initialUserId?: string;
};

export function mountPermissionVisualizer(target: HTMLElement, props: PermissionVisualizerProps = {}) {
  const instance = mount(PermissionVisualizer, {
    target,
    props,
  });

  return () => unmount(instance);
}
