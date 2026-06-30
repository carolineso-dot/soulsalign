"use client";

import { useEffect } from "react";

/** Registers the service worker so Souls Align is installable / works offline. */
export function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // registration failures are non-fatal
      });
    }
  }, []);
  return null;
}
