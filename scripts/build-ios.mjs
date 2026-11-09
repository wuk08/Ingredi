import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'vite';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const executable = (name) => `node_modules/.bin/${name}${process.platform === 'win32' ? '.cmd' : ''}`;

// Type-check the prototype before packaging it. Vite then emits directly into
// Capacitor's configured webDir so the native project and browser prototype use
// the same UI implementation.
run(executable('tsc'), ['-b', 'web']);
await build({
  root: 'web',
  configFile: 'web/vite.config.ts',
  base: '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});

// React uses element.style for the token-driven layout. Auth, private kitchen
// data, receipt scanning, address lookup, and maps retain the same explicit
// network allow-list as the original frontend.
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://hdclurdjuziprukiuamq.supabase.co https://tiles.openfreemap.org; font-src 'self'; worker-src 'self'; connect-src 'self' https://hdclurdjuziprukiuamq.supabase.co wss://hdclurdjuziprukiuamq.supabase.co https://photon.komoot.io https://tiles.openfreemap.org; object-src 'none'; base-uri 'self'; form-action 'self'";
const html=await readFile('dist/index.html','utf8');
await writeFile('dist/index.html',html.replace('<head>',`<head>\n  <meta http-equiv="Content-Security-Policy" content="${csp}">`));
console.log('Built the React prototype as the bundled iOS frontend. No local server is needed.');
