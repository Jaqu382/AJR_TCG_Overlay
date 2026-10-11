let givvyLoaded = false;
const showEl = (id) => document.getElementById(id);
function renderShowControls(s) {
  showEl("cueView").value = s.cueView || "full";
  if (!givvyLoaded) {
    showEl("givvyInput").value = s.givvy.text;
    givvyLoaded = true;
  }
  showEl("cuePause").disabled = !s.cue;
  showEl("cuePause").textContent = s.cue?.paused
    ? "Resume animation"
    : "Pause animation";
  showEl("givvyShow").textContent = s.givvy.visible
    ? "Hide givvy line"
    : "Show givvy line";
  document.querySelectorAll("[data-cue]").forEach((b) => {
    const active = s.cue?.kind === b.dataset.cue;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", active);
  });
}
showEl("givvyUpdate").onclick = () => {
  const text = showEl("givvyInput").value.trim();
  return commit((n) => (n.givvy = { text, visible: true }));
};
showEl("givvyShow").onclick = () =>
  commit((n) => (n.givvy.visible = !n.givvy.visible));
showEl("givvyClear").onclick = () => {
  showEl("givvyInput").value = "";
  return commit((n) => (n.givvy = { text: "", visible: false }));
};
document.querySelectorAll("[data-cue]").forEach(
  (button) =>
    (button.onclick = () => {
      const kind = button.dataset.cue;
      return commit((n) => {
        n.cue = {
          id: Date.now() + "-" + Math.random().toString(36).slice(2),
          kind,
          startedAt: Date.now(),
          paused: false,
          elapsedMs: 0,
        };
      });
    }),
);
showEl("cueClear").onclick = () => commit((n) => (n.cue = null));

showEl("cuePause").onclick = () =>
  commit((n) => {
    if (!n.cue) return;
    if (n.cue.paused) {
      n.cue.startedAt = Date.now();
      n.cue.paused = false;
    } else {
      n.cue.elapsedMs =
        (n.cue.elapsedMs || 0) + Math.max(0, Date.now() - n.cue.startedAt);
      n.cue.paused = true;
    }
  });

showEl("cueView").onchange = () =>
  commit(
    (n) => (n.cueView = showEl("cueView").value === "rip" ? "rip" : "full"),
  );
