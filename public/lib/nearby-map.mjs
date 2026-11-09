import { isNativeApp } from './capture.mjs';
import { icon } from './ui.mjs';
export function validLocation(value) {
  return Array.isArray(value)&&value.length===2&&value.every(Number.isFinite)&&Math.abs(value[0])<=90&&Math.abs(value[1])<=180;
}
export function defaultView(location) {
  if(!validLocation(location))throw new Error('Location is required to display Nearby.');
  return {center:[...location],zoom:14};
}
// Sample neighborhood listings are offsets from the saved residence, never real people.
export function demoPosition(post,origin) {
  if(!validLocation(origin))throw new Error('Location is required for sample pins.');
  let hash=0;for(const c of post.id)hash=(hash*31+c.charCodeAt(0))>>>0;
  const bearing=(hash%360)*Math.PI/180, distance=Math.max(.08,Number(post.distance)||.2)/3958.8;
  const lat=origin[0]*Math.PI/180,lon=origin[1]*Math.PI/180;
  const destLat=Math.asin(Math.sin(lat)*Math.cos(distance)+Math.cos(lat)*Math.sin(distance)*Math.cos(bearing));
  const destLon=lon+Math.atan2(Math.sin(bearing)*Math.sin(distance)*Math.cos(lat),Math.cos(distance)-Math.sin(lat)*Math.sin(destLat));
  return [destLat*180/Math.PI,((destLon*180/Math.PI+540)%360)-180];
}
export async function currentPosition({native=isNativeApp(),loadNative=()=>import('@capacitor/geolocation'),geolocation=globalThis.navigator?.geolocation}={}) {
  let position;
  if(native){const {Geolocation}=await loadNative();position=await Geolocation.getCurrentPosition({enableHighAccuracy:false,timeout:10000,maximumAge:60000});}
  else {if(!geolocation)throw new Error('Location is unavailable. Enable location access to use Nearby.');position=await new Promise((resolve,reject)=>geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:10000,maximumAge:60000}));}
  const {latitude,longitude}=position.coords;
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)throw new Error('Location was not readable. Try getting your location again.');
  return [latitude,longitude];
}
const mapAsset = path => new URL(path, document.baseURI).href;
const loadMapLibrary = () => import(mapAsset('vendor/maplibre/maplibre-gl.mjs'));
function mapNotice(element) {
  const notice = document.createElement('div');
  notice.className = 'map-load-notice';
  notice.textContent = 'Loading the street map…';
  element.append(notice);
  return notice;
}
export function mountMap(options, { loadLibrary = loadMapLibrary, workerUrl } = {}) {
  if (!validLocation(options.location)) {
    options.element.textContent = 'Add a map location to your residence to display the map.';
    return () => {};
  }
  let disposed = false, dispose = () => {};
  const notice = mapNotice(options.element);
  Promise.resolve().then(loadLibrary).then(GL => {
    if (disposed) return;
    GL.setWorkerUrl(workerUrl || mapAsset('vendor/maplibre/maplibre-gl-worker.mjs?v=6.16.0'));
    GL.setWorkerCount(1);
    dispose = mountVectorMap({ ...options, notice }, GL);
  }).catch(() => {
    if (disposed) return;
    notice.hidden = false;
    notice.textContent = 'The street map could not load on this device. Switch to List to browse the listings.';
  });
  return () => { if (disposed) return; disposed = true; dispose(); notice.remove(); };
}
export function mountVectorMap({ element, posts, selected, view, location, residenceId, residenceName, avatarFor, onSelect, onView, mapStyle, notice = mapNotice(element) }, GL) {
  const initial = view || defaultView(location);
  // Keep wheel events out of map gesture handlers without cancelling page scrolling.
  const pageWheel = event => event.stopPropagation();
  const map = new GL.Map({
    container: element,
    style: mapStyle || mapAsset('maps/residence-style.json'),
    // Existing views use a 256px tile zoom; the vector renderer uses a 512px world.
    center: [initial.center[1], initial.center[0]], zoom: initial.zoom - 1,
    minZoom: 1, maxZoom: 18, maxPitch: 0,
    // Double-taps/clicks must not change zoom while browsing listings.
    scrollZoom: false, doubleClickZoom: false, cooperativeGestures: false,
    dragPan: true, touchZoomRotate: true, dragRotate: false, touchPitch: false,
    attributionControl: false, fadeDuration: 0,
    renderWorldCopies: false
  });
  element.addEventListener('wheel', pageWheel, { capture: true, passive: true });
  map.touchZoomRotate.disableRotation();
  map.addControl(new GL.NavigationControl({ showCompass: false }), 'top-left');
  map.addControl(new GL.AttributionControl({ compact: false }), 'bottom-right');
  let disposed = false;
  const ready = () => { if (!disposed) notice.hidden = true; };
  const failed = () => {
    if (disposed) return;
    notice.hidden = false;
    notice.textContent = 'Street map unavailable. Your residence is still selected; listings are available below.';
  };
  const loadedSource = event => { if (event.sourceDataType === 'content') ready(); };
  map.on('load', ready);
  map.on('sourcedata', loadedSource);
  map.on('error', failed);
  const buildingPosts = posts.filter(p => residenceId && p.residenceId === residenceId);
  const chosen = buildingPosts.find(p => p.id === selected) || buildingPosts[0];
  const markers = [];
  const displayed = [...posts.filter(p => !residenceId || p.residenceId !== residenceId), ...(chosen ? [chosen] : [])];
  for (const p of displayed) {
    const same = residenceId && p.residenceId === residenceId;
    const position = same ? location : demoPosition(p, location);
    const label = same ? `${residenceName} · ${buildingPosts.length} sample post${buildingPosts.length === 1 ? '' : 's'}` : p.title;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `real-map-pin ${p.id === selected ? 'selected' : ''}`;
    button.title = label;
    button.setAttribute('aria-label', label);
    const avatar = !same && avatarFor?.(p.owner);
    if (same) button.textContent = String(buildingPosts.length);
    else if (avatar) { button.classList.add('has-avatar'); button.style.backgroundImage = `url("${avatar}")`; }
    else button.innerHTML = icon('pin');
    button.onclick = event => {
      event.preventDefault(); event.stopPropagation();
      if (!disposed) onSelect(same ? buildingPosts[(buildingPosts.indexOf(p) + 1) % buildingPosts.length].id : p.id);
    };
    markers.push(new GL.Marker({ element: button, anchor: 'bottom' }).setLngLat([position[1], position[0]]).addTo(map));
  }
  if (!buildingPosts.length) {
    const origin = document.createElement('div'); origin.className = 'residence-origin'; origin.title = residenceName || 'Your residence';
    markers.push(new GL.Marker({ element: origin }).setLngLat([location[1], location[0]]).addTo(map));
  }
  const moved = () => {
    if (disposed) return;
    const center = map.getCenter();
    onView({ center: [center.lat, center.lng], zoom: map.getZoom() + 1 });
  };
  map.on('moveend', moved);
  const resize = new ResizeObserver(() => { if (!disposed) map.resize(); });
  resize.observe(element);
  return () => {
    if (disposed) return;
    disposed = true;
    resize.disconnect();
    element.removeEventListener('wheel', pageWheel, { capture: true });
    map.off('moveend', moved); map.off('load', ready); map.off('sourcedata', loadedSource); map.off('error', failed);
    for (const marker of markers) marker.remove();
    map.remove();
  };
}
