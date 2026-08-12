# Plan 2: OTP Authentication Migration — Execution Plan

> Goal: align the frontend auth flow with the new contract. No code changes until assumptions are approved.

## Phase A — Capture the real backend auth shape (before any code change)

### A.1 Probes (run against the dev backend)

These are the only safe actions in this phase. None of them modify frontend code.

| # | cURL | Purpose |
|---|---|---|
| 1 | `POST /auth/login` with `{email}` | Confirm: status code, response body, OTP delivery channel field, error envelope for unknown email |
| 2 | `POST /auth/login` with `{phone}` | Confirm phone field name (`phone`/`phone_number`/`mobile`) |
| 3 | `POST /auth/verify-otp` with valid `{identifier, code}` | Capture: response body, token field name, user shape, token storage format |
| 4 | `POST /auth/verify-otp` with wrong code | Capture: 4xx envelope, validation error shape |
| 5 | `POST /auth/login` with no body | Capture 422 envelope |
| 6 | `POST /auth/register` | Confirm current path is still `/auth/register` and response shape |
| 7 | `POST /auth/logout` (with token) | Confirm prefix and response |
| 8 | `GET /user` (with token) | Confirm `me` endpoint exists and shape |
| 9 | `POST /auth/forgot-password` | Confirm shape |
| 10 | `POST /auth/reset-password` | Confirm shape (token + email + password) |
| 11 | `POST /auth/two-factor-challenge` (2FA user) | Confirm shape |
| 12 | Rate-limit: 6 rapid `POST /auth/login` | Confirm 429 + Retry-After header |

Each probe is captured as a raw JSON file under `docs/reports/auth-probes/` for review.

### A.2 Derived decisions (need user sign-off before code)

| Decision | Current frontend | Proposed | Source |
|---|---|---|---|
| Login request body | `{email, password}` | `{identifier}` (email or phone) | new contract |
| Login response | `{user, token}` | `{message: "OTP sent"}` (no token yet) | new contract |
| Token response location | login | `verify-otp` (and `two-factor-challenge`) | new contract |
| Token type | (assumed plain text) | Sanctum plain text `1|hash...` | `auth-flow.md` |
| OTP request body | n/a | `{identifier, code}` | new contract |
| Identifier field | n/a | single field accepts email OR phone | TBD via probe |
| 2FA challenge body | `{code, recovery_code}` (current) | `{code}` or `{recovery_code}` (TBD) | new contract |
| `me` endpoint | n/a | `GET /user` (TBD prefix) | new contract |
| Logout body | empty | empty (TBD) | unchanged |

If any probe contradicts the table, the table is updated and the user is asked to re-confirm.

## Phase B — Service & DTO updates (only after A is approved)

### B.1 New DTOs (`types/dto.ts`)

```ts
export interface OtpLoginRequest {
  identifier: string // email or phone
}
export interface OtpLoginResponse {
  message: string
  channel?: "email" | "sms" | "push"
  // token is NOT returned here
}
export interface OtpVerifyRequest {
  identifier: string
  code: string
}
export interface OtpVerifyResponse {
  user: UserDto
  token: string
}
export interface TwoFactorChallengeRequest {
  code?: string
  recovery_code?: string
}
export interface CurrentUserResponse {
  data: UserDto
}
```

### B.2 `services/auth-service.ts` refactor

Replace the current credential-based `login` with:

- `sendOtp(identifier)` → `POST /auth/login`
- `verifyOtp(identifier, code)` → `POST /auth/verify-otp`
- `verifyTwoFactorChallenge({code?, recovery_code?})` → `POST /auth/two-factor-challenge`
- `me()` → `GET /user`
- `logout()` → `POST /auth/logout` (prefix TBD)
- Keep `register`, `forgotPassword`, `resetPassword`, `confirmPassword`, `updatePassword`, 2FA management (path renames TBD)
- Drop `completeTwoFactor(code?, recoveryCode?)` — replaced by `verifyTwoFactorChallenge`

### B.3 `AuthContext` updates

- Add `sendOtp(identifier)` and `verifyOtp(identifier, code)` to the public API
- The login page becomes a two-step flow (Step 1: identifier → Step 2: OTP code)
- 2FA challenge page calls `verifyTwoFactorChallenge` (renamed from `completeTwoFactor`)
- After successful `verifyOtp` or `verifyTwoFactorChallenge`, persist token + user via existing `setAuthSession`

### B.4 i18n additions

- `auth.identifier` — "Email or phone"
- `auth.identifierPlaceholder` — "you@example.com or +212..."
- `auth.sendOtp` — "Send code"
- `auth.otpSent` — "We sent a 6-digit code to your email or phone"
- `auth.verifyOtp` — "Verify code"
- `auth.otpCodePlaceholder` — "123456"
- `auth.invalidOtp` — "Invalid or expired code"
- `auth.tooManyAttempts` — "Too many attempts. Please try again later."

### B.5 Routes & pages touched

| File | Change |
|---|---|
| `app/[locale]/(auth)/login/page.tsx` | Two-step flow: identifier → OTP |
| `app/[locale]/(auth)/login/two-factor/page.tsx` | Use `verifyTwoFactorChallenge` |
| `app/[locale]/(auth)/register/page.tsx` | No flow change (path TBD) |
| `app/[locale]/(auth)/forgot-password/page.tsx` | No flow change |
| `app/[locale]/(auth)/reset-password/page.tsx` | No flow change |
| `app/[locale]/(auth)/verify-email/page.tsx` | No flow change |

## Phase C — Test updates (only after B is approved)

- `services/auth-service.test.ts` is rewritten to assert the new contract paths and bodies
- `src/context/AuthContext.test.tsx` updated to drive the new two-step login
- Existing 27 auth-service contract tests are replaced with new equivalents
- E2E: a new Playwright spec for the OTP flow (uses mocked network, not a real OTP inbox)

## Phase D — Verification gates (before Phase E / Plan 3)

- `npm run typecheck`
- `npm run lint`
- `npm test` (≥ 143 unit + ≥ 27 updated auth tests)
- `npm run test:i18n`
- `npm run build`
- `npm run e2e`

## Phase E — Smoke check against the real backend

- Run the dev backend
- Manually exercise: register → login (OTP) → verify → 2FA off path → logout
- Verify token storage, refresh on reload, `GET /user` returns the same user
- Capture failures as a follow-up report

## Deliverables

| Deliverable | Path | When |
|---|---|---|
| Probe results | `docs/reports/auth-probes/*.json` | After Phase A |
| Updated DTOs | `types/dto.ts` | Phase B |
| Updated `auth-service` | `services/auth-service.ts` | Phase B |
| Updated `AuthContext` | `src/context/AuthContext.tsx` | Phase B |
| Updated login page | `app/[locale]/(auth)/login/page.tsx` | Phase B |
| Updated 2FA page | `app/[locale]/(auth)/login/two-factor/page.tsx` | Phase B |
| Updated tests | `services/auth-service.test.ts` + `AuthContext.test.tsx` | Phase C |
| Updated i18n | `messages/{en,ar}.json` | Phase B |
| Verification report | `docs/reports/plan-2-verification.md` | Phase D |
| Smoke report | `docs/reports/plan-2-smoke.md` | Phase E |

## Out of scope (deferred)

- Plan 3 (other modules' contract revalidation)
- Plan 4 (new modules)
- Plan 5 (production hardening)

## Open decisions waiting on backend answers

(From Plan 1's audit)

1. **Auth prefix**: `/auth/...` or `/api/auth/...`?
2. **Token response location** in `/auth/verify-otp`
3. **Identifier field** in `/auth/login` body (one field or `channel`?)
4. **OTP error envelope** (status, body shape)
5. **Rate-limit headers** in 429 responses
6. **FCM prefix** (`/fcm` or `/api/fcm`)
7. **Pagination envelope** (current `from/to/...` vs Laravel default)

These are blockers for Phase B. The frontend cannot be migrated to OTP without at least answers 1, 2, and 3.
