// Hardcoded Superadmin credentials.
// NOTE: Anything in frontend code is visible to anyone who inspects the JS bundle.
// Change these values here to update the Superadmin login.
export const SUPERADMIN_USERNAME = "anshulsanjaywagh@gmail.com";
export const SUPERADMIN_PASSWORD = "anshul@12";

export const SUPERADMIN_SESSION_KEY = "superadmin";

export const isSuperadmin = (): boolean =>
  typeof window !== "undefined" &&
  sessionStorage.getItem(SUPERADMIN_SESSION_KEY) === "true";