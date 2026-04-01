const LIMIT = 60 * 60 * 1000;
const WARNINGS = [45, 50, 55];

export function check(time, warned) {
  const minutes = Math.floor(time / 60000);

  if (time >= LIMIT) return { type: "FINAL" };

  if (WARNINGS.includes(minutes) && !warned.has(minutes)) {
    return { type: "WARNING", minutes };
  }

  return null;
}
