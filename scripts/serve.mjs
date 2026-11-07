import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { config } from '../public/config.js';
const root = resolve('public');
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob: data: https://tile.openstreetmap.org; connect-src 'self' https://*.supabase.co; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    if (path === '/config.js') {
      res.writeHead(200,{'Content-Type':'text/javascript'}).end(`export const config = ${JSON.stringify({supabaseUrl: process.env.SUPABASE_URL || config.supabaseUrl, publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || config.publishableKey})};`); return;
    }
    const data = await readFile(file);
    res.writeHead(200,{'Content-Type':`${types[extname(file)] || 'application/octet-stream'}; charset=utf-8`}).end(data);
  } catch { res.writeHead(404).end('Not found'); }
});
server.listen(port,'127.0.0.1', () => console.log(`Ingredi is ready at http://127.0.0.1:${port}`));
