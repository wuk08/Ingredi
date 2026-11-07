import { isNativeApp } from './capture.mjs';
import { icon, escape } from './ui.mjs';
export const ANN_ARBOR = [42.2808, -83.7430];
export const DEFAULT_VIEW = { center: ANN_ARBOR, zoom: 14 };

// These positions belong to sample listings, never to real neighbors.
export function demoPosition(post) {
  let hash=0;
  for(const c of post.id) hash=(hash*31+c.charCodeAt(0))>>>0;
  const angle=(hash%360)*Math.PI/180, miles=Math.max(.08,Number(post.distance)||.2);
  return [ANN_ARBOR[0]+Math.cos(angle)*miles/69,ANN_ARBOR[1]+Math.sin(angle)*miles/(69*Math.cos(ANN_ARBOR[0]*Math.PI/180))];
}
export async function currentPosition({native=isNativeApp(),loadNative=()=>import('@capacitor/geolocation'),geolocation=globalThis.navigator?.geolocation}={}) {
  let position;
  if(native){const {Geolocation}=await loadNative();position=await Geolocation.getCurrentPosition({enableHighAccuracy:false,timeout:10000,maximumAge:60000});}
  else {if(!geolocation)throw new Error('Location is unavailable here. Showing Ann Arbor.');position=await new Promise((resolve,reject)=>geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:false,timeout:10000,maximumAge:60000}));}
  const {latitude,longitude}=position.coords;
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)throw new Error('Location was not readable. Showing Ann Arbor.');
  return [latitude,longitude];
}
export function mountMap({element,posts,selected,view=DEFAULT_VIEW,location,onSelect,onView}) {
  const L=globalThis.L;
  if(!L){element.innerHTML='<p class="map-load-notice">The map could not load. Switch to List to browse demo posts.</p>';return ()=>{};}
  const map=L.map(element,{attributionControl:false}).setView(view.center,view.zoom);
  L.control.attribution({position:'topright',prefix:false}).addTo(map);
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
  const notice=document.createElement('div');notice.className='map-load-notice';notice.hidden=true;notice.textContent='Street tiles unavailable. Sample pins remain in Ann Arbor. Check your connection.';element.append(notice);
  let loaded=0;tiles.on('tileload',()=>{loaded++;notice.hidden=true;});tiles.on('tileerror',()=>{if(!loaded)notice.hidden=false;});
  for(const p of posts){const marker=L.marker(demoPosition(p),{title:p.title,alt:p.title,icon:L.divIcon({className:`real-map-pin ${p.id===selected?'selected':''}`,html:icon('pin'),iconSize:[44,44],iconAnchor:[22,40]})}).addTo(map);marker.on('click',()=>onSelect(p.id));marker.bindTooltip(escape(p.title));}
  if(location)L.circleMarker(location,{radius:8,color:'#fff',weight:3,fillColor:'#3478b7',fillOpacity:1}).addTo(map).bindTooltip('Your location');
  map.on('moveend zoomend',()=>{const center=map.getCenter();onView({center:[center.lat,center.lng],zoom:map.getZoom()});});
  const resize=new ResizeObserver(()=>map.invalidateSize({pan:false}));resize.observe(element);
  return ()=>{resize.disconnect();map.remove();};
}
