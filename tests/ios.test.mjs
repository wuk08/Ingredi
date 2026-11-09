import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { captureNativeReceipt } from '../public/lib/capture.mjs';
import { ensurePhotoPermissions, photoPermissions } from '../scripts/lib/ios-config.mjs';

const png=new Uint8Array([137,80,78,71,13,10,26,10]);
test('native camera returns a validated File without uploading it',async()=>{
  let calls=0;
  const file=await captureNativeReceipt('camera',{
    loadCamera:async()=>({Camera:{takePhoto:async options=>{assert.equal(options.saveToGallery,false);assert.equal(options.correctOrientation,true);return {webPath:'capacitor://localhost/photo'};}}}),
    fetchImage:async url=>{calls++;assert.equal(url,'capacitor://localhost/photo');return new Response(png,{headers:{'Content-Type':'application/octet-stream'}});},
  });
  assert.equal(file.type,'image/png');assert.equal(file.name,'receipt.png');assert.equal(calls,1);
});
test('native gallery uses one selected photo and cancellation is harmless',async()=>{
  const file=await captureNativeReceipt('photos',{
    loadCamera:async()=>({Camera:{chooseFromGallery:async options=>{assert.equal(options.allowMultipleSelection,false);return {results:[{webPath:'photo.png'}]};}}}),
    fetchImage:async()=>new Response(png),
  });
  assert.equal(file.size,8);
  const cancelled=await captureNativeReceipt('camera',{loadCamera:async()=>({Camera:{takePhoto:async()=>{throw new Error('User cancelled camera');}}})});
  assert.equal(cancelled,null);
});
test('native permission and malformed file failures have usable messages',async()=>{
  await assert.rejects(captureNativeReceipt('camera',{loadCamera:async()=>({Camera:{takePhoto:async()=>{throw new Error('Permission denied');}}})}),/Settings/);
  await assert.rejects(captureNativeReceipt('photos',{loadCamera:async()=>({Camera:{chooseFromGallery:async()=>({results:[{webPath:'bad'}]})}}),fetchImage:async()=>new Response('<script>not a photo</script>')}),/JPEG, PNG or WebP/);
});
test('photo permission descriptions are placed in the root plist dictionary',()=>{
  const nested='<plist><dict><key>Scenes</key><dict><key>NSCameraUsageDescription</key><string>Existing text</string></dict></dict></plist>';
  const patched=ensurePhotoPermissions(nested);
  assert.ok(patched.indexOf('<key>NSCameraUsageDescription')>patched.indexOf('</dict>'));
  assert.equal((patched.match(/<key>NSCameraUsageDescription/g)||[]).length,1);
  assert.ok(patched.includes('<string>Existing text</string>'));
  assert.equal(ensurePhotoPermissions(patched),patched);
});
test('native demo uses bundled assets and includes the camera plugin',async()=>{
  const config=JSON.parse(await readFile(new URL('../capacitor.config.json',import.meta.url),'utf8'));
  assert.equal(config.webDir,'dist');assert.equal(config.server?.url,undefined);
  const plist=await readFile(new URL('../ios/App/App/Info.plist',import.meta.url),'utf8');
  for(const key of Object.keys(photoPermissions))assert.ok(plist.includes(`<key>${key}</key>`));
  const swift=await readFile(new URL('../ios/App/CapApp-SPM/Package.swift',import.meta.url),'utf8');
  assert.match(swift,/CapacitorCamera/);assert.ok(!swift.includes('C:\\Users'));
  const build=await readFile(new URL('../scripts/build-ios.mjs',import.meta.url),'utf8');
  assert.match(build,/root:\s*'web'/);assert.doesNotMatch(build,/public\/app\.js/);
  assert.match(build,/hdclurdjuziprukiuamq\.supabase\.co/);
  assert.match(build,/photon\.komoot\.io/);
  const scanner=await readFile(new URL('../web/src/screens/ScanCamera.tsx',import.meta.url),'utf8');
  assert.match(scanner,/captureNativeReceipt\(source\)/);
  assert.match(scanner,/startReceiptScan\(file, mode\)/);
  const state=await readFile(new URL('../web/src/data/AppState.tsx',import.meta.url),'utf8');
  assert.match(state,/public\/lib\/api\.mjs/);
  assert.match(state,/public\/lib\/community\.mjs/);
  assert.match(state,/confirm_receipt/);
  const map=await readFile(new URL('../web/src/components/ResidenceMap.tsx',import.meta.url),'utf8');
  assert.match(map,/mountMap/);assert.match(map,/maplibre-gl-worker\.mjs\?url/);assert.match(map,/residence-style\.json/);
});
