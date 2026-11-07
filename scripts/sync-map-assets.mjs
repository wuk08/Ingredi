import { cp,mkdir } from 'node:fs/promises';
await mkdir('public/vendor/maplibre',{recursive:true});
for(const name of ['maplibre-gl.mjs','maplibre-gl-worker.mjs','maplibre-gl-shared.mjs','maplibre-gl.css'])await cp(`node_modules/maplibre-gl/dist/${name}`,`public/vendor/maplibre/${name}`);
await cp('node_modules/maplibre-gl/LICENSE.txt','public/vendor/maplibre/LICENSE.txt');
