# Visual upgrade: Phase 0 audit

Baseline before any visual change, taken on 2026-11-13 from `main` at `b86662a` (branch `visual-upgrade`).
Screenshots: `docs/visual-upgrade/baseline/` (`<page>-<width>.webp`, full page, 375 / 768 / 1280 px, Albanian).

## 1. Stack

| Area | Finding |
|---|---|
| Angular | 21.2, **NgModules** (`standalone: false`), lazy feature modules (`catalog`, `auth`, `booking`, `messages`, `admin`, legacy `car`) |
| Styling | Plain CSS per component + global `src/styles.css`; **Bootstrap 5.3.3 from the jsDelivr CDN** for layout/forms/buttons; Angular Material 21 (M3 `mat.theme`, red palette) only for datepicker, dialogs and snackbars; one light theme, no dark theme |
| Fonts / icons | Barlow Condensed + Inter and the Material Icons font **from Google Fonts** (render-blocking, third-party) |
| i18n | `@ngx-translate` 18, `sq` (default) / `en` / `de`, choice in `localStorage` |
| Map | Leaflet 1.9.4 + OpenStreetMap tiles, lazy in the catalog chunk |
| Tests | Backend `python manage.py test`: **76 OK**. Frontend `ng test` (Vitest): **14 failed / 22 passed** (31 files); all failures are the known missing-provider `should create` specs (CLAUDE.md). No e2e suite |
| Build | `ng build`: initial bundle **664.97 kB** raw / 162.66 kB transfer (budget warning at 500 kB). Lazy: catalog 376.9 kB (Leaflet + Material datepicker), admin 49 kB, others < 16 kB |
| Deploy | Docker Compose: nginx (Angular build + API proxy, CSP) + gunicorn + PostgreSQL, behind a Cloudflare Tunnel at `my-cars.arlindo.site`. nginx sets long cache headers but **no gzip** (Cloudflare compresses at the edge) |

## 2. Page inventory

| Page | Route | Role |
|---|---|---|
| Home (hero, filters, car grid, how it works, contact + map) | `/` | public |
| Car detail (title band, photo, specs, description, ask owner, map, booking card) | `/catalog/:id` | public (booking/message need login) |
| Login | `/auth/login` | guest |
| Register | `/auth/register` | guest |
| Profile / update profile / change password | `/auth/profile`, `/auth/update-profile`, `/auth/change-password` | logged in |
| My bookings | `/bookings` | logged in (customer) |
| Inbox / thread | `/messages`, `/messages/:id` | logged in (customer and admin) |
| Admin bookings (landing) | `/admin/bookings` | admin |
| Fleet list / new car / edit car | `/admin/cars`, `/admin/cars/new`, `/admin/cars/:id/edit` | admin |
| Users list / new / detail / edit | `/admin/users`, `/admin/users/new`, `/admin/users/:id`, `/admin/users/:id/edit` | admin |
| Legacy car pages (unlinked) | `/cars`, `/cars/new`, `/cars/:id`, `/cars/:id/edit` | admin |
| 404 | none: `**` redirects to `/` | - |

Found while taking screenshots: **`/login` and `/register` (root routes) are broken.** They point at `Login`/`Register`, which are declared in the lazy `AuthModule`, so the root injector has no `translate` pipe and the page throws `NG0302` (blank page). The app links only to `/auth/login` and `/auth/register`, so users don't hit it unless they type the URL. Suggested fix (functional, so not done here): turn both into redirects to `/auth/...`.

## 3. Color audit

Tokens in `src/styles.css`: `--ink #2b2d31`, `--ink-2 #33363b`, `--ink-3 #3d4046`, `--accent #c8102e`, `--accent-dark #a00d25`, `--page-bg #f6f6f6`, `--card-bg #fff`, `--text #26282c`, `--text-muted #5f6368`, `--text-on-dark #f2f2f2`, `--text-on-dark-muted #a6a6a6`, `--border #e2e2e2`.

Hard-coded colors outside the tokens (file: values):

| File | Values |
|---|---|
| `styles.css` | `#198754` (success snackbar), `rgba(200,16,46,.2)` (focus shadow), `white`, Bootstrap `--bs-*-rgb` triplets |
| `index.html` | `theme-color #2B2D31` |
| `material-theme.scss` | `mat.$red-palette` (primary + tertiary), `color-scheme: light` |
| `nav-bar.css` | `#4a4d54` (toggle border), `#ffffff` |
| `footer.css` | `#232529` (background), `#45484e` (dashes), `#ffffff` x2 |
| `language-switcher.css` | `#4a4d54` x2, `#ffffff` |
| `catalog/home.css` | hero `rgba(200,16,46,.28)` + `#383b41`, `#ff3b55` x2 (light red on dark), skeleton `#ececec`/`#f6f6f6`, `#cfcfcf` |
| `car-card.css` | `#e9e9e9`, `#f1f1f1`, `rgba(0,0,0,.12)` |
| `car-placeholder.ts` | `#ececec`, `#dcdcdc`, `#8a8a8a`, `#c4c4c4` |
| `catalog-car-detail.css` | `#e9e9e9`, `#ffffff` |
| `booking-card.css` | `#ffffff`, `#cfcfcf` |
| `auth/login.css` | `#fff7f8` (demo box) |
| `admin-bookings.css`, `admin-car-list.css`, `my-bookings.css` | status chips `#fff3cd/#664d03`, `#d1e7dd/#0a3622`, `#f1f1f1/#5f6368`, `#ececec/#333`, borders `#e0a800`, `#198754`, `#cfcfcf`, `#e2e2e2` |
| `admin-car-form.css` | `#e9e9e9` |
| `inbox.css`, `thread.css` | `#cfcfcf`, `#f1f1f1`, `#ff3b55`, `#ffffff`, `white` |
| Templates | Bootstrap color utilities: `btn-dark`, `btn-outline-light/-dark/-secondary/-danger`, `bg-primary`, `bg-secondary`, `text-danger`, `text-muted`; legacy `car` module: inline `#2c3e50`, `#f8f9fa`, `bg-light`, `bg-success`; auth/legacy templates: inline `#f8f9fa` |

Where red and dark meet:

| Pairing | Ratio | Problem |
|---|---|---|
| "CARS" in the logo, `#c8102e` on `--ink #2b2d31` (header) | **2.34:1** | fails AA (Lighthouse flags it) |
| "CARS" in the footer logo, `#c8102e` on `#232529` | **2.6:1** | fails AA |
| Focus ring `#c8102e` on the charcoal header/bands | ~2.3:1 | below 3:1 for UI components: focus is hard to see on dark |
| Red 3 px rules: header bottom, footer top, the diagonal cut, dashed red divider | - | four full-width red lines on one screen, plus red tags on every card: red is everywhere |
| Hero line 2 in `#ff3b55` on charcoal (huge type) | 3.95:1 | passes only as large text; a big saturated red headline vibrating on dark |
| Error snackbar uses the brand red | - | brand and error look the same |
| Active language pill, primary buttons: white on `#c8102e` | 5.9:1 | fine |

## 4. Baseline measurements

Lighthouse 12.6 (headless Chrome 157) on the **production build** served locally with gzip (`docs/visual-upgrade/lighthouse-baseline.txt`):

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Home, mobile | 46 | 93 | 100 | 83 | 4.6 s | **0.449** | 470 ms |
| Home, desktop | 83 | 96 | 100 | 83 | 1.0 s | 0.304 | 0 ms |
| Car, mobile | 57 | 96 | 100 | 83 | 4.0 s | **0.423** | 260 ms |
| Car, desktop | 88 | 97 | 100 | 83 | 1.0 s | 0.216 | 0 ms |

Main causes: render-blocking Bootstrap CSS from jsDelivr and Google Fonts CSS; font swap shifts (Lighthouse names the Material Icons glyph in the logo as a shift source); the footer and catalog section jump when the car list arrives (no reserved height); 480 KiB unused JS on first load; no `<meta name="description">`; no `robots.txt` (the SPA fallback serves HTML). A11y misses: the two red logo contrasts above, and the hero's "demo login" link is 20 px tall (target size).

Console: no errors on any page except the broken `/login` and `/register` routes above.

## 5. UX defects

- **No dark theme** and no theme toggle.
- **Loading states:** only the home grid has a skeleton; car detail, bookings, inbox, thread, admin tables show nothing (or "0") until data arrives, so footers jump.
- **Empty states:** plain text in a dashed box; no illustration or next action on most.
- **Car photos:** none locally (and only some on the server); every card shows the grey placeholder, which makes the grid look unfinished. The hero has no photo.
- **Icons:** Material Icons font from Google (third-party, render-blocking); the logo icon shifts when it loads.
- **Spacing/radii:** 6 px radius everywhere, but status chips/tabs are pills, bubbles 12 px; padding varies per page (0.9 / 1 / 1.1 / 1.25 rem).
- **Touch targets:** language buttons ~28 px tall, the mobile menu toggle ~34 px, "Pastro" and outline buttons small (`btn-sm`), the hero demo link 20 px.
- **Red overuse:** red header rule + red diagonal + red price tags + red section bars + red dashed divider + red step numbers + red buttons on one screen.
- **Booking card:** "Rezervo tani" is disabled (pink, reads as error) until dates are chosen, with no hint next to the button.
- **Auth/profile pages:** generic Bootstrap cards with inline `#f8f9fa` backgrounds; they don't share the site's look.
- **Admin:** the users page splits admins and customers but paginates them together, so on page 1 the "Admins" table is an empty header; list rows instead of tables in bookings; fleet/users tables without sticky headers; no skeletons.
- **Albanian length:** nav labels fit at 1280; at 768 the nav collapses to the burger; no clipping seen. German is the longest and fits.
- **Map:** OSM tiles are bright and will clash with a dark theme.

## 6. Reference: arlindo.site motion language

From its `style.css` and scripts (fetched 2026-11-13): `--ease-out: cubic-bezier(.22,1,.36,1)`, `--ease-in-out: cubic-bezier(.65,0,.35,1)`, `--dur-micro: .25s`, `--dur-ui: .5s`, `--dur-reveal: 1s`, respects `prefers-reduced-motion`, uses GSAP + Lenis (smooth scroll). my_cars will reuse the same token names and easings with shorter app durations, and **no Lenis** (the manual forbids scroll hijacking in a data-heavy app).

## Test data added during the visual upgrade (dev database only)
Created by Claude on 2026-11-13 at 14:29 (Phase 0) through the API, with the existing tokens of `Ana` (customer) and `admin`, so that "my bookings", messages and the admin pages have content for screenshots. Arlindo decided to keep them for testing.
- Booking 4: Ana, Volkswagen ID.4 (car 35), 2026-11-20 → 2026-11-24, pending.
- Booking 5: Ana, Ford Mustang (car 36), 2026-12-05 → 2026-12-08, pending.
- Conversation about car 35: message 4 from Ana ("Përshëndetje! A përfshihet sigurimi i plotë në çmim?") and message 5, the admin's reply.
No users or tokens were created. A generated test photo was uploaded to car 35 in Phase 5 and removed again with the same endpoint.
