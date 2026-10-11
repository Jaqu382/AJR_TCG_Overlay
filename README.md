# AJR TCG Overlay

Stream overlay for Ray and Colin's Whatnot stream. Includes a full Type/Chaser
board, a ripping overlay, and a shared control panel.
It uses port **8766** 


## Start

Install Python **3.9 or newer**

On Windows, double-click **START AJR TCG.bat** at the repository root.

Keep its console open while streaming. close it or press Ctrl+C to stop.

Alternatively, from the repository root:

```powershell
py -3 server\server.py
```

If the Python launcher is unavailable, use `python server\server.py`.
For development, `--no-browser` suppresses the automatic control-panel launch,
and `--port 8767` selects an alternate port.

## Control panel and OBS

| View | URL |
| --- | --- |
| Control panel / OBS browser dock | http://localhost:8766/control.html |
| Full TCG overlay | http://localhost:8766/index.html |
| Ripping overlay | http://localhost:8766/rip.html |

Set OBS Browser Sources to **1080 x 1920**. The camera opening is transparent;
place your camera source underneath the overlay. The existing URLs are unchanged
by the repository reorganization.

Stop the previous TCG server before starting this copy, then refresh the OBS
browser sources. If sports branding (such as BOWMAN JUMBO or the sports AJR logo)
overlaps the TCG scene, disable the separate Sports browser source in that scene.
Do not delete or edit the Sports project.

## Controls

- **Board 5 - Pokemon Type:** Grass, Fire, Water, Lightning, Psychic, Fighting,
  Darkness, Metal, Dragon, Colorless, Items, and Trainers. Claim spots and highlight
  chases from the control panel.
- **Board 6 - Pokemon Chaser:** 30 editable chaser spots, with sold and highlight
  controls.
- **Themes:** Electric TCG, Cosmic TCG, and Elemental TCG. The shared theme setting
  applies to both views; the full overlay's rendered Championship artwork remains
  static.
- **Rolling ticker:** Edit text, save presets, pause scrolling, and select speed.
- **Random Spin In timer:** Set minutes/seconds, start, pause, reset, show/clear,
  and choose red, white, or black.
- **Current Givvy:** Update, show/hide, or clear the line on the ripping overlay.
  The full overlay intentionally hides this line.
- **Show animations:** Stash or Pass, PYT, See 2 Pick 1, and See 3 Pick 2, with
  target-view, pause, and clear controls.

## Repository layout

```text
README.md                  Setup, usage, and consolidated build history
START AJR TCG.bat           Windows launcher
server/
  server.py                Local HTTP server and shared state API
web/
  control.html             Control panel
  index.html               Full overlay
  rip.html                 Ripping overlay
  css/                     Stylesheets, including Championship overrides
  js/                      Overlay, control, timer, and state scripts
  assets/                  Runtime artwork and retained source assets
docs/
  TCG_LAYOUT_REFERENCE.png Original layout reference
data/                      Local runtime state; ignored by Git
```

The server serves only `web/`; documentation, Python code, and saved state are
not static web content. HTML references `css/` and `js/`, and stylesheet artwork
paths resolve to `../assets/`.

## Saved state

The server automatically creates `data/ajr-tcg-state.json` when controls save an
update. It retains boards, ticker settings/presets, theme, timer, givvy, and cues
across restarts. This local file is ignored by Git.

To migrate from an older build, stop both servers and copy that build's
`ajr-tcg-state.json` into `data/` (create the folder if needed), then start the
new server. Back up the file before replacing it. To return to defaults, stop
the server and move the state file aside before restarting.

## Consolidated build history

These notes replace the separate Build 01, 02, 03, 06, and 07 README files.
They describe successive revisions, not separate launchable applications.

| Revision | Changes |
| --- | --- |
| Build 01 | Standalone TCG server on port 8766; Type and Chaser boards; shared themes; full and ripping overlays; isolation from Sports V23. |
| Build 02 | Restrained Championship shell styling, adjusted Type/Chaser grid position and size, and revised type symbols/labels. Ticker, logo, givvy, camera opening, and controls were unchanged in this revision. |
| Build 03 | Hid the Current Givvy bar on the full overlay only. Retained ticker, logo, camera opening, and frame. Documented disabling overlapping Sports OBS sources rather than changing Sports files. |
| Build 06 | Chrome/Championship design test using rendered base artwork. Transparent camera window, static type artwork, dynamic SOLD overlays, and the existing ticker/control dock. Sports V23 was neither included nor modified. |
| Build 07 | Ticker-only fix: opaque dark ticker plate and removal of static ticker words from the artwork; scrolling text remains controlled by the dock. Other TCG mechanics unchanged. |
| Repository cleanup | Organized pages, styles, scripts, server, and reference artwork; consolidated documentation; moved local state out of the web root; preserved OBS URLs and the newer artwork/style updates. |

The current full overlay loads `web/css/championship06.css`, which contains the
Build 06 artwork treatment and Build 07 ticker overrides. Legacy Build 01 labels
in the control panel and version endpoint are not an indication that those later
styles are missing.
