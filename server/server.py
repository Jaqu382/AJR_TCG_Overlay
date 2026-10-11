"""AJR TCG local overlay server. Completely separate from AJR Sports Build 23."""

from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import json, threading, webbrowser, os, argparse
from urllib.parse import urlsplit, unquote

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ROOT = PROJECT_ROOT / "web"
STATE_FILE = PROJECT_ROOT / "data" / "ajr-tcg-state.json"
LOCK = threading.Lock()


def spot():
    return {"sold": False, "highlight": False}


def chaser():
    return {"name": "", "sold": False, "highlight": False}


def defaults():
    names = (
        "Grass",
        "Fire",
        "Water",
        "Lightning",
        "Psychic",
        "Fighting",
        "Darkness",
        "Metal",
        "Dragon",
        "Colorless",
        "Items",
        "Trainers",
    )
    return {
        "board": "type",
        "theme": "electric",
        "types": {n: spot() for n in names},
        "chasers": [chaser() for _ in range(30)],
        "ticker": "WELCOME TO AJR TCG BREAKS • BIG CHASERS • HUGE HITS • GOOD LUCK EVERYONE! • FOLLOW THE SHOW •",
        "duration": 24,
        "paused": False,
        "messages": [],
        "cueView": "full",
        "givvy": {"text": "", "visible": True},
        "cue": None,
        "timer": {
            "durationMs": 180000,
            "remainingMs": 180000,
            "endsAt": None,
            "running": False,
            "visible": False,
            "color": "black",
        },
    }


def load():
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8-sig"))
        except Exception:
            pass
    return defaults()


STATE = load()
MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def reply(self, code, body=b"", mime="application/json; charset=utf-8"):
        self.send_response(code)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def valid_host(self):
        return self.headers.get("Host") in {
            f"localhost:{self.server.server_port}",
            f"127.0.0.1:{self.server.server_port}",
        }

    def do_GET(self):
        if not self.valid_host():
            return self.reply(403)
        path = unquote(urlsplit(self.path).path)
        if path == "/api/version":
            return self.reply(200, b'{"build":"TCG-01"}')
        if path == "/api/state":
            with LOCK:
                body = json.dumps(STATE, ensure_ascii=False).encode()
            return self.reply(200, body)
        rel = path.lstrip("/") or "control.html"
        f = (ROOT / rel).resolve()
        if not f.is_relative_to(ROOT) or not f.is_file():
            return self.reply(404)
        return self.reply(
            200, f.read_bytes(), MIME.get(f.suffix, "application/octet-stream")
        )

    def do_POST(self):
        global STATE
        if not self.valid_host() or urlsplit(self.path).path != "/api/state":
            return self.reply(403)
        try:
            n = int(self.headers.get("Content-Length", "0"))
            candidate = json.loads(self.rfile.read(n).decode())
            if (
                candidate.get("board") not in ("type", "chaser")
                or candidate.get("theme") not in ("electric", "cosmic", "elemental")
                or len(candidate.get("chasers", [])) != 30
                or candidate.get("duration") not in (16, 24, 36)
            ):
                return self.reply(400)
            encoded = json.dumps(candidate, ensure_ascii=False).encode()
            with LOCK:
                STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
                tmp = STATE_FILE.with_suffix(".tmp")
                tmp.write_bytes(encoded)
                os.replace(tmp, STATE_FILE)
                STATE = candidate
            self.reply(200, encoded)
        except Exception:
            return self.reply(400)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--no-browser", action="store_true")
    p.add_argument("--port", type=int, default=8766)
    a = p.parse_args()
    server = ThreadingHTTPServer(("127.0.0.1", a.port), Handler)
    print(
        f"AJR TCG Build 01 | Separate from Sports V23\nControls: http://localhost:{a.port}/control.html\nFull overlay: http://localhost:{a.port}/index.html\nRip overlay: http://localhost:{a.port}/rip.html",
        flush=True,
    )
    if not a.no_browser:
        webbrowser.open(f"http://localhost:{a.port}/control.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
