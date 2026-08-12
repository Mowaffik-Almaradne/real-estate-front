# Frontend-Backend Integration Plan

## Scope

This report defines the implementation plan for integrating the frontend with the backend documentation stored under `docs/backend/`.

The plan covers API integration, authentication, real-time communication, UI, UX, responsive behavior, permissions, validation, and production verification.

Notifications will use Pusher as the primary real-time mechanism. FCM remains optional for background or mobile push support and is not a dependency for the web notification experience.

## Current Assessment

The backend documentation describes approximately 150+ endpoints across these modules:

- Authentication and user profiles
- Public property discovery
- Property publishing and moderation
- Viewings and scheduling
- Chat and real-time notifications
- Advertising and analytics
- Sponsored advertising and payments
- Subscriptions and Stripe checkout
- Service providers and service requests
- Office upgrades and verification
- Reviews and ratings
- Ledger, accounting, and payroll
- Admin users, roles, permissions, locations, and categories

The frontend currently contains partial implementations for authentication, properties, cities, dashboard pages, chat, notifications, and Pusher setup. Most documented modules still require complete API clients, pages, state management, and UX flows.

## Documentation Issues To Resolve First

These discrepancies must be confirmed against the actual backend before feature implementation:

1. **API prefix inconsistency**
   - OpenAPI uses server `http://localhost:8000` with paths such as `/api/properties`.
   - The current frontend defaults to `http://localhost:8000/api` and calls paths such as `/properties`.
   - Authentication paths alternate between `/auth/*` and `/api/auth/*`.

2. **Response shape inconsistency**
   - New documentation uses `{ data, message }`.
   - Older documentation uses `{ success, message, data }`.
   - Pagination appears as both `pagination` and `meta`.

3. **Chat room type inconsistency**
   - New documentation uses `private | group`.
   - Older documentation uses `private | property`.
   - Existing frontend code also refers to `direct`.

4. **Query parameter inconsistency**
   - Both `perPage` and `per_page` are documented or used.
   - Analytics date filters use different names in different documents.

5. **Field naming inconsistency**
   - City input is documented as both `state_province` and `state_provianc`.
   - Ad tracking paths differ between the old and new documentation.

6. **Authentication and Pusher authorization**
   - The final broadcasting authentication URL and required API prefix must be confirmed.
   - The frontend must not hardcode an outdated token during Pusher initialization.

## Engineering Rules

All phases must follow these rules:

- Use a single API client and a single response-normalization strategy.
- Keep domain services responsible for API operations, not UI components.
- Keep components focused on presentation and user interaction.
- Use shared schemas and types for frontend validation and API payloads.
- Use shared status enums and transition rules instead of scattered string literals.
- Reuse common table, form, dialog, pagination, filtering, and feedback components.
- Avoid unnecessary abstractions. Reuse only where behavior is genuinely shared.
- Apply single responsibility to services, hooks, components, and route-level pages.
- Do not duplicate token handling, error parsing, loading states, or permission checks.
- Every feature must support loading, empty, validation-error, authorization-error, server-error, and success states.
- Every completed phase must pass lint, type checking, production build, and relevant manual/API verification.

## Phased Implementation Plan

### Phase 1: Integration Foundation

Build the shared foundation before implementing additional business modules.

#### Work

- Confirm the canonical backend base URL and route prefix.
- Standardize API response and pagination parsing.
- Replace direct `axios`, `fetch`, and manual token handling with one API client.
- Add typed request and response models for documented entities.
- Centralize:
  - Bearer authentication
  - 401 handling
  - 403, 404, 422, and 500 error handling
  - Backend validation error mapping
  - Request cancellation and retry behavior where appropriate
- Correct token persistence and logout behavior.
- Align middleware authentication with client authentication.
- Add environment configuration for API, Pusher, and payment redirects.
- Define shared date, currency, enum, status, and pagination utilities.
- Add the baseline testing and verification setup.

#### Exit Criteria

- All requests use the shared API client.
- Authentication works across browser refreshes and protected routes.
- Backend errors are displayed consistently.
- Pagination is normalized regardless of the backend wrapper used.
- No feature-specific code directly reads or writes tokens.

### Phase 2: Authentication, Profile, and Access Control

#### Work

- Complete login and registration flows.
- Add two-factor authentication setup, challenge, recovery codes, and disable flow.
- Add email verification and resend flow.
- Add forgot-password and reset-password flows.
- Add profile information and password management.
- Add password confirmation for sensitive actions.
- Add publisher profile management, avatar, social links, and contact preference.
- Add role and permission-aware navigation and actions.
- Display publisher and office verification badges.

#### Exit Criteria

- Users can complete the full account lifecycle.
- Protected actions respect backend permissions.
- Unauthorized features are hidden or disabled without relying only on frontend checks.

### Phase 3: Property Discovery and Publishing

#### Work

- Rebuild public property browsing around the documented filters and sorting.
- Implement responsive property cards, list/grid states, and pagination or infinite loading.
- Complete property detail pages with gallery, publisher data, badges, favorites, and contact actions.
- Complete property creation and editing forms.
- Add temporary media upload, progress, preview, removal, main-image selection, and gallery ordering.
- Support all property types and lifecycle statuses.
- Add draft, pending, rejected, suspended, sold, and archived states.
- Add favorite toggle and optimistic update behavior.
- Add “my properties” and property statistics.
- Add photographer-assisted property creation.

#### Exit Criteria

- A publisher can create and edit a complete listing with media.
- A guest can search, filter, view, and browse properties.
- Property lifecycle states and backend rejection reasons are visible and understandable.

### Phase 4: Viewings and Scheduling

#### Work

- Add viewing booking form with date, time, duration, buffer, type, attendees, and notes.
- Add buyer viewing list and publisher schedule.
- Add calendar view with date range filtering.
- Implement confirm, reschedule, cancel, complete, and no-show actions.
- Enforce valid state transitions in the UI.
- Present conflict and unavailable-slot errors clearly.
- Subscribe to Pusher viewing updates.
- Connect viewing changes to the notification center.

#### Exit Criteria

- Buyers and publishers can complete the full viewing lifecycle.
- Invalid transitions are not offered in the UI.
- Schedule conflicts and backend validation errors are actionable.

### Phase 5: Chat and Pusher Notifications

#### Work

- Confirm and correct private-channel authentication.
- Make Pusher lifecycle depend on the authenticated user and current token.
- Add private and property inquiry room creation.
- Add room detail and participant display.
- Complete paginated message history.
- Add text, image, and file messages where supported.
- Add message deletion and threaded replies where supported.
- Add typing indicators with the documented rate limit.
- Add connection, reconnecting, disconnected, and failed states.
- Implement notification list, unread count, read, read-all, delete, and deep links.
- Deduplicate Pusher events and reconcile optimistic messages safely.
- Remove polling or timer-based notification behavior.

#### Exit Criteria

- Chat updates in real time without polling.
- Notifications update through Pusher.
- Unread counts remain correct after refreshes, duplicate events, and reconnects.

### Phase 6: Advertising and Sponsored Ads

#### Work

- Implement ad group creation, editing, archiving, restoring, and default-ad management.
- Implement ad creation, editing, scheduling, status changes, media uploads, and property linking.
- Add public ad display placements.
- Add view and click tracking.
- Add dashboard, group, and ad analytics.
- Add date filtering, trends, CTR, and report export.
- Add sponsored-ad pricing and active sponsored ads.
- Add sponsored-ad creation with media validation and idempotency keys.
- Integrate Stripe redirect and balance payment flows.
- Add cancellation and refund status handling.

#### Exit Criteria

- Publishers can manage normal and sponsored advertising.
- Public users see active ads correctly.
- Payment, loading, failure, and cancellation states are clear.

### Phase 7: Subscriptions and Billing

#### Work

- Add public plan comparison and plan details.
- Add coupon validation.
- Add Stripe checkout initiation and return pages.
- Add current subscription and subscription history.
- Add cancellation of auto-renewal.
- Add feature access and usage display.
- Add frontend gating for listing, image, analytics, badge, contact, and sponsored-ad limits.
- Add subscription expiry warnings.
- Add admin CRUD for plans, features, plan-feature links, and discounts.

#### Exit Criteria

- Users understand limits before starting restricted actions.
- Checkout success and failure states are handled correctly.
- Feature availability matches the backend response.

### Phase 8: Service Providers and Service Requests

#### Work

- Add public provider directory and profile pages.
- Add provider registration and profile management.
- Add coverage cities and availability management.
- Add client service request creation, listing, detail, and cancellation.
- Add provider request queue and request detail.
- Add accept, reject, start, task completion, and complete actions.
- Add provider balance, earnings, and withdrawal request.
- Add admin provider verification and service-request oversight.
- Connect photographer service requests to property creation.

#### Exit Criteria

- Clients, providers, and administrators can complete their respective workflows.
- Service request state transitions are accurately represented.

### Phase 9: Offices, Upgrades, and Reviews

#### Work

- Add individual-to-office upgrade request flow.
- Add upgrade status and rejection reason display.
- Add admin approval and rejection.
- Add public office directory and office detail pages.
- Add office verification and unverification.
- Add office profile information and verified badge.
- Add reviews, ratings, average ratings, and review counts.
- Add review deletion according to backend permissions.

#### Exit Criteria

- Office upgrades and verification are visible end to end.
- Public trust information is consistent across properties and publisher profiles.

### Phase 10: Admin, Ledger, Payroll, and Moderation

#### Work

- Add user management and status toggling.
- Add roles, permissions, and permission assignment.
- Add categories management.
- Complete country and city management.
- Add property moderation and status transitions.
- Add office and provider moderation.
- Add ledger balance and transaction statements.
- Add account tree and account CRUD.
- Add journal entry drafts, editing, deletion, and posting.
- Add trial balance reports.
- Add payroll provider eligibility, setup, execution, payments, and updates.
- Add relevant audit and status logs.

#### Exit Criteria

- Administrators can operate the documented platform workflows without direct backend intervention.
- Financial data is clearly separated from ordinary user workflows.
- Destructive and irreversible actions require confirmation.

### Phase 11: UI, UX, Accessibility, and Responsive Quality

#### Work

- Normalize layout, spacing, typography, colors, and component variants.
- Ensure desktop, tablet, and mobile layouts work across every module.
- Add consistent loading skeletons and empty states.
- Add actionable error states and retry actions.
- Add accessible labels, keyboard behavior, focus handling, and dialog semantics.
- Add confirmation dialogs for destructive or irreversible actions.
- Standardize date, timezone, currency, number, and status formatting.
- Add upload previews and progress indicators.
- Ensure tables remain usable on small screens.
- Prepare localization and RTL support if Arabic content remains part of the product.

#### Exit Criteria

- All core routes are usable on mobile and desktop.
- All forms and dialogs are keyboard accessible.
- Every major async operation has complete feedback states.

### Phase 12: Verification and Release Hardening

#### Work

- Run TypeScript validation.
- Run ESLint.
- Run production build.
- Add API contract tests for critical endpoints.
- Test authentication, permissions, and token expiry behavior.
- Test property lifecycle and media upload flows.
- Test viewing state transitions.
- Test Pusher connection, reconnection, duplicate events, and notification updates.
- Test Stripe redirects and subscription feature gating.
- Test provider and admin workflows.
- Perform browser and mobile smoke tests.
- Verify production environment variables and API URLs.
- Add error monitoring and production logging where required.

#### Exit Criteria

- Critical workflows pass against the real backend.
- Production build succeeds.
- No known blocker remains in API integration, UI, UX, responsiveness, or permissions.

## Recommended Execution Order

1. Phase 1: Integration Foundation
2. Phase 2: Authentication, Profile, and Access Control
3. Phase 3: Property Discovery and Publishing
4. Phase 4: Viewings and Scheduling
5. Phase 5: Chat and Pusher Notifications
6. Phase 6: Advertising and Sponsored Ads
7. Phase 7: Subscriptions and Billing
8. Phase 8: Service Providers and Service Requests
9. Phase 9: Offices, Upgrades, and Reviews
10. Phase 10: Admin, Ledger, Payroll, and Moderation
11. Phase 11: UI, UX, Accessibility, and Responsive Quality
12. Phase 12: Verification and Release Hardening

## Phase Completion Standard

A phase is complete only when its API integration, types, validation, loading states, empty states, errors, permissions, responsive UI, accessibility, and relevant verification are implemented. A partially working endpoint or page does not qualify as phase completion.
