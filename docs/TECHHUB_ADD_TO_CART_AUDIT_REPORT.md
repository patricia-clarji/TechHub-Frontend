# TechHub Add to Cart Audit Report

Date: 2026-07-17

## Verdict

Add to Cart was not previously integrated with the Osimart cart backend. The UI only updated local Pinia/localStorage state, so Osimart did not receive `/cart/update-item/` calls and `GET /cart/view/` did not reflect the frontend cart.

This pass wires Add to Cart to the real Osimart cart API and keeps local Pinia synchronized from the backend response.

## Flow

```text
User clicks Add to Cart
  -> ProductCard / ProductDetail / QuickView / ProductShowcase
  -> useCartStore().addToCart(...)
  -> cartAPI.updateItem(...)
  -> POST /store/apis/cart/update-item/?store=<store_id>
  -> Osimart returns cart object
  -> Pinia cart state is rebuilt from backend response
  -> Navbar / cart drawer / cart page update from Pinia state
```

## Endpoint verified

Base URL:

```text
https://api.osimart.com/store/apis
```

Cart update:

```text
POST /cart/update-item/?store=b84d1118-898c-40df-8d14-eda52cbe0740
```

Cart view:

```text
GET /cart/view/?store=b84d1118-898c-40df-8d14-eda52cbe0740
```

OPTIONS confirmed the cart update request schema:

```json
{
  "item_id": "string, required",
  "action": "choice, required: add | edit | remove | remove_all",
  "quantity": "integer, optional"
}
```

## Exact working Add to Cart payload

```json
{
  "item_id": "e3e8e270-92e6-4ea4-baf6-7b95b4955998",
  "action": "add",
  "quantity": 1
}
```

`item_id` is the real Osimart product variant UUID. Product IDs, local IDs, and array indexes are not valid for this endpoint.

## Exact successful response observed

Using live product `AeroBlade 14` and variant `e3e8e270-92e6-4ea4-baf6-7b95b4955998`, Osimart returned:

```json
{
  "cart": {
    "e3e8e270-92e6-4ea4-baf6-7b95b4955998": {
      "id": "e3e8e270-92e6-4ea4-baf6-7b95b4955998",
      "name": "AeroBlade 14",
      "quantity": 1,
      "quantity_step": 1.0,
      "quantity_unit": "Piece",
      "price": "1000.00",
      "image": "static/images/uploaded_files/mystore2/mystore2_aeroblade-14-techhub-2_1.jpg",
      "values": ["14.5''", "16 GB", "512 GB", "White"],
      "total_price": 1000.0,
      "remaining_stock": 2,
      "sale": null
    }
  },
  "total_price": 1000.0
}
```

Adding the same item twice returned quantity `2` and total `2000.0`.

## Guest cart behavior

Guest carts are supported by Osimart, but they require the backend `cart` cookie.

Observed:

```text
POST /cart/update-item/ with a shared WebRequestSession -> 200 and cart cookie set
GET /cart/view/ with the same session -> cart contains the item
GET /cart/view/ with a new session -> {"cart": {}, "total_price": 0}
```

Frontend fix:
- `apiClient` now uses `withCredentials: true` so the browser sends/receives the Osimart cart cookie.

## Frontend bugs fixed

### Local-only cart

Before:
- `useCartStore().addToCart()` only changed local Pinia/localStorage.
- `cartService.js` had `CART_BACKEND_AVAILABLE = false`.
- `/cart/update-item/` was not called from Add to Cart.

After:
- `addToCart()` calls `cartAPI.updateItem()`.
- The backend response is normalized and applied to Pinia.
- Local success is not shown if Osimart rejects the update.

### Missing action field

Backend requires `action`. Payloads without it fail:

```json
{"action": ["This field is required."]}
```

Frontend now sends:

```json
{"item_id": "<variant UUID>", "action": "add", "quantity": 1}
```

### Variant ID selection

Product-card Add to Cart previously had no explicit variant selection. The cart store now selects a real in-stock/priced Osimart variant from `product.variants` before posting.

If no real variant UUID is available, the frontend returns an error and does not fake a local add.

### Quantity updates

Backend action `edit` currently returns HTTP 500. The frontend avoids it.

Current frontend strategy:
- Increase quantity: `action: "add"` with the delta.
- Decrease quantity: `action: "remove"` with the delta.
- Remove line: `action: "remove_all"`.

## Backend issues found

### `edit` action returns 500

Payload:

```json
{
  "item_id": "e3e8e270-92e6-4ea4-baf6-7b95b4955998",
  "action": "edit",
  "quantity": 1
}
```

Observed:

```text
HTTP 500
UnboundLocalError: local variable 'sale' referenced before assignment
/home/osimart/osistore/store/serializers.py, line 605, in update_item
```

Required backend fix:
- Make `edit` safely update the quantity, or remove it from OPTIONS if unsupported.
- Return structured 400 responses for invalid cart states.
- Disable Django DEBUG pages in production.

### Invalid variant handling

Payload:

```json
{
  "item_id": "00000000-0000-4000-8000-000000000000",
  "action": "add",
  "quantity": 1
}
```

Observed:

```json
{
  "detail": "No ProductVariant matches the given query."
}
```

Status: 404. This is acceptable as a backend validation response, but the frontend now prevents sending missing/local variant IDs whenever possible.

## Authenticated cart status

The frontend now attaches the bearer token through the central API client and also sends credentials for cookie/session cart support.

Authenticated cart creation could not be fully live-verified without a real test customer credential/token for a safe staging account. The integration path is ready for authenticated users because `apiClient` attaches `Authorization: Bearer <token>` unless `skipAuth` is set, and Add to Cart does not set `skipAuth`.

Acceptance test still needed:
- Sign in with a safe staging customer.
- Click Add to Cart.
- Confirm `POST /cart/update-item/` includes `Authorization`.
- Confirm `GET /cart/view/` returns the authenticated customer cart.

## Files modified

- `src/services/apiClient.js`
- `src/services/cartService.js`
- `src/stores/shop/cart.js`
- `src/pages/Products/ProductDetail.vue`
- `src/components/cards/ProductCard.vue`
- `src/components/cards/ProductShowcase.vue`
- `src/components/modals/QuickViewModal.vue`
- `__test__/unit/cartIntegration.test.js`
- `__test__/e2e/auth-session.spec.js`
- `docs/TECHHUB_ADD_TO_CART_AUDIT_REPORT.md`

## Tests added

Added `__test__/unit/cartIntegration.test.js` covering:
- exact Osimart add-to-cart payload
- add first product
- add same product twice
- decrease quantity using `remove`
- remove line using `remove_all`
- reject missing backend variant ID
- reject backend error without local fake success

## Validation

Passed:

```text
npm run lint
npm test
npm run build
npm run test:e2e
```

API smoke:

```text
npm run verify:api
```

Result: still fails only on the known `/order-summaries/` timeout. `cart-view` and `cart-update-item` are confirmed in the smoke check.

## Checkout dependency

Checkout can now rely on cart items having real Osimart variant IDs when they were added through the updated Add to Cart flow.

Important distinction:
- Osimart `/cart/view/` depends on the same authenticated/cookie session.
- Checkout implementation still sends its own `cart` payload dictionary keyed by variant UUID, so it does not depend exclusively on `cart/view`.

## Final answer

Add to Cart is now backend-integrated. It calls Osimart, sends the correct payload, receives a real cart response, and synchronizes Pinia from that response. Guest carts work when the Osimart cart cookie is preserved, which the frontend now supports with credentials enabled.
