const LIMIT = 60 * 60 * 1000; // 60 minutes
const WARNINGS = [45 * 60, 50 * 60, 55 * 60]; // seconds

export function check(time, warned) {
  const seconds = Math.floor(time / 1000);

  if (time >= LIMIT) {
    return { type: "FINAL", seconds };
  }

  for (const w of WARNINGS) {
    if (seconds >= w && !warned.has(w)) {
      warned.add(w);
      return { type: "WARNING", seconds: w };
    }
  }

  return null;
}
