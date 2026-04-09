import { api } from "./api.js";

export const KEY_TIME_LIMIT_MINUTES = "timeLimitMinutes";

export const DEFAULT_TIME_LIMIT_MINUTES = 60;
export const MIN_TIME_LIMIT_MINUTES = 1;
export const MAX_TIME_LIMIT_MINUTES = 300;

export function sanitizeTimeLimitMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_TIME_LIMIT_MINUTES;

  const int = Math.round(n);
  if (int < MIN_TIME_LIMIT_MINUTES) return MIN_TIME_LIMIT_MINUTES;
  if (int > MAX_TIME_LIMIT_MINUTES) return MAX_TIME_LIMIT_MINUTES;
  return int;
}

export async function getTimeLimitMinutes() {
  try {
    const result = await api.storage?.local?.get({
      [KEY_TIME_LIMIT_MINUTES]: DEFAULT_TIME_LIMIT_MINUTES
    });
    return sanitizeTimeLimitMinutes(result?.[KEY_TIME_LIMIT_MINUTES]);
  } catch {
    return DEFAULT_TIME_LIMIT_MINUTES;
  }
}

export async function setTimeLimitMinutes(minutes) {
  const value = sanitizeTimeLimitMinutes(minutes);
  await api.storage?.local?.set({ [KEY_TIME_LIMIT_MINUTES]: value });
  return value;
}
