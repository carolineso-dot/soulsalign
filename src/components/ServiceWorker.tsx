"use client";

import { useEffect } from "react";

/**
 * Registers the service worker in production so Souls Align is installable and
 * works offline. In development it does the opposite: unregisters any existing
 * worker and clears its caches, so stale cached bundles never mask code changes.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // registration failures are non-fatal
    });
  }, []);
  return null;
}
