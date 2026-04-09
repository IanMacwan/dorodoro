const custom_api = typeof browser !== "undefined" ? browser : chrome;

let indicator = null;
let limitMs = 60 * 60 * 1000;

if (window.location.href.includes("youtube.com")) {
  ensureIndicator();
}

custom_api.runtime.onMessage.addListener((msg) => {
  ensureIndicator();

  if (msg.type === "TICK") {
    if (
      typeof msg.limitMs === "number" &&
      Number.isFinite(msg.limitMs) &&
      msg.limitMs > 0
    ) {
      limitMs = msg.limitMs;
    }
    updateTimerUI(Math.floor(msg.time / 1000));
  }

  if (msg.type === "WARNING") {
    setIndicatorState("warning");
  }

  if (msg.type === "FINAL") {
    setIndicatorState("final");
  }
});

function ensureIndicator() {
  if (indicator) return;

  indicator = document.createElement("div");
  indicator.className = "yt-timer-indicator normal";

  const ascii = document.createElement("pre");
  ascii.className = "yt-ascii";
  ascii.textContent = String.raw`
 ▌       ▌      
▛▌▛▌▛▘▛▌▛▌▛▌▛▘▛▌
▙▌▙▌▌ ▙▌▙▌▙▌▌ ▙▌
                
`;

  const status = document.createElement("div");
  status.className = "yt-status";
  status.textContent = "ACTIVE";

  const timer = document.createElement("div");
  timer.className = "yt-timer";
  timer.textContent = "0:00:00";

  const progress = document.createElement("div");
  progress.className = "yt-progress";

  const bar = document.createElement("div");
  bar.className = "yt-progress-bar";

  progress.appendChild(bar);

  indicator.appendChild(ascii);
  indicator.appendChild(status);
  indicator.appendChild(timer);
  indicator.appendChild(progress);

  document.body.appendChild(indicator);
}

function updateTimerUI(sec) {
  const timerEl = document.querySelector(".yt-timer");
  const bar = document.querySelector(".yt-progress-bar");

  if (timerEl) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    timerEl.innerText =
      `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
  }

  const limitSec = Math.max(1, Math.floor(limitMs / 1000));
  const percent = Math.min((sec / limitSec) * 100, 100);
  if (bar) bar.style.width = percent + "%";
}

function setIndicatorState(state) {
  if (!indicator) return;

  indicator.classList.remove("normal", "warning", "final");
  indicator.classList.add(state);

  const status = indicator.querySelector(".yt-status");

  if (state === "normal") status.innerText = "ACTIVE";
  if (state === "warning") status.innerText = "⚠ WATCHING";
  if (state === "final") status.innerText = "⛔ LIMIT";
}
