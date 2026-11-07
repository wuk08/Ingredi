# Residence communities and sample student ID

Start the web preview with `node scripts/serve.mjs`. For an installed phone app, pull the changes on the Mac and run `pnpm ios:prepare`, then rebuild in Xcode.

## Setup and browsing

1. Choose **Explore the demo**, or sign in. First-time identities are prompted for student status; students enter a school name.
2. Choose **Use my current location** or search for an address/building. GPS is requested only by that button, never just by opening Nearby.
3. Select a suggestion and confirm the building name, address, and residence type. A school, campus, city, or street result is an approximate area: enter the actual building details. No room/unit number is requested.
4. If lookup fails or location permission is denied, choose **Enter building manually**. A building without a map location still has a working list. Add a map location later to enable maps and Neighborhood.
5. **My building** is the default feed. **Neighborhood** shows only sample posts explicitly shared with the neighborhood, using the existing distance/category/offer filters.

Setup can be postponed to use the fridge and recipes. Community screens require a residence and student status. **My → Residence & student status** reopens setup and lists previously saved residences. Switching residences restores that residence’s posts, draft, conversations, groups, and impact; recipe bookmarks and preferences follow the identity. **Add a map location** updates the selected building while keeping its history, including when a manual residence gains a provider result.

New posts default to **My building only**. **Share with neighborhood** is an explicit wider-audience choice and requires a saved map location. Groups and chats follow their parent post’s visibility. A building’s map marker aggregates its sample posts; neighborhood markers have simulated distances from the saved home, even when the viewer is away. Recenter returns to the saved residence and does not request GPS. Nearby scrolls vertically: its compact toolbar keeps residence scope, map/list switching, search, and sharing accessible; post type, distance, category, and offer live in the filter panel. The selected listing follows the map in page flow, with more listings below it. An original MapLibre vector style uses simplified 2D building footprints, clean roads, pale parks, blue water, and sparse labels. It omits raster textures, 3D extrusion, house numbers, and dense business/amenity icons. OpenFreeMap serves the vector tiles and fonts; OpenMapTiles and OpenStreetMap attribution remains visible. Scrolling over the map scrolls the page; touch users can use two fingers to move and zoom the map.

## Sample ID check

Students can browse without completing the check. Posting, requesting, sending messages, joining swaps, and completing/rating handoffs require it. The action opens:

1. **Sample student ID check**, with a clearly fake card.
2. **Use sample ID & submit**, then a simulated pending review.
3. **Simulate successful review**, then **Demo check completed → Continue**.

Continue resumes the attempted action. Closing the check cancels that action. Changing school or switching into student status requires another check. Nonstudents skip it.

There is no student-document file input, OCR, school lookup/integration, human reviewer, or real verification. The fake card is not matched to the selected school. Both residence membership and student status are self-declared; a demo result does not establish identity, enrollment, residency, or safety. All community interactions still use local sample people and replies.

## Storage and lookup

- Existing IndexedDB `ingredi-community` / `accounts` records are extended in place. The active residence’s activity stays at the existing root fields, with inactive residence snapshots in `communityArchives`; no object-store/version reset is needed.
- Existing posts, photo blobs, conversations, memberships, and IDs are retained and attached to the first confirmed residence’s neighborhood dataset. Each new residence gets a separate sample dataset and fresh IDs.
- Confirmed building metadata, student status/school, and simulated check state remain local to the account UUID or anonymous demo identity. Nothing is added to Supabase profiles or live community tables.
- Raw GPS fixes and lookup results are temporary. Only the user-confirmed building center (or explicitly confirmed approximate area) is saved. Address queries/one-time coordinates go to Photon; map tiles and font requests go to OpenFreeMap. No auth token is sent to Photon.
- Photon’s public service is for reasonable request volume and has no availability guarantee. Searches run only on explicit submission, with a timeout and a bounded session cache. Configure `geocoderUrl` in `public/config.js`; the preview server also accepts `GEOCODER_URL`. The web/native content policies allow the configured origin. [Provider API and usage terms](https://github.com/komoot/photon).
- **My → Settings → Reset community demo** clears all of this identity’s residences, archives, student/check state, and existing community demo activity. The signed-in fridge and Auth session are preserved.

## Verification

Run `node --test tests/*.test.mjs`, `node scripts/build.mjs`, and `node scripts/prepare-ios.mjs`.

MapLibre is lazy-loaded from bundled assets with a same-origin module worker and an explicit network allowlist. Browsers/devices without a usable vector renderer show a map error while keeping the list available. Run the pinned dependency install on the Mac before preparing iOS. [MapLibre setup](https://maplibre.org/maplibre-gl-js/docs/) · [OpenFreeMap data and attribution](https://openfreemap.org/quick_start/).

Automated coverage includes lookup normalization/caching/failures/cancellation, late results after identity changes, residence/visibility gates, student checks and invalidation, legacy migration, archived photo/draft/history restoration, identity separation, manual residences, and reset. Existing receipt/Auth/domain/native tests remain in the suite.

Verified in Edge with isolated local demo data: a real public dorm lookup and explicit confirmation; student dorm/apartment and nonstudent apartment journeys; fake-ID gating and resuming the original posting action; building-only post exclusion from Neighborhood; manual entry without coordinates; reload and saved-residence restoration. The scrollable Nearby layout was checked at 320×568, 375×667, 390×844, 430×932, 844×390, and 1366×900: no horizontal overflow, and selected cards remain in normal page flow and can be scrolled fully above navigation. Wheel scrolling over the map moves the page, and repeated zoom/view switches produce no new browser errors after the map cleanup fix. Location denial/native adapters, cancellation/stale responses, archives, reset, and cross-identity boundaries are covered by automated tests. A Mac/iPhone check is still required for native prompts, safe areas, and real-device navigation; Windows frontend builds do not establish native-device success.
