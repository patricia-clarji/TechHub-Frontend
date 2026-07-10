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

For login, the frontend trims/lowercases email but preserves the password exactly as typed.

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

The exact current full customer payload with a non-existent user returned:

```json
{
  "status": 400,
  "body": {
    "non_field_errors": ["Invalid user."]
  }
}
```

Newly registered but unverified users return:

```json
{
  "status": 400,
  "body": {
    "non_field_errors": ["User account is not verified."]
  }
}
```

Omitting `store_id` returned:

```json
{
  "status": 400,
  "body": {
    "store_id": ["Invalid store ID."]
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

Both values are accepted far enough to return the same credential error, but `customer` is the confirmed spelling for register and login. The frontend sends one clean `customer` login request by default and does not retry alternate `login_as` values on credential or verification errors.

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

# Osimart Register API

Tested against `https://api.osimart.com` on 2026-07-08.

## Endpoint Discovery

Confirmed endpoint:

- `POST /auth/register/`

Checked likely alternatives:

- `/auth/signup/`: connection closed during `OPTIONS`; not confirmed as a usable DRF route.
- `/auth/customer/register/`: `404`.
- `/auth/customer/signup/`: connection closed during `OPTIONS`; not confirmed as a usable DRF route.
- `/auth/users/`: `404`.

The Django DEBUG 404 page for unsupported routes listed `^register/$ [name='auth-register']` under the `auth/` URLconf.

## Request

The frontend sends:

```json
{
  "register_as": "customer",
  "store_id": "<VITE_OSIMART_STORE_ID>",
  "first_name": "<first name>",
  "last_name": "<last name>",
  "email": "<email>",
  "password": "<password>",
  "mobile_number": "+96170123456"
}
```

Observed validation behavior:

- `register_as` is required.
- `register_as: "customer"` is valid.
- `register_as: "custmer"` is rejected with `"custmer" is not a valid choice.`
- `store_id` is required for customer registration; when omitted, the backend returned `email: ["Store is required."]`.
- `confirm_password` is not required by observed validation.
- `device_name` and `device_id` are not required by observed validation.
- Passwords must pass Django password validation, including at least 8 characters and not common/all-numeric.
- Lebanon mobile numbers are normalized before submit. The UI may accept local input such as `70 123 456`, but the request body must send compact E.164-style text like `+96170123456`.
- Placeholder or formatted display text such as `XX XXX XXX` is blocked before the API request.

## Observed Error Responses

Missing `register_as` with invalid email/password:

```json
{
  "status": 400,
  "body": {
    "email": ["Enter a valid email address."],
    "password": [
      "This password is too short. It must contain at least 8 characters.",
      "This password is too common.",
      "This password is entirely numeric."
    ],
    "register_as": ["This field is required."]
  }
}
```

Missing `store_id`:

```json
{
  "status": 400,
  "body": {
    "email": ["Store is required."],
    "password": [
      "This password is too short. It must contain at least 8 characters.",
      "This password is too common.",
      "This password is entirely numeric."
    ]
  }
}
```

Invalid `register_as` typo:

```json
{
  "status": 400,
  "body": {
    "password": [
      "This password is too short. It must contain at least 8 characters.",
      "This password is too common.",
      "This password is entirely numeric."
    ],
    "register_as": ["\"custmer\" is not a valid choice."]
  }
}
```

## Successful Register Shape

A successful response was not captured because creating a live disposable account would mutate production data. The frontend does not fake registration success; it only reports account creation after a real successful `POST /auth/register/` response.

If the response includes a supported token field, the user is signed in immediately. If the response is successful but has no token, the frontend treats the account as pending verification and does not auto-login. It switches to the verification-code step with the email still present, shows: `Account created. Please enter the verification code to activate your account.`, and calls `/auth/regen/` once to ensure a verification code is sent.

The frontend blocks login/register/verify/resend/password reset before making a request when `VITE_OSIMART_STORE_ID` is missing and shows a configuration error. The exact successful register response shape still needs confirmation in a staging or sandbox environment where test account creation is allowed.

## Verification APIs

Checked on 2026-07-08:

- `OPTIONS /auth/verify/`: exists.
- `OPTIONS /auth/regen/`: exists and behaves like resend verification code.
- `/auth/activate/`: `404`.
- `/auth/resend-verification/`: `404`.
- `/auth/verify-email/`: `404`.
- `/auth/otp/verify/`: `404`.
- `/auth/email/verify/`: `404`.

`POST /auth/verify/` requires:

```json
{
  "email": "<email>",
  "verify_as": "customer",
  "code": "<verification code>",
  "store_id": "<VITE_OSIMART_STORE_ID>"
}
```

Observed validation:

```json
{
  "status": 400,
  "body": {
    "email": ["This field is required."],
    "verify_as": ["This field is required."],
    "code": ["This field is required."]
  }
}
```

`POST /auth/regen/` requires:

```json
{
  "email": "<email>",
  "verify_as": "customer",
  "store_id": "<VITE_OSIMART_STORE_ID>"
}
```

Observed validation with a non-existent email and valid store:

```json
{
  "status": 400,
  "body": {
    "email": ["Email does not exist."]
  }
}
```


