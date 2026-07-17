# TechHub Final Audit and Improvement Report

Date: 2026-07-17

## Executive summary

TechHub is now in a much stronger storefront-demo / order-request state. The checkout flow is wired to the real Osimart checkout API, registration sends the backend's expected `mobile` field, the checkout page pre-fills signed-in customer details without leaking stale user data, and the API smoke script now correctly treats POST-only endpoints as contract endpoints instead of broken GET endpoints.

This is not yet a fully production-ready ecommerce deployment. The remaining blockers are backend/API issues and unverified authenticated write contracts: `/order-summaries/` times out, checkout can still expose backend 500/debug behavior for invalid product variants, profile update APIs are not confirmed, and customer address persistence still needs a verified authenticated endpoint contract.

## Readiness classification

Current classification: polished storefront demo with real catalog, auth, cart UI, and checkout submission plumbing.

Not yet production ecommerce because:
- Order history endpoint `/order-summaries/` times out in the live smoke test.
- Backend returns server errors for some invalid checkout/cart variant scenarios instead of safe 400 responses.
- Profile editing, saved addresses, notification preferences, and billing settings do not have confirmed working API contracts.
- Staff/admin APIs are treated conservatively because live authenticated admin contracts were not provided.

## Implemented fixes

### Checkout API

Implemented checkout submission against:

```text
https://api.osimart.com/store/apis/checkout/
```

The frontend now builds the backend-required payload with:
- `payment_method_id`
- cart dictionary keyed by product variant ID
- guest customer information
- address object with `address`, `city`, optional `postal_code`, backend country UUID, and shipping zone UUID
- order notes
- total
- store ID

The checkout service also fetches live available payment methods and shipping countries before submitting, so the payload uses real backend IDs instead of hardcoded placeholders.

### Variant-safe checkout cart

Checkout now avoids unpriced variants where possible. If a cart item does not already carry a valid variant ID, the service chooses a priced variant matching the cart price, then falls back to the first priced variant. If no usable variant exists, checkout fails on the frontend with a useful error instead of sending a bad backend payload.

### Checkout signed-in prefill

Checkout now restores the user session and pre-fills name, email, and phone from the signed-in customer. It only fills empty fields, so user edits are not overwritten. If the user logs out or switches accounts, private checkout fields are cleared to prevent stale customer data from crossing sessions.

### Registration payload

Registration now sends:

```json
{
  "mobile": "..."
}
```

It no longer sends `mobile_number` or another frontend-only alias.

### API smoke contract handling

The API verifier now handles POST-only endpoints by checking `OPTIONS` and `Allow: POST, OPTIONS` instead of incorrectly marking them failed because GET returns 405.

POST-only endpoints now covered as contract checks:
- `/cart/update-item/`
- `/checkout/`
- `/contactmessage/`
- `/submitproductrequest/`

### Admin resource safety

POST-only resources were marked as non-list/detail resources in admin metadata so the admin UI does not imply unsupported browsing behavior for checkout/contact/submit-product-request endpoints.

### E2E local proxy resilience

Vite's `/api/chatbot` proxy target now honors `DEEPSEEK_PROXY_PORT`, matching the local chat proxy server. This lets tests run safely on an alternate port when `8787` is already in use.

## API status

Confirmed working or contract-valid in smoke test:
- `stores`: 200
- `categories`: 200
- `collections`: 200
- `brands`: 200
- `variant-types`: 200
- `products`: 200
- `product-variants`: 200
- `product-notification-requests`: 200
- `cart-view`: 200
- `cart-update-item`: POST contract confirmed by OPTIONS
- `payment-methods`: 200
- `available-payment-methods`: 200
- `shippingcountries`: 200
- `promocodes`: 200
- `freedeliveries`: 200
- `checkout`: POST contract confirmed by OPTIONS
- `contactmessage`: POST contract confirmed by OPTIONS
- `policies`: 200
- `banners`: 200
- `announcementbars`: 200
- `submitproductrequest`: POST contract confirmed by OPTIONS

Authenticated endpoints responding as protected:
- `customer-info`: 401 without auth
- `customer-addresses`: 401 without auth
- `wishlist`: 401 without auth

Still failing:
- `order-summaries`: request aborts due to timeout.

## Backend blockers found

### `/order-summaries/`

The live API smoke test consistently reports:

```text
order-summaries: failed (The operation was aborted due to timeout; 0 sampled)
```

This blocks a reliable production order-history/account-orders experience.

### Checkout/cart invalid variant handling

Live probing showed the checkout/cart backend can return HTTP 500 when given invalid or unpriced product variant inputs. The frontend now avoids known bad local variant choices, but the backend should still return safe validation errors, not Django server/debug responses.

Expected backend behavior:
- Invalid variant ID: 400 with a validation message.
- Variant with null/unavailable price: 400 with a validation message.
- Empty or malformed cart: 400 with a validation message.
- No debug stack trace in production responses.

### Profile/settings APIs

Confirmed:
- Password change has a real API path in frontend service code.

Not confirmed as production-ready:
- Profile edit/update endpoint.
- Saved customer addresses create/update/delete.
- Billing preferences.
- Notification preferences.

These settings areas should remain disabled or clearly limited until their backend contracts are confirmed.

## Security notes

Positive:
- Customer auth endpoints are treated as protected.
- Staff/admin access is disabled when staff auth is not configured.
- Admin login does not submit customer credentials.
- Checkout clears private fields on logout/user switch.
- Dependency audit found 0 vulnerabilities at moderate level or higher.

Remaining security work:
- Disable Django DEBUG-style error pages on production/staging API.
- Replace backend 500s with structured 400 responses for invalid ecommerce input.
- Confirm token refresh/logout behavior against final production auth settings.
- Confirm CORS and credential settings for the production frontend domain.

## UX and accessibility notes

Improved:
- Checkout now has a complete delivery form including city/area and optional postal code.
- Signed-in customer prefill reduces checkout friction.
- Checkout validation catches missing delivery area before API submission.
- E2E tests cover auth persistence, logout permanence, admin route protection, and chatbot proxy behavior.

Remaining:
- A complete premium redesign of every page should be handled as a separate visual QA/design pass. This audit focused on production blockers, checkout correctness, API contracts, and regression safety.
- Saved address selection would materially improve signed-in checkout once the address API contract is confirmed.

## Verification results

Passed:

```text
npm run lint
npm test
npm run build
npm run test:e2e
npm audit --audit-level=moderate
```

Unit test result:

```text
12 test files passed
86 tests passed
```

E2E result:

```text
4 tests passed
```

Dependency audit:

```text
found 0 vulnerabilities
```

API smoke result:

```text
npm run verify:api
```

Result: failed only because `/order-summaries/` timed out. All other public/contract endpoints in the smoke set passed or correctly returned auth-required status.

## Files changed in this pass

- `src/services/orderRequestService.js`
- `src/pages/Checkout/index.vue`
- `src/services/authService.js`
- `src/services/adminResources.js`
- `scripts/verify-osimart-drf-api.mjs`
- `vite.config.js`
- `__test__/unit/orderRequestService.test.js`
- `__test__/unit/checkoutPrefill.test.js`
- `__test__/unit/authService.test.js`
- `docs/TECHHUB_API_INTEGRATION_STATUS_REPORT.md`
- `docs/TECHHUB_PROFILE_SETTINGS_API_REPORT.md`
- `docs/TECHHUB_FINAL_AUDIT_AND_IMPROVEMENT_REPORT.md`

## Remaining API gaps

Highest priority:
- Fix `/order-summaries/` timeout.
- Confirm authenticated order history response shape.
- Harden checkout/cart backend validation for bad variants and unpriced variants.
- Confirm profile update endpoint and payload.
- Confirm customer address create/update/delete endpoints and payloads.

Medium priority:
- Confirm notification preferences endpoint.
- Confirm billing/settings endpoint, or remove billing UI until supported.
- Confirm staff/admin authenticated endpoints before enabling admin write features.

Lower priority:
- Add saved-address prefill and selection to checkout after address contracts are verified.
- Expand e2e coverage for a real checkout success path once a safe staging checkout fixture exists.
