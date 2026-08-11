# Production Roadmap

## Source Of Truth

All future API work must use:

`docs/backend/new-api-documentation/`

The old documentation under `docs/backend/api-documentation/` is retained for historical comparison only.

## Current Status

The frontend foundation is complete: CI, unit and contract-test infrastructure, Playwright E2E, i18n (English/Arabic), RTL, accessibility checks, Sentry, performance checks, and bundle budgets are in place.

The API integration must now be revalidated against the new backend documentation before production release.

## Remaining Plans

### Plan 1: API Contract Rebaseline

Reconcile the frontend services, DTOs, enums, permissions, authentication flow, response formats, and contract tests with the new OpenAPI and backend documentation.

### Plan 2: OTP Authentication Migration

Align registration, login, OTP verification, 2FA, token storage, logout, password reset, and email verification with the new authentication flow.

### Plan 3: Existing Module Migration

Revalidate and update the currently implemented modules: locations, properties, viewings, chat, notifications, media, publisher profile, and FCM.

### Plan 4: New Backend Modules

Plan and implement the newly documented modules as required: ads, ad groups, sponsored ads, analytics, service providers, reviews, ledger, deposits, CRM, map, and AI.

### Plan 5: Production UX And Security

Add SEO metadata, sitemap, robots, manifest, OpenGraph, localized canonical URLs, loading/error/not-found pages, security headers, CSP, and deployment configuration.

### Plan 6: Production Test Coverage

Complete API contract tests, OTP and critical-flow E2E tests, middleware tests, form-validation tests, Arabic formatting tests, and backend-connected smoke tests.

### Plan 7: Release Readiness

Run the final production checklist: environment configuration, deployment, Sentry releases and alerts, Lighthouse/performance checks, accessibility, bundle budgets, security verification, rollback procedure, and release sign-off.

## Execution Order

1. Plan 1: API Contract Rebaseline
2. Plan 2: OTP Authentication Migration
3. Plan 3: Existing Module Migration
4. Plan 4: New Backend Modules
5. Plan 5: Production UX And Security
6. Plan 6: Production Test Coverage
7. Plan 7: Release Readiness

## Important Rule

Do not remove the old API documentation until Plan 1 is complete and the new contract has been validated against the frontend.
