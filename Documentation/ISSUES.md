# Production Readiness Issues Tracker

**Created:** December 16, 2025  
**Status:** Active Development

> **Note:** These issues should be created in GitHub when authentication is configured.  
> For now, track progress here and mark completed items.

---

## 🔴 P0 - Critical (Must Fix Before Production)

### Issue #1: Set up testing infrastructure ✅

**Labels:** `enhancement`, `priority: critical`, `testing`

**Problem:** Zero test coverage - no unit, integration, or E2E tests.

**Tasks:**

- [x] Install Vitest and React Testing Library
- [x] Configure `vitest.config.ts`
- [x] Create test setup file
- [x] Add test scripts to package.json
- [x] Create first unit tests for auth utilities
- [x] Add test step to CI/CD pipeline

**Acceptance Criteria:**

- ✅ `npm run test` works
- ✅ CI includes test step
- ✅ 41 unit tests pass

---

### Issue #2: Add security headers

**Labels:** `security`, `priority: critical`

**Problem:** No security headers configured (CSP, X-Frame-Options, HSTS).

**Tasks:**

- [ ] Add headers config to next.config.js
- [ ] Include X-Frame-Options: DENY
- [ ] Include X-Content-Type-Options: nosniff
- [ ] Include Strict-Transport-Security
- [ ] Include Referrer-Policy

**Acceptance Criteria:**

- Security headers visible in browser dev tools
- Pass security header audit

---

### Issue #3: Implement error monitoring with Sentry

**Labels:** `enhancement`, `priority: critical`, `monitoring`

**Problem:** No visibility into production errors.

**Tasks:**

- [ ] Install @sentry/nextjs
- [ ] Configure Sentry client and server
- [ ] Add SENTRY_DSN to environment
- [ ] Test error capturing
- [ ] Add source maps

**Acceptance Criteria:**

- Errors appear in Sentry dashboard
- Source maps work correctly

---

### Issue #4: Fix CORS wildcard fallback

**Labels:** `security`, `priority: critical`

**Problem:** CORS allows any origin when Origin header missing.

**Tasks:**

- [ ] Create allowed origins whitelist
- [ ] Update middleware CORS handling
- [ ] Test cross-origin requests
- [ ] Ensure doctors.askremohealth.com works

**Acceptance Criteria:**

- Only whitelisted origins accepted
- Cross-subdomain requests work

---

## 🟠 P1 - High Priority (Should Fix Before Production)

### Issue #5: Add appointment email reminders

**Labels:** `enhancement`, `priority: high`, `notifications`

**Problem:** No appointment reminder system - patients miss appointments.

**Tasks:**

- [ ] Create email reminder templates
- [ ] Add reminder scheduling logic
- [ ] Configure cron for sending reminders
- [ ] Send 24h and 1h before reminders
- [ ] Add user preference for reminders

**Acceptance Criteria:**

- Emails sent 24h before appointment
- Emails sent 1h before appointment
- Proper email template with appointment details

---

### Issue #6: Build patient review submission UI

**Labels:** `enhancement`, `priority: high`, `feature`

**Problem:** Patients cannot leave reviews - schema exists but no UI.

**Tasks:**

- [ ] Create review form component
- [ ] Add star rating input
- [ ] Connect to reviews tRPC mutation
- [ ] Show on completed appointments
- [ ] Add success/error feedback

**Acceptance Criteria:**

- Patients can submit reviews after appointments
- Reviews appear on doctor profiles

---

### Issue #7: Create notification center UI

**Labels:** `enhancement`, `priority: high`, `feature`

**Problem:** Notifications table exists but no UI to view them.

**Tasks:**

- [ ] Create notification bell icon in header
- [ ] Build notification dropdown/panel
- [ ] Mark as read functionality
- [ ] Real-time updates (optional)
- [ ] Link notifications to relevant pages

**Acceptance Criteria:**

- Users see notification count
- Can view and dismiss notifications

---

### Issue #8: Enhance doctor search with name search

**Labels:** `enhancement`, `priority: high`, `feature`

**Problem:** Cannot search doctors by name on home page.

**Tasks:**

- [ ] Add name input to search form
- [ ] Update doctor list query to filter by name
- [ ] Implement fuzzy/partial matching
- [ ] Test search UX

**Acceptance Criteria:**

- Can search by doctor name
- Results filter correctly

---

### Issue #9: Add appointment rescheduling UI

**Labels:** `enhancement`, `priority: high`, `feature`

**Problem:** API exists but no patient-facing UI for rescheduling.

**Tasks:**

- [ ] Add reschedule button to appointments
- [ ] Create date/time picker for new slot
- [ ] Connect to reschedule mutation
- [ ] Show confirmation dialog

**Acceptance Criteria:**

- Patients can reschedule their appointments
- Confirmation shows new time

---

## 🟡 P2 - Medium Priority (Fix After Launch)

### Issue #10: Complete hospitals page

**Labels:** `enhancement`, `priority: medium`, `feature`

**Problem:** Hospitals page shows "Coming Soon" placeholder.

**Tasks:**

- [ ] Create hospitals listing component
- [ ] Connect to facilities query (type: hospital)
- [ ] Add search and filter
- [ ] Add hospital detail page

---

### Issue #11: Complete laboratories page

**Labels:** `enhancement`, `priority: medium`, `feature`

**Problem:** Labs page shows "Coming Soon" placeholder.

**Tasks:**

- [ ] Create labs listing component
- [ ] Connect to facilities query (type: laboratory)
- [ ] Add search and filter

---

### Issue #12: Complete pharmacies page

**Labels:** `enhancement`, `priority: medium`, `feature`

**Problem:** Pharmacies page shows "Coming Soon" placeholder.

**Tasks:**

- [ ] Create pharmacies listing component
- [ ] Connect to facilities query (type: pharmacy)
- [ ] Add search and filter

---

### Issue #13: Add accessibility improvements

**Labels:** `enhancement`, `priority: medium`, `accessibility`

**Problem:** Missing WCAG compliance features.

**Tasks:**

- [ ] Add skip-to-main link
- [ ] Improve focus indicators
- [ ] Add ARIA landmarks
- [ ] Connect form errors with aria-describedby
- [ ] Audit image alt texts

---

### Issue #14: Implement SEO enhancements

**Labels:** `enhancement`, `priority: medium`, `seo`

**Problem:** Limited meta tags and no structured data.

**Tasks:**

- [ ] Add JSON-LD structured data
- [ ] Create dynamic sitemap.xml
- [ ] Add Open Graph images
- [ ] Configure robots.txt

---

### Issue #15: Add prescription management (scaffolding)

**Labels:** `enhancement`, `priority: medium`, `feature`

**Problem:** No prescription system for doctors.

**Tasks:**

- [ ] Design prescription schema
- [ ] Create prescription form component
- [ ] Add to appointment flow
- [ ] Patient can view prescriptions

---

## 🔵 P3 - Low Priority (Future Enhancement)

### Issue #16: Add bundle analyzer

**Labels:** `enhancement`, `priority: low`, `performance`

### Issue #17: Implement dark mode toggle on public site

**Labels:** `enhancement`, `priority: low`, `ui`

### Issue #18: Add multi-language support

**Labels:** `enhancement`, `priority: low`, `i18n`

### Issue #19: Create API documentation

**Labels:** `documentation`, `priority: low`

### Issue #20: Add database seed script

**Labels:** `enhancement`, `priority: low`, `dx`

---

## Progress Tracking

| Issue                     | Status         | Assignee | PR  |
| ------------------------- | -------------- | -------- | --- |
| #1 Testing Infrastructure | ✅ Complete    | -        | -   |
| #2 Security Headers       | 🔄 In Progress | -        | -   |
| #3 Error Monitoring       | ⬜ Not Started | -        | -   |
| #4 CORS Fix               | ⬜ Not Started | -        | -   |
| #5 Email Reminders        | ⬜ Not Started | -        | -   |
| #6 Review UI              | ⬜ Not Started | -        | -   |
| #7 Notification Center    | ⬜ Not Started | -        | -   |
| #8 Doctor Name Search     | ⬜ Not Started | -        | -   |
| #9 Reschedule UI          | ⬜ Not Started | -        | -   |
| #10 Hospitals Page        | ⬜ Not Started | -        | -   |
| #11 Labs Page             | ⬜ Not Started | -        | -   |
| #12 Pharmacies Page       | ⬜ Not Started | -        | -   |
| #13 Accessibility         | ⬜ Not Started | -        | -   |
| #14 SEO                   | ⬜ Not Started | -        | -   |
| #15 Prescriptions         | ⬜ Not Started | -        | -   |

---

_Track progress by updating status: ⬜ Not Started | 🔄 In Progress | ✅ Complete_
