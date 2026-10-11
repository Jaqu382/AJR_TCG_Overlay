const $ = (id) => document.getElementById(id);
let lastBoard = "",
  loaded = false,
  lastPresets = "";
function notify(t) {
  $("notice").textContent = t;
}
function commit(edit) {
  return changeState(edit)
    .then((s) => {
      render(s);
      notify("Updated live TCG overlay.");
    })
    .catch(() =>
      notify("Could not update. Keep START AJR TCG open and try again."),
    );
}
function render(s) {
  state = s;
  renderTimerControls(s);
  renderShowControls(s);
  document.documentElement.dataset.theme = s.theme;
  document
    .querySelectorAll("[data-theme]")
    .forEach((b) => b.classList.toggle("active", b.dataset.theme === s.theme));
  document
    .querySelectorAll("[data-board]")
    .forEach((b) => b.classList.toggle("active", b.dataset.board === s.board));
  $("types").hidden = s.board !== "type";
  $("chasers").hidden = s.board !== "chaser";
  if (!loaded) {
    $("message").value = s.ticker;
    loaded = true;
  }
  $("pause").textContent = s.paused ? "Resume" : "Pause";
  $("speed").value = String(s.duration);
  if (s.board === "type") {
    if (lastBoard !== "type") {
      $("types").replaceChildren();
      TYPE_DATA.forEach((t) => {
        const v = s.types[t.name],
          row = document.createElement("div"),
          main = document.createElement("button"),
          star = document.createElement("button");
        row.className = "team";
        main.innerHTML = `<span class="tcg-dot type-${t.name.toLowerCase()}"></span><span>${t.name}<span class="status">${v.sold ? "CLAIMED" : "AVAILABLE"}</span></span>`;
        main.onclick = () =>
          commit((n) => (n.types[t.name].sold = !n.types[t.name].sold));
        star.textContent = "★";
        star.onclick = () =>
          commit(
            (n) => (n.types[t.name].highlight = !n.types[t.name].highlight),
          );
        row.append(main, star);
        $("types").append(row);
      });
    }
    TYPE_DATA.forEach((t, i) => {
      const v = s.types[t.name],
        r = $("types").children[i];
      r.className =
        "team" + (v.sold ? " sold" : "") + (v.highlight ? " highlight" : "");
      r.children[0].querySelector(".status").textContent = v.sold
        ? "CLAIMED"
        : "AVAILABLE";
      r.children[1].classList.toggle("selected", !!v.highlight);
    });
  }
  if (s.board === "chaser") {
    if (lastBoard !== "chaser") {
      $("chasers").replaceChildren();
      s.chasers.forEach((c, i) => {
        const row = document.createElement("div"),
          input = document.createElement("input"),
          claim = document.createElement("button"),
          star = document.createElement("button");
        row.className = "chaser";
        input.value = c.name;
        input.placeholder = "Chaser " + (i + 1);
        input.onchange = () => commit((n) => (n.chasers[i].name = input.value));
        claim.onclick = () =>
          commit((n) => (n.chasers[i].sold = !n.chasers[i].sold));
        star.textContent = "★";
        star.onclick = () =>
          commit((n) => (n.chasers[i].highlight = !n.chasers[i].highlight));
        row.append(input, claim, star);
        $("chasers").append(row);
      });
    }
    Array.from($("chasers").children).forEach((r, i) => {
      const c = s.chasers[i];
      if (document.activeElement !== r.children[0])
        r.children[0].value = c.name;
      r.children[1].textContent = c.sold ? "Claimed" : "Available";
      r.children[2].classList.toggle("selected", !!c.highlight);
    });
  }
  lastBoard = s.board;
  const pk = JSON.stringify(s.messages);
  if (pk !== lastPresets) {
    lastPresets = pk;
    $("presets").replaceChildren();
    s.messages.forEach((text, i) => {
      const row = document.createElement("div"),
        use = document.createElement("button"),
        del = document.createElement("button");
      row.className = "preset";
      use.textContent = text;
      use.onclick = () => {
        $("message").value = text;
        commit((n) => (n.ticker = text));
      };
      del.textContent = "×";
      del.onclick = () => commit((n) => n.messages.splice(i, 1));
      row.append(use, del);
      $("presets").append(row);
    });
  }
}
$("update").onclick = () =>
  commit((n) => (n.ticker = $("message").value.trim()));
$("save").onclick = () => {
  const t = $("message").value.trim();
  if (t)
    return commit((n) => {
      if (!n.messages.includes(t)) n.messages.push(t);
    });
};
$("pause").onclick = () => commit((n) => (n.paused = !n.paused));
$("speed").onchange = () =>
  commit((n) => (n.duration = Number($("speed").value)));
document
  .querySelectorAll("[data-theme]")
  .forEach(
    (b) => (b.onclick = () => commit((n) => (n.theme = b.dataset.theme))),
  );
document
  .querySelectorAll("[data-board]")
  .forEach(
    (b) => (b.onclick = () => commit((n) => (n.board = b.dataset.board))),
  );
$("reset").onclick = () => {
  const b = state.board;
  if (
    confirm(
      "Reset claimed and highlighted spots on " +
        (b === "type" ? "Pokémon Type" : "Pokémon Chaser") +
        "? Chaser names will stay.",
    )
  )
    return commit((n) => {
      if (b === "type")
        TYPE_DATA.forEach(
          (t) => (n.types[t.name] = { sold: false, highlight: false }),
        );
      else
        n.chasers.forEach((c) => {
          c.sold = false;
          c.highlight = false;
        });
    });
};
async function poll() {
  try {
    render(await getState());
    $("connection").textContent = "● Connected";
  } catch (e) {
    $("connection").textContent = "● Disconnected — open START AJR TCG";
  } finally {
    setTimeout(poll, 350);
  }
}
poll();
