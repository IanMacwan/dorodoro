import { api } from "../shared/api.js";
import { activateTab, deactivateTab, getGlobalTime } from "../application/globalSession.js";
import { check } from "../application/rulesEngine.js";

const TARGET = "youtube.com";
const warnedSet = new Set();

api.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await api.tabs.get(tabId);

  if (tab.url?.includes(TARGET)) {
    activateTab(tabId);
  }

  const tabs = await api.tabs.query({});
  for (const t of tabs) {
    if (t.id !== tabId) {
      deactivateTab(t.id);
    }
  }
});

api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;

  if (tab.url.includes(TARGET)) {
    activateTab(tabId);
  } else {
    deactivateTab(tabId);
  }
});

api.tabs.onRemoved.addListener((tabId) => {
  deactivateTab(tabId);
});

setInterval(async () => {
  const time = getGlobalTime();
  const result = check(time, warnedSet);

  const tabs = await api.tabs.query({
    url: "*://*.youtube.com/*"
  });

  tabs.forEach(tab => {
    try {
      api.tabs.sendMessage(tab.id, {
        type: "TICK",
        time
      });
    } catch (e) {}
  });

  setBadge("ON", "#b8bb26");

  if (!result) return;

  if (result.type === "WARNING") {
    tabs.forEach(tab => {
      try {
        api.tabs.sendMessage(tab.id, result);
      } catch (e) {}
    });
    setBadge("!", "#fabd2f");
  }

  if (result.type === "FINAL") {
    tabs.forEach(tab => {
      try {
        api.tabs.sendMessage(tab.id, result);
      } catch (e) {}
      setTimeout(() => api.tabs.remove(tab.id), 5000);
    });

    setBadge("X", "#fb4934");
  }
}, 1000);

function setBadge(text, color) {
  if (!api.action) return;
  api.action.setBadgeText({ text });
  api.action.setBadgeBackgroundColor({ color });
}
