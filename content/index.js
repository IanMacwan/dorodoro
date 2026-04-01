const custom_api = typeof browser !== "undefined" ? browser : chrome;

let indicator = null;

custom_api.runtime.onMessage.addListener((msg) => {
  ensureIndicator();

  if (msg.type === "WARNING") {
    showToast(`Watching: ${msg.seconds}s`);
    setIndicatorState("warning");
  }

  if (msg.type === "FINAL") {
    showToast("Time limit reached. Closing tab...");
    setIndicatorState("final");
  }
});

function ensureIndicator() {
  if (indicator) return;

  indicator = document.createElement("div");
  indicator.className = "yt-timer-indicator normal";
  indicator.innerText = "ACTIVE";

  document.body.appendChild(indicator);
}

function setIndicatorState(state) {
  if (!indicator) return;

  indicator.classList.remove("normal", "warning", "final");
  indicator.classList.add(state);

  if (state === "warning") indicator.innerText = "⚠ WATCHING";
  if (state === "final") indicator.innerText = "⛔ LIMIT";
}

function showToast(text) {
  const div = document.createElement("div");
  div.className = "yt-timer-toast";
  div.innerText = text;

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 4000);
}

const style = document.createElement("style");
style.innerHTML = `
:root {
  --bg: #282828;
  --bg-soft: #3c3836;
  --fg: #ebdbb2;
  --yellow: #fabd2f;
  --red: #fb4934;
  --green: #b8bb26;
}

/* Toast */
.yt-timer-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--bg-soft);
  color: var(--fg);
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  z-index: 999999;
  animation: fadeIn 0.3s ease;
}

/* Indicator */
.yt-timer-indicator {
  position: fixed;
  top: 12px;
  right: 12px;
  background: var(--green);
  color: var(--bg);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: bold;
  z-index: 999999;
  box-shadow: 0 2px 10px rgba(0,0,0,0.4);
}

.yt-timer-indicator.warning {
  background: var(--yellow);
  color: var(--bg);
}

.yt-timer-indicator.final {
  background: var(--red);
  color: var(--bg);
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
document.head.appendChild(style);
