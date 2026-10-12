"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during SSR/prerender and the hydration pass, true afterwards. Used to keep submit
 * buttons disabled until React's onSubmit handlers are attached, so an early click can't
 * trigger a native form submission.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
