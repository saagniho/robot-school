/**
 * Site-wide third-party identifiers. Every value here is PUBLIC and
 * submit/count-only — safe to ship in client code, never a secret.
 * An empty string switches that integration off gracefully (the UI that
 * depends on it hides itself), so the site keeps working while an account
 * is still being set up.
 */

/**
 * goatcounter.com site code — the CODE in https://CODE.goatcounter.com.
 * Register this exact code (free, no card) and pageviews start flowing;
 * also enable Settings → "Visitor counter" there so the footer odometer
 * can read the total.
 */
export const GOATCOUNTER_CODE = "robot-school";
