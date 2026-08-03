import { api } from "../shared/api.js";
import {
  getLimitMinutes,
  setLimitMinutes,
  getLimitEnabled,
  setLimitEnabled,
  clampLimit,
  LIMITS
} from "../shared/settings.js";

const limitInput = document.getElementById("limitInput");
const saveBtn = document.getElementById("saveBtn");
const errorMsg = document.getElementById("errorMsg");
const savedMsg = document.getElementById("savedMsg");
const remainingEl = document.getElementById("remaining");
const enabledToggle = document.getElementById("enabledToggle");
const presetButtons = document.querySelectorAll(".preset");

init();

async function init() {
  const [limitMinutes, enabled] = await Promise.all([
    getLimitMinutes(),
    getLimitEnabled()
  ]);
  limitInput.value = limitMinutes;
  setToggleState(enabled);
  highlightPreset(limitMinutes);
  refreshRemaining();

  saveBtn.addEventListener("click", handleSave);
  limitInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSave();
  });
  limitInput.addEventListener("input", () => {
    hideError();
    highlightPreset(Number(limitInput.value));
  });

  enabledToggle.addEventListener("click", async () => {
    const nextState = enabledToggle.getAttribute("aria-pressed") !== "true";
    setToggleState(nextState);
    await setLimitEnabled(nextState);
    refreshRemaining();
  });

  presetButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = Number(btn.dataset.value);
      limitInput.value = value;
      highlightPreset(value);
      await saveLimit(value);
    });
  });

  const liveTimer = setInterval(refreshRemaining, 1000);
  window.addEventListener("unload", () => clearInterval(liveTimer));
}

function setToggleState(enabled) {
  enabledToggle.setAttribute("aria-pressed", String(enabled));
  enabledToggle.textContent = enabled ? "[ ON ]" : "[ OFF ]";
}

function highlightPreset(value) {
  presetButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.value) === value);
  });
}

function validate(rawValue) {
  if (rawValue === "" || rawValue === null) {
    return "Enter a number of minutes.";
  }
  const n = Number(rawValue);
  if (!Number.isFinite(n) || Number.isNaN(n)) {
    return "Numeric values only.";
  }
  if (!Number.isInteger(n)) {
    return "Whole minutes only.";
  }
  if (n < LIMITS.MIN_MINUTES || n > LIMITS.MAX_MINUTES) {
    return `Enter a value between ${LIMITS.MIN_MINUTES} and ${LIMITS.MAX_MINUTES}.`;
  }
  return null;
}

async function handleSave() {
  const rawValue = limitInput.value.trim();
  const error = validate(rawValue);
  if (error) {
    showError(error);
    return;
  }
  await saveLimit(Number(rawValue));
}

async function saveLimit(value) {
  const clamped = clampLimit(value);
  limitInput.value = clamped;
  hideError();
  await setLimitMinutes(clamped);
  highlightPreset(clamped);
  showSaved();
  refreshRemaining();
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
  savedMsg.hidden = true;
}

function hideError() {
  errorMsg.hidden = true;
}

function showSaved() {
  savedMsg.hidden = false;
  // restart animation
  savedMsg.style.animation = "none";
  // eslint-disable-next-line no-unused-expressions
  savedMsg.offsetHeight;
  savedMsg.style.animation = "";
  setTimeout(() => {
    savedMsg.hidden = true;
  }, 1400);
}

async function refreshRemaining() {
  try {
    const status = await api.runtime.sendMessage({ type: "GET_STATUS" });
    if (!status) {
      remainingEl.textContent = "--:--:--";
      return;
    }
    if (!status.enabled) {
      remainingEl.textContent = "Off";
      remainingEl.style.color = "var(--grey)";
      return;
    }
    const limitMs = status.limitMinutes * 60 * 1000;
    const remainingMs = Math.max(limitMs - status.time, 0);
    remainingEl.textContent = formatDuration(remainingMs);
    remainingEl.style.color = remainingMs === 0 ? "var(--red)" : "var(--green)";
  } catch (e) {
    remainingEl.textContent = "--:--:--";
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
