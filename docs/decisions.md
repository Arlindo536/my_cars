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

## Phase 3: layout shell and motion foundation (2026-11-13)

Phase 1 questions still open, so the defaults stay (Sora, theme follows the system, `/login` route and admins table untouched).

### What changed
- **Nav bar states:** transparent over the home hero (route data `overlayHeader`; the hero slides under the bar with `margin-top: -var(--header-h)`), solid graphite on other pages, translucent (94 %) + `backdrop-filter` blur after 40 px of scroll, slides away while scrolling down and returns on scroll up. It never hides near the top, while a menu is open, while it holds keyboard focus (`:focus-visible`), or with reduced motion. The background sits on `::before`, so the blur does not trap the fixed drawer. Fixed height (`--header-h`, 64 px), so no layout shift.
- **Bug found:** the bar was never actually sticky: the `app-nav-bar` host box (as tall as the bar) was its containing block. `:host { display: contents }` fixes it.
- **Drawer** below 992 px (1200 px for admins, who have five links): slides in from the right over a scrim, `role="dialog"` + `aria-modal`, focus moves to its close button, Tab is trapped, Escape and the scrim close it and focus returns to the menu button, page scroll locked. Links close it; language/theme buttons don't. Reduced motion: fades instead of sliding.
- **Account menu:** initials avatar (from the username the login response already returns, now kept in `localStorage` `username` for display only and removed on logout/account deletion; users logged in before this see a person icon). Dropdown with name, profile (customers) and logout; Escape returns focus, click outside or tabbing away closes. Logout moved from the bar into this menu (in the drawer it is listed flat).
- **Language and theme:** one pill shape with a sliding neutral indicator (`.pill-switch` in `styles.css`), 44 px targets, `aria-pressed`; no red needed. Also in the footer.
- **Footer:** wordmark + tagline, links that depend on the session (guests: login/register; customers: bookings; logged in: messages), contact address + "open map" link to openstreetmap.org (new tab, announced), language/theme, small print. No motion.
- **Route transitions:** `withViewTransitions` (router setup moved from `RouterModule.forRoot` to `provideRouter` in the routing module, because only the functional API has the hook). Old page fades out in 180 ms, new page fades + rises 8 px in 350 ms; the bar keeps its own `view-transition-name` so it does not flash. Skipped on the first load (would delay LCP) and when only the query string changes. Reduced motion: 150 ms opacity only. Browsers without the API switch instantly.
- **`appReveal`** (`UiModule`): IntersectionObserver adds `.reveal` / `.is-revealed` (opacity + 16 px rise, 700 ms, stagger via `--i` × 60 ms). It never hides anything already on screen at load (so never the LCP), and hides nothing without IntersectionObserver, with reduced motion or in print. Used on the home "how it works" steps and the map section; not in admin.
- **Reduced motion:** `scrollIntoView` (home CTA, pagination, booking card) uses `auto` instead of `smooth` (`src/app/motion.ts`).
- Component style budget raised to 8 kB warning / 12 kB error: `nav-bar.css` is 6.9 kB (drawer + menu + states). Initial bundle 883 kB raw / 189 kB transferred (+18 kB raw).

### Contrast of the new surfaces (`contrast.py`)
| Pair | Light | Dark | Needs |
|---|---|---|---|
| Nav text on scrolled glass over a white card / on the hero glow | 10.8 / 10.2 | 12.9 / 12.5 | 4.5 |
| Nav muted links on the same | 5.2 / 4.9 | 6.2 / 6.0 | 4.5 |
| Light red (large logo text, active underline) on the same | 4.7 / 4.5 | 5.6 / 5.4 | 3 |

90 % glass gave 4.1 for the logo red over white, so the bar is 94 % opaque.

### Verified
- Header at 360 / 768 / 1024 / 1440 for guest, customer and admin in sq / en / de: one row, 64 px, no horizontal scroll (a footer gutter overflow at 1024 px was found and fixed).
- Drawer: focus trap wraps after 12 Tab presses, Escape closes and returns focus, scroll lock removed. Account menu: Escape closes and refocuses the avatar.
- Real navigations run a view transition (2 of 2), the filter change does not; no console errors.
- Reduced motion: bar never hides, no `.reveal` element is hidden.
- Production build with the nginx CSP: every page, 0 console errors, only third party `tile.openstreetmap.org`.
- Lighthouse (`lighthouse-phase3.txt`): accessibility 100, CLS 0 on home, car page and register; mobile perf 74 / 73 / 83, desktop 98-99.
- Tests: backend 76 OK; frontend 44 passed / 8 failed (same 8 legacy specs). New specs: nav bar initials, drawer/breakpoint, Escape, logout clears the username; reveal keeps on-screen content visible.
- Screenshots: `docs/visual-upgrade/phase3/`.

## Phase 4: home (2026-11-13) — review point

Phase 1 questions still open: Sora headings, theme follows the system, no photos (placeholders), `/login` route untouched.

### What changed
- **Hero:** full-bleed graphite with an original line-art scene (horizon, two mountain ridges, a road with foreshortened centre dashes, red horizon glow) in a "photo slot" layer under a graphite overlay, so a real photo can replace the SVG later without touching the layout. The layer drifts at 0.25× scroll on desktop with a fine pointer (`appParallax`; off on touch and with reduced motion). Kicker, two headline lines, lead and panel rise in one after another (90 ms apart, **transform only**, so the heading is painted from the first frame and LCP is not delayed). Scroll cue on desktop: three gentle nudges, then still.
- **Glass search panel:** search + type + the red "Browse cars" button; translucent graphite with a light top edge. Submitting scrolls to the results and moves focus to their heading. It shares the form controls with the filters below, so both stay in sync. Dates stay on the car page (manual).
- **Filters:** chip rows for type, fuel and gearbox (`aria-pressed`, "All" first, choosing the active chip again resets it; phones get one horizontally scrollable row per group, wider screens wrap) + sort select. Active filters show as removable pills ("Remove filter: Electric") with "Clear all". "Clear all" now keeps the sort order (sorting isn't a filter) and reloads once instead of once per field. Search/filters/sort still sync to the URL and deep links work.
- **Results count** counts up/down (`appCountUp`, 500 ms, off with reduced motion); the visible number is `aria-hidden` and a separate `aria-live` text announces the final count once.
- **Grid:** CSS grid 1 / 2 / 3 columns. The manual suggests up to 4, but the API returns 9 cars per page (backend unchanged), which would leave rows of 4 + 4 + 1. Each new result set enters with a 60 ms stagger (opacity + 14 px rise, capped at 8 steps).
- **Card:** 16:10 frame with a slow 4 % zoom on hover (hover-capable devices only), spec row with icons (fuel / gearbox / km), price tag with "/ day", one dark action button that is a stretched link (the whole card is clickable, one tab stop). Photos use `NgOptimizedImage` (`fill` + `sizes`). **No "Available / Reserved" badge:** the catalog API has no availability per car, and a badge we can't back with data would be false.
- **Optional trust strip:** not added (the "how it works" steps already say what's true; the wording would be Arlindo's).

### Performance work (LCP)
| Change | Effect |
|---|---|
| Leaflet loads via `import()` when the map is within 400 px of the viewport | catalog chunk −38 kB gz; OSM tiles only requested when the map is near |
| Car page moved to its own lazy module (`CarPageModule`, `/catalog/:id`) | home chunk 50 → 9 kB gz (the Material datepicker stays on the car page) |
| `theme-init.js` also sets `<html lang>` and preloads `i18n/<lang>.json` | translations no longer wait for the app bundle |
| `scripts/preload-initial.mjs` after `ng build` (in `npm run build` and the Dockerfile) | Angular emits at most 10 `modulepreload` hints and dropped the 100 kB framework chunk; the script adds the missing ones plus the home route's chunk |
| Glass panel without `backdrop-filter` | scroll over the hero: dropped frames per run 15 → 6 under 4× CPU throttle (headless, no GPU) |

**Result:** home mobile LCP 4.6 → 4.2 s (Lighthouse simulated) and 6.3 → 4.9 s with real DevTools throttling; FCP and LCP now coincide (the hero paints with the nav bar). **The manual's LCP < 2.5 s on mobile is not met.** What remains is the framework (~190 kB gz JS) + one 39 kB CSS file that must download and run before anything paints in a client-rendered Angular app. Reaching < 2.5 s needs **prerendering the home page** (Angular SSG: server-safe code for `localStorage`/`window`, a static `index.html` for `/`, and an nginx fallback to the CSR shell). That's an architecture change, so it's a question for Arlindo, not done silently; trimming Bootstrap (Phase 7) would help but not reach 2.5 s on its own. Performance stays above the manual's fallback rule (baseline 46 → 69-72 now). Desktop: 98-99, LCP 0.9 s.

TBT on mobile rose from ~200 to ~400 ms (more script, style and paint: hero art, entrance animations, chips). Phase 7 item: check the hero art's paint cost and whether `.enter` + stagger can be cheaper.

### Verified
- Filters (scripted, dev and prod build): chip on/off, two filters combined, hero select and chips in sync, hero search + Enter (URL, count, pills, focus on the results heading), remove one pill, clear all, sort, deep link `/?fuel=diesel`. All correct.
- Widths 360 / 768 / 1024 / 1440 / 1920 in sq, en and de (with active filters): no horizontal page scroll, no clipped chip/button/label text.
- Smoothness under 4× CPU throttle (headless Chrome, software rendering): card hover 60 fps / 0 dropped; stagger after a filter change ~56 fps (3 frames over 25 ms); scroll over the hero after the blur change: worst frame 33 ms.
- Production build with the nginx CSP: every page at 375 / 1280 light and 1280 dark, 0 console errors, only third party `tile.openstreetmap.org`. Car page (now its own chunk) renders with datepicker, booking and message box.
- Lighthouse (`lighthouse-phase4.txt`): accessibility 100, CLS 0 on home, car page, register.
- Tests: backend 76 OK; frontend 48 passed / 8 failed (same 8 legacy specs). New: Home (default load, chip toggle + pill, clear all keeps sort), CountUp; Reveal spec fixed to actually instantiate the directive.
- Before/after: `docs/visual-upgrade/phase4/before-after-home-1280.webp` and `-375.webp`; more in `phase4/`.

## Phase 5: car page and booking (2026-11-13)

Arlindo continued without answering the Phase 4 questions, so the defaults stay (no prerendering, no photos, Sora, theme follows the system, `/login` untouched).

### What changed
- **Gallery** (`app-gallery`, `CarPageModule`): 16:9 stage with crossfading photos, thumbnail strip, prev/next buttons and a counter when there is more than one photo, ← / → keys, horizontal swipe (`touch-action: pan-y`, so vertical scrolling still works). The first photo is `NgOptimizedImage` with `priority`. The **lightbox** is a native `<dialog>` (`showModal`: the page behind is inert, focus moves inside, Escape closes and focus returns to the photo). It shows the full photo with a 2× zoom around the clicked point (or the centre via the zoom button, `aria-pressed`). **The API has one photo per car**, so today there is never a thumbnail strip; the component already takes a list. Without a photo the placeholder shows and nothing opens.
- **Spec grid:** five tiles (year, fuel, gearbox, type, mileage) with icons. 2 columns on phones (the last one spans), 3 up to 1199 px, 5 from 1200 px; German "Kilometerstand" didn't fit five in a row at 1024 px. Replaces the graphite strip with the red top border.
- **Booking panel:** sticky beside the content on wide screens (on a wrapper; the card itself was sticky inside a box exactly its own height, so it never stuck). The total **counts to the new value** (`appCountUp` now takes a formatter; prices keep "99,50 €" formatting). The visible number is `aria-hidden` and the `aria-live` summary reads the final price from hidden text.
- **Mobile (< 992 px): bottom bar + bottom sheet.** A fixed graphite bar shows the price per day, or the total and day count once dates are chosen, plus "Choose dates" / "Book now". The button opens the booking card in a bottom sheet (`role="dialog"`, `aria-modal`, focus on the close button, Tab trapped, Escape and the scrim close it, focus returns to the bar button, page scroll locked; it fades instead of sliding with reduced motion). The Material calendar opens above the sheet (`.cdk-overlay-container` z-index 1150, toasts 1200). "Message the owner" inside the sheet closes it before scrolling to the form. The page gets bottom padding and toasts move up while the bar is shown.
- **Date picker states** (Material overrides with tokens): selected start/end in brand red, the range between as a light red wash, today outlined, hover/focus neutral, booked and past days muted **and struck through** (not colour alone). Keyboard navigation is Material's (arrows, Enter, Page Up/Down); verified picking a range by keyboard on desktop and in the sheet.
- **Similar cars:** up to 3 cars of the same type (cheapest first) from the public catalog endpoint, below the content. The page now follows the `:id` parameter, so clicking a similar car loads it (the component is reused).
- **Section reveals** on description, "ask the owner", pickup map and similar cars.
- **Shared-element transition:** clicking a card names its photo `car-photo`. The car page's photo frame carries the same name: the skeleton's photo block while loading, then the gallery. So the card photo morphs into place (350 ms, ease-out). Off with reduced motion (0 s); skipped when a car-page photo is already on screen (similar cars), because names must be unique.
- Fuel icon mapping moved to `shared/car-labels.ts` (`fuelIcon()`), used by the card and the spec grid. `html.drawer-open` renamed to `html.scroll-locked` (drawer, sheet); a modal `<dialog>` locks scrolling via `:has(dialog[open])`.

### Booking flow unchanged
Same API calls (availability, quote, create), same rules and messages. Checked in the browser: customer picks dates → quote → total; guest "Log in to book" goes to `/auth/login?returnUrl=/catalog/35`; admin sees the disabled button and note (unchanged template). No backend change.

### Verified
- Scripted (dev + production build with the nginx CSP), 0 console errors:
  - Lightbox opens by keyboard (Enter on the photo), zoom toggles, Escape closes and refocuses.
  - Booking panel stays at 80 px from the top while scrolling.
  - Date range picked by keyboard; the total and hidden text match.
  - Similar cars render (3) and navigate (`/catalog/35` → `/catalog/29`).
  - Mobile sheet: focus, Escape, scroll lock, calendar on top (hit-tested), bar shows "160 € · 2 days · Book now" after choosing.
  - Shared-element group `car-photo` animates (350 ms; 0 with reduced motion).
- Photo features were tested with a **generated test image** uploaded to dev car 35 through the existing admin endpoint, then removed with the same endpoint (car 35 has no image again; the file was deleted). The lightbox screenshot in `phase5/` shows that test image.
- Spec grid: 360 to 1440 px in sq / en / de, no broken words or overflowing tiles.
- Lighthouse (`lighthouse-phase5.txt`): car page accessibility 100, CLS 0 (bottom bar included); mobile perf 74, desktop 98.
- Tests: backend 76 OK; frontend 51 passed / 8 failed (same 8 legacy specs). New: Gallery (no photos, keyboard wrap + thumbnails, swipe doesn't open the lightbox).

## Phase 6: auth, messaging, map, admin (2026-11-13)

Same defaults as before (Arlindo's open questions unchanged).

### Auth (login, register)
- **Split layout** (`AuthLayout` in `AuthModule`): graphite brand panel with the road art (now a shared `app-road-art` in `UiModule`, also used by the home hero; `align="end"` keeps the road in view in a tall, narrow panel), the home claim and the three true "how it works" steps; the form on the other side. On phones the panel is a short band above the form and the steps are hidden.
- **Floating labels** (Bootstrap `form-floating`), keeping the Phase 2 inline errors, password toggle and loading button. The page heading is now an `h1` (it was an `h2` with no `h1` on the page). First and last name side by side from 576 px.
- The public **demo logins** (production build only) stay next to the form in a neutral box (was red dashed), **never in the artwork**, as the manual asks. Bootstrap's pink `<code>` colour failed contrast there (3.8:1); `--bs-code-color` now uses `--text` globally.

### Messaging
- Thread: **day separators** (Today / Yesterday / weekday + date) and **sender groups**: consecutive messages from the same side within 5 minutes join (tighter corners, one visible time on the last one; screen readers still get every time). Neutral bubbles (theirs `--bg-2`, mine ink), no red.
- **Scroll to latest:** follows new messages smoothly when you are at the bottom or just sent one; if you scrolled up, a "N new messages ↓" pill appears instead of jumping (polling as before). New messages after the first load rise in softly (off with reduced motion).
- Inbox: avatar per conversation (customer initials for admins, a car icon for customers).
- **Not added: typing indicator.** The API has no typing signal (polling, no WebSockets), and an indicator without data would be fake.
- Not changed: list and thread stay separate pages (a two-pane layout would change routing).

### Map
- **CSS marker** (`divIcon`): red dot with a white ring and a soft pulse in `--brand-ui` that runs 4 times and stops (no endless motion; none with reduced motion). The Leaflet marker PNGs are no longer copied into the build.
- **Tiles muted** (slightly desaturated); in **dark theme inverted and dimmed** with a CSS filter on the tile pane (no new tile provider, CSP unchanged). Leaflet controls, attribution and popup use the tokens.
- **Info card** under the map: office name, address, **opening hours (fictional: Mon–Sat 08:00–20:00, Sun 09:00–14:00, translated; Arlindo to confirm or change)**, a "Get directions" button and "Open map" link (OpenStreetMap, new tab).

### Admin
- **`AdminShell`** around every admin route (routing: one `''` parent with the existing pages as children; guards unchanged at the app level). **Collapsible sidebar** from 992 px (Bookings, Fleet, Users, Messages with the unread badge; collapsed state in `localStorage` `adminSidebar`, labels stay for screen readers when collapsed); on phones the header drawer already has these links. **Breadcrumbs** from `data.breadcrumb` on each route (they replace the "back to fleet" link).
- Page headers are plain (`.admin-head`) instead of graphite bands with the red cut: calmer, denser, and no large dark blocks in admin.
- **Stat cards** on the landing page (bookings): pending, confirmed, cars in the fleet, unread messages. Counts come from the existing list endpoints' `count` and the unread endpoint; they count up from 0 in 400 ms. Only "pending" uses the red tint (it asks for action); fleet and messages cards link to their pages. If the counters fail, the page works without them.
- **Tables** (fleet, users): scroll in their own box with a **sticky header row**, row hover, existing status badges and pagination. The existing multi-select delete became a **bulk-action bar** pinned to the bottom while rows are selected.
- **Not added: sortable columns.** The admin list endpoints have no ordering parameter, and sorting only the visible page of a paginated list would mislead. Needs a backend change (Arlindo's call).
- No charts (no data series to show).

### Verified
- Production build with the nginx CSP: every page at 375 / 1280 in light and dark, 0 console errors.
- Admin stays admin-only: `/admin/cars/35/edit` as guest goes to login, as customer to `/`; neither loads the shell or calls admin lists. As admin: shell, breadcrumbs "Admin panel / Fleet / Edit car", collapse to 72 px with the state stored, breadcrumb link works.
- Lighthouse (`lighthouse-phase6.txt`): login, register and home accessibility 100, CLS 0.
- Tests: backend 76 OK; frontend 52 passed / **7** failed. The `UserList` legacy spec was rewritten while touching the component (it now tests the bulk bar through real clicks); the 7 left are user-detail, user-form, update-profile, confirm-dialog and the legacy car pages.
- Screenshots: `docs/visual-upgrade/phase6/`.
