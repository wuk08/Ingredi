import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('React state bridge retains Supabase kitchen and persistent community repositories', async () => {
  const state = await source('web/src/data/AppState.tsx');
  for (const expected of ['signIn', 'signUp', 'signOut', 'kitchen.load()', 'kitchen.add', 'kitchen.remove', 'kitchen.setDate', 'scanReceipt', 'confirm_receipt', 'new DemoRepository']) assert.match(state, new RegExp(expected.replace(/[().]/g, '\\$&')));
});

test('mock Apple and Google entry points preserve real email and password authentication', async () => {
  const [login, state, api] = await Promise.all([
    source('web/src/screens/Login.tsx'),
    source('web/src/data/AppState.tsx'),
    source('public/lib/api.mjs'),
  ]);
  for (const provider of ['Apple', 'Google']) assert.match(login, new RegExp(`Sign (?:in|up) with ${provider}`));
  assert.match(login, /mockAuthenticate/);assert.match(login, /type="email"/);assert.match(login, /type="password"/);
  assert.match(state, /No provider data was sent/);assert.doesNotMatch(state, /signInWithOAuth/);
  assert.match(api, /grant_type=password/);assert.match(api, /auth\/v1\/signup/);
});

test('new UI exposes original residence, verification, scope, messaging, and exchange actions', async () => {
  const [dialogs, nearby, map, chat, post, group, profile] = await Promise.all([
    source('web/src/components/CommunityDialogs.tsx'),
    source('web/src/screens/Nearby.tsx'),
    source('web/src/components/ResidenceMap.tsx'),
    source('web/src/screens/Chat.tsx'),
    source('web/src/screens/UploadPost.tsx'),
    source('web/src/screens/MealSwap.tsx'),
    source('web/src/screens/My.tsx'),
  ]);
  for (const action of ['student', 'residence', 'checkStudent']) assert.match(dialogs, new RegExp(`runCommunity\\("${action}"`));
  assert.match(nearby, /"building" \| "neighborhood"/);
  assert.match(nearby, /ResidenceMap/);assert.doesNotMatch(nearby, /AnnArborMap/);
  assert.match(nearby, /view === "map" && hasMap/);
  for (const feature of ['mountMap', 'maplibre-gl', 'residence-style.json', 'mapWorkerUrl']) assert.match(map, new RegExp(feature.replace('.', '\\.')));
  for (const action of ['read', 'send', 'complete']) assert.match(chat, new RegExp(`runCommunity\\("${action}"`));
  for (const action of ['saveDraft', 'publish']) assert.match(post, new RegExp(`runCommunity\\("${action}"`));
  assert.match(group, /runCommunity\("join"/);
  for (const feature of ['updateProfile', 'preferences', 'resetCommunity', 'logout']) assert.match(profile, new RegExp(feature));
});

test('main user portraits remain connected to the functional community UI and map', async () => {
  const [avatar, people, mapModule, ...screens] = await Promise.all([
    source('web/src/components/Avatar.tsx'),
    source('web/src/data/people.ts'),
    source('public/lib/nearby-map.mjs'),
    ...['Home', 'Messages', 'Chat', 'Post', 'MealSwap', 'My'].map(name => source(`web/src/screens/${name}.tsx`)),
  ]);
  assert.match(avatar, /personas as Record/);
  assert.match(avatar, /initials\(name\)/, 'custom profile names keep a readable fallback');
  for (const index of [1, 2, 3, 5, 6, 7, 8]) assert.match(people, new RegExp(`ingredi-avatar-${String(index).padStart(2, '0')}\\.png`));
  for (const screen of screens) {
    assert.match(screen, /import \{ Avatar \}/);
    assert.match(screen, /<Avatar/);
  }
  assert.match(mapModule, /avatarFor\?\.\(p\.owner\)/);
  assert.match(mapModule, /classList\.add\('has-avatar'\)/);
});
