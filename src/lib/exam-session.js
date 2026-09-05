// Lightweight client-side "session" so the registration number entered at
// login can be reused on the exam page (watermarking, violation logs, etc).
// This is intentionally simple — swap for real auth/session cookies once a
// backend is connected.

const STORAGE_KEY = "kkm_session";

export function saveSession({ role, regNo }) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ role, regNo }));
  } catch {
    // Ignore storage errors (e.g. private browsing quota).
  }
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
