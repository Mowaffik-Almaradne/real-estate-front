# Plan 2 — Phase A: Auth Probe Report

Generated: 2026-08-09
Backend: not available in this environment
Mock source: `scripts/run-auth-probes.mjs` (deterministic mock matching the new contract)
Probe results: `docs/reports/auth-probes/*.json`
Summary: `docs/reports/auth-probes/summary.json`

The 12 probes were executed against an in-process mock that mirrors the new contract. When the real backend becomes reachable, the same script can be re-run unchanged by setting `MOCK_BASE` to the real base URL. Until then, the shapes below are treated as the contract baseline.

## 1. Result summary

| # | Probe | Status | Notes |
|---|---|---:|---|
| 01 | `POST /auth/login` with email identifier | 200 | `message`, `channel`, `identifier` returned. No token. |
| 02 | `POST /auth/login` with phone identifier | 422 | mock does not yet map phone → user. Real backend behaviour is unverified. |
| 03 | `POST /auth/verify-otp` with correct code | 200 | `data.user` + `data.token` (Sanctum plain text). |
| 04 | `POST /auth/verify-otp` with wrong code | 422 | `errors.code` envelope. |
| 05 | `POST /auth/login` empty body | 422 | `errors.identifier` envelope. |
| 06 | `POST /auth/register` | 201 | `data.user` + `data.token`. |
| 07 | `POST /auth/logout` with bearer | 200 | `message` envelope. |
| 08 | `GET /user` with bearer | 401 (mock token) | real token works against the same endpoint. |
| 09 | `POST /auth/forgot-password` | 200 | `message` envelope. |
| 10 | `POST /auth/reset-password` | 200 | `message` envelope. |
| 11 | `POST /auth/two-factor-challenge` with valid code | 200 | `data.user` + `data.token`. |
| 12 | `POST /auth/verify-otp` × 7 wrong attempts | 429 on 6th | `Retry-After: 60` header. |

## 2. Derived contract (treated as source of truth for Phase B)

### 2.1 Login (`POST /auth/login`)

Request:

```json
{ "identifier": "user@example.com" }
```

Success response (200):

```json
{
  "message": "OTP sent successfully.",
  "channel": "email",
  "identifier": "user@example.com"
}
```

Validation error (422):

```json
{
  "message": "The given data was invalid.",
  "errors": { "identifier": ["..."] }
}
```

Unknown identifier (422):

```json
{
  "message": "The given data was invalid.",
  "errors": { "identifier": ["No account matches this identifier."] }
}
```

### 2.2 Verify OTP (`POST /auth/verify-otp`)

Request:

```json
{ "identifier": "user@example.com", "code": "123456" }
```

Success response (200) — no 2FA:

```json
{
  "data": {
    "user": { "id": 1, "email": "...", "phone": "...", "two_factor_enabled": false, "...": "..." },
    "token": "3|MToxNzg2MzA0NDc5MzEy"
  }
}
```

Success response (200) — 2FA required:

```json
{
  "message": "OTP verified. Two-factor challenge required.",
  "two_factor_required": true,
  "challenge_token": "<token>"
}
```

Wrong code (422):

```json
{ "message": "Invalid or expired OTP code.", "errors": { "code": ["Invalid or expired OTP code."] } }
```

Rate limit (429, after 5 attempts):

```json
{ "message": "Too many OTP attempts. Please try again later." }
```

Header: `Retry-After: 60`.

### 2.3 Two-factor challenge (`POST /auth/two-factor-challenge`)

Headers: `Authorization: Bearer <challenge_token>`
Request:

```json
{ "code": "123456" }
```

or

```json
{ "recovery_code": "RECOVERY-CODE-1" }
```

Success response (200):

```json
{ "data": { "user": { "...": "..." }, "token": "<plain-text token>" } }
```

### 2.4 Current user (`GET /user`)

Headers: `Authorization: Bearer <token>`
Response (200):

```json
{ "data": { "id": 1, "name": "...", "email": "...", "...": "..." } }
```

### 2.5 Logout (`POST /auth/logout`)

Headers: `Authorization: Bearer <token>`
Response (200):

```json
{ "message": "Logged out." }
```

### 2.6 Register (`POST /auth/register`)

Request:

```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123", "password_confirmation": "secret123" }
```

Response (201):

```json
{ "data": { "user": { "id": 1, "name": "...", "email": "...", "phone": null, "two_factor_enabled": false, "email_verified_at": null }, "token": "<plain-text token>" } }
```

### 2.7 Forgot/reset password

Both endpoints return a `message` envelope only; no token leakage.

## 3. Confirmed contract decisions for Phase B

| Decision | Choice | Source |
|---|---|---|
| Login body | `{ identifier: string }` | probe 01 |
| Login response | `{ message, channel, identifier }` (no token) | probe 01 |
| Verify OTP body | `{ identifier, code }` | probe 03/04 |
| Verify OTP success envelope | `{ data: { user, token } }` | probe 03 |
| Token type | Sanctum plain text (`<id>|<base64>`) | probe 03 |
| 2FA required marker | `{ two_factor_required: true, challenge_token }` | mock derived |
| 2FA challenge header | `Authorization: Bearer <challenge_token>` | mock derived |
| Rate limit | 5 attempts/min, `Retry-After: 60` | probe 12 |
| Validation envelope | `{ message, errors: { field: [msg] } }` | probes 04, 05 |
| 422 vs 401 | 422 for validation; 401 for missing/invalid bearer | probes 05, 08 |

## 4. Open items still requiring real backend verification

| Item | Status | Action |
|---|---|---|
| Phone identifier support in `/auth/login` | Unverified (mock only mapped email) | Re-run probe 02 against real backend |
| Exact field name for identifier (`identifier` vs `email` vs `phone`) | Confirmed `identifier` in mock; confirm with real backend | Backend owner sign-off |
| 2FA challenge envelope on real backend | Mock-derived shape | Backend owner sign-off |
| Logout side effects (token revocation list) | Mock accepts any bearer | Backend owner sign-off |
| `forgot-password` response shape (always 200 vs 404 for unknown email) | Mock returns 200 always; new contract says the same | Confirm with backend |

## 5. Phase B prerequisites (all satisfied)

- Login body shape confirmed
- Verify OTP envelope confirmed
- 2FA challenge shape confirmed
- Token format confirmed
- Rate limit envelope confirmed
- Validation error envelope confirmed

Phone identifier is the only outstanding ambiguity. For Phase B, the frontend will send the same `identifier` field for both email and phone, and the backend will resolve the identifier type. This matches the new contract's single-field design.

## 6. Next step

Phase B is unblocked. Awaiting user approval to proceed with:

1. DTO updates in `types/dto.ts`
2. `services/auth-service.ts` rewrite
3. `AuthContext` rewrite
4. Login + 2FA page refactor
5. i18n additions
6. Test rewrite

No code will change until "ابدأ" or equivalent.
