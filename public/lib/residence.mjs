import { validLocation } from './nearby-map.mjs';

export const defaultGeocoderUrl = 'https://photon.komoot.io';
export const activeResidence = data => data?.residences?.find(r => r.id === data.activeResidenceId) || null;
export const setupComplete = data => typeof data?.student?.isStudent === 'boolean' && Boolean(activeResidence(data));
export const needsStudentCheck = data => data?.student?.isStudent === true && data.student.verification !== 'demo_complete';

export function normalizeResidence(value) {
  const name = String(value.name || '').trim(), address = String(value.address || '').trim();
  if (!name || name.length > 120 || !address || address.length > 240) throw new Error('Enter a building name and building address (up to 120 and 240 characters).');
  if (!['apartment', 'dorm', 'other'].includes(value.kind)) throw new Error('Choose apartment, dorm, or other.');
  if (value.center != null && !validLocation(value.center)) throw new Error('The map location is invalid. Search again or save without a map location.');
  const providerId = /^osm:[NWR]:\d+$/.test(value.id || '') ? value.id : null;
  const lookupId = providerId || (/^osm:[NWR]:\d+$/.test(value.lookupId || '') ? value.lookupId : null);
  // A normalized manual address reopens the same local community, including after reload.
  const manualId = `manual:${address.toLocaleLowerCase('en-US').replace(/\s+/g, ' ')}`;
  return { id: providerId || manualId, lookupId, name, address, kind: value.kind, center: value.center ? [...value.center] : null, approximate: Boolean(value.center && value.approximate), source: lookupId ? 'photon' : 'manual', selfConfirmed: true };
}

export function normalizeCandidates(payload) {
  if (!Array.isArray(payload?.features)) throw new Error('Address search returned an unreadable response. Try again or enter your building manually.');
  const seen = new Set();
  return payload.features.flatMap(feature => {
    const p = feature.properties || {}, coordinates = feature.geometry?.coordinates;
    const center = Array.isArray(coordinates) ? [coordinates[1], coordinates[0]] : null;
    if (!validLocation(center) || !/^[NWR]$/.test(p.osm_type) || !Number.isSafeInteger(p.osm_id)) return [];
    const id = `osm:${p.osm_type}:${p.osm_id}`;
    if (seen.has(id)) return [];
    seen.add(id);
    const address = [...new Set([ [p.housenumber, p.street].filter(Boolean).join(' '), p.city || p.town || p.village || p.locality, p.state, p.postcode, p.country ].filter(Boolean))].join(', ');
    const broad = ['place', 'highway'].includes(p.osm_key) || ['university', 'college', 'campus'].includes(p.osm_value);
    const building = !broad && (p.osm_key === 'building' || Boolean(p.housenumber && p.street));
    return [{ id, name: p.name || [p.housenumber, p.street].filter(Boolean).join(' ') || address, address: address || p.name || '', center, building, approximate: !building, kind: p.osm_value === 'dormitory' ? 'dorm' : 'apartment' }];
  }).slice(0, 5);
}

export function createResidenceLookup({ baseUrl = defaultGeocoderUrl, fetcher = globalThis.fetch, timeout = 10000 } = {}) {
  const cache = new Map();
  async function lookup(path, params, signal) {
    const url = new URL(path, `${baseUrl.replace(/\/$/, '')}/`);
    for (const [key, value] of Object.entries({ ...params, limit: 5 })) url.searchParams.set(key, String(value));
    const key = url.href;
    if (signal?.aborted) throw new DOMException('Search cancelled', 'AbortError');
    if (cache.has(key)) return structuredClone(cache.get(key));
    // AbortSignal.any is newer than the supported Safari target.
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => controller.abort(new DOMException('Address search timed out', 'TimeoutError')), timeout);
    let response;
    try {
      response = await fetcher(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(response.status === 429 ? 'Address search is busy. Wait a moment and try again, or enter your building manually.' : 'Address search is unavailable. Try again or enter your building manually.');
      const candidates = normalizeCandidates(await response.json());
      if (controller.signal.aborted) throw controller.signal.reason;
      if (cache.size >= 40) cache.delete(cache.keys().next().value);
      cache.set(key, candidates);
      return structuredClone(candidates);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }
  return {
    search(query, signal) {
      const q = String(query || '').trim();
      if (q.length < 3 || q.length > 240) return Promise.reject(new Error('Enter an address or building name between 3 and 240 characters.'));
      return lookup('api/', { q }, signal);
    },
    reverse(center, signal) {
      if (!validLocation(center)) return Promise.reject(new Error('Your location was not readable. Enter your building address instead.'));
      return lookup('reverse', { lat: center[0], lon: center[1], radius: 0.2 }, signal);
    },
    clear() { cache.clear(); }
  };
}
