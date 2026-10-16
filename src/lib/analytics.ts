import { track } from "@vercel/analytics";

export function trackEvent(name: string, properties?: Record<string, string | number | boolean>) {
  try {
    track(name, properties);
  } catch (err) {
    console.debug("Analytics track error:", err);
  }
}
