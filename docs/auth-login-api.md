# Osimart Login API

Tested against `POST https://api.osimart.com/auth/login/` on 2026-07-08.

## Request

The frontend sends:

```json
{
  "login_as": "customer",
  "email": "<email>",
  "password": "<password>",
  "device_name": "<device_name>",
  "device_id": "<device_id>",
  "store_id": "<VITE_OSIMART_STORE_ID>"
}
```

`store_id` is included because the live backend returned `400 {"store_id":["Invalid store ID."]}` when it was omitted, even though the shorter endpoint brief only listed the first five fields.

## Observed Error Responses

`OPTIONS /auth/login/` returned:

```json
{
  "name": "Login",
  "description": "",
  "renders": ["application/json", "text/html"],
  "parses": ["application/json", "application/x-www-form-urlencoded", "multipart/form-data"],
  "actions": {
    "POST": {
      "id": { "type": "string", "required": false, "read_only": true, "label": "Id" },
      "email": { "type": "email", "required": false, "read_only": false, "label": "Email address", "max_length": 254 },
      "first_name": { "type": "string", "required": false, "read_only": false, "label": "First name", "max_length": 150 },
      "last_name": { "type": "string", "required": false, "read_only": false, "label": "Last name", "max_length": 150 },
      "profile_pic_path": { "type": "field", "required": false, "read_only": true, "label": "Profile pic path" },
      "mobile_number": { "type": "string", "required": false, "read_only": false, "label": "Mobile number", "max_length": 20 }
    }
  }
}
```

Invalid credentials with `login_as: "customer"` and a valid store id:

```json
{
  "status": 400,
  "body": {
    "non_field_errors": ["Invalid user."]
  }
}
```

Invalid credentials with `login_as: "custmer"` and a valid store id:

```json
{
  "status": 400,
  "body": {
    "non_field_errors": ["Invalid user."]
  }
}
```

Both values are accepted far enough to return the same credential error. No successful login credentials were available, so the frontend tries `customer` first and retries once with `custmer` only after a backend 400/401/403 rejection.

Missing `store_id`:

```json
{
  "status": 400,
  "body": {
    "store_id": ["Invalid store ID."]
  }
}
```

## Successful Login Shape

A successful response could not be captured without valid real credentials. The frontend does not fake success; it only authenticates after the backend returns a token. It accepts common token shapes already used by Django/DRF auth APIs:

```json
{
  "access": "<token>",
  "user": {
    "id": "<id>",
    "email": "<email>",
    "first_name": "<first_name>",
    "last_name": "<last_name>"
  }
}
```

It also supports `access_token`, `token`, `key`, `tokens.access`, `data.access`, and `data.token`. Tokens are kept in memory through `authSession`; they are not written to `localStorage` or `sessionStorage`.
