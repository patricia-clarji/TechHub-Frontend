# TechHub Frontend

Production-oriented Vue 3, Vite, and Pinia storefront backed by Osimart.

## Setup

Requires Node.js 20.19+ or 22.12+.

```bash
cp .env.example .env
npm ci
npm run dev
```

The local storefront runs at `http://127.0.0.1:5173`.

Environment variables:

- `VITE_OSIMART_BASE_URL`: public Osimart storefront API root.
- `VITE_OSIMART_AUTH_URL`: Osimart authentication API root.
- `VITE_OSIMART_STORE_ID`: Osimart store UUID.
- `VITE_GOOGLE_CLIENT_ID`: public Google OAuth Web Client ID for Sign in with Google; never a client secret.
- `VITE_SITE_URL`: final HTTPS storefront origin, without a trailing slash.
- `VITE_SITE_NAME`: public store name.
- `VITE_DEFAULT_OG_IMAGE`: public Open Graph image path or URL.

All `VITE_*` values are public browser configuration. Never put private API keys, bearer tokens, payment secrets, or
authentication secrets in them.

## Osimart integration

- `GET /products/`
- `GET /products/{uuid}/`
- `GET /products/?slugified_name={slug}`
- `GET /categories/`
- `GET /brands/`
- `GET /banners/`
- `POST /contactmessage/` for cash-on-delivery/order requests
- `POST /auth/login/`
- `POST /auth/register/`
- `POST /auth/forgot-password/`
- `POST /auth/login/google/`

The catalog reads Osimart’s `slugified_name`, `remaining_stock`, `price_range`, `discounted_price_range`,
`gallery[].media`, `categories[].category`, `brand`, and `product_variants` fields. There is no production fallback
catalog: a failed API request produces a visible error instead of silently showing demo data.

Osimart also exposes `POST /checkout/`, but its public endpoint depends on an Osimart server-side cart/payment session.
It is not used without an agreed payment and session integration.

## Checkout behavior

Checkout submits a real order request to Osimart after validating name, email, phone, address, cart availability, stock,
variants, quantities, and totals. It never collects card data. The cart is cleared and confirmation is displayed only
after Osimart accepts the request.

## Customer authentication

Login, customer registration, password recovery, logout, and the protected account route use Osimart’s real customer
authentication endpoints. Passwords are sent directly to Osimart over HTTPS and are never stored by the frontend.
The returned access token and sanitized customer identity are kept in memory only—never in `localStorage`,
`sessionStorage`, IndexedDB, or cookies accessible to JavaScript. They are cleared on refresh, logout, or token expiry.
Persistent login should be enabled only when the backend can issue Secure, HttpOnly, SameSite cookies. Refresh and
profile/order-history features remain disabled until their exact Osimart response contracts are verified.

Password recovery always returns a neutral response so the storefront does not reveal whether an email is registered.
Email ownership verification and 2FA are not simulated in the frontend; enable them only when Osimart provides a
complete backend-enforced enrollment, challenge, recovery-code, rate-limit, and audit flow.

Google sign-in uses the current Google Identity Services button and passes Google’s signed ID token directly to
Osimart for server-side verification. Configure a Web OAuth client in Google Cloud, add the local and production
storefront origins as Authorized JavaScript origins, and set `VITE_GOOGLE_CLIENT_ID`. A Google client secret must never
be added to this frontend.

## SEO

Route metadata includes titles, descriptions, canonical URLs, Open Graph/Twitter cards, Organization,
BreadcrumbList, and Product JSON-LD. Generate the deployment sitemap after configuring the final domain:

```bash
npm run sitemap
npm run build
```

This SPA updates metadata client-side. For markets requiring guaranteed crawler-rendered product metadata, add
prerendering or migrate public catalog routes to SSR.

## Production deployment checklist

1. Rotate the previously exposed DeepSeek/OpenRouter key; removing it from the frontend does not revoke it.
2. Configure all variables from `.env.example`, then run `npm ci`, `npm run sitemap`, and `npm run build`.
3. Serve `dist/` over HTTPS with SPA history fallback to `index.html`.
4. Deliver `dist/` or a `git archive`; never include `.git`, `.env`, source maps, editor settings, or local logs.
5. Configure these response headers at the CDN/server:
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - A tested Content Security Policy allowing this site, Osimart images/API, configured fonts, required styles, and
     `https://accounts.google.com` / `https://*.gstatic.com` when Google sign-in is enabled.
6. Replace CDN-hosted fonts/icons with self-hosted approved assets if the final CSP must avoid third-party origins.
7. Confirm Osimart CORS, rate limiting, order-request recipients, tax, currency, shipping, and COD terms.
8. Run keyboard, screen-reader, mobile-device, and cross-browser acceptance tests.

## Client handoff and limitations

- Customer login and basic account identity are enabled through Osimart. Profile editing, account settings, order
  history, and review submission are not simulated.
- Checkout creates an order request, not a paid order. Payment requires a PCI-compliant hosted provider.
- Guest cart, wishlist, recently viewed items, UI notifications, and theme preference use local storage; none contain
  passwords, tokens, card data, or customer checkout details. Logout clears customer-visible cart, wishlist, and local
  notification state to avoid cross-user leakage.
- Prices are currently displayed in USD because the Osimart payload does not provide storefront currency metadata.
- The final legal privacy/terms content, shipping rules, social links, and contact ownership require client approval.

## Admin workspace

The lazy-loaded admin workspace code remains in the bundle, but `/admin/*` is blocked by default because no
server-verified staff authentication contract is configured. `/admin/login` shows a disabled staff-access notice.
Customer credentials must not unlock admin routes.

Prepared admin routes:

- `/admin/overview`
- `/admin/analytics`
- `/admin/products`, `/admin/products/new`, `/admin/products/:id/edit`
- `/admin/categories`, `/admin/brands`, `/admin/orders`, `/admin/customers`
- `/admin/order-statuses`, `/admin/shipping-countries`
- `/admin/banners`, `/admin/promotions`, `/admin/media`, `/admin/markets`, `/admin/online-store`
- `/admin/inventory`, `/admin/reviews`
- `/admin/settings`

The prepared workspace includes a responsive sidebar/drawer, top navigation, breadcrumbs, dark mode, workspace search, live catalog
metrics, searchable/filterable responsive tables, product editor schema, loading/empty/error states, inventory and
product CSV exports, and settings/security blueprints. Product, category, brand, banner, and inventory views use live
public Osimart catalog data. Private order/customer/review data is never fabricated.

### Admin security and demo-mode limitation

The workspace is intentionally **blocked demo mode**. The current Osimart customer session does not prove a staff
role, and no verified admin API contract was available. Frontend route guards or a `VITE_*` flag are not authorization.
Therefore admin route access, create, update, delete, moderation, fulfilment, and settings persistence remain disabled;
unsupported service calls throw instead of reporting fake success.

Before production admin access is enabled, the backend must provide:

1. Server-enforced staff login and role/permission checks for every admin endpoint.
2. Secure, HttpOnly, SameSite session cookies or short-lived memory-only staff tokens with rotation.
3. CSRF protection where cookie sessions are used, MFA, rate limits, audit logs, and re-authentication for destructive
   operations.
4. Scoped CRUD endpoints for products, categories, brands, banners, promotions, inventory, reviews, orders, customers,
   and settings, including validated media uploads.
5. Pagination, filtering, optimistic-concurrency/version checks, and stable validation-error contracts.

The full Django admin API contract is documented in [`docs/admin-api-contract.md`](docs/admin-api-contract.md). Existing
DRF GET resources are registered in `src/services/adminResources.js` and rendered through the generic admin
list/detail pages. Automated unit and e2e test code lives under `__test__/`.

Never add an admin password, private token, OAuth secret, or privileged Osimart credential to `.env`, any `VITE_*`
variable, source code, localStorage, or the delivered client bundle. For a public deployment, remove or server-block
`/admin/*` until staff authentication is connected if the client does not want the read-only catalog workspace visible.

### Sale/demo readiness checklist

- Configure `.env` from `.env.example`; leave `VITE_OSIMART_ADMIN_URL` blank until staff endpoints exist.
- Install the Playwright browser once on each test machine with `npm exec playwright install chromium`.
- Run `npm install`, `npm run test:api`, `npm test`, `npm run lint`, `npm run test:e2e`, and `npm run build`.
- Review `reports/osimart-api-smoke.json` after `npm run test:api`; any `405` or `500` response is a backend/API gap, not a frontend success.
- Confirm `/admin/*` redirects to the disabled staff-login state until a backend staff session exists.
- Confirm private modules show “Backend API required” and never show fabricated records.
- Confirm write/destructive controls remain disabled until staging staff CRUD endpoints pass E2E tests.
- Confirm public catalog reads use the intended store id and no localhost or private token is bundled.
- Confirm CDN/server headers, CORS, CSRF, CSP, HSTS, rate limits, and audit logging are configured.
- Confirm client-approved legal copy, shipping rules, payment/COD terms, contact ownership, and currency/market rules.

### Admin test checklist

```bash
npm ci
npm run test:api
npm test
npm run lint
npm exec playwright install chromium
npm run test:e2e
npm run build
npm run dev
```

Then open `http://127.0.0.1:5173/admin/overview` and confirm it redirects to `/admin/login` with disabled staff-login
controls. Only enable route rendering tests after a server-verified staff auth flow is implemented.
