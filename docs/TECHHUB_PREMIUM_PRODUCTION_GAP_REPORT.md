# TechHub Premium Production Gap Report

Generated from the current Vue 3 + Vite + Vue Router + Pinia codebase.

## 1. Executive summary

TechHub is currently a polished order-request storefront, not a secure production e-commerce platform. The storefront has a live Osimart-backed catalog, product detail pages, local cart/wishlist/compare flows, customer auth, contact-message order requests, and a secured chatbot proxy path. It does not yet have backend-authoritative cart, checkout, payment, order history, profile persistence, staff admin authentication, or operational production controls.

This cleanup phase removed or corrected misleading behavior in customer auth, account settings, admin access, and logout state. Admin customer-login access is now blocked until a real staff auth contract exists. Settings no longer collects payment cards or pretends to persist profile, password, or notification changes. Logout clears customer-visible local cart, wishlist, and notifications.

Readiness classification: order-request storefront.

## 2. Current product maturity

- Product maturity: polished demo / order-request storefront.
- Commerce maturity: request-to-contact flow; no accepted order/payment lifecycle.
- Security maturity: improved frontend security posture; backend security controls still required.
- Admin maturity: blocked demo mode; admin code exists but cannot be accessed without a future staff auth contract.
- AI maturity: functional local proxy integration; production proxy controls and retrieval layer still required.

## 3. Features currently complete

- Live catalog listing from Osimart: `src/services/osimart.js`, `src/stores/shop/products.js`, `src/pages/Products/index.vue`.
- Product detail and variant display: `src/pages/Products/ProductDetail.vue`, `src/components/products/*`.
- Local guest cart: `src/stores/shop/cart.js`, `src/pages/Cart/index.vue`, `src/components/layout/CartDrawer.vue`.
- Local wishlist: `src/stores/shop/wishlist.js`, `src/pages/Wishlist/index.vue`.
- Customer auth shell: `src/services/authService.js`, `src/services/authSession.js`, `src/stores/auth/user.js`, `src/components/modals/AuthModal.vue`.
- Contact form and order-request form using `/contactmessage/`: `src/pages/Contact/index.vue`, `src/pages/Checkout/index.vue`, `src/services/orderRequestService.js`.
- Chatbot frontend and local proxy contract: `src/components/ui/ChatWidget.vue`, `src/services/chatbotService.js`, `server/deepseek-proxy.mjs`.
- Read-only admin API service preparation: `src/services/adminApi.js`, `src/services/adminResources.js`.
- SEO meta updates and sitemap script: `src/router/index.js`, `scripts/generate-sitemap.mjs`.
- Automated test harness: `vitest.config.js`, `playwright.config.js`, `__test__/`.

## 4. Features partially implemented

- Admin workspace UI exists but access is blocked until staff auth exists.
- Profile/settings display exists, but save actions are disabled because no profile/password/preferences APIs are confirmed.
- Checkout submits an order request through contact messages, not a real order.
- Product reviews render if product data contains reviews, but no review submission/moderation API exists.
- Notifications are local UI notifications only; no persistent account notification API exists.
- Recently viewed is local storage only.
- Chatbot has safe context from current app state but no dedicated product/policy retrieval service.

## 5. Features that are misleading or local-only

- Local cart/wishlist/recently viewed are browser-local, not backend-synced.
- Contact-message order requests can look commerce-like but are not accepted orders.
- Admin module is a prepared UI, not production admin.
- Account settings are view-only until backend contracts exist.
- Notification bell shows local UI notifications only.

## 6. Missing backend contracts

- Staff auth, RBAC, audit log, and admin CRUD contracts.
- Server-side cart with guest-to-customer merge.
- Real checkout/order API with idempotency, tax, shipping, promotion validation, stock validation, payment status.
- Customer order history and tracking API.
- Profile update, password change, MFA, account deletion, data export APIs.
- Wishlist, notification preferences, back-in-stock, and price-drop APIs.
- Reviews and verified-purchase review APIs.
- Policy retrieval API for returns, warranty, privacy, shipping, and payment terms.

## 7. Missing customer features

- Order history and status tracking.
- Address book.
- Saved payment provider integration.
- Returns and warranty requests.
- Invoices.
- Notification preferences.
- Profile photo upload.
- Account deletion and data export.
- Two-factor authentication.

## 8. Missing catalog/product features

- Backend smart search, typo tolerance, and suggestions.
- Product recommendation service.
- Related products from backend merchandising rather than local category matching.
- Verified product reviews.
- Back-in-stock and price-drop alerts.
- Delivery estimates.
- Currency/market metadata.
- Variant-level stock reservation.

## 9. Missing cart/checkout/order features

- Backend-synced cart.
- Guest-to-user cart merge.
- Server-calculated totals.
- Stock revalidation at checkout.
- Real order creation.
- Tax, shipping, discount validation.
- Payment provider integration.
- Idempotent checkout submission.
- Email confirmation.
- Fraud prevention and abuse controls.

## 10. Missing account/profile features

- Persisted profile edits.
- Persisted preferences.
- Password change.
- Active session management.
- MFA setup.
- Account deletion and data export.
- Secure avatar upload.

## 11. Missing notification features

- Persistent notification API.
- User-specific notification preferences.
- Order, delivery, warranty, price-drop, and back-in-stock notifications.
- Mark-read sync across devices.
- Notification clearing on backend logout/session expiry.

## 12. Missing chatbot/AI features

- Production-hosted secure proxy.
- Product search/retrieval layer with token limits.
- Policy/document retrieval.
- Conversation isolation by user/session.
- Rate limits, abuse detection, and audit logs.
- Human-support escalation.
- AI analytics and answer quality monitoring.

## 13. Missing admin features

- Staff authentication.
- RBAC and permission checks.
- CRUD write endpoints.
- Inventory management.
- Order workflow.
- Customer history.
- Promotion scheduling.
- Exports and bulk actions.
- API health and operational alerts.
- MFA and re-authentication for destructive actions.

## 14. Missing security controls

- CSP and security headers.
- HSTS and HTTPS-only deployment.
- Backend rate limits for auth, contact, checkout, chatbot.
- CSRF strategy for cookie-backed APIs.
- Staff auth and RBAC.
- Server-side cart/order validation.
- Payment provider tokenization.
- Dependency and supply-chain monitoring in CI.
- Secret scanning and key rotation process.

## 15. Missing accessibility work

- Full keyboard audit for modals, drawers, comparison tray, chatbot, and admin.
- Focus trapping for all modal/drawer overlays.
- Screen-reader labels for icon-only controls.
- Reduced-motion audit.
- Color contrast audit across light/dark themes.
- Form error association with `aria-describedby`.

## 16. Missing SEO work

- SSR/prerendering for product/category pages.
- Product canonical URL strategy.
- Dynamic Open Graph images.
- Currency and availability schema from backend-confirmed data.
- Robots/sitemap deployment validation.
- Redirect strategy for stale product slugs.

## 17. Missing performance work

- Bundle budget and analysis.
- Image optimization/CDN strategy.
- Product page lazy media.
- Font/icon self-hosting.
- Route-level performance budgets.
- Cache strategy for catalog resources.

## 18. Missing analytics/observability

- Privacy-aware analytics consent.
- Conversion funnel events.
- Checkout failure monitoring.
- API error telemetry.
- Chatbot usage/quality metrics.
- Admin operational logs.
- Frontend error reporting.

## 19. Missing deployment/operations work

- Production `.env` validation.
- CI/CD pipeline.
- Staging environment.
- Release monitoring.
- Rollback process.
- Backup/disaster recovery plan for backend-owned data.
- CDN/security headers.
- Runtime health checks.

## 20. Missing automated tests

- Cart logout and namespacing coverage was added in this cleanup; backend-synced cart tests still missing.
- Product filter/sort/route query integration tests.
- Checkout idempotency tests after real order API exists.
- Accessibility tests.
- SEO/meta tests for product pages.
- Admin staff-auth tests after backend support.
- Chatbot abuse/error/rate-limit tests against production proxy.

## 21. Missing legal/privacy/compliance items

- Final privacy policy, terms, returns, warranty, shipping, and COD terms.
- Cookie/analytics consent.
- Data deletion/export flows.
- PCI scope documentation.
- AI disclosure and support escalation policy.
- Retention policy for contact/order requests.

## 22. Recommended premium differentiators

- Guided product finder for gaming, creator, office, and student needs.
- Side-by-side product comparison with real specs.
- Verified-purchase reviews and Q&A.
- Back-in-stock and price-drop alerts.
- Delivery promise by address.
- Warranty/return self-service.
- Human handoff from AI assistant.

## 23. Recommended architecture improvements

- Introduce feature folders only where ownership is changing: `src/auth`, `src/account`, `src/cart`, `src/chatbot`, `src/admin/resources`, `src/shared`.
- Keep `src/services/apiClient.js` as the shared Osimart client.
- Add typed/validated response adapters per feature before larger rewrites.
- Centralize currency, dates, and price formatting.
- Add a single account/profile service once backend endpoints exist.

## 24. Recommended backend APIs

- `GET/PATCH /customer/profile/`
- `POST /customer/change-password/`
- `GET/POST/PATCH/DELETE /customer/addresses/`
- `GET/POST/PATCH/DELETE /cart/`
- `POST /cart/merge/`
- `POST /checkout/quote/`
- `POST /orders/`
- `GET /orders/`
- `GET /orders/:id/`
- `POST /returns/`
- `GET/PATCH /notification-preferences/`
- `GET /notifications/`
- `POST /chat/`
- Staff: `/admin/auth/login/`, `/admin/session/`, `/admin/resources/*`, `/admin/audit-logs/`.

## 25. Recommended database/domain capabilities

- Customer profile and address models.
- Cart and cart line models with variant snapshots and stock checks.
- Order, order line, payment, shipment, return, warranty models.
- Promotion and eligibility engine.
- Notification preference and delivery event models.
- Staff roles/permissions and audit logs.
- Product search index and recommendation metadata.

## 26. Production-launch blockers

| Item | Current status | Affected files | Business impact | Security impact | UX impact | Frontend work | Backend work | Dependencies | Acceptance criteria | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Staff admin auth | Blocked by cleanup | `src/router/index.js`, `src/admin/pages/AdminLogin.vue` | No operational admin | Prevents customer privilege escalation | Admin unavailable | Add staff login UI after contract | Staff auth, RBAC, MFA | Osimart/admin API | Customer login cannot access admin; staff login can after server verification | P0 |
| Real checkout/orders | Order request only | `src/pages/Checkout/index.vue`, `src/services/orderRequestService.js` | Cannot sell as full e-commerce | Client totals not authoritative | Manual confirmation required | Integrate quote/order/payment flows | Order, stock, payment APIs | Payment provider | Server returns order id, totals, stock validation, idempotency | P0 |
| Payment provider | Disabled | `src/pages/Settings/index.vue`, checkout pages | No online payment | Avoids PCI risk today | COD/request only | Hosted checkout/token UI | Provider integration | Stripe/Adyen/etc. | No card data touches frontend app except provider elements | P0 |
| Customer profile persistence | Disabled | `src/pages/Settings/index.vue`, `src/stores/auth/user.js` | Weak account center | Avoids fake save | Users cannot edit profile | Add forms after API | Profile/preferences APIs | Auth session | Saved values survive reload/device | P1 |
| Backend cart | Local-only | `src/stores/shop/cart.js` | Cart not cross-device | Cross-user risk mitigated by logout clear | Guest-only behavior | Namespaced/backend sync | Cart APIs | Auth/profile | Guest merge and backend authoritative prices pass tests | P1 |
| Policies/legal | Partial/static | `src/pages/FAQ`, `src/pages/About`, docs | Legal launch risk | Compliance gaps | Unclear terms | Render approved policies | Policy APIs/content | Legal approval | Privacy/terms/returns/shipping visible and versioned | P0 |

## 27. Sell-ready blockers

| Item | Current status | Affected files | Business impact | Security impact | UX impact | Frontend work | Backend work | Dependencies | Acceptance criteria | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Product data quality | Live but uneven | `src/services/normalizers.js`, product pages | Product confidence varies | Low | Inconsistent prices/specs | Validate display states | Complete catalog fields | Merchandising | No `$0` unless explicitly free/unpriced | P1 |
| Search quality | Client-side only | `src/pages/Products/index.vue` | Lower conversion | Low | Weak discovery | Search UI/results states | Search API/index | Catalog index | Typo-tolerant ranked results | P1 |
| Delivery estimates | Missing | Product/checkout pages | Lower purchase confidence | Low | Unknown delivery terms | Display quote | Shipping quote API | Address book | Estimate shown before request/order | P1 |
| Order communications | Manual | checkout/contact | Support burden | Medium | Unclear follow-up | Confirmation states | Email/SMS events | Notification service | Customer receives reference and next steps | P1 |

## 28. Suggested implementation roadmap

### Phase 0: Security and correctness
- Keep admin blocked until staff auth exists.
- Rotate any previously exposed AI/provider keys.
- Add CSP/security headers.
- Keep settings payment/profile writes disabled.

### Phase 1: Backend commerce contracts
- Implement cart, quote, order, payment, and order history APIs.
- Add idempotency and server-side totals.
- Add address book and customer profile endpoints.

### Phase 2: Frontend commerce integration
- Replace contact-message checkout with order quote/order creation.
- Add backend cart sync and guest merge.
- Add order history/tracking pages.

### Phase 3: Premium customer experience
- Reviews, alerts, recommendations, delivery estimates.
- Persistent notifications and preferences.
- Policy-driven support flows.

### Phase 4: Admin operations
- Staff auth, RBAC, audit logs.
- Enable admin route access and CRUD one resource at a time.
- Add operational dashboards and exports.

## 29. Estimated complexity

- Small: copy/docs cleanup, disabled-state UI, error-state tests, SEO metadata fixes.
- Medium: backend cart frontend integration, account profile forms, notification preferences, accessibility pass.
- Large: real checkout/payment/order lifecycle, search/recommendations, staff admin.
- Backend-dependent: profile persistence, payment, orders, cart sync, admin, AI retrieval, legal policy content.

## 30. Prioritized backlog

### P0 critical
- Staff admin auth/RBAC before enabling admin.
- Real order/checkout/payment contracts before claiming production e-commerce.
- Legal/privacy/returns/shipping policy approval.
- Secret rotation and production proxy deployment.
- Security headers and HTTPS-only deployment.

### P1 high
- Backend cart and guest merge.
- Customer profile/address/order history.
- Delivery estimates and order communications.
- Search/recommendation improvements.
- Accessibility audit.

### P2 medium
- Persistent notifications.
- Reviews and verified-purchase reviews.
- Back-in-stock/price-drop alerts.
- Performance budgets and image optimization.
- Analytics consent and funnel tracking.

### P3 premium enhancement
- AI shopping advisor with retrieval and escalation.
- Multilingual/multi-currency support.
- PWA/offline handling.
- Advanced admin bulk actions.
- Warranty/return self-service.
