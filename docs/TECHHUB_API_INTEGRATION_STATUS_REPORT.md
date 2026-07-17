# TechHub API Integration Status Report

Generated: 2026-07-17

Backend base URL tested: `https://api.osimart.com/store/apis`

## Summary

The storefront catalog, payment metadata, shipping metadata, cart view contract, cart update contract, checkout POST contract, contact POST contract, and product request POST contract are reachable. The only public smoke-test failure after correcting POST-only classification is `GET /order-summaries/`, which times out.

Authenticated customer resources return `401` without a token, as expected. They still require authenticated E2E verification with a real scoped customer account before they can be called production-ready.

## Endpoint Inventory

| API | Method | Feature | Frontend status | Backend status | Tested result | Current issue | Root cause | Frontend fix made | Backend fix required | Priority |
|---|---:|---|---|---|---|---|---|---|---|---|
| `/stores/` | GET | Store metadata/admin market list | Integrated read-only | Working | 200, array, detail 200 | Public response is large/slow | Backend returns all stores | Bounded smoke timeout | Pagination/filter hardening | Medium |
| `/customer-info/` | GET | Customer profile/admin customers | Partially integrated | Authentication required | 401 anonymous | Needs real customer token test | Auth-required endpoint | Profile does not fake editing | Confirm read/update contract | High |
| `/customer-addresses/` | GET | Saved addresses | Not integrated into checkout yet | Authentication required | 401 anonymous | Checkout uses safe defaults, not saved address | Auth-required endpoint | Reported as missing for prefill | Confirm list/default address contract | High |
| `/categories/` | GET | Catalog categories | Integrated | Working | 200 paginated, detail 200 | None found | N/A | Existing normalization retained | None | Low |
| `/collections/` | GET | Collections/admin | Admin read-only | Working | 200 paginated, detail 200 | Not surfaced strongly in storefront | UX scope | None | None | Low |
| `/brands/` | GET | Brands/filtering | Integrated | Working | 200 paginated, detail 200 | None found | N/A | Existing normalization retained | None | Low |
| `/variant-types/` | GET | Variant admin metadata | Admin read-only | Working | 200 array, detail 200 | Not used by customer UI | Scope | None | None | Low |
| `/products/` | GET | Product list | Integrated | Working with latency risk | 200 paginated, detail 200 | Product list can exceed 20s in browser | Heavy payload/API latency | Product list timeout raised to 60s | Backend pagination/performance | High |
| `/products/{id}/` | GET | Product detail | Integrated | Working | 200 in smoke | Slug lookup uses search fallback | Backend detail is ID-based | Existing fallback retained | Native slug detail would help | Medium |
| `/product-variants/` | GET | Variant inventory/admin | Admin read-only | Working | 200 paginated, detail 200 | Storefront cart depends on valid variant IDs | Product lines can lack selected variant | Checkout now falls back to priced variant only | Ensure every product has priced variants | High |
| `/product-notification-requests/` | GET | Notification requests/admin | Admin read-only | Working | 200 array, detail 200 | Customer create flow not integrated | Not in UI flow | None | Confirm POST contract if needed | Medium |
| `/wishlist/` | GET | Wishlist | Local-only storefront, admin auth-required | Authentication required | 401 anonymous | Storefront wishlist is local storage | Auth contract not implemented | Reported honestly | Confirm wishlist CRUD contract | Medium |
| `/cart/view/` | GET | Server cart | Smoke-tested only | Working | 200 object | Storefront cart is local Pinia | Backend cart session contract differs | Checkout posts cart dictionary directly | Server cart/session strategy | High |
| `/cart/update-item/` | POST | Server cart mutation | Contract tested | Working with backend edge bugs | OPTIONS allow POST | Backend 500 on unpriced variant | Backend assumes variant price | Frontend avoids unpriced variants | Return 400 for invalid/unpriced items | High |
| `/payment-methods/` | GET | Payment method metadata | Admin read-only | Working | 200 paginated, detail 200 | None found | N/A | None | None | Low |
| `/available-payment-methods/` | GET | Checkout payment options | Integrated | Working | 200 paginated, detail 200 | Only COD active | Store config | Checkout uses active COD method ID | None unless more payments needed | High |
| `/shippingcountries/` | GET | Checkout shipping defaults | Integrated | Working | 200 array, detail 200 | Checkout uses first country/zone | No customer address API integration yet | Checkout sends country and zone | Confirm default-zone contract | High |
| `/promocodes/` | GET | Promotions | Admin read-only | Working, empty | 200 paginated, 0 records | No discount apply UI/API | No active promos/apply contract | No fake discount input added | Confirm promo validation endpoint | Medium |
| `/freedeliveries/` | GET | Free delivery offers | Admin read-only | Working | 200 array, detail 200 | Not applied in cart totals | No pricing contract | None | Server-authoritative totals needed | Medium |
| `/checkout/` | POST | Checkout/order request | Integrated | POST-capable | OPTIONS allow POST | Live success not executed to avoid real order | Destructive production write | Checkout payload fixed | Idempotency/result contract needed | Critical |
| `/checkout/{id}/result/` | GET | Checkout result | Not integrated | Untested | Route exists in backend hints | Needs real checkout ID | Would require real order | Reported | Provide non-destructive test checkout | High |
| `/order-summaries/` | GET | Order history/admin orders | Admin read-only but failing | Backend error | Timeout after 30s | Prevents order history/admin orders | Backend query hangs/errors | Reported; no fake orders | Fix endpoint performance/error | Critical |
| `/contactmessage/` | POST | Contact/support form | Integrated | POST-capable | OPTIONS allow POST | GET is unsupported by design | POST-only endpoint | Smoke checker fixed | Add admin list endpoint if needed | Medium |
| `/policies/` | GET | Store policies/admin | Admin read-only | Working | 200 object, detail 200 | Not deeply surfaced | UX scope | None | None | Low |
| `/banners/` | GET | Home hero banners | Integrated | Working | 200 paginated, detail 200 | None found | N/A | None | None | Low |
| `/announcementbars/` | GET | Announcements/admin | Admin read-only | Working | 200 paginated, detail 200 | Not surfaced in storefront | UX scope | None | None | Low |
| `/submitproductrequest/` | POST | Product request | Contract only | POST-capable | OPTIONS allow POST | No customer UI integrated | Feature not built | Smoke checker fixed | Confirm payload fields | Medium |
| `/auth/login/` | POST | Login | Integrated/tested by unit mocks | Contract not live-smoked | Unit tests pass | Needs real staging account E2E | Destructive/private auth data | Payload centralized | Provide staging account | High |
| `/auth/register/` | POST | Register | Integrated/tested by unit mocks | Contract corrected | Unit tests pass | Live write unsafe | Would create account | Payload now sends `mobile` | Confirm backend register contract | High |
| `/auth/verify/` | POST | Verification | Integrated/tested by unit mocks | Not live-smoked | Unit tests pass | Needs real code | Private flow | None | Staging verification path | High |
| `/auth/regen/` | POST | Resend verification | Integrated/tested by unit mocks | Not live-smoked | Unit tests pass | Needs real email/phone | Private flow | None | Staging account | Medium |
| `/auth/forgot-password/` | POST | Password reset request | Integrated/tested by unit mocks | Not live-smoked | Unit tests pass | Production email side effect | Unsafe to spam | None | Staging mailbox | Medium |
| `/auth/reset-password/` | POST | Password reset | Integrated/tested by unit mocks | Not live-smoked | Unit tests pass | Requires real code | Private flow | None | Staging reset code | Medium |
| `/auth/change-password/` | POST | Settings security | Integrated/tested by unit mocks | Not live-smoked | Unit tests pass | Requires real auth | Private flow | UI disables duplicate submit | Staging customer | High |
| `/auth/refresh/` | POST | Session restore | Integrated/tested | Not live-smoked | Unit/E2E mocks pass | Needs real refresh token | Private flow | Restore logic covered | Staging auth flow | High |
| `/auth/logout/` | POST | Logout | Integrated/tested | Not live-smoked | Unit/E2E mocks pass | Needs real auth | Private flow | Clears cart/wishlist/notifications | Staging auth flow | Medium |

## Current Backend Blockers

- `GET /order-summaries/` times out and blocks real order history/admin order views.
- `/cart/update-item/` can return a Django debug 500 for invalid/unpriced product variants instead of a safe 400 response.
- Customer profile/address update contracts are not confirmed; frontend keeps profile editing disabled rather than faking persistence.
- Checkout result lookup exists in backend route hints but was not executed because creating a real order in production is unsafe.
