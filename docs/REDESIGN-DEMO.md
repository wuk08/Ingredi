# Five-tab competition demo

Ingredi now follows the supplied Home / Cook / Nearby / Message / My references, using forest green, white, pale green cards, food illustrations, and initials avatars. Detail flows fill the phone screen and use fixed bottom actions. Larger screens use the same destinations in a sidebar.

## Run and prepare

```powershell
node scripts/serve.mjs
node --test tests/*.test.mjs
node scripts/build-ios.mjs
```

Open http://127.0.0.1:5173. Choose **Explore the demo** for a sample fridge. An existing local fridge is preserved. Sign in with email for the real private fridge and live AI scanning; signing in does not copy sample ingredients into the account.

For the native app, pull/copy the updated source onto the Mac, install the pinned dependencies, and run `pnpm ios:prepare` before building again in Xcode. The installed phone app uses bundled files; refreshing the Windows preview does not update it. See [IOS-DEMO.md](IOS-DEMO.md).

## Three presentation journeys

### Cook what you have

1. Open **Cook**. Search ingredients or recipes, toggle preferences, or roll a recipe idea.
2. Choose **Fill up fridge**. Quick-add a few ingredients, set amounts and optional dates, and save them together.
3. Alternatively choose **Scan a receipt**, then the preset sample receipt. A real photo requires sign-in and explicit OpenAI-transfer consent. The native app keeps its camera, photo-library, and bundled live-AI test image controls.
4. In review, edit a name or amount, skip an item, and optionally choose its date. Low-confidence items start unchecked. Dates are never silently guessed.
5. Confirm and show the success screen, dated ingredients to check first, and suggested recipes.
6. Open a recipe. Switch Ingredients / Steps, save it, find a missing ingredient nearby, or start a meal-prep group with the recipe prefilled.

### Share a little extra

1. Open **Nearby**. Switch between the interactive street map and list; combine search, distance, type, category, and offer filters.
2. Use **+** to create an Available post. Photos are optional; up to five are resized and saved as local blobs. **Save draft** restores the form and photos after reload.
3. Publish. A sample neighbor immediately sends a request for the demo.
4. Open the linked conversation, send a message, and show the deterministic sample reply.
5. Choose **Mark shared**. The reward screen adds 50 illustrative points once, updates sample impact, and stores a rating if chosen.
6. Choose **Done** to show the updated **My** screen.

For someone else's Available post, **Request item** opens/reuses the conversation and the completion action is **Mark received**. Receiving does not award points for giving. Helping with a Wanted post counts as giving. Reopening a completed handoff never awards points again.

### Cook together

1. Open a meal-prep group from Home or Nearby.
2. Inspect the meetup details, members, dishes, and open slots.
3. Choose an unclaimed dish and join. The membership count updates and group chat opens.
4. Reload to show persistence. An existing member reopens the chat; retrying the join does not add a second membership.
5. Open **Message → Group** to find the conversation again.

## Data boundaries

| Data | Storage / behavior |
| --- | --- |
| Signed-in fridge and receipt scans | Existing authenticated Supabase APIs, private uploads, and duplicate-safe receipt confirmation |
| Anonymous sample fridge | Existing `ingredi.local-pantry` device storage |
| Community posts, photos, drafts, messages, groups | IndexedDB `ingredi-community`, version 1; one record per account UUID or `anonymous-demo` |
| Residence/student setup and sample ID state | The same identity-scoped local record; inactive residences retain separate activity archives |
| Recipe bookmarks and preferences | The same identity-scoped local record |
| Signed-in profile name/city | Existing permitted profile columns; reward columns are never written |
| Demo impact | Local illustrative counters only; no backend reward awards |

**My → Settings → Reset community demo** restores the chosen identity's sample community, bookmarks, preferences, and impact. It leaves authentication and fridge data intact. The confirmation explains what resets.

Nearby uses locally bundled Leaflet 1.9.4 and OpenStreetMap street tiles. [Residence setup and sample student verification](RESIDENCE-DEMO.md) now provide explicit address/GPS lookup, self-confirmed buildings, a default My building feed, opt-in neighborhood visibility, and a fake-card check before student exchanges. Opening Nearby never requests GPS: maps center on the saved residence, and manually entered buildings work in list view without coordinates. Only the Use my current location setup button requests a foreground location fix. Raw fixes are temporary; confirmed building metadata is stored locally for the selected identity. Map tiles and live address lookup require internet access.

Community listings remain sample data. Their simulated marker positions are deterministic offsets around the saved residence, matching the displayed sample distances; they do not represent actual local people or pickups. Community messages, posts, requests, and joins never reach real neighbors. No social sign-in, grocery-photo recognition, custom camera preview, push notifications, or real multi-user messaging is included.

This update adds the native Capacitor Geolocation plugin. On the Mac, run the pinned dependency install, then `ios:prepare` to register the plugin and location usage descriptions before rebuilding in Xcode. No background location watch is used.

## Verification

- Original receipt/domain/native tests retained; community/discovery/navigation, map/location, and residence tests (58 total).
- The browser walkthrough checks actual IndexedDB draft/photo restoration, linked post requests, sample replies, handoff rewards/ratings, membership persistence, recipe bookmarks, missing-ingredient search, and reset preserving the fridge.
- Phone layouts checked at 375, 390, and 430px, with a desktop sidebar layout. Map controls sit above the selected post card and navigation; detail screens reserve space for bottom actions.
- Web and iOS frontend builds are checked independently from the native Xcode build.
- Real AI scanning uses the existing backend. This redesign's interactive acceptance runs use the isolated local demo rather than adding test data to a user's signed-in fridge.

Xcode compilation, Simulator behavior, physical camera access, and real iPhone keyboard/safe-area behavior must be checked on a Mac/iPhone before the competition. Windows browser verification does not establish native-device success.
