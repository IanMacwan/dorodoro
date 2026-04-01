import { api } from "../shared/api.js";
import { activate, deactivate, getTimeForTab, getSession } from "../application/sessionManager.js";
import { check } from "../application/rulesEngine.js";

const TARGET = "youtube.com";

const warnedMap = new Map();

api.tabs.onActivated.addListener(({ tabId }) => {
  activate(tabId);

  api.tabs.query({}, (tabs) => {
    tabs.forEach((t) => {
      if (t.id !== tabId) deactivate(t.id);
    });
  });
});

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes(TARGET)) {
    getSession(tabId);
  }
});

setInterval(async () => {
  const tabs = await api.tabs.query({});

  for (const tab of tabs) {
    if (!tab.url || !tab.url.includes(TARGET)) continue;

    const session = getSession(tab.id);
    const time = getTimeForTab(tab.id);

    if (!warnedMap.has(tab.id)) warnedMap.set(tab.id, new Set());

    const result = check(time, warnedMap.get(tab.id));

    setBadge("ON", "#b8bb26");

    if (!result) continue;

    if (result.type === "WARNING") {
      api.tabs.sendMessage(tab.id, result);
      setBadge("!", "#fabd2f");
    }

    if (result.type === "FINAL") {
      api.tabs.sendMessage(tab.id, result);
      setBadge("X", "#fb4934");

      setTimeout(() => api.tabs.remove(tab.id), 5000);
    }
  }
}, 1000);

function setBadge(text, color) {
  if (!api.action) return; // safety for older browsers
  api.action.setBadgeText({ text });
  api.action.setBadgeBackgroundColor({ color });
}
