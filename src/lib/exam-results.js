// Stores finished exam attempts on the device so the dashboard can analyse
// them right after submission. Swap for a backend table when one is wired up.

const RESULTS_KEY = "kkm_exam_results";

export function saveResult(result) {
  if (typeof window === "undefined") return;
  try {
    const all = getResults();
    all.unshift(result);
    window.localStorage.setItem(RESULTS_KEY, JSON.stringify(all.slice(0, 20)));
  } catch {
    // Ignore storage errors.
  }
}

export function getResults() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLatestResult() {
  return getResults()[0] || null;
}

export function clearResults() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RESULTS_KEY);
  } catch {
    // Ignore.
  }
}
