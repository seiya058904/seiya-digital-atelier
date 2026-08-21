import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parent
PROJECT_PREFIX = "/seiya-digital-atelier"
ROUTES = {
    "/work": "work/index.html",
    "/about": "about/index.html",
    "/contact": "contact/index.html",
}


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parts = urlsplit(self.path)
        ranges = parse_qs(parts.query).get("range")
        if ranges and "/framerusercontent.com/cms/" in parts.path:
            source = Path(self.translate_path(self.path))
            if source.is_file():
                payload = bytearray()
                for item in ranges[0].split(","):
                    start, end = (int(value) for value in item.split("-", 1))
                    with source.open("rb") as stream:
                        stream.seek(start)
                        payload.extend(stream.read(end - start + 1))
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)
                return
        super().do_GET()

    def translate_path(self, path):
        request_path = urlsplit(path).path
        if request_path == PROJECT_PREFIX or request_path.startswith(f"{PROJECT_PREFIX}/"):
            request_path = request_path[len(PROJECT_PREFIX):] or "/"
        cms_prefix = "/assets/main/framerusercontent.com/cms/"
        if request_path.startswith(cms_prefix):
            request_path = "/assets/main/framerusercontent.com/modules/" + request_path[len(cms_prefix):]
        route = request_path.rstrip("/") or "/"
        if route in ROUTES:
            return str(ROOT / ROUTES[route])
        return super().translate_path(request_path)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8787
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
