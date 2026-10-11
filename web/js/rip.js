const ticker = document.getElementById("ripTicker"),
  clone = document.getElementById("ripClone");
function render(s) {
  state = s;
  document.documentElement.dataset.theme = s.theme;
  updateTimerState(s);
  updateShowEffects(s);
  ticker.textContent = s.ticker;
  clone.textContent = s.ticker;
  const tr = document.querySelector(".ticker-track");
  tr.style.animationDuration = s.duration + "s";
  tr.style.animationPlayState = s.paused ? "paused" : "running";
}
async function poll() {
  try {
    render(await getState());
  } catch (e) {
  } finally {
    setTimeout(poll, 250);
  }
}
poll();
