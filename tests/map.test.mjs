import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ANN_ARBOR,demoPosition,currentPosition} from '../public/lib/nearby-map.mjs';
import {seedCommunity} from '../public/lib/community.mjs';
import {ensurePhotoPermissions,locationPermissions} from '../scripts/lib/ios-config.mjs';

test('sample pins stay deterministic in Ann Arbor regardless of viewer location',()=>{
  for(const post of seedCommunity().posts){const p=demoPosition(post);assert.deepEqual(p,demoPosition(post));assert.ok(Math.abs(p[0]-ANN_ARBOR[0])<.03);assert.ok(Math.abs(p[1]-ANN_ARBOR[1])<.03);}
});
test('browser location is requested only through the explicit adapter and uses a timeout',async()=>{
  let calls=0;const result=await currentPosition({native:false,geolocation:{getCurrentPosition(resolve,reject,options){calls++;assert.equal(options.timeout,10000);resolve({coords:{latitude:42.28,longitude:-83.74}});}}});assert.deepEqual(result,[42.28,-83.74]);assert.equal(calls,1);
});
test('location denial and invalid coordinates reject without inventing a current location',async()=>{
  await assert.rejects(currentPosition({native:false,geolocation:{getCurrentPosition(resolve,reject){reject(new Error('denied'));}}}),/denied/);
  await assert.rejects(currentPosition({native:false,geolocation:{getCurrentPosition(resolve){resolve({coords:{latitude:NaN,longitude:0}});}}}),/not readable/);
});
test('native location uses Capacitor foreground position rather than background tracking',async()=>{
  const result=await currentPosition({native:true,loadNative:async()=>({Geolocation:{getCurrentPosition:async options=>{assert.equal(options.enableHighAccuracy,false);return {coords:{latitude:40,longitude:-74}};}}})});assert.deepEqual(result,[40,-74]);
});
test('native map permissions and tile policy settings are bundled',async()=>{
  const plist=ensurePhotoPermissions('<plist><dict></dict></plist>');for(const key of Object.keys(locationPermissions))assert.ok(plist.includes(`<key>${key}</key>`));assert.equal(ensurePhotoPermissions(plist),plist);
  const config=JSON.parse(await readFile(new URL('../capacitor.config.json',import.meta.url),'utf8'));assert.match(config.appendUserAgent,/Ingredi/);
  const server=await readFile(new URL('../scripts/serve.mjs',import.meta.url),'utf8');assert.match(server,/https:\/\/tile\.openstreetmap\.org/);assert.match(server,/strict-origin-when-cross-origin/);
});
