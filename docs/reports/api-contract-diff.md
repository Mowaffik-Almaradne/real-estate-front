# API Contract Diff

Generated: 2026-08-09T19:27:15.647Z

- OLD endpoint count: 215
- NEW endpoint count: 287
- Unchanged: 180
- Added in NEW: 107
- Removed from OLD: 35

## Added in NEW (not in OLD)

| Method | Path | Operation | Tags |
|---|---|---|---|
| GET | `/api/admin/statistics/ads` |  | Admin Statistics |
| GET | `/api/admin/statistics/communication` |  | Admin Statistics |
| GET | `/api/admin/statistics/crm` |  | Admin Statistics |
| GET | `/api/admin/statistics/moderation` |  | Admin Statistics |
| GET | `/api/admin/statistics/overview` |  | Admin Statistics |
| GET | `/api/admin/statistics/properties` |  | Admin Statistics |
| GET | `/api/admin/statistics/subscriptions` |  | Admin Statistics |
| POST | `/api/ai/description/generate` | postApiAiDescriptionGenerate | Endpoints |
| POST | `/api/ai/description/improve` | postApiAiDescriptionImprove | Endpoints |
| POST | `/api/ai/description/suggest-features` | postApiAiDescriptionSuggestFeatures | Endpoints |
| POST | `/api/ai/description/suggest-title` | postApiAiDescriptionSuggestTitle | Endpoints |
| POST | `/api/ai/search` | postApiAiSearch | Endpoints |
| POST | `/api/auth/email/verification-notification` | sendANewEmailVerificationNotification | Endpoints |
| POST | `/api/auth/forgot-password` | sendAResetLinkToTheGivenUser | Endpoints |
| POST | `/api/auth/login` | postApiAuthLogin | Endpoints |
| POST | `/api/auth/logout` | destroyAnAuthenticatedSession | Endpoints |
| POST | `/api/auth/register` | createANewRegisteredUser | Endpoints |
| POST | `/api/auth/reset-password` | resetTheUsersPassword | Endpoints |
| POST | `/api/auth/two-factor-challenge` | attemptToAuthenticateANewSessionUsingTheTwoFactorAuthenticationCode | Endpoints |
| POST | `/api/auth/user/confirm-password` | confirmTheUsersPassword | Endpoints |
| PUT | `/api/auth/user/password` | updateTheUsersPassword | Endpoints |
| PUT | `/api/auth/user/profile-information` | updateTheUsersProfileInformation | Endpoints |
| POST | `/api/auth/user/two-factor-authentication` | enableTwoFactorAuthenticationForTheUser | Endpoints |
| DELETE | `/api/auth/user/two-factor-authentication` | disableTwoFactorAuthenticationForTheUser | Endpoints |
| POST | `/api/auth/user/two-factor-recovery-codes` | generateAFreshSetOfTwoFactorAuthenticationRecoveryCodes | Endpoints |
| POST | `/api/auth/verify-otp` | postApiAuthVerifyOtp | Endpoints |
| POST | `/api/dashboard/appointments` | postApiDashboardAppointments | Endpoints |
| DELETE | `/api/dashboard/appointments/{id}` | deleteApiDashboardAppointmentsId | Endpoints |
| PATCH | `/api/dashboard/appointments/{id}/cancel` | patchApiDashboardAppointmentsIdCancel | Endpoints |
| PATCH | `/api/dashboard/appointments/{id}/complete` | patchApiDashboardAppointmentsIdComplete | Endpoints |
| PATCH | `/api/dashboard/appointments/{id}/confirm` | patchApiDashboardAppointmentsIdConfirm | Endpoints |
| PATCH | `/api/dashboard/appointments/{id}/no-show` | patchApiDashboardAppointmentsIdNoShow | Endpoints |
| PATCH | `/api/dashboard/appointments/{id}/reschedule` | patchApiDashboardAppointmentsIdReschedule | Endpoints |
| GET | `/api/dashboard/appointments/calendar` |  | Appointments |
| POST | `/api/dashboard/appointments/follow-ups` | postApiDashboardAppointmentsFollowUps | Endpoints |
| GET | `/api/dashboard/appointments/my` |  | Appointments |
| GET | `/api/dashboard/appointments/schedule` |  | Appointments |
| GET | `/api/dashboard/crm/dashboard/summary` |  | CRM |
| GET | `/api/dashboard/crm/dashboard/today` |  | CRM |
| POST | `/api/dashboard/crm/leads` | postApiDashboardCrmLeads | Endpoints |
| PATCH | `/api/dashboard/crm/leads/{id}` | patchApiDashboardCrmLeadsId | Endpoints |
| POST | `/api/dashboard/crm/leads/{id}/archive` | postApiDashboardCrmLeadsIdArchive | Endpoints |
| POST | `/api/dashboard/crm/leads/{id}/restore` | postApiDashboardCrmLeadsIdRestore | Endpoints |
| PATCH | `/api/dashboard/crm/leads/{id}/status` | patchApiDashboardCrmLeadsIdStatus | Endpoints |
| POST | `/api/dashboard/crm/leads/{leadId}/notes` | postApiDashboardCrmLeadsLeadIdNotes | Endpoints |
| GET | `/api/dashboard/crm/leads/archived` |  | CRM |
| GET | `/api/dashboard/crm/leads/check-duplicate` |  | CRM |
| GET | `/api/dashboard/crm/leads/export` |  | CRM |
| PATCH | `/api/dashboard/crm/notes/{noteId}` | patchApiDashboardCrmNotesNoteId | Endpoints |
| DELETE | `/api/dashboard/crm/notes/{noteId}` | deleteApiDashboardCrmNotesNoteId | Endpoints |
| POST | `/api/dashboard/deposits` | createANewDepositpendingStatus | Deposits |
| PATCH | `/api/dashboard/deposits/{id}` | updateAPendingDepositsMutableFields | Deposits |
| DELETE | `/api/dashboard/deposits/{id}` | softDeleteADeposit | Deposits |
| POST | `/api/dashboard/deposits/{id}/cancel` | cancelADeposit | Deposits |
| POST | `/api/dashboard/deposits/{id}/pay` | payAndHoldTheDepositInEscrow | Deposits |
| POST | `/api/dashboard/deposits/{id}/refund` | refundTheHeldDepositBackToTheBuyer | Deposits |
| POST | `/api/dashboard/deposits/{id}/release` | releaseTheHeldDepositToTheSeller | Deposits |
| GET | `/api/dashboard/my-deposits` |  | Deposits |
| GET | `/api/dashboard/my-sales` |  | Deposits |
| GET | `/api/dashboard/properties/{property}/stats` |  | Statistics |
| GET | `/api/dashboard/properties/{propertyId}/rental-cards/active` | getTheActiveRentalCardForAPropertyifAny | Rental Cards |
| GET | `/api/dashboard/properties/{propertyId}/rental-cards/history` | listAllRentalCardshistoryForASpecificProperty | Rental Cards |
| GET | `/api/dashboard/rental-cards` | listRentalCards | Rental Cards |
| POST | `/api/dashboard/rental-cards` | createANewRentalCard | Rental Cards |
| GET | `/api/dashboard/rental-cards/{id}` | showASingleRentalCard | Rental Cards |
| PATCH | `/api/dashboard/rental-cards/{id}` | updateARentalCardsMutableFields | Rental Cards |
| DELETE | `/api/dashboard/rental-cards/{id}` | softDeleteARentalCard | Rental Cards |
| PATCH | `/api/dashboard/rental-cards/{id}/end` | endARentalCardEarly | Rental Cards |
| PATCH | `/api/dashboard/rental-cards/{id}/renew` | renewARentalCard | Rental Cards |
| GET | `/api/dashboard/trader/competitive-map` |  | Map |
| GET | `/api/dashboard/trader/expiring-rentals` |  | Statistics |
| GET | `/api/dashboard/trader/export/properties` |  | Statistics |
| GET | `/api/dashboard/trader/leads-by-status` |  | Statistics |
| GET | `/api/dashboard/trader/properties-by-status` |  | Statistics |
| GET | `/api/dashboard/trader/recent-leads` |  | Statistics |
| GET | `/api/dashboard/trader/sponsored-ads-summary` |  | Statistics |
| GET | `/api/dashboard/trader/summary` |  | Statistics |
| GET | `/api/dashboard/trader/top-properties` |  | Statistics |
| GET | `/api/dashboard/trader/upcoming-appointments` |  | Statistics |
| GET | `/api/dashboard/trader/views-trend` |  | Statistics |
| DELETE | `/api/files/{id}` |  | نظام الملفات |
| POST | `/api/files/{id}/move` |  | FileSystem |
| POST | `/api/files/{id}/rename` |  | نظام الملفات |
| PUT | `/api/files/{id}/text` |  | نظام الملفات |
| POST | `/api/files/image` |  | FileSystem |
| POST | `/api/files/text` |  | FileSystem |
| GET | `/api/folders` |  | نظام الملفات |
| GET | `/api/folders/{id}` | ++ | نظام الملفات |
| PUT | `/api/folders/{id}` |  | نظام الملفات |
| DELETE | `/api/folders/{id}` |  | نظام الملفات |
| POST | `/api/folders/{id}/move` |  | FileSystem |
| POST | `/api/folders/{id}/rename` |  | نظام الملفات |
| POST | `/api/journal-entries/{journalEntry_id}/post` | postApiJournalEntriesJournalEntry_idPost | Endpoints |
| GET | `/api/map/properties` |  | Map |
| GET | `/api/market/by-category` |  | Market |
| GET | `/api/market/by-city` |  | Market |
| GET | `/api/market/by-price-range` |  | Market |
| GET | `/api/market/listings-trend` |  | Market |
| GET | `/api/market/overview` |  | Market |
| GET | `/api/market/top-saved` |  | Market |
| GET | `/api/market/top-viewed` |  | Market |
| PUT | `/api/payroll/{id}` | putApiPayrollId | Endpoints |
| GET | `/api/properties/{propertyId}/files` |  | FileSystem |
| GET | `/api/search/{type}` |  | Search |
| GET | `/api/storage/packages` |  | FileSystem |
| GET | `/api/storage/status` |  | نظام الملفات |
| POST | `/api/storage/upgrade` |  | نظام الملفات |

## Removed from OLD (not in NEW)

| Method | Path | Operation | Tags |
|---|---|---|---|
| GET | `/api/accounts` |  | Ledger |
| GET | `/api/accounts/{id}` |  | Ledger |
| GET | `/api/admin/subscription/discounts` |  | Admin Subscriptions |
| GET | `/api/admin/subscription/discounts/{id}` |  | Admin Subscriptions |
| GET | `/api/admin/subscription/features` |  | Admin Subscriptions |
| GET | `/api/admin/subscription/features/{id}` |  | Admin Subscriptions |
| GET | `/api/admin/subscription/plans` |  | Admin Subscriptions |
| GET | `/api/admin/subscription/plans/{id}` |  | Admin Subscriptions |
| GET | `/api/categories` |  | Categories |
| GET | `/api/categories/{id}` |  | Categories |
| GET | `/api/chat/rooms` |  | Chat |
| GET | `/api/chat/rooms/{roomId}/messages` |  | Chat |
| GET | `/api/dashboard/ad-groups` |  | Ad Groups |
| GET | `/api/dashboard/ad-groups/{id}` |  | Ad Groups |
| GET | `/api/dashboard/ads` |  | Ads |
| GET | `/api/dashboard/ads/{id}` |  | Ads |
| GET | `/api/dashboard/properties` |  | Dashboard Properties |
| GET | `/api/dashboard/properties/{id}` |  | Dashboard Properties |
| GET | `/api/dashboard/sponsored-ads` |  | Sponsored Ads |
| GET | `/api/dashboard/viewings` |  | Viewings |
| GET | `/api/dashboard/viewings/{id}` |  | Viewings |
| GET | `/api/journal-entries` |  | Ledger |
| GET | `/api/journal-entries/{id}` |  | Ledger |
| GET | `/api/location/cities` |  | Location |
| GET | `/api/location/cities/{id}` |  | Location |
| GET | `/api/location/countries` |  | Location |
| GET | `/api/location/countries/{id}` |  | Location |
| GET | `/api/roles` |  | Role Management |
| GET | `/api/roles/{id}` |  | Role Management |
| GET | `/api/service-provider/profile` |  | Provider Portal |
| GET | `/api/service-requests` |  | Service Requests |
| POST | `/api/upload` |  | Files |
| GET | `/api/users` |  | User Management |
| GET | `/api/users/{id}` |  | User Management |
| GET | `/search/{type}` |  | Search |