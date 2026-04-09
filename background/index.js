import { api } from "../shared/api.js";
import { activateTab, deactivateTab, getGlobalTime } from "../application/globalSession.js";
import { check } from "../application/rulesEngine.js";
import {
  DEFAULT_TIME_LIMIT_MINUTES,
  KEY_TIME_LIMIT_MINUTES,
  getTimeLimitMinutes,
  sanitizeTimeLimitMinutes
} from "../shared/settings.js";

const TARGET = "youtube.com";
const warnedSet = new Set();

let timeLimitMinutes = DEFAULT_TIME_LIMIT_MINUTES;

// Service worker can be restarted at any time; reload persisted config.
getTimeLimitMinutes().then((m) => {
  timeLimitMinutes = m;
});

api.storage?.onChanged?.addListener((changes, area) => {
  if (area !== "local") return;
  const change = changes?.[KEY_TIME_LIMIT_MINUTES];
  if (!change) return;

  timeLimitMinutes = sanitizeTimeLimitMinutes(change.newValue);
  warnedSet.clear();
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

setInterval(async () => {
  const time = getGlobalTime();
  const result = check(time, warnedSet, timeLimitMinutes);

  const tabs = await api.tabs.query({
    url: "*://*.youtube.com/*"
  });

  tabs.forEach(async tab => {
    try {
      await api.tabs.sendMessage(tab.id, {
        type: "TICK",
        time,
        limitMs: timeLimitMinutes * 60 * 1000
      });
    } catch (e) {}
  });

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
