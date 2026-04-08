import { createTracker, start, stop, getTime } from "../core/timeTracker.js";

const global = {
  tracker: createTracker(),
  activeTabs: new Set()
};

export function activateTab(tabId) {
  global.activeTabs.add(tabId);

  if (global.activeTabs.size === 1) {
    start(global.tracker);
  }
}

export function deactivateTab(tabId) {
  global.activeTabs.delete(tabId);

  if (global.activeTabs.size === 0) {
    stop(global.tracker);
  }
}

export function getGlobalTime() {
  return getTime(global.tracker);
}
