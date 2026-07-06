# Osimart Django Admin API Contract

This contract defines the staff-only endpoints the admin frontend is prepared to consume. Until these endpoints exist and are protected by server-side staff authorization, the frontend must stay in read-only demo mode and must not report successful writes.

## Base URL and Versioning

- Configure the frontend with `VITE_OSIMART_ADMIN_URL`, for example `https://api.osimart.com/admin/apis/v1`.
- All endpoints below are relative to that base URL.
- All responses use JSON unless the endpoint is a file download.
- File upload endpoints accept `multipart/form-data`.
- The API should preserve backwards-compatible fields for at least one minor frontend release.

## Authentication and Security

- Require a server-verified staff session for every endpoint.
- Preferred auth: Secure, HttpOnly, SameSite cookie session with Django CSRF protection.
- Alternative auth: short-lived memory-only staff access token plus refresh rotation. Do not expose long-lived admin tokens to JavaScript.
- Return `401` when unauthenticated and `403` when authenticated but missing permission.
- Require MFA for staff accounts before granting admin API access.
- Apply rate limits, audit logs, and re-authentication for destructive actions.
- Add CORS only for approved admin frontend origins and allow credentials when cookie auth is used.

## Shared List Contract

Every list endpoint must support:

- `page`: positive integer, default `1`.
- `page_size`: positive integer, default `25`, max `100`.
- `search`: full-text search for the module's primary fields.
- `ordering`: comma-separated sortable fields. Prefix with `-` for descending.
- `status`: module-specific status filter when applicable.
- `created_after`, `created_before`, `updated_after`, `updated_before`: ISO 8601 timestamps.

Paginated response:

```json
{
  "count": 125,
  "next": "https://api.osimart.com/admin/apis/v1/products/?page=2",
  "previous": null,
  "results": []
}
```

## Shared Error Contract

Validation errors must return `400` with field-level detail:

```json
{
  "type": "validation_error",
  "message": "Check the highlighted fields.",
  "errors": {
    "name": ["This field is required."],
    "price": ["Ensure this value is greater than or equal to 0."]
  }
}
```

Other common responses:

- `401`: `{ "detail": "Authentication credentials were not provided." }`
- `403`: `{ "detail": "You do not have permission to perform this action." }`
- `404`: `{ "detail": "Not found." }`
- `409`: `{ "detail": "This record was changed by another user.", "version": 12 }`
- `429`: `{ "detail": "Rate limit exceeded." }`
- `500`: `{ "detail": "Unexpected server error." }`

## Modules and Endpoints

### Home and Analytics

Endpoints:

- `GET /analytics/summary/`
- `GET /analytics/timeseries/`
- `GET /analytics/inventory-health/`

Filters:

- `date_from`, `date_to`, `market`, `currency`, `granularity=day|week|month`

Summary response:

```json
{
  "revenue": "12500.00",
  "orders": 84,
  "customers": 51,
  "conversion_rate": "2.45",
  "average_order_value": "148.81",
  "products": 240,
  "low_stock": 8,
  "out_of_stock": 3
}
```

### Products

Endpoints:

- `GET /products/`
- `POST /products/`
- `GET /products/{id}/`
- `PATCH /products/{id}/`
- `PUT /products/{id}/`
- `DELETE /products/{id}/`
- `POST /products/bulk/`

Filters/search/sorting:

- `search`: name, SKU, slug, brand, category
- `category`, `brand`, `status=published|draft|archived`, `stock=low|out|available`
- `ordering`: `name`, `price`, `remaining_stock`, `created_at`, `updated_at`

Create/update body:

```json
{
  "name": "Laptop Pro",
  "slugified_name": "laptop-pro",
  "sku": "LP-001",
  "description": "Full product description",
  "short_description": "Short summary",
  "brand_id": "uuid",
  "category_ids": ["uuid"],
  "price": "1299.00",
  "compare_at_price": "1499.00",
  "remaining_stock": 10,
  "status": "published",
  "is_featured": false,
  "variants": [
    {
      "id": "uuid",
      "sku": "LP-001-BLK",
      "name": "Black / 512GB",
      "price": "1299.00",
      "remaining_stock": 4,
      "attributes": { "Color": "Black", "Storage": "512GB" }
    }
  ],
  "media_ids": ["uuid"],
  "version": 7
}
```

Response body includes the same fields plus `id`, `created_at`, `updated_at`, `published_at`, `archived_at`, and nested display objects for brand, categories, media, and variants.

Bulk body:

```json
{
  "action": "archive",
  "ids": ["uuid-1", "uuid-2"]
}
```

### Customers

Endpoints:

- `GET /customers/`
- `POST /customers/`
- `GET /customers/{id}/`
- `PATCH /customers/{id}/`
- `DELETE /customers/{id}/`

Filters/search/sorting:

- `search`: name, email, phone
- `status=active|disabled`
- `ordering`: `created_at`, `last_order_at`, `total_spent`, `email`

Body:

```json
{
  "first_name": "Patricia",
  "last_name": "Customer",
  "email": "customer@example.com",
  "mobile_number": "+96100000000",
  "status": "active",
  "notes": "VIP customer",
  "version": 3
}
```

### Orders

Endpoints:

- `GET /orders/`
- `POST /orders/`
- `GET /orders/{id}/`
- `PATCH /orders/{id}/`
- `DELETE /orders/{id}/`
- `POST /orders/{id}/status/`

Filters/search/sorting:

- `search`: order number, customer name, email, phone
- `status`, `payment_status`, `shipping_country`, `market`
- `ordering`: `created_at`, `total`, `status`, `customer`

Update body:

```json
{
  "status": "processing",
  "payment_status": "cod_pending",
  "shipping_address": {
    "line1": "Street",
    "city": "Beirut",
    "country_code": "LB"
  },
  "staff_note": "Confirmed by phone",
  "version": 10
}
```

Response:

```json
{
  "id": "uuid",
  "order_number": "OS-10001",
  "customer": { "id": "uuid", "name": "Customer", "email": "customer@example.com" },
  "items": [],
  "subtotal": "100.00",
  "shipping_total": "5.00",
  "discount_total": "0.00",
  "total": "105.00",
  "currency": "USD",
  "status": "processing",
  "payment_status": "cod_pending",
  "created_at": "2026-07-06T08:00:00Z",
  "updated_at": "2026-07-06T08:15:00Z",
  "version": 10
}
```

### Order Statuses

Endpoints:

- `GET /order-statuses/`
- `POST /order-statuses/`
- `GET /order-statuses/{id}/`
- `PATCH /order-statuses/{id}/`
- `DELETE /order-statuses/{id}/`

Body:

```json
{
  "code": "processing",
  "label": "Processing",
  "customer_label": "We are preparing your order",
  "sort_order": 20,
  "is_active": true,
  "is_terminal": false,
  "allowed_next_statuses": ["shipped", "cancelled"],
  "version": 2
}
```

### Shipping Countries

Endpoints:

- `GET /shipping-countries/`
- `POST /shipping-countries/`
- `GET /shipping-countries/{id}/`
- `PATCH /shipping-countries/{id}/`
- `DELETE /shipping-countries/{id}/`

Body:

```json
{
  "country_code": "LB",
  "name": "Lebanon",
  "is_active": true,
  "currency": "USD",
  "base_shipping_price": "5.00",
  "free_shipping_threshold": "100.00",
  "delivery_min_days": 1,
  "delivery_max_days": 4,
  "version": 1
}
```

### Promotions

Endpoints:

- `GET /promotions/`
- `POST /promotions/`
- `GET /promotions/{id}/`
- `PATCH /promotions/{id}/`
- `DELETE /promotions/{id}/`

Filters:

- `status=active|scheduled|expired|disabled`
- `type=percentage|fixed_amount|free_shipping`

Body:

```json
{
  "name": "Summer Sale",
  "code": "SUMMER10",
  "type": "percentage",
  "value": "10.00",
  "starts_at": "2026-07-01T00:00:00Z",
  "ends_at": "2026-07-31T23:59:59Z",
  "usage_limit": 100,
  "minimum_order_total": "50.00",
  "is_active": true,
  "version": 1
}
```

### Media

Endpoints:

- `GET /media/`
- `POST /media/`
- `GET /media/{id}/`
- `PATCH /media/{id}/`
- `DELETE /media/{id}/`

Upload body: `multipart/form-data`

- `file`: required, PNG/JPG/WebP/PDF depending on use.
- `alt_text`: optional.
- `folder`: optional.

Response:

```json
{
  "id": "uuid",
  "url": "https://cdn.example.com/media/file.webp",
  "thumbnail_url": "https://cdn.example.com/media/file-thumb.webp",
  "filename": "file.webp",
  "content_type": "image/webp",
  "size": 123456,
  "alt_text": "Product front view",
  "created_at": "2026-07-06T08:00:00Z"
}
```

### Markets

Endpoints:

- `GET /markets/`
- `POST /markets/`
- `GET /markets/{id}/`
- `PATCH /markets/{id}/`
- `DELETE /markets/{id}/`

Body:

```json
{
  "code": "lb",
  "name": "Lebanon",
  "currency": "USD",
  "locale": "en-LB",
  "tax_included": false,
  "is_default": true,
  "is_active": true,
  "version": 1
}
```

### Online Store

Endpoints:

- `GET /online-store/`
- `GET /online-store/{id}/`
- `PATCH /online-store/{id}/`

Body:

```json
{
  "store_name": "TechHub",
  "support_email": "support@example.com",
  "phone": "+96100000000",
  "announcement_text": "Free delivery this week",
  "homepage_sections": ["hero", "featured", "brands"],
  "default_theme": "light",
  "seo": {
    "meta_title": "TechHub",
    "meta_description": "Premium electronics"
  },
  "social": {
    "facebook_url": "https://facebook.com/example",
    "instagram_url": "https://instagram.com/example"
  },
  "version": 4
}
```

### Inventory

Endpoints:

- `GET /inventory/`
- `PATCH /inventory/{id}/`
- `POST /inventory/bulk/`

Body:

```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "remaining_stock": 12,
  "low_stock_threshold": 5,
  "reason": "manual_adjustment",
  "version": 3
}
```

### Reviews

Endpoints:

- `GET /reviews/`
- `GET /reviews/{id}/`
- `PATCH /reviews/{id}/`
- `DELETE /reviews/{id}/`

Body:

```json
{
  "status": "approved",
  "moderation_note": "Verified purchase",
  "version": 2
}
```

## Frontend Enablement Checklist

1. Implement all endpoints above behind server-side staff permissions.
2. Configure `VITE_OSIMART_ADMIN_URL` only after staff auth, CSRF/CORS, and audit logging are verified.
3. Run `npm run test:api`, `npm test`, `npm run lint`, `npm run test:e2e`, and `npm run build`.
4. Enable write buttons only after successful end-to-end CRUD tests against staging.
5. Keep destructive actions disabled unless the backend supports re-authentication, audit logs, and concurrency checks.

## Current DRF GET Integration Status

The frontend now integrates the known `/store/apis/` GET resources through `src/services/adminResources.js` and
`src/services/adminApi.js`. The admin is read-only for these resources until write methods are explicitly confirmed.

Integrated list/detail resources:

- Stores, customers, customer addresses, categories, collections, brands, variant types
- Products, product variants, product notification requests, wishlist, cart view
- Payment methods, available payment methods, shipping countries
- Promo codes, free deliveries, checkout, order summaries
- Contact messages, policies, banners, announcement bars, submit product requests

Known backend gaps from live smoke testing must be fixed or formally documented before claiming full production admin
readiness:

- `GET /store/apis/checkout/` returned `405` in the current environment.
- `GET /store/apis/order-summaries/` returned `500` in the current environment.
- `GET /store/apis/contactmessage/` returned `405` in the current environment.
- `GET /store/apis/submitproductrequest/` returned `405` in the current environment.
