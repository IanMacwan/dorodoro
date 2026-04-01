const custom_api = typeof browser !== "undefined" ? browser : chrome;

custom_api.runtime.onMessage.addListener((msg) => {
  if (msg.type === "WARNING") {
    show(`You've been watching for ${msg.seconds} seconds.`);
  }

  if (msg.type === "FINAL") {
    show("Time limit reached. Closing tab...");
  }
});

function show(text) {
  const div = document.createElement("div");
  div.className = "dorodoro-overlay";
  div.innerText = text;

  document.body.appendChild(div);

  setTimeout(() => div.remove(), 4000);
}
