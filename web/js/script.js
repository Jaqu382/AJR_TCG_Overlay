const typeGrid = document.getElementById("typeGrid"),
  chaserGrid = document.getElementById("chaserGrid"),
  ticker = document.getElementById("ticker"),
  clone = document.getElementById("tickerClone");
function glyph(kind) {
  const m = {
    leaf: "◒",
    fire: "▲",
    drop: "◆",
    bolt: "ϟ",
    eye: "◉",
    fist: "✦",
    moon: "◐",
    metal: "⬡",
    dragon: "◔",
    star: "✧",
  };
  return m[kind] || "";
}
TYPE_DATA.forEach((t) => {
  const c = document.createElement("div");
  c.className = "type-card type-" + t.name.toLowerCase();
  c.innerHTML = `<span class="energy-symbol">${t.icon === "text" ? "" : glyph(t.icon)}</span><span class="type-name">${t.name}</span>`;
  c.onclick = () =>
    changeState((n) => (n.types[t.name].sold = !n.types[t.name].sold));
  c.oncontextmenu = (e) => {
    e.preventDefault();
    changeState(
      (n) => (n.types[t.name].highlight = !n.types[t.name].highlight),
    );
  };
  typeGrid.append(c);
});
for (let i = 0; i < 30; i++) {
  const r = document.createElement("div");
  r.className = "chaser-row";
  r.onclick = () =>
    changeState((n) => (n.chasers[i].sold = !n.chasers[i].sold));
  r.oncontextmenu = (e) => {
    e.preventDefault();
    changeState((n) => (n.chasers[i].highlight = !n.chasers[i].highlight));
  };
  chaserGrid.append(r);
}
function render(s) {
  state = s;
  document.documentElement.dataset.theme = s.theme;
  updateTimerState(s);
  updateShowEffects(s);
  typeGrid.classList.toggle("hidden", s.board !== "type");
  chaserGrid.classList.toggle("hidden", s.board !== "chaser");
  TYPE_DATA.forEach((t, i) => {
    const v = s.types[t.name];
    typeGrid.children[i].classList.toggle("sold", !!v.sold);
    typeGrid.children[i].classList.toggle("highlight", !!v.highlight);
  });
  s.chasers.forEach((v, i) => {
    const n = chaserGrid.children[i];
    n.textContent = v.name;
    n.classList.toggle("sold", !!v.sold);
    n.classList.toggle("highlight", !!v.highlight);
  });
  ticker.textContent = s.ticker;
  clone.textContent = s.ticker;
  document.querySelector(".ticker-track").style.animationDuration =
    s.duration + "s";
  document.querySelector(".ticker-track").style.animationPlayState = s.paused
    ? "paused"
    : "running";
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
