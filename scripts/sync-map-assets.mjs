import { cp,mkdir } from 'node:fs/promises';
await mkdir('public/vendor/leaflet',{recursive:true});
for(const name of ['leaflet.js','leaflet.css','images'])await cp(`node_modules/leaflet/dist/${name}`,`public/vendor/leaflet/${name}`,{recursive:true});
await cp('node_modules/leaflet/LICENSE','public/vendor/leaflet/LICENSE');
