import {
  DEFAULT_TIME_LIMIT_MINUTES,
  MAX_TIME_LIMIT_MINUTES,
  MIN_TIME_LIMIT_MINUTES,
  getTimeLimitMinutes,
  setTimeLimitMinutes,
  sanitizeTimeLimitMinutes
} from "../shared/settings.js";

const limitEl = document.getElementById("limit");
const saveEl = document.getElementById("save");
const statusEl = document.getElementById("status");

function setStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.classList.remove("ok", "err");
  if (kind) statusEl.classList.add(kind);
}

function readInputValue() {
  const raw = limitEl.value;
  if (raw === "") return NaN;
  return Number(raw);
}

async function load() {
  const current = await getTimeLimitMinutes();
  limitEl.value = String(current ?? DEFAULT_TIME_LIMIT_MINUTES);
  setStatus("", null);
}

async function save(value) {
  const sanitized = sanitizeTimeLimitMinutes(value);
  limitEl.value = String(sanitized);

  try {
    await setTimeLimitMinutes(sanitized);
    setStatus("Saved", "ok");
  } catch {
    setStatus("Failed to save", "err");
  }
}

saveEl.addEventListener("click", async () => {
  const value = readInputValue();
  if (!Number.isFinite(value)) {
    setStatus(
      `Enter a number (${MIN_TIME_LIMIT_MINUTES}-${MAX_TIME_LIMIT_MINUTES})`,
      "err"
    );
    return;
  }
  await save(value);
});

limitEl.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  saveEl.click();
});

document.querySelectorAll(".chip[data-minutes]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const v = Number(btn.getAttribute("data-minutes"));
    await save(v);
  });
});

load();
