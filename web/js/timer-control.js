let timerInputsLoaded = false,
  timerInputsDirty = false;
const timerEl = (id) => document.getElementById(id);
function timerInputMs() {
  const minutes = Number(timerEl("timerMinutes").value),
    seconds = Number(timerEl("timerSeconds").value);
  if (
    !Number.isInteger(minutes) ||
    minutes < 0 ||
    minutes > 999 ||
    !Number.isInteger(seconds) ||
    seconds < 0 ||
    seconds > 59
  )
    throw Error("Enter minutes from 0–999 and seconds from 0–59.");
  return (minutes * 60 + seconds) * 1000;
}
function timerAction(edit) {
  return commit(edit);
}
function renderTimerControls(s) {
  const t = s.timer;
  if (!timerInputsLoaded) {
    timerEl("timerMinutes").value = Math.floor(t.durationMs / 60000);
    timerEl("timerSeconds").value = Math.floor(t.durationMs / 1000) % 60;
    timerInputsLoaded = true;
  }
  timerEl("timerColor").value = t.color;
  timerEl("timerDockPreview").dataset.color = t.color;
  timerEl("timerShow").textContent = t.visible ? "Hide timer" : "Show timer";
  const remaining = remainingTimerMs(t);
  timerEl("timerStart").textContent =
    t.running && remaining > 0
      ? "Running"
      : remaining < t.durationMs && remaining > 0
        ? "Resume"
        : "Start";
  timerEl("timerStart").disabled = t.running && remaining > 0;
  timerEl("timerPause").disabled = !t.running || remaining <= 0;
  if (timerInputsDirty) {
    timerEl("timerStart").disabled = false;
    timerEl("timerStart").textContent = "Start new time";
  }
  paintTimerDock();
}
function paintTimerDock() {
  const t = normalizeTimer(state.timer),
    value = timerText(t);
  if (timerEl("timerDockValue").textContent !== value)
    timerEl("timerDockValue").textContent = value;
  const status =
    (t.visible ? "Visible" : "Hidden") +
    " • " +
    (remainingTimerMs(t) <= 0
      ? "Finished"
      : t.running
        ? "Running"
        : "Ready / paused");
  if (timerEl("timerDockStatus").textContent !== status)
    timerEl("timerDockStatus").textContent = status;
  if (remainingTimerMs(t) <= 0) {
    timerEl("timerStart").disabled = false;
    timerEl("timerStart").textContent = "Start";
    timerEl("timerPause").disabled = true;
  }
}
for (const id of ["timerMinutes", "timerSeconds"])
  timerEl(id).oninput = () => {
    timerInputsDirty = true;
    timerEl("timerStart").disabled = false;
    timerEl("timerStart").textContent = "Start new time";
  };
timerEl("timerSet").onclick = () => {
  let ms;
  try {
    ms = timerInputMs();
  } catch (e) {
    notify(e.message);
    return;
  }
  timerInputsDirty = false;
  return timerAction((n) => {
    Object.assign(n.timer, {
      durationMs: ms,
      remainingMs: ms,
      endsAt: null,
      running: false,
      visible: true,
    });
  });
};
timerEl("timerStart").onclick = () => {
  let input;
  if (timerInputsDirty) {
    try {
      input = timerInputMs();
    } catch (e) {
      notify(e.message);
      return;
    }
  }
  timerInputsDirty = false;
  return timerAction((n) => {
    const t = n.timer;
    if (input !== undefined) {
      t.durationMs = input;
      t.remainingMs = input;
      t.running = false;
      t.endsAt = null;
    }
    let remaining = remainingTimerMs(t);
    if (remaining <= 0) remaining = t.durationMs;
    t.remainingMs = remaining;
    t.endsAt = Date.now() + remaining;
    t.running = remaining > 0;
    t.visible = true;
  });
};
timerEl("timerPause").onclick = () =>
  timerAction((n) => {
    const t = n.timer;
    t.remainingMs = remainingTimerMs(t);
    t.running = false;
    t.endsAt = null;
  });
timerEl("timerReset").onclick = () =>
  timerAction((n) => {
    const t = n.timer;
    t.remainingMs = t.durationMs;
    t.endsAt = null;
    t.running = false;
  });
timerEl("timerShow").onclick = () =>
  timerAction((n) => (n.timer.visible = !n.timer.visible));
timerEl("timerColor").onchange = () => {
  const color = timerEl("timerColor").value;
  return timerAction((n) => (n.timer.color = color));
};
setInterval(paintTimerDock, 100);

timerEl("timerClear").onclick = () =>
  timerAction((n) => {
    const t = n.timer;
    t.visible = false;
    t.running = false;
    t.endsAt = null;
    t.remainingMs = t.durationMs;
  });
