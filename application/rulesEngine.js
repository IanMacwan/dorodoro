const LIMIT = 60 * 60 * 1000; // 1 hour (in ms)
const WARNINGS = [15 * 60, 30 * 60, 45 * 60]; // seconds (15, 30, 45 mins)

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
