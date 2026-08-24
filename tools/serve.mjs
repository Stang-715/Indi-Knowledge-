#!/usr/bin/env node
/** Static server for the client. No dependencies, no build step. */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 8420);
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
  '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    // Redirect rather than serve the client at the root: its script and
    // stylesheet paths are relative to its own directory, and serving it one
    // level up silently 404s them.
    if (p === '/') {
      res.writeHead(302, { location: '/apps/client/' });
      return res.end();
    }
    let file = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ''));
    let st = await stat(file);
    if (st.isDirectory()) { file = join(file, 'index.html'); st = await stat(file); }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
                         'cache-control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
}).listen(PORT, () => console.log(`  paramountcy → http://localhost:${PORT}/`));
