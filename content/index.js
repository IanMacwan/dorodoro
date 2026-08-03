const custom_api = typeof browser !== "undefined" ? browser : chrome;
let indicator = null;
let currentLimitMinutes = 60;
let isEnabled = true;
let isPoweringOff = false;

if (window.location.href.includes("youtube.com")) {
  ensureIndicator();
}

custom_api.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TICK") {
    if (typeof msg.limitMinutes === "number") {
      currentLimitMinutes = msg.limitMinutes;
    }
    applyEnabledState(msg.enabled);
    if (isEnabled) {
      ensureIndicator();
      updateTimerUI(Math.floor(msg.time / 1000));
    }
  }
  if (msg.type === "STATE") {
    if (typeof msg.limitMinutes === "number") {
      currentLimitMinutes = msg.limitMinutes;
    }
    applyEnabledState(msg.enabled);
    if (isEnabled) {
      ensureIndicator();
    }
  }
  if (msg.type === "WARNING") {
    setIndicatorState("warning");
  }
  if (msg.type === "FINAL") {
    setIndicatorState("final");
  }
});

function applyEnabledState(enabled) {
  if (typeof enabled !== "boolean") return;
  if (enabled === isEnabled) return;
  isEnabled = enabled;
  if (!enabled) {
    powerOffIndicator();
  }
}

function ensureIndicator() {
  if (indicator) return;
  isPoweringOff = false;
  indicator = document.createElement("div");
  indicator.className = "yt-timer-indicator normal power-on";

  const titlebar = document.createElement("div");
  titlebar.className = "yt-titlebar";
  const dotRed = document.createElement("span");
  dotRed.className = "yt-dot yt-dot-red";
  const dotYellow = document.createElement("span");
  dotYellow.className = "yt-dot yt-dot-yellow";
  const dotGreen = document.createElement("span");
  dotGreen.className = "yt-dot yt-dot-green";
  const titleText = document.createElement("span");
  titleText.className = "yt-titlebar-text";
  titleText.textContent = "dorodoro";
  titlebar.appendChild(dotRed);
  titlebar.appendChild(dotYellow);
  titlebar.appendChild(dotGreen);
  titlebar.appendChild(titleText);

  const ascii = document.createElement("pre");
  ascii.className = "yt-ascii";
  ascii.textContent = String.raw`
 ▌       ▌      
▛▌▛▌▛▘▛▌▛▌▛▌▛▘▛▌
▙▌▙▌▌ ▙▌▙▌▙▌▌ ▙▌
                `;
  const status = document.createElement("div");
  status.className = "yt-status";
  status.textContent = "● ACTIVE";
  const timer = document.createElement("div");
  timer.className = "yt-timer";
  timer.textContent = "0:00:00";
  const progress = document.createElement("div");
  progress.className = "yt-progress";
  const bar = document.createElement("div");
  bar.className = "yt-progress-bar";
  progress.appendChild(bar);
  indicator.appendChild(titlebar);
  indicator.appendChild(ascii);
  indicator.appendChild(status);
  indicator.appendChild(timer);
  indicator.appendChild(progress);
  document.body.appendChild(indicator);
}

function powerOffIndicator() {
  if (!indicator || isPoweringOff) return;
  isPoweringOff = true;
  indicator.classList.remove("power-on");
  indicator.classList.add("power-off");
  indicator.addEventListener(
    "animationend",
    () => {
      if (indicator) {
        indicator.remove();
      }
      indicator = null;
      isPoweringOff = false;
    },
    { once: true }
  );
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
  const limitSeconds = currentLimitMinutes * 60;
  const percent = Math.min((sec / limitSeconds) * 100, 100);
  if (bar) bar.style.width = percent + "%";
}

function setIndicatorState(state) {
  if (!indicator) return;
  indicator.classList.remove("normal", "warning", "final");
  indicator.classList.add(state);
  const status = indicator.querySelector(".yt-status");
  if (state === "normal") status.innerText = "● ACTIVE";
  if (state === "warning") status.innerText = "⚠ WATCHING";
  if (state === "final") status.innerText = "⛔ LIMIT";
}
