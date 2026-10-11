const TYPE_DATA = [
  { name: "Grass", icon: "leaf" },
  { name: "Fire", icon: "fire" },
  { name: "Water", icon: "drop" },
  { name: "Lightning", icon: "bolt" },
  { name: "Psychic", icon: "eye" },
  { name: "Fighting", icon: "fist" },
  { name: "Darkness", icon: "moon" },
  { name: "Metal", icon: "metal" },
  { name: "Dragon", icon: "dragon" },
  { name: "Colorless", icon: "star" },
  { name: "Items", icon: "text" },
  { name: "Trainers", icon: "text" },
];
const THEMES = {
  electric: "Electric TCG",
  cosmic: "Cosmic TCG",
  elemental: "Elemental TCG",
};
const blankSpot = () => ({ sold: false, highlight: false });
const defaultState = () => ({
  cueView: "full",
  givvy: { text: "", visible: true },
  cue: null,
  timer: {
    durationMs: 180000,
    remainingMs: 180000,
    endsAt: null,
    running: false,
    visible: false,
    color: "black",
  },
  theme: "electric",
  board: "type",
  types: Object.fromEntries(TYPE_DATA.map((t) => [t.name, blankSpot()])),
  chasers: Array.from({ length: 30 }, () => ({
    name: "",
    sold: false,
    highlight: false,
  })),
  ticker:
    "WELCOME TO AJR TCG BREAKS • BIG CHASERS • HUGE HITS • GOOD LUCK EVERYONE! • FOLLOW THE SHOW •",
  duration: 24,
  paused: false,
  messages: [],
});
let state = defaultState();
function normalizeTimer(value) {
  const t = value || {};
  const duration = Number.isFinite(t.durationMs)
    ? Math.min(59999000, Math.max(0, t.durationMs))
    : 180000;
  return {
    durationMs: duration,
    remainingMs: Number.isFinite(t.remainingMs)
      ? Math.min(59999000, Math.max(0, t.remainingMs))
      : duration,
    endsAt: Number.isFinite(t.endsAt) ? t.endsAt : null,
    running: !!t.running && Number.isFinite(t.endsAt),
    visible: !!t.visible,
    color: ["red", "white", "black"].includes(t.color) ? t.color : "black",
  };
}
function normalizeState(s) {
  s = s || defaultState();
  s.board = ["type", "chaser"].includes(s.board) ? s.board : "type";
  s.theme = THEMES[s.theme] ? s.theme : "electric";
  s.types ||= {};
  TYPE_DATA.forEach((t) => (s.types[t.name] ||= blankSpot()));
  s.chasers = Array.from(
    { length: 30 },
    (_, i) => s.chasers?.[i] || { name: "", sold: false, highlight: false },
  );
  s.givvy = {
    text: String(s.givvy?.text || "").slice(0, 100),
    visible: s.givvy?.visible !== false,
  };
  s.cue =
    s.cue &&
    ["stashpass", "pyt", "see2", "see3"].includes(s.cue.kind) &&
    Number.isFinite(s.cue.startedAt)
      ? {
          id: String(s.cue.id || s.cue.kind + "-" + s.cue.startedAt),
          kind: s.cue.kind,
          startedAt: s.cue.startedAt,
          paused: !!s.cue.paused,
          elapsedMs: Number.isFinite(s.cue.elapsedMs)
            ? Math.max(0, s.cue.elapsedMs)
            : 0,
        }
      : null;
  s.timer = normalizeTimer(s.timer);
  s.cueView = s.cueView === "rip" ? "rip" : "full";
  s.messages = Array.isArray(s.messages) ? s.messages : [];
  s.duration = [16, 24, 36].includes(s.duration) ? s.duration : 24;
  s.paused = !!s.paused;
  return s;
}
async function getState() {
  const r = await fetch("/api/state", { cache: "no-store" });
  if (!r.ok) throw Error("Connection unavailable");
  return normalizeState(await r.json());
}
let pending = Promise.resolve();
function changeState(edit) {
  pending = pending
    .catch(() => {})
    .then(async () => {
      const latest = await getState();
      edit(latest);
      const r = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latest),
      });
      if (!r.ok) throw Error("Update failed");
      state = latest;
      return latest;
    });
  return pending;
}
function remainingTimerMs(t, now = Date.now()) {
  return Math.max(0, t.running ? t.endsAt - now : t.remainingMs);
}
function timerText(t, now = Date.now()) {
  const total = Math.ceil(remainingTimerMs(t, now) / 1000);
  return (
    String(Math.floor(total / 60)).padStart(2, "0") +
    ":" +
    String(total % 60).padStart(2, "0")
  );
}
