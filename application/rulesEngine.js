const DEFAULT_LIMIT_MINUTES = 60;
const MIN_LIMIT_MINUTES = 1;
const MAX_LIMIT_MINUTES = 300;

// Match the old 45/50/55 of 60 behavior, but scale with configured limit.
const WARNING_RATIOS = [0.75, 50 / 60, 55 / 60];

function sanitizeLimitMinutes(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_LIMIT_MINUTES;

  const int = Math.round(n);
  if (int < MIN_LIMIT_MINUTES) return MIN_LIMIT_MINUTES;
  if (int > MAX_LIMIT_MINUTES) return MAX_LIMIT_MINUTES;
  return int;
}

function buildWarningSeconds(limitSeconds) {
  const uniq = new Set();
  for (const r of WARNING_RATIOS) {
    const w = Math.floor(limitSeconds * r);
    if (w > 0 && w < limitSeconds) uniq.add(w);
  }
  return [...uniq].sort((a, b) => a - b);
}

export function check(timeMs, warned, limitMinutes = DEFAULT_LIMIT_MINUTES) {
  const minutes = sanitizeLimitMinutes(limitMinutes);
  const limitMs = minutes * 60 * 1000;
  const limitSeconds = minutes * 60;

  const seconds = Math.floor(timeMs / 1000);

  if (timeMs >= limitMs) {
    return { type: "FINAL", seconds, limitMs };
  }

  const warnings = buildWarningSeconds(limitSeconds);
  for (const w of warnings) {
    if (seconds >= w && !warned.has(w)) {
      warned.add(w);
      return { type: "WARNING", seconds: w, limitMs };
    }
  }

  return null;
}
