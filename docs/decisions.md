# Visual upgrade: decisions

Running log for the `visual-upgrade` branch (manual: `my-cars-visual-upgrade-manual.md`). Newest phase last.

## Phase 1: tokens, palette, themes (2026-11-13)

### What changed
- **Tokens** in `frontend/src/tokens.css`: colours (light + dark), type scale (`clamp()`), spacing 4–96, radius (10 inputs/buttons, 16 cards), shadows (layered in light, none + 1 px inner highlight in dark), motion (`--ease-out`, `--ease-in-out`, `--dur-*`, same names as arlindo.site). Every component CSS file now uses tokens; `grep` for hex/rgb/named colours in `src/app` finds none.
- **Themes:** light / dark / system. `public/theme-init.js` sets `data-theme` and `data-bs-theme` on `<html>` before the first paint (an external file, because the CSP allows no inline scripts). `Theme` service (`src/app/theme.ts`) keeps it in sync and follows system changes live. Choice stored in `localStorage` `theme` inside try/catch; "system" removes the key. Toggle: three icon buttons next to the language switch (labelled, `aria-pressed`, 44 px).
- **Default theme: follow the system** (the manual's default; Arlindo can change it).
- **Self-hosted everything:** Bootstrap 5.3.3 (same version as the CDN before) is bundled from npm; Inter and Sora (variable, Latin + Latin Extended only) and Material Icons come from Fontsource and are served from `/fonts`; the two Latin text fonts are preloaded. The CSP drops `cdn.jsdelivr.net`, `fonts.googleapis.com`, `fonts.gstatic.com` (now `style-src 'self' 'unsafe-inline'; font-src 'self'`). Checked every page on the production build with that CSP: 0 console errors, the only third-party host is `tile.openstreetmap.org`.
- **Fonts:** Sora (display) + Inter (UI), as the manual suggests. Headings are no longer uppercase Barlow Condensed; this is the biggest visible change and is **one token** (`--font-display`) to revert if Arlindo prefers the old look. Checked that ë/ç/ü render in Sora.
- **Red rationed:** removed the red header and footer rules and the red dashed divider (now neutral); the diagonal cut under bands is 3 px instead of 6 px; step numbers 01/02/03 are steel; the active language/theme is a neutral fill with a thin red underline. Red stays on: primary buttons, price tags, the small section-title bars, nav active underline, unread badges, the brand mark, the cut line, the spec-panel top border. On the home page at 1280 px that's well under 10% of the screen.
- **Red on dark** now uses the light red `#F47A7A` (logo "Cars", hero line 2, focus ring inside graphite bands). That fixes the 2.34:1 logo contrast from the audit.
- **Errors have their own hue:** rose `#BE185D` (light) / coral `#FF8A80` (dark) for `text-danger`, destructive outline buttons and the error snackbar. Status chips are text + tint, never colour alone.
- **Disabled primary button** is neutral grey instead of faded pink (pink read as an error).
- **Layout shift fix:** `main` reserves the viewport height, so the footer no longer paints at the top and jumps down while a lazy route loads. CLS went from 0.22–0.45 to 0 (it's CSS only).
- Bundle budget: initial warning 950 kB / error 1.1 MB (was 500 kB / 1 MB and already exceeded at 665 kB). Initial is now 910 kB raw / 187 kB transferred: +245 kB raw is Bootstrap's CSS, which users downloaded from jsDelivr before anyway. Trimming Bootstrap to the used modules is a Phase 7 item.

### Graphite bands
Header, page-title bands, filter bar, booking-card head, spec panel and footer use `--band-*` tokens. In light theme they are a cool graphite (`#1B1F25` / `#22272E` / `#2B313A`), slightly deeper than the old `#2B2D31` charcoal: the softening now comes from fewer red edges, neutral borders and the light red for text, not from lightening the dark. In dark theme they are the raised surfaces (`--bg-1` / `--bg-2`), so dark mode has three visible depths and no flat black.

### Measured contrast (WCAG 2.x formula, `python3 -I docs/visual-upgrade/contrast.py`)

| Pair | Light | Dark | Needs |
|---|---|---|---|
| Text on page / card / raised | 16.2 / 17.8 / 15.0 | 16.3 / 15.1 / 13.7 | 4.5 |
| Muted text on page / card / raised | 5.8 / 6.3 / 5.3 | 7.9 / 7.3 / 6.6 | 4.5 |
| Steel on page / card | 5.8 / 6.3 | 7.4 / 6.9 | 4.5 |
| Brand as text on page / card / raised | 5.1 / 5.6 / 4.7 | 6.4 / 5.9 / 5.3 | 4.5 |
| Brand UI (focus ring, borders) on page / card | 5.1 / 5.6 | 4.4 / 4.1 | 3 |
| Form field border on page / card | 3.4 / 3.7 | 3.9 / 3.6 | 3 |
| Success / warning / error / info text on card | 6.2 / 5.2 / 6.0 / 5.2 | 10.0 / 10.5 / 7.7 / 8.2 | 4.5 |
| Status text on its tinted chip (success / warning / error / info) | 5.3 / 4.6 / 5.1 / 4.6 | 7.5 / 7.8 / 6.0 / 6.3 | 4.5 |
| Band text on band 0 / 1 / 2 | 14.3 / 13.0 / 11.3 | 16.3 / 15.1 / 13.7 | 4.5 |
| Band muted on band 0 / 1 / 2 | 6.9 / 6.3 / 5.5 | 7.9 / 7.3 / 6.6 | 4.5 |
| Light red (logo, hero, focus) on band 0 / 1 / 2 | 6.2 / 5.7 / 4.9 | 7.1 / 6.6 / 6.0 | 4.5 |
| Neutral button text on fill / hover | 13.0 / 9.8 | 11.5 / 9.8 | 4.5 |
| Photo placeholder label on its gradient | 5.8 / 5.1 | 6.6 / 6.0 | 4.5 |
| White on brand `#C62828` / hover / pressed | 5.6 / 6.6 / 8.0 | 5.6 / 5.0 / 6.6 | 4.5 |
| White on success / error snackbar | 5.0 / 6.0 | 5.0 / 6.0 | 4.5 |
| *Before:* red logo on charcoal header / footer | 2.34 / 2.61 | - | 4.5 |

Values that had to move from the manual's starting tokens to pass: light field border `#80858D`, light success `#137038`, light status colours (manual left them unmeasured: warning `#A35A00`, error `#BE185D`, info `#1D6FB8`), light-red-on-band `#F47A7A`, light placeholder label `#545960`.

### Results
| | Lighthouse perf (mobile / desktop) | A11y | CLS |
|---|---|---|---|
| Home before → after | 46 / 83 → **72 / 98** | 93 / 96 → **100 / 100** | 0.45 / 0.30 → **0 / 0** |
| Car page before → after | 57 / 88 → **74 / 98** | 96 / 97 → **100 / 100** | 0.42 / 0.22 → **0 / 0** |

Mobile LCP is still ~4.7 s (throttled 4G): one 264 kB CSS file and the app JS block the hero heading. Phase 4 (hero) and Phase 7 (trim Bootstrap, budgets) target it. Screenshots: `docs/visual-upgrade/phase1-light/` and `phase1-dark/` vs `baseline/`.

Tests: backend 76 OK; frontend 25 passed / 14 failed, the same 14 pre-existing `should create` failures as the baseline (the NavBar spec was updated to declare the new switcher; 3 new `Theme` specs).

### Gaps and open points
- **Leaflet tiles** stay bright in dark mode (Phase 6: muted tile style or CSS filter).
- **Photos:** no car or hero photos locally; the placeholder now follows the theme.
- **Not changed (functional):** `/login` and `/register` root routes are broken (see audit); the admin users page shows an empty "Admins" table on page 1. Both need Arlindo's OK.
- Optional baby-blue secondary: **not added** (manual default: no). `--steel` is the only secondary.
- Brand name/logo: kept the text wordmark "MyCars" + car icon (placeholder until Arlindo decides).
- The manual says SQ | EN; the app keeps SQ | EN | DE.

## Phase 2: base components and states (2026-11-13)

Arlindo had not answered the Phase 1 questions yet, so the defaults stay: Sora headings, theme follows the system, the two functional bugs (`/login` route, empty admins table) untouched.

### What changed
- **`UiModule`** (`src/app/ui/`), separate from `SharedModule` so the eager shell can use it without pulling Leaflet into the initial bundle:
  - `app-skeleton` (`card` / `row` / `detail`): shaped like the real content, `role="status"` with a hidden "loading" label, shimmer off under reduced motion. Replaces every "Loading…" line (home, car page, my bookings, inbox, thread, admin bookings, fleet, car form).
  - `app-empty-state`: small original line illustration (car on a dashed road + accent: magnifier, warning sign, calendar, speech bubble, signpost, garage), optional heading (`h1` for whole-page states, `h2` otherwise), text and projected actions. Error variant is `role="alert"`. Used for every empty, error and not-found state above; the fleet's empty state gained an "Add car" action.
  - `app-status-badge`: icon + text per status (pending, confirmed, rejected, cancelled, listed, hidden); colour is never the only signal.
  - `app-field-error`: inline message with icon under a field once it was touched, linked with `aria-describedby`; inputs get `aria-invalid` and an error-hue border. Refreshes on `control.events`, so `markAllAsTouched()` on submit shows it (needed with zoneless change detection).
  - `appPasswordToggle`: show/hide button inside password fields (44 px, `aria-pressed`, translated label). On login, register, change password, admin "new user".
- **Toasts** replace the Material snackbar behind the same `Notification.success/error` API: bottom of the screen (centred on mobile, right on desktop), stacked (max 4), auto-dismiss 4 s / 6 s, paused on hover/focus, close button, icon + text, `aria-live` region with errors as `role="alert"`; enter/leave via Angular's `animate.enter/leave`. Dropping `MatSnackBar` cut the initial bundle from 910 to 865 kB.
- **404 page**: unknown URLs show a "page not found" state with a link to the cars instead of silently redirecting home (`**` route now renders `NotFound`).
- **Buttons**: `.is-loading` adds an inline spinner (with `disabled` + `aria-busy`) on booking, ask-owner, thread send, car form save, login and register. Login/register no longer keep the submit disabled while the form is invalid: submitting shows the inline errors instead, and register checks the password confirmation client-side (the API still validates it).
- Legacy car list: the two icon-only pagination buttons got `aria-label`s. A scan of all templates finds no other unlabelled icon-only button or link.
- Icons stay **Material Icons** (one set, already used everywhere).

### Verified
- Lighthouse (production build + CSP): accessibility 100 on home, car page, register and 404, mobile and desktop; CLS 0 on all. Mobile performance read 65 on home this time, but the Phase 1 build measured 65 too in the same session (machine load), so no regression; desktop 97-99.
- Keyboard (scripted): Tab reaches the password toggle, Enter toggles it; the toast close button is reachable and Space closes it; focus ring visible.
- No console errors or CSP violations on any page of the production build; only third party is the OSM tiles.
- Tests: backend 76 OK; frontend 39 passed / 8 failed. The 8 are the remaining legacy `should create` specs; the specs of every component touched here (App, Login, Register, ChangePassword, UserCreate) were rewritten and pass, plus new specs for toasts and the UI components.
- Screenshots of the new states (light/dark): `docs/visual-upgrade/phase2/`.

### Deferred
- Auth pages keep their card layout (split layout is Phase 6); floating labels likewise.
- Admin "Confirm/Reject" show `aria-busy` but no spinner (both share one busy flag, so the clicked one isn't known).
