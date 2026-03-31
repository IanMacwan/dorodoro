export function createTracker() {
  return {
    total: 0,
    start: null
  };
}

export function start(tracker) {
  if (!tracker.start) tracker.start = Date.now();
}

export function stop(tracker) {
  if (tracker.start) {
    tracker.total += Date.now() - tracker.start;
    tracker.start = null;
  }
}

export function getTime(tracker) {
  return tracker.total + (tracker.start ? Date.now() - tracker.start : 0);
}
