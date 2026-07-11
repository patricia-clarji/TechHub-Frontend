# TechHub Premium Implementation Prompt

Use this prompt in a new Codex session to implement approved improvements from `docs/TECHHUB_PREMIUM_PRODUCTION_GAP_REPORT.md`.

## Role and objective

You are Codex working in the TechHub frontend repository. TechHub is a Vue 3 + Vite + Vue Router + Pinia storefront using Osimart/Django REST Framework APIs. Preserve the existing visual identity and all genuinely working functionality. Do not invent backend APIs, fake persistence, fake orders, fake payments, fake admin access, or hardcoded chatbot answers.

Current readiness: order-request storefront.

## Actual project structure to respect

- Entry: `src/main.js`, `src/App.vue`
- Router: `src/router/index.js`
- Config: `src/config/index.js`
- Shared services: `src/services/apiClient.js`, `src/services/errorHandler.js`, `src/services/endpoints.js`, `src/services/drf.js`
- Auth: `src/services/authService.js`, `src/services/authSession.js`, `src/services/authValidation.js`, `src/stores/auth/user.js`, `src/components/modals/AuthModal.vue`
- Catalog: `src/services/osimart.js`, `src/services/normalizers.js`, `src/stores/shop/products.js`, `src/stores/catalog/*`, `src/pages/Products/*`, `src/components/products/*`, `src/components/cards/*`
- Cart/wishlist: `src/stores/shop/cart.js`, `src/stores/shop/wishlist.js`, `src/pages/Cart/index.vue`, `src/pages/Wishlist/index.vue`, `src/components/layout/CartDrawer.vue`
- Checkout/order request: `src/pages/Checkout/index.vue`, `src/services/orderRequestService.js`, `src/pages/OrderConfirmation/index.vue`
- Account/settings: `src/pages/Account/index.vue`, `src/pages/Settings/index.vue`
- Notifications/toasts: `src/stores/ui/toast.js`, `src/stores/ui/notifications.js`, `src/components/layout/ToastNotification.vue`, `src/components/layout/Navbar.vue`
- Chatbot: `src/components/ui/ChatWidget.vue`, `src/services/chatbotService.js`, `server/deepseek-proxy.mjs`
- Admin: `src/admin/*`, `src/services/adminApi.js`, `src/services/adminResources.js`, `src/stores/admin/*`
- Tests: `__test__/unit/*`, `__test__/e2e/*`
- Scripts: `scripts/dev.mjs`, `scripts/verify-osimart-drf-api.mjs`, `scripts/generate-sitemap.mjs`

## Non-negotiable safety rules

1. Start by running `git status --short --ignored`, `git branch --show-current`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`, `npm run verify:api`, and `npm audit --audit-level=moderate`.
2. Create a dedicated branch before edits.
3. Do not reset or overwrite user work.
4. Keep admin blocked until server-verified staff auth exists.
5. Do not collect card numbers, CVV, or payment data in regular Vue forms.
6. Do not claim local-only state is backend-persisted.
7. Do not call an order request a completed order.
8. Add tests for every important fix.
9. Run lint, unit tests, build, and relevant e2e after each phase.
10. End with a production-readiness report.

## Phase 0: Security and correctness foundation

### Tasks
- Verify `src/router/index.js` still blocks `/admin/*` when `config.ADMIN.STAFF_AUTH_CONFIGURED` is false.
- Verify `src/admin/pages/AdminLogin.vue` does not submit customer credentials.
- Verify `src/pages/Settings/index.vue` does not collect cards, CVV, or fake password/profile saves.
- Verify `src/services/authService.js` sends one clean `login_as: "customer"` request and does not retry misspelled values.
- Verify `src/stores/auth/user.js` clears local cart, wishlist, and notifications on logout.
- Review `.env.example` and docs for frontend secret misuse.

### Acceptance criteria
- Customer login cannot access admin.
- No card fields exist outside a future PCI provider integration.
- No fake save/success states for profile/password/preferences.
- Logout clears customer-visible local state.
- `npm run lint`, `npm run test`, `npm run build`, and `npm run test:e2e` pass.

### Required tests
- Admin blocked e2e.
- Logout state-clear unit test.
- Auth one-request login unit test.
- Settings disabled-state component or route test.

## Phase 1: Backend contract confirmation

### Tasks
- Confirm with backend owners which APIs exist for:
  - customer profile
  - address book
  - cart
  - cart merge
  - checkout quote
  - order creation
  - order history/detail
  - payment provider
  - notification preferences
  - staff auth/RBAC
  - chatbot proxy
- Update `docs/admin-api-contract.md` and add commerce/account contracts before UI enablement.
- Extend `scripts/verify-osimart-drf-api.mjs` so POST-only endpoints are tested with safe contract-aware probes or documented as intentionally skipped.

### Acceptance criteria
- Every enabled UI write action has a confirmed backend endpoint.
- Unknown or backend-dependent flows remain disabled with honest copy.
- API verifier distinguishes backend gaps from frontend failures.

### Required tests
- API verifier tests for new contracts.
- Unit tests for endpoint builders and response adapters.

## Phase 2: Backend cart and guest merge

### Tasks
- Add a cart service rather than embedding API logic in components.
- Keep `src/stores/shop/cart.js` as the source of truth, but add modes:
  - guest local cart
  - authenticated backend cart
  - merge pending state
- Backend remains authoritative for price, stock, and line validity.
- Preserve cart on failed sync/checkout.
- Prevent duplicate add/update requests.

### Acceptance criteria
- Guest cart works offline/local.
- Login merges guest cart into backend cart only through confirmed API.
- Logout clears active customer cart from UI.
- Backend stock/price errors are visible.

### Required tests
- Guest add/update/remove.
- Login merge success/failure.
- Logout cleanup.
- Backend unavailable state.

## Phase 3: Real checkout and orders

### Tasks
- Keep current `orderRequestService.js` until real order APIs exist.
- Add quote/order services only after backend contracts are confirmed.
- Replace client-calculated totals with server quote totals.
- Add idempotency key per submission.
- Integrate hosted payment provider if online payment is approved.
- Keep COD/order-request wording unless a real order is created.

### Acceptance criteria
- No duplicate order on double submit.
- Server validates stock, tax, shipping, discounts, and totals.
- Payment data is never collected by raw Vue inputs.
- Confirmation page receives real order/request reference from backend.

### Required tests
- Quote success/failure.
- Order create success/failure.
- Duplicate submit blocked.
- Cart preserved on failure.

## Phase 4: Account/profile features

### Tasks
- Add account service only after backend profile/preferences/password endpoints exist.
- Enable profile fields in `src/pages/Settings/index.vue` one capability at a time.
- Add address book page/components if backend supports it.
- Add order history and tracking pages.
- Add account deletion/data export only with confirmed backend contract.

### Acceptance criteria
- Saved data persists across reload and device.
- Password changes never expose secrets in logs/state.
- Disabled actions clearly explain missing backend dependencies.

### Required tests
- Profile update.
- Preferences update.
- Password change errors.
- Address CRUD.
- Order history rendering.

## Phase 5: Admin production enablement

### Tasks
- Implement staff auth only with server-verified staff session.
- Add an admin auth store separate from customer auth.
- Enable `/admin/*` route access only for staff sessions.
- Keep writes disabled until each resource write contract is confirmed.
- Add RBAC-driven UI capabilities.
- Add audit-log display when API exists.

### Acceptance criteria
- Customer auth cannot satisfy admin guards.
- Staff logout clears staff state.
- Unauthorized admin API responses redirect/block safely.
- Write controls appear only when backend capability says allowed.

### Required tests
- Customer blocked from admin.
- Staff login success/failure.
- RBAC hides unauthorized actions.
- Write action contract tests per resource.

## Phase 6: Chatbot production hardening

### Tasks
- Deploy secure backend proxy for `/api/chatbot`.
- Move provider keys server-side only.
- Add rate limits, request-size limits, response-size limits, timeout, origin checks, and secret redaction.
- Add retrieval for product summaries and policies.
- Keep `src/services/chatbotService.js` as the frontend source of truth.

### Acceptance criteria
- Browser traffic never contains provider keys.
- Chatbot answers are grounded in provided product/policy context.
- Malformed responses and rate limits show controlled errors.

### Required tests
- Success response.
- 400/401/403/404/408/429/5xx mapping.
- Malformed response.
- Context privacy.
- E2E mocked proxy.

## Phase 7: Accessibility, SEO, and performance

### Tasks
- Add focus traps to modals/drawers.
- Audit keyboard and screen-reader flow.
- Add product/category prerendering or SSR plan.
- Add bundle budgets and image optimization.
- Self-host fonts/icons if CSP requires it.

### Acceptance criteria
- Keyboard-only checkout/cart/auth/search/chat flows work.
- Product pages have valid schema and canonical URLs.
- Bundle sizes are tracked in CI.

### Required tests
- Accessibility smoke tests.
- Metadata tests.
- Bundle-size checks.

## Phase 8: Premium enhancements

### Tasks
- Smart search and suggestions.
- Recommendations.
- Verified reviews.
- Back-in-stock and price-drop alerts.
- Warranty and returns self-service.
- AI human-support escalation.

### Acceptance criteria
- Each premium feature has backend ownership, privacy rules, tests, and clear failure states.
- No feature is enabled with mock/fake production data.

## Final validation

Run:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
npm run verify:api
npm audit --audit-level=moderate
```

Also perform manual checks:

- Customer auth login/register/verify/resend.
- Guest cart, checkout request, contact form.
- Logout clears local customer-visible state.
- Admin remains blocked without staff auth.
- Settings does not collect card/password/profile writes.
- Chatbot mocked e2e and local proxy smoke.

## Final deliverable

Provide:

1. Summary of implemented phases.
2. Files changed.
3. Backend contracts still required.
4. Security issues fixed.
5. Tests added.
6. Commands run and results.
7. Rollback notes.
8. Updated readiness classification.
