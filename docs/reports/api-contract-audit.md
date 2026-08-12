# Plan 1: API Contract Rebaseline — Audit Report

Generated: 2026-08-09
Scope: Reconcile the frontend against the new backend documentation under `docs/backend/new-api-documentation/`.
The old documentation under `docs/backend/api-documentation/` is retained for historical comparison only.

## 1. Inventory

### 1.1 Frontend API surface (current implementation)

Scanned 120 TypeScript files, captured 22 unique `apiClient.{method}(...)` call sites.

| Method | Normalized path | Call sites |
|---|---|---|
| DELETE | `/auth/user/two-factor-authentication` | services/auth-service.ts:134 |
| DELETE | `/chat/rooms/${roomId}/messages/${messageId}` | services/chat-service.ts:56 |
| DELETE | `/dashboard/properties/${id}` | src/modules/properties/services/propertyService.ts:147 |
| DELETE | `/dashboard/viewings/${id}` | src/modules/viewings/services/viewingService.ts:147 |
| DELETE | `/fcm/revoke` | src/services/fcm-service.ts:42 |
| DELETE | `/location/cities/${id}` | src/modules/cities/services/cityService.ts:44 |
| DELETE | `/notifications/${id}` | services/notification-service.ts:41 |
| GET | `/auth/email/verify/${id}/${hash}?${query}` | services/auth-service.ts:79 |
| GET | `url` (dynamic) | hooks/useProperties.ts:9 |
| PATCH | `/notifications/${id}/read` | services/notification-service.ts:33 |
| PATCH | `/notifications/read-all` | services/notification-service.ts:37 |
| POST | `/auth/email/verification-notification` | services/auth-service.ts:75 |
| POST | `/auth/forgot-password` | services/auth-service.ts:57 |
| POST | `/auth/logout` | services/auth-service.ts:37 |
| POST | `/auth/reset-password` | services/auth-service.ts:66 |
| POST | `/auth/user/confirm-password` | services/auth-service.ts:122 |
| POST | `/auth/user/confirmed-two-factor-authentication` | services/auth-service.ts:130 |
| POST | `/auth/user/two-factor-authentication` | services/auth-service.ts:126 |
| POST | `/auth/user/two-factor-recovery-codes` | services/auth-service.ts:159 |
| POST | `/chat/rooms/${roomId}/typing` | services/chat-service.ts:52 |
| POST | `/fcm/register` | src/services/fcm-service.ts:36 |
| PUT | `/auth/user/password` | services/auth-service.ts:118 |

Note: A second set of services was previously migrated to typed wrappers. The surface above only reflects `apiClient.*` direct calls. Additional wrapper services (e.g. `propertyService`, `viewingService`, `cityService`, `mediaService`) call the same client internally and are covered by Plan 3.

### 1.2 Backend OpenAPI inventory

| Spec | Endpoint count |
|---|---:|
| OLD (`docs/backend/api-documentation/openapi.yaml`) | 215 |
| NEW (`docs/backend/new-api-documentation/openapi.yaml`) | 287 |
| Unchanged (method + path) | 180 |
| Added in NEW | 107 |
| Removed from OLD | 35 |

Generated artifacts:
- `docs/reports/api-contract-diff.json`
- `docs/reports/api-contract-diff.md`
- `docs/reports/frontend-api-calls.json`

## 2. Findings

### 2.1 Auth flow requires redesign (high impact)

The new contract replaces the credential-based login with an OTP-based flow. The current frontend has no `verify-otp` or `send-otp` call sites and assumes `POST /auth/login` returns a token.

New contract login sequence (per `auth-flow.md` and `application-scenarios.md`):

1. `POST /auth/login` — sends OTP (`AuthController::sendOtp`)
2. `POST /auth/verify-otp` — verifies OTP, returns `{ user, token }`
3. Optional: `POST /auth/two-factor-challenge` if user has 2FA enabled
4. Sanctum token (plain text, returned once). No refresh tokens.

Current frontend does not implement steps 1, 2, or the token format expectations.

### 2.2 Auth endpoint prefix changes (medium impact)

New contract lists the same auth paths under both `/auth/...` (Fortify router) and `/api/auth/...` for the new auth controller. Frontend currently calls only `/auth/...` paths. The exact prefix the backend serves under must be confirmed before migrating.

### 2.3 Removed endpoints (medium impact)

`docs/reports/api-contract-diff.md` lists 35 endpoints removed from the old spec. Highlights:

- `GET /api/categories`, `GET /api/categories/{id}` (kept only the `/public` variants)
- `GET /api/upload`
- `GET /search/{type}`
- `GET /api/journal-entries`
- `GET /api/accounts`, `GET /api/admin/subscription/{plans,features,discounts}`

The frontend does not currently call any of the removed endpoints directly, but the `propertyService` and `chatService` may rely on removed shape patterns that must be re-validated.

### 2.4 Added modules (large surface, deferred to later plans)

The 107 added endpoints fall into new modules not present in the current frontend:

- Statistics / Admin statistics
- AI description generation
- Appointments
- Service Provider (registration, profile, services, types)
- Map
- Ledger / Journal entries
- Deposit
- CRM
- Subscription / Plans / Features / Discounts (new admin surface)
- Categories CRUD
- New auth paths under `/api/auth/...`

These are deferred to Plan 4 ("New Backend Modules") once the existing contract is realigned.

### 2.5 Same paths, new request/response shapes (medium impact)

Paths that exist in both specs (e.g. `/properties/browse`, `/properties/random`, `/properties/{id}/details`, `/dashboard/properties`, `/dashboard/viewings`, `/location/cities`, `/notifications`) may have updated request schemas, response envelopes, enum values, or pagination. These must be re-validated endpoint-by-endpoint in Plan 3.

## 3. Contract Matrix (current implementation vs new contract)

Status legend:
- OK — frontend call site matches the new contract path
- RENAME — same intent, path renamed in new contract
- SHAPE — same path, but request/response shape likely changed (requires validation)
- MISSING — endpoint used by frontend is not in the new contract (needs replacement)
- NEW — new-contract endpoint not yet used by frontend (deferred)

| Service | Method | Frontend path | New-contract path | Status | Action |
|---|---|---|---|---|---|
| auth-service | POST | `/auth/logout` | `/auth/logout` (Fortify) or `/api/auth/logout` | RENAME | Verify server prefix |
| auth-service | POST | `/auth/forgot-password` | `/auth/forgot-password` or `/api/auth/forgot-password` | RENAME | Verify prefix |
| auth-service | POST | `/auth/reset-password` | `/auth/reset-password` or `/api/auth/reset-password` | RENAME | Verify prefix |
| auth-service | POST | `/auth/email/verification-notification` | `/auth/email/verification-notification` or `/api/auth/email/verification-notification` | RENAME | Verify prefix |
| auth-service | GET | `/auth/email/verify/${id}/${hash}?${query}` | `/auth/email/verify/{id}/{hash}` | SHAPE | Re-validate query handling |
| auth-service | PUT | `/auth/user/password` | `/auth/user/password` or `/api/auth/user/password` | RENAME | Verify prefix |
| auth-service | POST | `/auth/user/confirm-password` | `/auth/user/confirm-password` or `/api/auth/user/confirm-password` | RENAME | Verify prefix |
| auth-service | POST | `/auth/user/two-factor-authentication` | `/auth/user/two-factor-authentication` or `/api/auth/user/two-factor-authentication` | RENAME | Verify prefix |
| auth-service | POST | `/auth/user/confirmed-two-factor-authentication` | `/auth/user/confirmed-two-factor-authentication` or `/api/auth/user/confirmed-two-factor-authentication` | RENAME | Verify prefix |
| auth-service | DELETE | `/auth/user/two-factor-authentication` | `/auth/user/two-factor-authentication` or `/api/auth/user/two-factor-authentication` | RENAME | Verify prefix |
| auth-service | POST | `/auth/user/two-factor-recovery-codes` | `/auth/user/two-factor-recovery-codes` or `/api/auth/user/two-factor-recovery-codes` | RENAME | Verify prefix |
| auth-service | POST | (none) | `/auth/login` (OTP send) | MISSING | Plan 2 |
| auth-service | POST | (none) | `/auth/verify-otp` | MISSING | Plan 2 |
| auth-service | POST | (none) | `/auth/two-factor-challenge` (post-OTP) | MISSING | Plan 2 |
| auth-service | GET | (none) | `/user` | NEW | Plan 2 |
| propertyService | GET | `/properties/browse` | `/api/properties/browse` | SHAPE | Plan 3 |
| propertyService | GET | `/properties/random` | `/api/properties/random` | SHAPE | Plan 3 |
| propertyService | GET | `/properties/${id}/details` | `/api/properties/{id}/details` | SHAPE | Plan 3 |
| propertyService | GET | `/dashboard/properties` | `/api/dashboard/properties` | SHAPE | Plan 3 |
| propertyService | GET | `/dashboard/properties/statistics` | `/api/dashboard/properties/statistics` | SHAPE | Plan 3 |
| propertyService | POST | `/dashboard/properties` | `/api/dashboard/properties` | SHAPE | Plan 3 |
| propertyService | PUT | `/dashboard/properties/${id}` | `/api/dashboard/properties/{id}` | SHAPE | Plan 3 |
| propertyService | DELETE | `/dashboard/properties/${id}` | `/api/dashboard/properties/{id}` | SHAPE | Plan 3 |
| propertyService | PATCH | `/dashboard/properties/${id}/status` | `/api/dashboard/properties/{id}/status` | SHAPE | Plan 3 |
| propertyService | POST | `/dashboard/properties/${id}/favorite` | `/api/dashboard/properties/{id}/favorite` | SHAPE | Plan 3 |
| propertyService | GET | `/dashboard/my-properties` | `/api/dashboard/my-properties` | SHAPE | Plan 3 |
| viewingService | GET | `/dashboard/viewings` | `/api/dashboard/viewings` | SHAPE | Plan 3 |
| viewingService | GET | `/dashboard/viewings/my` | `/api/dashboard/viewings/my` | SHAPE | Plan 3 |
| viewingService | GET | `/dashboard/viewings/calendar` | `/api/dashboard/viewings/calendar` | SHAPE | Plan 3 |
| viewingService | GET | `/dashboard/viewings/schedule` | `/api/dashboard/viewings/schedule` | SHAPE | Plan 3 |
| viewingService | GET | `/dashboard/viewings/${id}` | `/api/dashboard/viewings/{id}` | SHAPE | Plan 3 |
| viewingService | POST | `/dashboard/viewings` | `/api/dashboard/viewings` | SHAPE | Plan 3 |
| viewingService | POST | `/dashboard/viewings/${id}/confirm` | `/api/dashboard/viewings/{id}/confirm` | SHAPE | Plan 3 |
| viewingService | POST | `/dashboard/viewings/${id}/reschedule` | `/api/dashboard/viewings/{id}/reschedule` | SHAPE | Plan 3 |
| viewingService | POST | `/dashboard/viewings/${id}/cancel` | `/api/dashboard/viewings/{id}/cancel` | SHAPE | Plan 3 |
| viewingService | POST | `/dashboard/viewings/${id}/complete` | `/api/dashboard/viewings/{id}/complete` | SHAPE | Plan 3 |
| viewingService | POST | `/dashboard/viewings/${id}/no-show` | `/api/dashboard/viewings/{id}/no-show` | SHAPE | Plan 3 |
| viewingService | DELETE | `/dashboard/viewings/${id}` | `/api/dashboard/viewings/{id}` | SHAPE | Plan 3 |
| chat-service | GET | `/chat/rooms` | `/api/chat/rooms` | SHAPE | Plan 3 |
| chat-service | GET | `/chat/rooms/${roomId}/messages` | `/api/chat/rooms/{roomId}/messages` | SHAPE | Plan 3 |
| chat-service | DELETE | `/chat/rooms/${roomId}/messages/${messageId}` | `/api/chat/rooms/{roomId}/messages/{messageId}` | SHAPE | Plan 3 |
| chat-service | POST | `/chat/rooms/${roomId}/typing` | `/api/chat/rooms/{roomId}/typing` | SHAPE | Plan 3 |
| notification-service | GET | `/notifications` | `/api/notifications` | SHAPE | Plan 3 |
| notification-service | GET | `/notifications/unread-count` | `/api/notifications/unread-count` | SHAPE | Plan 3 |
| notification-service | PATCH | `/notifications/${id}/read` | `/api/notifications/{id}/read` | SHAPE | Plan 3 |
| notification-service | PATCH | `/notifications/read-all` | `/api/notifications/read-all` | SHAPE | Plan 3 |
| notification-service | DELETE | `/notifications/${id}` | `/api/notifications/{id}` | SHAPE | Plan 3 |
| fcm-service | POST | `/fcm/register` | `/api/fcm/register` | RENAME | Plan 3 |
| fcm-service | DELETE | `/fcm/revoke` | `/api/fcm/revoke` | RENAME | Plan 3 |
| cityService | GET | `/location/countries` | `/api/location/countries` | SHAPE | Plan 3 |
| cityService | GET | `/location/cities` | `/api/location/cities` | SHAPE | Plan 3 |
| cityService | POST | `/location/cities` | `/api/location/cities` | SHAPE | Plan 3 |
| cityService | PUT | `/location/cities/${id}` | `/api/location/cities/{id}` | SHAPE | Plan 3 |
| cityService | DELETE | `/location/cities/${id}` | `/api/location/cities/{id}` | SHAPE | Plan 3 |
| mediaService | POST | `/upload` | `/api/upload` | SHAPE | Plan 3 |

## 4. Open Questions (require backend confirmation before Plan 2)

1. **Auth prefix**: Does the new auth controller serve under `/auth/...` (Fortify) or `/api/auth/...` (Laravel API router)? The new OpenAPI lists both. The frontend must call the correct prefix.
2. **Token format**: Sanctum plain-text token (`1|base64hash...`). How is the token delivered in the response body of `/auth/verify-otp` and `/auth/two-factor-challenge`? Same shape as `/auth/register`?
3. **OTP delivery channel**: Per `auth-flow.md`, OTP is sent via SMS/email/notification. Does the API accept a single field (email OR phone) or a typed `channel` parameter?
4. **Error envelope for OTP**: What does an invalid/expired OTP response look like (status code, body shape)? The current 422 path validation pattern may not apply.
5. **Rate limits**: 5 req/min for `/auth/login` and `/auth/verify-otp`, 60 req/min for chat. Are these enforced on the API side (and surfaced via `429` + `Retry-After`)? The frontend toast/UX needs to handle them.
6. **FCM device registration**: Is `/api/fcm/register` still present, or has it moved? The new contract added it explicitly.
7. **Pagination**: Does the new contract use the same `from/to/per_page/current_page/last_page/total` envelope, or has it changed to `data/meta/links` (Laravel default)?

## 5. Decisions for Plan 2 (OTP Migration)

These must be confirmed before implementation:

- The new contract will be treated as the **single source of truth**.
- The old `docs/backend/api-documentation/` will be removed only after Plan 1 is signed off and the new auth flow is verified.
- The frontend will support **OTP-only login** going forward. The legacy `password → token` form will be removed, not aliased.
- `authService` will be split into `sendOtp`, `verifyOtp`, `register`, `forgotPassword`, `resetPassword`, `logout`, `me` (current user), plus 2FA management. The `completeTwoFactor` flow will be renamed to `verifyTwoFactorChallenge`.
- All existing `auth-service.test.ts` assertions will be rewritten to match the new contract paths and request bodies.

## 6. Out of Scope (deferred)

- Plan 3 — revalidation of `propertyService`, `viewingService`, `chatService`, `notificationService`, `cityService`, `mediaService`, `fcmService` against the new contract shapes
- Plan 4 — implementation of new modules (ads, sponsored ads, analytics, service provider, ledger, deposit, CRM, AI, map, appointments, statistics, categories, subscriptions)
- Plan 5 — production hardening (SEO, error pages, security headers, deployment)
- Plan 6 — production test coverage
- Plan 7 — release readiness

## 7. Deliverables Status

| Deliverable | Status |
|---|---|
| Contract diff JSON | Done (`docs/reports/api-contract-diff.json`) |
| Contract diff Markdown | Done (`docs/reports/api-contract-diff.md`) |
| Frontend API surface JSON | Done (`docs/reports/frontend-api-calls.json`) |
| Reproducible diff script | Done (`scripts/api-contract-diff.mjs`) |
| Reproducible surface script | Done (`scripts/frontend-api-surface.mjs`) |
| Backend prefix confirmation (auth, FCM, etc.) | Pending (Open Question 1) |
| Token response shape confirmation | Pending (Open Question 2) |
| OTP error envelope confirmation | Pending (Open Question 4) |
