import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const port = Number(process.env.PORT || 8080);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded.replace(/^[/\\]+/, "");
  const full = path.resolve(root, relative);
  const fromRoot = path.relative(root, full);
  if (fromRoot.startsWith("..") || path.isAbsolute(fromRoot)) return null;
  return full;
}

function sendFile(res, status, file) {
  const type = types[path.extname(file)] || "application/octet-stream";
  res.writeHead(status, { "Content-Type": type });
  fs.createReadStream(file).pipe(res);
}

function send404(res) {
  sendFile(res, 404, path.join(root, "404.html"));
}

const server = http.createServer((req, res) => {
  let full;
  try {
    full = resolvePath(req.url || "/");
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }

  if (!full) {
    send404(res);
    return;
  }

  if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
    full = path.join(full, "index.html");
  }

  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    send404(res);
    return;
  }

  sendFile(res, 200, full);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Preview at http://127.0.0.1:${port}`);
});
