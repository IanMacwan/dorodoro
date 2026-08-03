import { api } from "./api.js";
import { DEFAULT_LIMIT_MINUTES } from "../application/rulesEngine.js";

const STORAGE_KEY = "timeLimitMinutes";
const ENABLED_KEY = "limitEnabled";

const MIN_MINUTES = 1;
const MAX_MINUTES = 300;

export function clampLimit(minutes) {
  const n = Number(minutes);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT_MINUTES;
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(n)));
}

export async function getLimitMinutes() {
  const result = await api.storage.sync.get({
    [STORAGE_KEY]: DEFAULT_LIMIT_MINUTES
  });
  return clampLimit(result[STORAGE_KEY]);
}

export async function setLimitMinutes(minutes) {
  const clamped = clampLimit(minutes);
  await api.storage.sync.set({ [STORAGE_KEY]: clamped });
  return clamped;
}

export async function getLimitEnabled() {
  const result = await api.storage.sync.get({ [ENABLED_KEY]: true });
  return !!result[ENABLED_KEY];
}

export async function setLimitEnabled(enabled) {
  await api.storage.sync.set({ [ENABLED_KEY]: !!enabled });
  return !!enabled;
}

export function onSettingsChanged(callback) {
  api.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    if (changes[STORAGE_KEY] || changes[ENABLED_KEY]) {
      callback({
        limitMinutes: changes[STORAGE_KEY]?.newValue,
        enabled: changes[ENABLED_KEY]?.newValue
      });
    }
  });
}

export const LIMITS = { MIN_MINUTES, MAX_MINUTES };
