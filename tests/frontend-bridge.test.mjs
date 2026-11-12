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

test('section heading primary links retain readable button text', async () => {
  const [cook, styles] = await Promise.all([
    source('web/src/screens/Cook.tsx'),
    source('web/src/theme/global.css'),
  ]);
  assert.match(cook, /className="btn btn--primary btn--sm">\+ Fill up fridge/);
  assert.match(styles, /\.btn--primary\s*\{[^}]*color:\s*var\(--text-on-primary\)/);
  assert.match(styles, /\.section-heading a:not\(\.btn\)/);
  assert.doesNotMatch(styles, /\.section-heading a\s*\{/);
});

test('iOS shell prevents accidental double-tap zoom across the whole app', async () => {
  const styles = await source('web/src/theme/global.css');
  assert.match(styles, /\*, \*::before, \*::after\s*\{[^}]*touch-action:\s*manipulation/);
});

test('fridge and receipt close actions cannot bounce between each other', async () => {
  const [fridge, receipt] = await Promise.all([
    source('web/src/screens/AddIngredient.tsx'),
    source('web/src/screens/ScanCamera.tsx'),
  ]);
  assert.match(fridge, /onBack=\{\(\) => nav\("\/cook", \{ replace: true \}\)\}/);
  assert.match(receipt, /onClick=\{\(\) => nav\("\/fridge\/add", \{ replace: true \}\)\}/);
});

test('simple pantry categories preserve photos and the live My fridge screen', async () => {
  const [app, cook, fridge, categories, home, recipe, scanDone, profile] = await Promise.all([
    source('web/src/App.tsx'),
    source('web/src/screens/Cook.tsx'),
    source('web/src/screens/MyFridge.tsx'),
    source('web/src/components/FoodCategoryIcon.tsx'),
    source('web/src/screens/Home.tsx'),
    source('web/src/screens/Recipe.tsx'),
    source('web/src/screens/ScanDone.tsx'),
    source('web/src/screens/My.tsx'),
  ]);
  assert.match(app, /path="\/fridge" element=\{<MyFridge \/>\}/);
  assert.match(cook, /to="\/fridge">View all/);
  for (const action of ['pantry', 'removePantry', 'setPantryDate']) assert.match(fridge, new RegExp(action));
  assert.match(fridge, /to="\/fridge\/add"/);
  for (const category of ['fruit', 'vegetable', 'dairy', 'protein', 'grains', 'drink', 'pantry']) assert.match(categories, new RegExp(`"${category}"`));
  assert.match(cook, /<FoodCategoryIcon name=\{item\.name\}/);
  assert.match(fridge, /<FoodCategoryIcon name=\{item\.name\}/);
  for (const screen of [cook, home, recipe, scanDone, profile]) assert.match(screen, /assets\/photos/);
});

test('current UI uses the original always-light green palette and leaf-free ingredi period wordmark', async () => {
  const [tokenCss, tokenJson, logo, logoCss, html, main, shell, welcome] = await Promise.all([
    source('web/src/theme/tokens.css'),
    source('web/src/theme/tokens.json'),
    source('web/src/components/Logotype.tsx'),
    source('web/src/components/Logotype.css'),
    source('web/index.html'),
    source('web/src/main.tsx'),
    source('public/app.js'),
    source('public/features/kitchen-views.mjs'),
  ]);
  const tokens = JSON.parse(tokenJson).color.tokens;
  const value = (name) => tokens.find((token) => token.name === name)?.value;
  assert.deepEqual(value('primary'), { light: '#234D3C', dark: '#3E6B55' });
  assert.deepEqual(value('brand-green'), { light: '#8BAE4D', dark: '#C1D77E' });
  assert.match(tokenCss, /--primary:\s*#234D3C/);
  assert.match(tokenCss, /--accent-tint:\s*#DDEAAF/);
  assert.doesNotMatch(tokenCss, /#BF4F3B/);
  assert.match(logo, /aria-label="ingredi\."/);
  assert.match(logo, />ingredi<span className="logotype__period"/);
  assert.match(logoCss, /\.logotype__period[^}]*var\(--brand-green\)/);
  assert.match(html, /<title>ingredi\.<\/title>/);
  assert.match(main, /document\.documentElement\.dataset\.theme = "light"/);
  assert.doesNotMatch(shell, /class="(?:mobile-brand )?brand"[^>]*>\$\{icon\("leaf"\)\}/);
  assert.doesNotMatch(welcome, /class="brand">\$\{icon\("leaf"\)\}/);
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
