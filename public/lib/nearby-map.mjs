import { isNativeApp } from './capture.mjs';
import { icon, escape } from './ui.mjs';
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
export function mountMap({element,posts,selected,view,location,residenceId,residenceName,onSelect,onView}) {
  if(!validLocation(location)){element.textContent='Add a map location to your residence to display the map.';return ()=>{};}
  const L=globalThis.L;
  if(!L){element.innerHTML='<p class="map-load-notice">The map could not load. Switch to List to browse demo posts.</p>';return ()=>{};}
  const map=L.map(element,{attributionControl:false}).setView((view||defaultView(location)).center,(view||defaultView(location)).zoom);
  L.control.attribution({position:'topright',prefix:false}).addTo(map);
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
  const notice=document.createElement('div');notice.className='map-load-notice';notice.hidden=true;notice.textContent='Street tiles unavailable. Your residence is still selected. Check your connection.';element.append(notice);
  let loaded=0;tiles.on('tileload',()=>{loaded++;notice.hidden=true;});tiles.on('tileerror',()=>{if(!loaded)notice.hidden=false;});
  const buildingPosts=posts.filter(p=>residenceId&&p.residenceId===residenceId);
  const chosen=buildingPosts.find(p=>p.id===selected)||buildingPosts[0];
  const markers=[...posts.filter(p=>!residenceId||p.residenceId!==residenceId),...(chosen?[chosen]:[])];
  for(const p of markers){const same=residenceId&&p.residenceId===residenceId;const label=same?`${residenceName} · ${buildingPosts.length} sample posts`:p.title;const marker=L.marker(same?location:demoPosition(p,location),{title:label,alt:label,icon:L.divIcon({className:`real-map-pin ${p.id===selected?'selected':''}`,html:same?`<span>${buildingPosts.length}</span>`:icon('pin'),iconSize:[44,44],iconAnchor:[22,40]})}).addTo(map);marker.on('click',()=>onSelect(same?buildingPosts[(buildingPosts.indexOf(p)+1)%buildingPosts.length].id:p.id));marker.bindTooltip(escape(label));}
  if(location)L.circleMarker(location,{radius:8,color:'#fff',weight:3,fillColor:'#3478b7',fillOpacity:1}).addTo(map).bindTooltip(escape(residenceName||'Your residence'));
  map.on('moveend zoomend',()=>{const center=map.getCenter();onView({center:[center.lat,center.lng],zoom:map.getZoom()});});
  const resize=new ResizeObserver(()=>map.invalidateSize({pan:false}));resize.observe(element);
  return ()=>{resize.disconnect();map.remove();};
}
