declare global {
  interface Window {
    fbq?: (
      action: "track" | "trackCustom",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * Fire a Meta Pixel STANDARD event ("Lead", "CompleteRegistration", "Contact"…).
 * Standard events get automatic optimization support in Ads Manager.
 * No-op on the server or if the pixel hasn't loaded.
 */
export function trackFbEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", eventName, params);
}
