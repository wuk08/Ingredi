import { cp, mkdir } from 'node:fs/promises';
import './sync-map-assets.mjs';
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
console.log('Built static app in dist/. No secrets or server files are included.');
