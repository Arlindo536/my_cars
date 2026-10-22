# my_cars: project handoff for Claude Code

Owner: Arlindo (Tirana, Albania). Speak Albanian with him (short, concrete, direct). Code, commits and docs stay in English.
He wants Claude to do the programming itself and report progress; he watches, tests in the browser and decides only things that are his (photos, texts, address, visual taste). Ask only when blocked or for those decisions.

## Goal
Turn `my_cars` (an internship project: role-based car management) into a realistic **car rental website** for his portfolio (arlindo.site):
- Public catalog: search by name, filter by type / fuel / transmission / price, sort, pagination.
- Car detail page: specs, date selection with price total, booking, direct message to the owner/admin.
- One rental place on a map (Leaflet + OpenStreetMap). No per-car location.
- Language switch sq/en/de (German added by Arlindo in step 6). Demo (fictional) cars and prices. No real payments.
- Visual overhaul, see "Design" below. Later: a security audit of the app written up as a portfolio case study.

## Stack and conventions (stay faithful to these)
Backend (`backend/`): Django 6 + Django REST Framework, PostgreSQL, Token authentication (`rest_framework.authtoken`), `python-decouple` for settings (`.env`, see `.env.example`).
- One Django app per domain (`users`, `cars`; new: `bookings`, `messaging`).
- **Class-based `APIView`s only**, **manually written `serializers.Serializer`s (no `ModelSerializer`)**, objects created manually in views (`Car.objects.create(...)`).
- Role checks like the existing code: `request.user.role` (`'admin'` / `'customer'`), `IsOwnerOrAdmin` for object permissions. Default permission is `IsAuthenticated`; public views set `authentication_classes = []` and `permission_classes = [AllowAny]`.
- Pagination: a `PageNumberPagination` subclass per view.
- Money: `DecimalField`, never float. The server computes prices, never trust the client.
Frontend (`frontend/`): Angular 21, **module-based** (`standalone: false`), lazy-loaded feature modules, services `providedIn: 'root'`, Bootstrap 5 (CDN) for layout, Angular Material only for dialogs/snackbars/datepicker, token and role in `localStorage`, `authInterceptor`, route guards.

## Findings about the original code
- Fixed in step 0: `RegisterSerializer.validate` sat outside the class (password confirmation never checked); stray empty `backend/__init__.py` broke test discovery.
- Step 8 moved the admin fleet into the admin module (`/admin/cars`, `/admin/cars/new`, `/admin/cars/:id/edit`). The old `car` module (`/cars`, from when customers added their own cars) is now admin-only and unlinked; ask Arlindo before deleting it.
- API base URLs: moved to `src/environments/environment(.prod).ts` in step 1 (prod uses relative `/api`).
- Frontend specs: 16 of 27 generated `should create` specs fail (missing HttpClient/MatSnackBar/router providers in TestBed); pre-existing, fix when touching each component.
- Step 2: the 11 pre-existing dev cars (owned by customers) have `price_per_day = 0` and no photo; the catalog must hide or handle them (ask Arlindo before deleting). Demo cars have no photos yet (his decision); the frontend needs a placeholder.
- `price_per_day`/`description` are optional in `CarSerializer` so the old edit form (which does not send them) cannot reset them on PUT.
- Step 3: `CarDetailView` had `permission_classes = [IsOwnerOrAdmin]` only, so anonymous requests crashed with 500 (AnonymousUser has no `role`); fixed to `[IsAuthenticated, IsOwnerOrAdmin]`. Check other views for the same pattern in the security audit.
- Arlindo's local `.env` sets `CORS_ALLOWED_ORIGINS=http://localhost:4201`, so run `ng serve --port 4201` locally.
- Catalog: cars with `price_per_day = 0` are hidden (his decision). Prices are EUR. 
- Step 4 (bookings): `TIME_ZONE = 'Europe/Tirane'` so "today" is local. Rules: start >= today, end > start, max 30 days, max 1 year ahead; return day may be the next pickup day. Only customers book; admins confirm/reject pending (UI in step 8). Customers see others' bookings as 404 (no IDOR). `ConcurrentBookingTests` proves the `select_for_update` lock (it fails without it).
- Datepicker limitation: one `dateFilter` for both ends, so a booked range's start day cannot be picked as a return day in the UI (the API allows it).
- Headless Chrome in this environment has no Albanian ICU data, so its calendar shows English month names for sq; de/en are fine. Real browsers use `sq-AL`.
- Login accepts `?returnUrl=` (relative app paths only, via the router); `authGuard` sets it.
- Step 5: office name/address/coordinates live in `environment(.prod).ts` (placeholder until Arlindo picks the real address). Leaflet stays in the lazy catalog chunk; its CSS is global and marker PNGs are copied to `/leaflet` (angular.json). Tiles come from tile.openstreetmap.org (fine for a low-traffic portfolio; check OSM tile policy before heavy use).
- Step 6/8: everything is translated except the legacy `car` module. Car descriptions come from the DB in Albanian only (ask Arlindo if he wants per-language descriptions). Backend error messages are English; the UI shows translated generic messages instead of server text.
- Step 7 (messaging): one `Conversation` per (customer, car); any admin can read and answer every thread (admins act for the rental). Customers see others' threads as 404. `is_read` is a single flag per message (shared by all admins). Polling: thread 5 s with `?after=<last id>`, inbox 15 s, nav unread badge 30 s, all paused while the tab is hidden. Sending is throttled (`send_message`: 20/min, POST only via `SendMessageThrottle`); GET polling is never throttled. Message bodies are stored verbatim and rendered only via interpolation (`white-space: pre-wrap`); verified that `<img onerror>` shows as text. Inbox serializer does 2 queries per conversation (last message, unread): fine for 20 per page, annotate if it grows.
- Step 8: customers can no longer create cars (`POST /api/cars/` is admin-only; admins use `admin-create/`, owner defaults to the requesting admin). Photos: `POST/DELETE /api/cars/<id>/image/` (admin, multipart `image`), validated with Pillow (JPEG/PNG/WebP, max 5 MB), re-encoded to JPEG (max 1600 px, EXIF/GPS dropped) under a random `cars/<uuid>.jpg` name; old files are deleted on replace, removal and car deletion. `CarSerializer` returns absolute image URLs when given the request. Admin landing page is `/admin/bookings` (confirm/reject pending); customers land on `/` after login. `adminGuard` now redirects to `/` (it pointed to `/cars`, which would loop now that `/cars` is admin-only). Prices render through the shared `price` pipe ("35 €", "99,50 €").
- Test quirk: specs for components declared in a feature module import that module (e.g. `AdminModule`) instead of re-declaring the component, otherwise exported components/pipes are not in scope.
- Step 9 (Docker): backend runs gunicorn as uid 10001; the entrypoint migrates and runs collectstatic. Static/media dirs contain a `.keep` file so new named volumes copy the app user's ownership (empty dirs gave root-owned volumes and a crash). nginx re-resolves `backend` via the container DNS (`NGINX_ENTRYPOINT_LOCAL_RESOLVERS` + variable `proxy_pass`), uses `^~` for `/static/` and `/media/` (otherwise the asset regex location wins), and forwards `Host` with port (`$http_host`). CSP: `script-src 'self'`; Angular's critical-CSS inlining is disabled in production because it adds an `onload` handler the CSP blocks. A full browser run against the container showed no CSP violations or console errors. `make_admin <username>` gives a user the admin role (createsuperuser alone creates a customer).
- Production build: initial bundle ~572 kB exceeds the 500 kB budget warning (was ~562 kB before step 1; ~620 kB after step 4: Material form-field/datepicker code shared with the app shell; ~658 kB after step 6: ngx-translate + sq/de locale data).
- `app-routing-module.ts` has no `''` route: the public catalog will be the home page.
- Step 9: `DEBUG` (default False), `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, secure cookies, HSTS and the Django admin path (`DJANGO_ADMIN_PATH`, `django-admin/` in Docker because Angular owns `/admin`) come from the environment. Arlindo's local `backend/.env` got `DEBUG=True`.
- Token in `localStorage`: acceptable here, but note it in the security audit.
- Invalid token on a public endpoint returns 401: hence `authentication_classes = []` on public views.

## Target data model (PostgreSQL, Django migrations)
- `Car` (existing): add `price_per_day` (Decimal), `description`, `image` (ImageField, needs Pillow + MEDIA settings), type `hatchback`. Keep `owner` (the admin who manages it). Customers no longer create cars; admin manages the fleet.
- `bookings.Booking`: car, customer, start_date, end_date, total_price, status (`pending`, `confirmed`, `rejected`, `cancelled`), created_at. Days = end - start. Overlap check inside `transaction.atomic()` with `select_for_update()` on the car row (optional later: PostgreSQL `ExclusionConstraint`).
- `messaging.Conversation` (customer + car) and `messaging.Message` (conversation, sender, body, created_at, is_read). Polling, no WebSockets.

## API additions
- Public: `GET /api/cars/catalog/` (search, type, fuel, transmission, min_price, max_price, ordering, page), `GET /api/cars/catalog/<id>/`, `GET /api/cars/<id>/availability/` (booked ranges).
- Bookings: create, list (customer: own, admin: all), cancel (customer), confirm/reject (admin), `quote`.
- Messages: list conversations, start conversation about a car, read messages, send message.

## Frontend additions
- Lazy modules: `catalog` (home + car detail, public), `booking`, `messages`, `shared` (car card, Leaflet map, language switcher).
- Material datepicker range with `dateFilter` to grey out booked days.
- `@ngx-translate/core` + `@ngx-translate/http-loader` 18.0.0, `public/i18n/{sq,en,de}.json` (keep the three files' keys identical), choice kept in `localStorage` (`lang`). `Language` service (`src/app/language.ts`): `current`, `locale()` for number/date pipes (pass it explicitly: `number:'1.0-2':language.locale()`), `intlLocale()` for the datepicker, `t()` for strings in code. `TranslatePipe` is standalone: import it in each NgModule (SharedModule re-exports it). Specs use `provideTestTranslations()` from `src/testing/translate.ts`.
- Leaflet 1.9.4 + `@types/leaflet` (fix marker icon assets in `angular.json`). Office coordinates and address in `environment.ts`.

## Design (Albanian flag colours, a bit distinctive, never excessive)
- Palette: black `#0B0B0C` / `#111111`, red accent `#C8102E` (CSS variable `--accent`), neutral greys, white cards, page background `#F6F6F6`. White text on red passes contrast.
- Fonts: **Barlow Condensed** (800, uppercase) for headings, prices and numerals; **Inter** for body.
- Motifs: dark header + hero with a diagonal red cut at the bottom (`clip-path` over a red wrapper), skewed red price tags and labels, small skewed red bar before section titles, dashed "road line" dividers.
- Home: hero with background photo + title (no date form in the hero), then dark filter bar (name search + type / fuel / transmission / sort + clear), 3-column car cards (photo, name, year · type, pills, price tag, black "Shiko detajet" button), "Si funksionon" (01/02/03), dark contact/map section, black footer.
- Car page: dark title band, photo gallery, dark spec panel (year, fuel, transmission, type) with a red top border, description, "Pyet pronarin" message box, pickup map, sticky booking card (black price header, date range, total, red "Rezervo tani", outline "Dërgo mesazh pronarit").
- Copy is Albanian by default (`sq`), mobile-first, accessible (real buttons/links, labels, 4.5:1 contrast).

## Plan and status (blocks are ~90 min; target finish early December)
- [x] Step 0: local setup, register bug fix, first tests, `.env.example`, version checks.
- [x] Step 1: theme (CSS variables, fonts), nav-bar, footer, `environment.ts`.
- [x] Step 2: new `Car` fields + migration, `seed_demo` management command (15-20 fictional cars), media settings.
- [x] Step 3: public catalog endpoints + home page with filters + car detail page.
- [x] Step 4: `bookings` app, tests (overlap, price, permissions), datepicker UI, my bookings.
- [x] Step 5: map component (Leaflet, office at Skanderbeg Square placeholder 41.3275, 19.8187).
- [x] Step 6: sq/en/de translations (@ngx-translate 18.0.0).
- [x] Step 7: `messaging` app + UI.
- [x] Step 8: admin changes (car form with price/description/image, bookings, messages).
- [x] Step 9: README with screenshots, Docker Compose, production settings (env-driven). Verified locally with rootless Podman (`docker compose` via the user podman socket).
- [ ] Deploy to Arlindo's headless ThinkPad server (needs his server details / access; see README "Deployment").
Later: security audit write-up (OWASP-style: auth, IDOR on bookings/messages, XSS in messages, CORS, dependency scans, ZAP).

## Working agreements
- One branch per step (`step-1-theme`, ...), small commits, merge to `main` weekly. Run `python manage.py test` before every commit; keep the app runnable at the end of each session.
- After each step give Arlindo a short report in Albanian: what changed, how to run/see it, what to check.
- Never put real secrets in the repo. Use a dedicated dev database. Do not delete files or data without asking.
- Verify claims by running things; say plainly what was not verified.

## Run locally
```
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your values
python manage.py migrate && python manage.py seed_demo && python manage.py runserver
python manage.py test

cd frontend && npm install && ng serve
```
