import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('React state bridge retains Supabase kitchen and persistent community repositories', async () => {
  const state = await source('web/src/data/AppState.tsx');
  for (const expected of ['signIn', 'signUp', 'signOut', 'kitchen.load()', 'kitchen.add', 'kitchen.remove', 'kitchen.setDate', 'scanReceipt', 'confirm_receipt', 'new DemoRepository']) assert.match(state, new RegExp(expected.replace(/[().]/g, '\\$&')));
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
