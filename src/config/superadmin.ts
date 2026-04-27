// Hardcoded Superadmin credentials.
// NOTE: Anything in frontend code is visible to anyone who inspects the JS bundle.
// Change these values here to update the Superadmin login.
export const SUPERADMIN_USERNAME = "superadmin";
export const SUPERADMIN_PASSWORD = "pccoe@2026";

export const SUPERADMIN_SESSION_KEY = "superadmin";

export const isSuperadmin = (): boolean =>
  typeof window !== "undefined" &&
  sessionStorage.getItem(SUPERADMIN_SESSION_KEY) === "true";