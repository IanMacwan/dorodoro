export const DEFAULT_LIMIT_MINUTES = 60;

// Warnings fire at these fractions of the configured limit.
const WARNING_FRACTIONS = [0.75, 0.83, 0.92];

export function getWarningSecondsForLimit(limitMinutes) {
  const limitSeconds = limitMinutes * 60;
  return WARNING_FRACTIONS.map(f => Math.floor(limitSeconds * f));
}

/**
 * @param {number} time - elapsed time in ms
 * @param {Set<number>} warned - set of warning checkpoints (seconds) already fired
 * @param {number} limitMinutes - configured limit in minutes
 */
export function check(time, warned, limitMinutes = DEFAULT_LIMIT_MINUTES) {
  const seconds = Math.floor(time / 1000);
  const limitMs = limitMinutes * 60 * 1000;
  const warnings = getWarningSecondsForLimit(limitMinutes);

  if (time >= limitMs) {
    return { type: "FINAL", seconds };
  }
  for (const w of warnings) {
    if (seconds >= w && !warned.has(w)) {
      warned.add(w);
      return { type: "WARNING", seconds: w };
    }
  }
  return null;
}
