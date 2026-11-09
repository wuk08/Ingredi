import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {demoPosition,currentPosition,defaultView,mountMap,mountVectorMap} from '../public/lib/nearby-map.mjs';
import {seedCommunity,ensureResidenceState,actions,communityView} from '../public/lib/community.mjs';
import {ensurePhotoPermissions,locationPermissions} from '../scripts/lib/ios-config.mjs';
import {nearby} from '../public/features/community-views.mjs';

test('Nearby requires residence setup, then uses its saved location without a device fix',()=>{
  const html=nearby({state:{mapLocation:null,locating:false,locationError:'Permission denied'},d:seedCommunity()});
  assert.match(html,/Set up my residence/);assert.doesNotMatch(html,/nearby-map-canvas|Ann Arbor|map-preview/);
  const data=ensureResidenceState(seedCommunity());actions.student(data,{isStudent:false});actions.residence(data,{name:'Home Building',address:'100 Test Street, Test City',kind:'apartment',center:[40,-74]});
  const ready=nearby({state:{mapLocation:null,nearby:{view:'map'}},d:communityView(data),photoURL:()=>''});
  assert.match(ready,/nearby-map-canvas/);assert.match(ready,/Your residence/);assert.doesNotMatch(ready,/Use my location|Ann Arbor|ann-arbor/);
  actions.residence(data,{name:'Manual Building',address:'200 Test Street, Test City',kind:'apartment'});
  const manual=nearby({state:{nearby:{view:'map',scope:'building'}},d:communityView(data),photoURL:()=>''});
  assert.match(manual,/nearby-list/);assert.match(manual,/Same building/);assert.doesNotMatch(manual,/nearby-map-canvas/);
});

test('sample pins follow the viewer location and remain deterministic',()=>{
  const origins=[[40,-74],[34,-118],[89.99,179.99]];
  for(const origin of origins)for(const post of seedCommunity().posts){
    const p=demoPosition(post,origin);assert.deepEqual(p,demoPosition(post,origin));
    assert.ok(Number.isFinite(p[0])&&Math.abs(p[0])<=90);assert.ok(Number.isFinite(p[1])&&Math.abs(p[1])<=180);
    const rad=x=>x*Math.PI/180,dlat=rad(p[0]-origin[0]),dlon=rad(p[1]-origin[1]);
    const a=Math.sin(dlat/2)**2+Math.cos(rad(origin[0]))*Math.cos(rad(p[0]))*Math.sin(dlon/2)**2;
    assert.ok(Math.abs(2*3958.8*Math.asin(Math.sqrt(a))-post.distance)<.0001);
  }
  const post=seedCommunity().posts[0];assert.notDeepEqual(demoPosition(post,origins[0]),demoPosition(post,origins[1]));
});
test('Nearby has no map center or sample pins without a valid user location',()=>{
  for(const invalid of [undefined,null,[],[NaN,0],[91,0],[0,181]]){
    assert.throws(()=>defaultView(invalid),/Location is required/);
    assert.throws(()=>demoPosition(seedCommunity().posts[0],invalid),/Location is required/);
  }
  assert.deepEqual(defaultView([0,0]),{center:[0,0],zoom:14});
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
  const server=await readFile(new URL('../scripts/serve.mjs',import.meta.url),'utf8');assert.match(server,/https:\/\/tiles\.openfreemap\.org/);assert.match(server,/strict-origin-when-cross-origin/);
});

test('map teardown ignores queued movement and resize callbacks after changing views',t=>{
  const originals={document:globalThis.document,ResizeObserver:globalThis.ResizeObserver};
  t.after(()=>Object.assign(globalThis,originals));
  const handlers=new Map();let removed=false,resizes=0,views=0,resizeCallback,removedMarkers=0,mapZoom,mapCenter;
  const map={
    touchZoomRotate:{disableRotation(){}},addControl(){return this;},
    on(name,callback){handlers.set(name,callback);return this;},
    off(name){handlers.delete(name);return this;},
    getCenter(){assert.equal(removed,false,'movement must not read a removed map');return {lat:40,lng:-74};},
    getZoom(){return mapZoom;},
    resize(){assert.equal(removed,false,'queued resize must not touch a removed map');resizes++;},
    remove(){removed=true;handlers.get('moveend')?.();}
  };
  const customStyle={version:8,sources:{},layers:[]};
  const GL={Map:class{constructor(options){assert.equal(options.doubleClickZoom,false,'double taps and double clicks must not zoom the map');assert.equal(options.scrollZoom,false,'scrolling the page must not zoom the map');assert.notEqual(options.touchZoomRotate,false,'deliberate pinch zoom remains available');assert.equal(options.style,customStyle);mapZoom=options.zoom;mapCenter=options.center;return map;}},NavigationControl:class{},AttributionControl:class{},Marker:class{setLngLat(){return this;}addTo(){return this;}remove(){removedMarkers++;}}};
  globalThis.document={baseURI:'https://ingredi.test/index.html',createElement:()=>({})};
  globalThis.ResizeObserver=class{constructor(callback){resizeCallback=callback;}observe(){}disconnect(){}};
  const dispose=mountVectorMap({element:{append(){},addEventListener(){},removeEventListener(){}},posts:[],location:[40,-74],mapStyle:customStyle,onSelect(){},onView(value){views++;assert.deepEqual(value,{center:[40,-74],zoom:14});}},GL);
  assert.deepEqual(mapCenter,[-74,40]);assert.equal(mapZoom,13);
  const queuedMovement=handlers.get('moveend');queuedMovement();resizeCallback();
  assert.equal(views,1);assert.equal(resizes,1);
  dispose();resizeCallback();queuedMovement();dispose();
  assert.equal(removed,true);assert.equal(views,1);assert.equal(resizes,1);assert.equal(removedMarkers,1);
});

test('leaving Nearby before the vector library loads cannot mount a stale map',async t=>{
  const original=globalThis.document;t.after(()=>{globalThis.document=original;});
  let finish,initialized=false,noticeRemoved=false;
  globalThis.document={createElement:()=>({remove(){noticeRemoved=true;}})};
  const dispose=mountMap({element:{append(){}},location:[40,-74]},{loadLibrary:()=>new Promise(resolve=>{finish=resolve;})});
  await new Promise(resolve=>setImmediate(resolve));
  dispose();finish({setWorkerUrl(){initialized=true;}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(initialized,false);assert.equal(noticeRemoved,true);
});

test('street style preserves geography while omitting raster textures and dense POIs',async()=>{
  const style=JSON.parse(await readFile(new URL('../public/maps/residence-style.json',import.meta.url),'utf8'));
  assert.equal(style.version,8);assert.equal(style.sources.streets.type,'vector');
  assert.equal(style.layers.find(l=>l.id==='buildings').type,'fill');
  assert.equal(style.layers.find(l=>l.id==='street-names')['source-layer'],'transportation_name');
  assert.ok(style.layers.some(l=>l['source-layer']==='water'));assert.ok(style.layers.some(l=>l['source-layer']==='park'));
  assert.equal(style.layers.some(l=>l.type==='raster'||l.type==='fill-extrusion'||l.paint?.['fill-pattern']),false);
  assert.equal(style.layers.some(l=>l['source-layer']==='housenumber'),false);
  const landmarks=style.layers.filter(l=>l['source-layer']==='poi');assert.equal(landmarks.length,1);assert.ok(landmarks[0].minzoom>=16);
  const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');assert.match(html,/vendor\/maplibre\/maplibre-gl.css/);assert.doesNotMatch(html,/leaflet/);
  const native=await readFile(new URL('../scripts/build-ios.mjs',import.meta.url),'utf8');assert.match(native,/worker-src 'self'/);assert.match(native,/tiles.openfreemap.org/);
});
