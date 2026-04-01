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
