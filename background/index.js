import { api } from "../shared/api.js";
import { activateTab, deactivateTab, getGlobalTime, resetGlobalTimer } from "../application/globalSession.js";
import { check, DEFAULT_LIMIT_MINUTES } from "../application/rulesEngine.js";
import { getLimitMinutes, getLimitEnabled, onSettingsChanged } from "../shared/settings.js";
const TARGET = "youtube.com";
const warnedSet = new Set();

let limitMinutes = DEFAULT_LIMIT_MINUTES;
let limitEnabled = true;

async function loadSettings() {
  limitMinutes = await getLimitMinutes();
  limitEnabled = await getLimitEnabled();
}
loadSettings();

async function broadcastState() {
  const tabs = await api.tabs.query({ url: "*://*.youtube.com/*" });
  tabs.forEach(async (tab) => {
    try {
      await api.tabs.sendMessage(tab.id, {
        type: "STATE",
        enabled: limitEnabled,
        limitMinutes
      });
    } catch (e) {}
  });
}

onSettingsChanged(({ limitMinutes: newLimit, enabled }) => {
  const wasEnabled = limitEnabled;
  let shouldReset = false;

  if (typeof newLimit === "number" && newLimit !== limitMinutes) {
    limitMinutes = newLimit;
    shouldReset = true;
  }
  if (typeof enabled === "boolean") {
    limitEnabled = enabled;
    // Re-enabling the limiter starts a fresh session too.
    if (enabled && !wasEnabled) {
      shouldReset = true;
    }
  }

  if (shouldReset) {
    resetGlobalTimer();
    warnedSet.clear();
    setBadge(limitEnabled ? "ON" : "OFF", limitEnabled ? "#b8bb26" : "#928374");
  }

  if (typeof enabled === "boolean" && enabled !== wasEnabled) {
    broadcastState();
  }
});

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

api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "GET_STATUS") {
    sendResponse({
      time: getGlobalTime(),
      limitMinutes,
      enabled: limitEnabled
    });
    return true;
  }
});
setInterval(async () => {
  const time = getGlobalTime();
  const tabs = await api.tabs.query({
    url: "*://*.youtube.com/*"
  });

  tabs.forEach(async tab => {
    try {
      await api.tabs.sendMessage(tab.id, {
        type: "TICK",
        time,
        limitMinutes,
        enabled: limitEnabled
      });
    } catch (e) {}
  });

  if (!limitEnabled) {
    setBadge("OFF", "#928374");
    return;
  }

  const result = check(time, warnedSet, limitMinutes);
  setBadge("ON", "#b8bb26");
  if (!result) return;
  if (result.type === "WARNING") {
    tabs.forEach(async tab => {
      try {
        await api.tabs.sendMessage(tab.id, result);
      } catch (e) {}
    });
    setBadge("!", "#fabd2f");
  }
  if (result.type === "FINAL") {
    tabs.forEach(async tab => {
      try {
        await api.tabs.sendMessage(tab.id, result);
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
