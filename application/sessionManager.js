import { createTracker, start, stop, getTime } from "../core/timeTracker.js";

const sessions = {};

export function getSession(tabId) {
  if (!sessions[tabId]) {
    sessions[tabId] = {
      tracker: createTracker(),
      warned: new Set()
    };
  }
  return sessions[tabId];
}

export function activate(tabId) {
  start(getSession(tabId).tracker);
}

export function deactivate(tabId) {
  stop(getSession(tabId).tracker);
}

export function getTimeForTab(tabId) {
  return getTime(getSession(tabId).tracker);
}
