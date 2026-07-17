# TechHub Profile and Settings API Report

Generated: 2026-07-17

## Summary

Profile and settings are intentionally conservative. The frontend displays authenticated session data from the Osimart auth response/session snapshot, allows real password change through `/auth/change-password/`, and disables unsupported profile, billing, and notification persistence instead of showing fake success.

## Profile and Account

| Feature | Current implementation | API used | Persistence status | Issue | Fix made | Backend work required |
|---|---|---|---|---|---|---|
| Account identity display | Reads `userStore.currentUser` | Auth login/register/refresh response | Persisted in session snapshot only | Does not refetch `/customer-info/` on account page | No fake edit action | Confirm `/customer-info/` authenticated response and expose profile refresh |
| Profile edit | Disabled read-only fields | None | Not persisted | No confirmed profile update API | UI clearly says update API required | Provide profile update endpoint and validation schema |
| Email update | Disabled | None | Not persisted | Email update/verification flow unknown | No fake save button | Provide email-change contract |
| Mobile update | Disabled | None | Not persisted | Mobile update/verification flow unknown | Register payload corrected to `mobile` | Provide mobile-change contract |
| Avatar upload/removal | Disabled display only | None | Not persisted | No upload contract confirmed | No unsafe file upload added | Provide secure media upload/removal contract |
| Address list/default address | Not shown in profile | `/customer-addresses/` returns 401 anonymously | Unknown authenticated persistence | Needs scoped customer token test | Checkout does not fake saved address use | Confirm address list/create/update/delete/default schema |
| Order history | Disabled copy in account | `/order-summaries/` | Backend failing | Endpoint times out | No fabricated orders | Fix order summaries endpoint |

## Settings

| Feature | Classification | Current implementation | API used | Persistence status | Issue | Fix made | Backend work required |
|---|---|---|---|---|---|---|---|
| Password change | Backend account setting | Active form with validation and duplicate-submit prevention | `/auth/change-password/` | Real backend call after auth | Needs real customer E2E | Existing implementation retained and tested | Provide staging customer for E2E |
| Profile tab | Backend account setting | Read-only fields | None | Not persisted | Profile update API missing/unconfirmed | Disabled action with honest copy | Profile update API |
| Billing/payment settings | Unsupported/fake-risk feature | Disabled notice | None | Not persisted | Card collection would be unsafe without PCI provider | Card collection remains disabled | PCI-compliant provider/tokenization |
| Notification preferences | Unsupported/fake-risk feature | Disabled notice | None | Not persisted | No preferences API | No fake preference toggles | Customer preferences API |
| Theme/display setting | Local UI preference | Header/admin theme toggle only | Local DOM class | Local only | Not account-scoped | No false backend claim | Optional account preference API |
| Account deletion | Unsupported | Not exposed | None | Not persisted | Destructive endpoint not confirmed | Not added | Account deletion contract |
| Data export | Unsupported | Not exposed | None | Not persisted | Export endpoint not confirmed | Not added | Data export contract |

## Checkout Prefill

| Requirement | Current status |
|---|---|
| Guest fields remain empty | Implemented and unit tested |
| Signed-in profile prefill | Implemented from authenticated `currentUser` snapshot and unit tested |
| Saved address prefill | Not implemented; `/customer-addresses/` requires authenticated contract verification |
| User edits not overwritten | Implemented and unit tested |
| Logout/user switch clears private fields | Implemented in checkout watcher |
| Phone parsing | Existing auth flow normalizes Lebanese mobile numbers; checkout preserves the stored value for submission |

## Remaining Work

1. Provide a staging authenticated customer so `/customer-info/` and `/customer-addresses/` can be safely verified.
2. Add customer profile refresh/update service only after the backend contract is confirmed.
3. Add saved address selection only after ownership/default-address response shape is verified.
4. Keep billing/payment method management disabled until a PCI-compliant provider integration exists.
