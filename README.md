<p align="center">
  <img src="./assets/icon128.png" width="96" height="96" alt="dorodoro logo" />
</p>

<h1 align="center"> dorodoro</h1>

> a minimal, clean-architecture browser extension for enforcing attention boundaries on youtube and youtube shorts.

dorodoro tracks **active youtube time globally across your entire browser session**, not per-tab, not per-window and automatically closes youtube once you've hit your limit.

what makes dorodoro different is that it's built to stay **simple, lightweight, modular, and respectful of your privacy.** no accounts, no telemetry, and no network calls.

---
## how it works

```
tab activity  →  core/timeTracker      (pure start/stop/elapsed math)
             →  application/globalSession (tracks which tabs are "active" YouTube tabs)
             →  application/rulesEngine   (decides WARNING / FINAL against your limit)
             →  background/index.js       (orchestrates it all, ticks every 1s, closes tabs)
             →  content/index.js          (renders the on-page overlay)
             →  popup/                    (reads/writes settings via shared/settings.js)
```

the clock only runs while at least one youtube tab is the active tab in the active window, switch away, and it pauses. switch back, and it resumes.

---
## install (unpacked)

**chrome / edge / brave**
1. `chrome://extensions`
2. enable **Developer mode**
3. **Load unpacked** → select this folder

**firefox**
1. `about:debugging#/runtime/this-firefox`
2. **Load Temporary Add-on** → select `manifest.json`
