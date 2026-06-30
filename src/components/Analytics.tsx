"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

/**
 * PostHog analytics — only initializes when NEXT_PUBLIC_POSTHOG_KEY is set, so
 * local dev (and any deploy without the key) stays analytics-free and silent.
 */
export function Analytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
      person_profiles: "identified_only",
    });
  }, []);
  return null;
}
