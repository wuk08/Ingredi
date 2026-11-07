import { config } from '../config.js';

const SESSION_KEY = 'ingredi.session.v1';
let session;
try { session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { session = null; }
let refreshing;
function remember(value) {
  session = value?.access_token ? value : null;
  if (session) {
    session.expires_at ||= Math.floor(Date.now()/1000) + session.expires_in;
    localStorage.setItem(SESSION_KEY,JSON.stringify(session));
  } else localStorage.removeItem(SESSION_KEY);
  return session;
}
export function getSession() { return session; }
async function unpack(response) {
  const text = await response.text();
  let value; try { value = text ? JSON.parse(text) : null; } catch { value = null; }
  if (!response.ok) {
    const message = value?.error_description || (typeof value?.error === 'string' && value.error) || value?.message || 'Connection failed. Please retry.';
    const error = new Error(message); error.status = response.status; throw error;
  }
  return value;
}
async function token() {
  if (!session) throw new Error('Please sign in first.');
  if (session.expires_at > Date.now()/1000 + 60) return session.access_token;
  if (!refreshing) refreshing = fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method:'POST', headers:{apikey:config.publishableKey,'Content-Type':'application/json'}, body:JSON.stringify({refresh_token:session.refresh_token}), signal:AbortSignal.timeout(15000),
  }).then(unpack).then(remember).catch(error => { if ([400,401,403].includes(error.status)) remember(null); throw error; }).finally(() => { refreshing = null; });
  return (await refreshing).access_token;
}
export async function api(path, { method='GET', body, headers={}, timeout=20000 } = {}) {
  const accessToken = await token();
  return fetch(`${config.supabaseUrl}${path}`, {
    method, headers:{apikey:config.publishableKey,Authorization:`Bearer ${accessToken}`,...(body instanceof Blob?{}:{'Content-Type':'application/json'}),...headers},
    body:body instanceof Blob?body:body===undefined?undefined:JSON.stringify(body), signal:AbortSignal.timeout(timeout),
  }).then(unpack);
}
export async function signIn(email,password) {
  return fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email,password}),signal:AbortSignal.timeout(15000)}).then(unpack).then(remember);
}
export async function signUp(email,password) {
  const result = await fetch(`${config.supabaseUrl}/auth/v1/signup`, {method:'POST',headers:{apikey:config.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email,password}),signal:AbortSignal.timeout(15000)}).then(unpack);
  if (result.access_token) remember(result);
  return result;
}
export async function signOut() {
  try { if (session) await api('/auth/v1/logout',{method:'POST'}); } finally { remember(null); }
}
export async function ensureProfile() {
  // Only insert allowed columns. Protected counters always use database defaults.
  return api('/rest/v1/profiles?on_conflict=id',{method:'POST',body:{id:session.user.id,display_name:'My kitchen'},headers:{Prefer:'resolution=ignore-duplicates,return=minimal'}});
}
export async function loadKitchen() {
  await ensureProfile();
  const [pantry,recipes,scans] = await Promise.all([
    api('/rest/v1/pantry_items?select=*&order=created_at.desc'),
    api('/rest/v1/recipes?select=*'),
    api('/rest/v1/receipt_scans?select=*&order=created_at.desc&limit=5'),
  ]);
  return {pantry,recipes,scans};
}
export async function scanReceipt({ id, file, mode }) {
  let path = null;
  if (mode === 'live') {
    const extension = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type];
    path = `${session.user.id}/${id}.${extension}`;
    await api(`/storage/v1/object/receipts/${path}`,{method:'POST',body:file,headers:{'Content-Type':file.type,'x-upsert':'false'}});
  }
  return api('/functions/v1/scan-receipt',{method:'POST',body:{scan_id:id,mode,storage_path:path,consent_to_openai:mode==='live'},timeout:75000});
}
