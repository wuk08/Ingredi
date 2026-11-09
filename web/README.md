# Ingredi (web)

React + Vite + TypeScript starter for Ingredi, built from the mid-fi prototype and the Ingredi design system.

- Prototype (screens, flows, motion): https://claude.ai/artifact/1KL32xEsaScmCP1TKqw3gb
- Design system (tokens, components, rules): https://claude.ai/artifact/E3BHkAT3CBXo6Coyjrvi9K

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
```

Node 18 or newer. On a desktop browser the app shows inside a 390 × 844 phone frame; on a phone it fills the screen.

## Structure

```
src/
  theme/
    tokens.json      design-system tokens (source of truth, copied from the DS)
    tokens.css       CSS variables generated from tokens.json (light + dark)
    type.ts          type scale as style objects
    global.css       base styles + component classes (.btn, .chip, .card, .box, .tag, .tabbar…)
  components/        Button, Chip, Avatar, BellButton, TabBar, TopBar, Icons, Logotype, Illustration, Photo
  screens/           every screen from the prototype (see Routes)
  data/              AppState.tsx bridge plus prototype media/content helpers
  assets/
    avatars/         10 profile PNGs (512px). 01 Jack, 02 Mason, 03 Leo, 05 Dana, 06 Priya, 07 Jason, 08 Ari; 04/09/10 spare
    photos/          12 food photos (JPEG) + index.ts → import { photos } from "../assets/photos"
    illustrations/   flat food illustrations (fridge items, map pins, share bag)
    logotype.svg     animated "Ingredi" logotype (Outfit 500)
```

## Design rules to keep

- White page (`--bg`), warm off-white cards and popups (`--surface`), yellow boxes for featured groups and rewards (`--accent-tint`).
- No outlines and no glow shadows. Cards separate by tone. Shadows only for things that float (FAB, map pins, sheets, controls over photos).
- Coral (`--primary`) is for actions and selection only, always with a white label. Never a coral button inside a yellow box: use the white pill.
- Text is four levels of warm brown, never black: `--text-primary`, `--text-body`, `--text-secondary`, `--text-tertiary`.
- Max font weight 600. Outfit for headings, Nunito Sans for everything else.
- Active tab: tinted pill + solid icon. Inactive: outline icon.
- Login is the only screen on beige (`--surface-muted`).
- Every animation turns off under `prefers-reduced-motion`.

## Routes

All prototype boards are ported. Open any route directly while developing.

| Route | Screen |
| --- | --- |
| `/` | Login |
| `/home` · `/cook` · `/nearby` · `/messages` · `/my` | Tabs (Nearby: `?view=list` for the list view) |
| `/recipe` | Recipe Detail |
| `/meal-swap/:id` | Persistent Meal Swap |
| `/fridge/add` | Fill up fridge |
| `/scan` → `/scan/review` → `/scan/done` | Scan 1–3 |
| `/post/:id` · `/post/new` | Persistent Post Detail · Upload Post |
| `/chat/:id` · `/chat/group/:id` | Persistent direct and group chats |
| `/shared/:id` | Completed share, impact, and saved rating |
| `/tokens` | Get tokens (Apple Pay + card) |

`src/data/AppState.tsx` reuses the original `public/lib` implementations. Supabase Auth and private pantry/profile/receipt/recipe operations remain backend-connected. Residence-scoped posts, conversations, groups, verification state, and illustrative impact remain the same explicitly simulated IndexedDB community from the backup frontend. Prototype-only token purchases remain in-memory and are not represented as real billing.

Shared classes added to `global.css`: `.topbar`, `.action-bar`, `.seg`, `.rows`, `.field`, `.switch`, `.stepper`, `.mini-map`/`.road`, `.map-pin`, `.photo-scrim`.

## Photos

12 food photos are in `src/assets/photos` and wired into Home and Cook (`<Photo src={photos["bibimbap"]} …/>`). Recipe cards on photos use `.photo-scrim` (black gradient) with white text.

Still needed: **Avocados (3)** for Post Detail, Chat and Upload Post (4:3 + 1:1).
