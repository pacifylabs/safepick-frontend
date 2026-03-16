# SafePick — Full Implementation Plan
**Version:** 2.0 (Revised — Delegate Dashboard Added)
**Stack:** Next.js (App Router) · NestJS · PostgreSQL · Prisma · FCM · Twilio
**Methodology:** Agile · TDD · Feature-by-feature deploy
**Source:** PRD v2.0 + Flowchart v2.0 + Delegate Dashboard addition (post-Feature 07 review)

---

## Revision Notes (v1.0 → v2.0)

The following change was made after Feature 07 review:

> **A new Feature 08 (Delegate Authentication & Dashboard) has been inserted.**
> The delegate was previously a passive actor with no persistent authenticated identity.
> This created two problems: (1) delegates serving multiple families had no unified view
> of their day, and (2) the QR display page was a public route with no authentication gate.
> Feature 08 resolves both by giving delegates a proper authenticated account and dashboard.

**What changed:**

| Old Number | New Number | Feature |
|------------|------------|---------|
| Feature 08 | Feature 09 | Real-time Parent Pickup Authorization |
| Feature 09 | Feature 10 | Secondary Guardian Fallback + Override Codes |
| Feature 10 | Feature 11 | Release Confirmation + Clock-out Attendance |
| Feature 11 | Feature 12 | Audit Log + Incident Reporting |
| Feature 12 | Feature 13 | Emergency Controls |
| Feature 13 | Feature 14 | GPS Tracking (blocked) |
| Feature 14 | Feature 15 | Monetisation (blocked) |

**Feature 07 note:** The `/gate` QR display page built in Feature 07 is currently
a public route. Feature 08 secures it behind delegate authentication. No rework
of Feature 07 UI is required — only middleware protection is added.

---

## How to Use This Document

Each feature is structured as a self-contained implementation unit with:

- **Scope** — what is built (frontend + backend)
- **Flowchart ref** — which blocks this feature covers
- **API contract** — exact request/response payloads
- **Frontend checklist** — components and states to implement
- **Backend checklist** — endpoints, services, guards to implement
- **TDD anchors** — test cases to write BEFORE coding
- **Deploy gate** — what must pass before you ship this feature

Work through each sprint in order. Every feature has a deploy gate —
do not proceed to the next feature until the gate passes.

---

## Project Structure Overview

```
safepick/
├── apps/
│   ├── web/                  # Next.js — Parent PWA
│   ├── delegate/             # Next.js — Delegate PWA (NEW in Feature 08)
│   ├── school/               # Next.js — School admin + gate dashboard
│   └── api/                  # NestJS — Core backend
├── packages/
│   ├── types/                # Shared TypeScript types & Zod schemas
│   ├── ui/                   # Shared component library
│   └── config/               # Shared env + constants
└── prisma/
    └── schema.prisma         # Single source of truth for data model
```

---

## Sprint Overview

| Sprint | Feature | Name | Deployable After |
|--------|---------|------|-----------------|
| **Sprint 1A** | Feature 01 | Parent Auth + OTP | Feature 01 |
| **Sprint 1B** | Feature 02 | Child Registration + Secondary Guardian | Feature 02 |
| **Sprint 1C** | Feature 03 | School Linking + Adoption Request | Feature 03 |
| **Sprint 1D** | Feature 04 | Delegate Invite + KYC Flow | Feature 04 |
| **Sprint 1E** | Feature 05 | Parent Delegate Approval + Authorization Rules | Feature 05 |
| **Sprint 1F** | Feature 06 | Attendance — Drop-off Clock-in | Feature 06 |
| **Sprint 1G** | Feature 07 | Gate Verification — QR + OTP Chain | Feature 07 |
| **Sprint 1H** | **Feature 08** | **Delegate Authentication & Dashboard** ← NEW | Feature 08 |
| **Sprint 1I** | Feature 09 | Real-time Parent Pickup Authorization | Feature 09 |
| **Sprint 1J** | Feature 10 | Secondary Guardian Fallback + Override Codes | Feature 10 |
| **Sprint 1K** | Feature 11 | Release Confirmation + Clock-out Attendance | Feature 11 |
| **Sprint 1L** | Feature 12 | Audit Log + Incident Reporting | Feature 12 |
| **Sprint 1M** | Feature 13 | Emergency Controls — Panic, Revoke, Delegate SOS | Feature 13 |
| **Sprint 2** | Feature 14 | GPS Tracking (blocked — Decision #6 pending) | Feature 14 |
| **Sprint 3** | Feature 15 | Monetisation (blocked — Decision #8 pending) | Feature 15 |

---
---

# SPRINT 1 — CORE SYSTEM

---

## Feature 01 — Parent Authentication & OTP Verification

**Flowchart:** Blocks A1 → A2 → A3
**PRD ref:** Section 7.1 (Parent App)
**Status:** ✅ COMPLETE

### Scope
Full auth lifecycle: signup, phone OTP verification, JWT session, and the empty parent dashboard state.

### API Contract

#### `POST /auth/register`
```json
// REQUEST
{
  "fullName": "Amara Osei",
  "phone": "+2348012345678",
  "email": "amara@example.com",
  "password": "hashed_on_client_or_plain_https"
}

// RESPONSE 200
{
  "message": "OTP sent to +2348012345678",
  "otpToken": "eyJhbGci...",
  "expiresIn": 300
}

// RESPONSE 409
{
  "error": "PHONE_ALREADY_REGISTERED",
  "message": "An account with this phone number already exists."
}
```

#### `POST /auth/verify-otp`
```json
// REQUEST
{ "otpToken": "eyJhbGci...", "otp": "847291" }

// RESPONSE 200
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "usr_01HXYZ",
    "fullName": "Amara Osei",
    "phone": "+2348012345678",
    "email": "amara@example.com",
    "role": "PARENT",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}

// RESPONSE 400
{ "error": "OTP_INVALID_OR_EXPIRED", "message": "The code entered is incorrect or has expired." }
```

#### `POST /auth/resend-otp`
```json
// REQUEST
{ "otpToken": "eyJhbGci..." }
// RESPONSE 200
{ "message": "New OTP sent.", "otpToken": "eyJhbGci...", "expiresIn": 300 }
```

#### `POST /auth/refresh`
```json
// REQUEST
{ "refreshToken": "eyJhbGci..." }
// RESPONSE 200
{ "accessToken": "eyJhbGci...", "refreshToken": "eyJhbGci..." }
```

#### `POST /auth/login`
```json
// REQUEST
{ "phone": "+2348012345678", "password": "plain_password" }
// RESPONSE 200 — same shape as verify-otp response
```

### Frontend Checklist — `apps/web`
- [x] `/signup` — multi-step form
- [x] `/verify` — OTP input (6-digit, auto-submit)
- [x] Resend OTP with 60s cooldown
- [x] Error states: invalid OTP, expired OTP, phone taken
- [x] `/login` — phone + password form
- [x] JWT storage in httpOnly cookie
- [x] Auth context / provider
- [x] Protected route HOC
- [x] Empty parent dashboard shell

### Backend Checklist — `apps/api`
- [ ] `AuthModule` — `AuthService`, `AuthController`
- [ ] `UsersModule` — `User` entity (Prisma)
- [ ] OTP generation (6-digit, crypto-random)
- [ ] OTP stored as bcrypt hash in DB with expiry
- [ ] Twilio SMS integration
- [ ] JWT strategy — access (15min) + refresh (7d)
- [ ] `JwtAuthGuard` + `RolesGuard`
- [ ] Rate limiting on `/auth/verify-otp` (5 attempts max)

### TDD Anchors
```typescript
describe('AuthService', () => {
  it('should hash and store OTP on register')
  it('should return otpToken JWT on register')
  it('should reject invalid OTP')
  it('should reject expired OTP')
  it('should return accessToken + refreshToken on valid OTP')
  it('should invalidate OTP after successful verification')
  it('should block after 5 failed OTP attempts')
  it('should refresh access token with valid refresh token')
  it('should reject refresh with revoked refresh token')
})
```

### Deploy Gate ✅
- [x] Parent can sign up, receive OTP, verify, and land on dashboard
- [x] Invalid OTP is rejected with correct error
- [x] JWT auth guard blocks unauthenticated requests
- [ ] All TDD anchors passing

---

## Feature 02 — Child Registration & Mandatory Secondary Guardian

**Flowchart:** Blocks B1 → B2 → B3
**PRD ref:** Sections 5.2, 7.1
**Status:** ✅ COMPLETE

### Scope
Parent registers a child, system generates a unique SafePick ID, parent assigns a mandatory secondary guardian.

### API Contract

#### `POST /children`
```json
// REQUEST
{
  "fullName": "Zara Osei",
  "dateOfBirth": "2017-03-15",
  "grade": "Grade 3",
  "photo": "base64_or_upload_url",
  "secondaryGuardian": { "phone": "+2348099887766" }
}

// RESPONSE 201
{
  "child": {
    "id": "chd_01HXYZ",
    "safepickId": "SP-2025-00142",
    "fullName": "Zara Osei",
    "dateOfBirth": "2017-03-15",
    "grade": "Grade 3",
    "photoUrl": "https://cdn.safepick.io/children/chd_01HXYZ.jpg",
    "parentId": "usr_01HXYZ",
    "secondaryGuardianId": "usr_02HABC",
    "schoolId": null,
    "enrollmentStatus": "PENDING_SCHOOL",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}

// RESPONSE 400
{ "error": "SECONDARY_GUARDIAN_NOT_FOUND", "message": "No verified SafePick account found for this phone number." }
{ "error": "SECONDARY_GUARDIAN_CONFLICT", "message": "Secondary guardian cannot be the same account as the primary parent." }
```

#### `GET /children`
```json
// RESPONSE 200
{
  "children": [{
    "id": "chd_01HXYZ",
    "safepickId": "SP-2025-00142",
    "fullName": "Zara Osei",
    "grade": "Grade 3",
    "photoUrl": "...",
    "school": null,
    "enrollmentStatus": "PENDING_SCHOOL",
    "secondaryGuardian": { "id": "usr_02HABC", "fullName": "Kwame Osei", "phone": "+2348099887766" }
  }]
}
```

#### `GET /children/:childId`
```json
// RESPONSE 200 — full child record with delegates and authorization summary
```

#### `PATCH /children/:childId`
```json
// REQUEST — update name, grade, photo, or secondary guardian
{ "grade": "Grade 4" }
// RESPONSE 200 — updated child object
```

### Frontend Checklist — `apps/web`
- [x] `/dashboard/children/new` — 3-step form
- [x] Secondary guardian phone lookup UI
- [x] Error states: guardian not found, guardian is self
- [x] SafePick ID displayed on child card
- [x] Child card component with status badge
- [x] `PENDING_SCHOOL` empty state

### Backend Checklist — `apps/api`
- [ ] `ChildrenModule` — `Child` entity, service, controller
- [ ] SafePick ID generation — `SP-{YEAR}-{5-digit-seq}`
- [ ] Secondary guardian phone lookup
- [ ] Enforce: guardian ≠ parent, guardian must be verified
- [ ] Photo upload to object storage
- [ ] `GET /children` scoped to authenticated parent only

### TDD Anchors
```typescript
describe('ChildrenService', () => {
  it('should generate a unique SafePick ID on child creation')
  it('should reject secondary guardian with unregistered phone')
  it('should reject secondary guardian who is the parent themselves')
  it('should require secondaryGuardian field — cannot be null')
  it('should scope GET /children to the authenticated parent only')
  it('should store photo URL, not raw binary')
})
```

### Deploy Gate ✅
- [x] Parent can register a child end-to-end
- [x] Secondary guardian phone lookup works
- [x] SafePick ID is unique and formatted correctly
- [x] Child appears on dashboard with correct status badge
- [ ] All TDD anchors passing

---

## Feature 03 — School Linking & Parent-Led Adoption Request

**Flowchart:** Blocks B4 → B5 → B6 → B7/B8 → B9 → B10 → B11/B12
**PRD ref:** Sections 6.1, 6.2
**Status:** ✅ COMPLETE

### Scope
Parent searches for child's school. If it exists, enrollment is requested. If not, an adoption request is logged. When threshold is reached, school admin receives a self-serve onboarding link.

### API Contract

#### `GET /schools/search?q=greenfield`
```json
// RESPONSE 200
{
  "schools": [{
    "id": "sch_01HXYZ",
    "name": "Greenfield Academy",
    "address": "15 Palm Avenue, Lagos",
    "city": "Lagos",
    "country": "NG",
    "status": "ACTIVE",
    "studentCount": 420
  }]
}
```

#### `POST /children/:childId/school`
```json
// REQUEST
{ "schoolId": "sch_01HXYZ" }

// RESPONSE 200 — school ACTIVE
{ "enrollmentStatus": "PENDING_VERIFICATION", "message": "Enrollment request sent." }

// RESPONSE 200 — school NOT_REGISTERED
{
  "enrollmentStatus": "SCHOOL_NOT_ON_SAFEPICK",
  "adoptionRequestId": "req_01HXYZ",
  "requestCount": 4,
  "threshold": 10
}
```

#### `POST /schools/request`
```json
// REQUEST
{ "childId": "chd_01HXYZ", "schoolName": "Sunrise Montessori", "schoolAddress": "...", "city": "Abuja", "country": "NG" }
// RESPONSE 201
{ "adoptionRequestId": "req_01HABC", "message": "Request logged." }
```

#### `POST /schools/onboard`
```json
// REQUEST
{ "inviteToken": "tok_abc123", "adminName": "Mrs. Adeola Bello", "adminEmail": "...", "adminPhone": "...", "password": "..." }
// RESPONSE 201
{ "school": { "id": "sch_01HXYZ", "name": "Greenfield Academy", "status": "ACTIVE" }, "admin": { "id": "usr_03HABC", "role": "SCHOOL_ADMIN" } }
```

#### `PATCH /schools/:schoolId/enrollment/:childId`
```json
// REQUEST
{ "action": "APPROVE" }
// RESPONSE 200
{ "enrollmentStatus": "VERIFIED", "attendanceSyncEnabled": true }
```

### Frontend Checklist — `apps/web`
- [x] School search with debounced autocomplete
- [x] School result card with status badge
- [x] "Request SafePick at this school" CTA
- [x] Adoption request confirmation with progress bar
- [x] Enrollment pending state on child card

### Frontend Checklist — `apps/school`
- [x] School onboarding flow from email link
- [x] Admin profile setup form
- [x] Pending enrollment requests list
- [x] Approve / reject enrollment UI

### Backend Checklist — `apps/api`
- [ ] `SchoolsModule` — `School`, `AdoptionRequest`, `Enrollment` entities
- [ ] School search with fuzzy name match
- [ ] Adoption request deduplication
- [ ] Adoption threshold check — `SCHOOL_ADOPTION_THRESHOLD` env var
- [ ] Auto-trigger onboarding email via queue/job
- [ ] Secure onboarding invite token — signed JWT, single-use, 7d expiry
- [ ] Enrollment status state machine

### TDD Anchors
```typescript
describe('SchoolsService', () => {
  it('should return schools matching search query')
  it('should create adoption request and not duplicate per parent-school')
  it('should trigger onboarding email when threshold is reached')
  it('should not trigger email if threshold not yet met')
  it('should reject onboarding token if expired')
  it('should reject onboarding token if already used')
  it('should update enrollment status to VERIFIED on admin approval')
  it('should enable attendance sync after enrollment is VERIFIED')
})
```

### Deploy Gate ✅
- [x] Parent can search and link child to an active school
- [x] Adoption request is created for unlisted schools
- [x] School receives onboarding email when threshold is met
- [x] School admin can complete self-serve onboarding
- [x] School admin can approve / reject enrollments
- [ ] All TDD anchors passing

---

## Feature 04 — Delegate Invite & KYC Flow

**Flowchart:** Blocks C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8/C9
**PRD ref:** Section 7.1 (Delegate Management), Section 5.3
**Status:** ✅ COMPLETE

### Scope
Parent generates a secure invite link. Delegate opens it, verifies phone via OTP, submits KYC. System validates and matches or creates a delegate profile. Parent is notified.

**Note for Feature 08:** KYC completion in this feature creates a `DelegateProfile`.
Feature 08 upgrades this to a full authenticated `DelegateAccount` with login credentials.
The invite flow in this feature remains unchanged — Feature 08 adds a
"Create your delegate account" step after KYC approval.

### API Contract

#### `POST /delegates/invite`
```json
// REQUEST
{
  "childIds": ["chd_01HXYZ"],
  "relationship": "DRIVER",
  "kycLevel": "STANDARD",
  "expiresInHours": 48
}
// RESPONSE 201
{
  "inviteId": "inv_01HXYZ",
  "inviteToken": "tok_abc123...",
  "inviteUrl": "https://safepick.io/delegate/join?token=tok_abc123...",
  "expiresAt": "2025-01-03T00:00:00Z"
}
```

#### `GET /delegates/invite/:token/validate`
```json
// RESPONSE 200
{ "valid": true, "inviterName": "Amara Osei", "childNames": ["Zara Osei"], "relationship": "DRIVER", "expiresAt": "..." }
// RESPONSE 400
{ "error": "INVITE_INVALID", "message": "This invite link has expired or already been used." }
```

#### `POST /delegates/kyc/start`
```json
// REQUEST
{ "inviteToken": "tok_abc123...", "phone": "+2348055544433" }
// RESPONSE 200
{ "otpToken": "eyJhbGci...", "expiresIn": 300, "existingProfile": false }
```

#### `POST /delegates/kyc/submit`
```json
// REQUEST
{
  "otpToken": "eyJhbGci...",
  "otp": "928471",
  "fullName": "David Mensah",
  "idType": "NATIONAL_ID",
  "idNumber": "NGA-1234567",
  "idPhotoFront": "upload_url",
  "idPhotoBack": "upload_url",
  "selfiePhoto": "upload_url",
  "biometricTemplate": null
}
// RESPONSE 200 — submitted
{ "kycStatus": "PENDING", "delegateProfileId": "dlg_01HXYZ", "message": "Identity being verified." }
// RESPONSE 200 — existing match
{ "kycStatus": "MATCHED", "delegateProfileId": "dlg_EXISTING", "message": "Identity matched from previous verification." }
```

#### `GET /delegates/kyc/:kycId/status`
```json
// RESPONSE 200
{ "status": "APPROVED", "delegateProfileId": "dlg_01HXYZ", "failureReason": null }
```

#### `GET /delegates`
```json
// RESPONSE 200
{
  "delegates": [{
    "id": "dlg_01HXYZ",
    "fullName": "David Mensah",
    "phone": "+2348055544433",
    "relationship": "DRIVER",
    "photoUrl": "...",
    "kycStatus": "APPROVED",
    "authorizations": [{ "childId": "chd_01HXYZ", "childName": "Zara Osei", "status": "PENDING_PARENT_APPROVAL" }]
  }]
}
```

### Frontend Checklist — `apps/web` (parent side)
- [x] `/dashboard/delegates/invite` — invite form
- [x] Generated invite link with copy + share
- [x] Delegate list with KYC status badges
- [x] KYC pending and failed notification states

### Frontend Checklist — `apps/web` (delegate side — public route)
- [x] `/delegate/join?token=...` — invite landing page
- [x] Step 1: Phone OTP verification
- [x] Step 2: KYC form — name, ID, selfie
- [x] Step 3: Biometric enrollment (optional)
- [x] Step 4: Submission confirmation
- [x] Existing profile detection state
- [x] Expired token error page

### Backend Checklist — `apps/api`
- [ ] `DelegatesModule` — `DelegateProfile`, `DelegateInvite`, `KYCRecord` entities
- [ ] Invite token — signed JWT, configurable expiry, single-use
- [ ] Phone deduplication — match existing profile
- [ ] KYC document upload, encrypted at rest
- [ ] KYC validation — manual review queue; auto-approval stub for dev
- [ ] Parent notification on KYC pass/fail

### TDD Anchors
```typescript
describe('DelegatesService', () => {
  it('should generate a signed, single-use invite token')
  it('should reject expired invite token')
  it('should reject already-used invite token')
  it('should match existing delegate profile by phone number')
  it('should create new delegate profile if phone not found')
  it('should not allow KYC submission without valid OTP')
  it('should notify parent when KYC is approved')
  it('should notify parent when KYC is rejected')
  it('should store KYC documents as encrypted references, not inline')
})
```

### Deploy Gate ✅
- [x] Parent can generate and share invite link
- [x] Delegate can open link, verify phone, and submit KYC
- [x] Existing delegate profile is matched by phone
- [x] Parent receives notification on KYC outcome
- [ ] All TDD anchors passing

---

## Feature 05 — Parent Delegate Approval & Authorization Rules

**Flowchart:** Blocks C10 → C11 → C12/C13 → C14
**PRD ref:** Section 5.3, Section 7.1
**Status:** ✅ COMPLETE

### Scope
After KYC passes, parent approves or rejects the delegate per child with custom authorization rules.

### API Contract

#### `POST /authorizations`
```json
// REQUEST
{
  "delegateProfileId": "dlg_01HXYZ",
  "childId": "chd_01HXYZ",
  "authType": "RECURRING",
  "allowedDays": ["MON","TUE","WED","THU","FRI"],
  "allowedTimeStart": "14:00",
  "allowedTimeEnd": "17:00",
  "validFrom": "2025-01-01",
  "validUntil": null
}
// RESPONSE 201
{
  "authorization": {
    "id": "auth_01HXYZ",
    "delegateProfileId": "dlg_01HXYZ",
    "delegateName": "David Mensah",
    "childId": "chd_01HXYZ",
    "childName": "Zara Osei",
    "authType": "RECURRING",
    "allowedDays": ["MON","TUE","WED","THU","FRI"],
    "allowedTimeStart": "14:00",
    "allowedTimeEnd": "17:00",
    "validFrom": "2025-01-01",
    "validUntil": null,
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### `POST /authorizations/reject`
```json
// REQUEST
{ "delegateProfileId": "dlg_01HXYZ", "childId": "chd_01HXYZ", "reason": "No longer needed" }
// RESPONSE 200
{ "message": "Delegate rejected for Zara Osei. Profile retained for future use." }
```

#### `GET /authorizations?childId=chd_01HXYZ`
```json
// RESPONSE 200
{
  "authorizations": [{
    "id": "auth_01HXYZ",
    "delegate": { "id": "dlg_01HXYZ", "fullName": "David Mensah", "photoUrl": "...", "relationship": "DRIVER" },
    "authType": "RECURRING",
    "allowedDays": ["MON","TUE","WED","THU","FRI"],
    "allowedTimeStart": "14:00",
    "allowedTimeEnd": "17:00",
    "status": "ACTIVE",
    "validUntil": null
  }]
}
```

#### `PATCH /authorizations/:authId`
```json
// REQUEST
{ "allowedDays": ["MON","WED","FRI"], "allowedTimeEnd": "16:30" }
// RESPONSE 200 — updated authorization object
```

#### `DELETE /authorizations/:authId`
```json
// RESPONSE 200
{ "message": "Authorization revoked. Takes effect immediately.", "revokedAt": "2025-01-10T14:32:00Z" }
```

### Frontend Checklist — `apps/web`
- [x] Pending approval notification card on dashboard
- [x] Delegate approval modal with delegate details
- [x] Authorization rules form — type, days, time window, dates
- [x] Active authorizations list per child
- [x] Edit rules modal — pre-filled, fully functional
- [x] Suspend toggle with confirmation sheet
- [x] Revoke single authorization with animation
- [x] Revoke all access with type-to-confirm

### Backend Checklist — `apps/api`
- [ ] `AuthorizationsModule` — `Authorization` entity with status state machine
- [ ] Enforce: authorization only if KYC is APPROVED
- [ ] Authorization validity check helper — enforces day/time rules at pickup
- [ ] SMS notification to delegate on approval
- [ ] Push notification to parent on status change
- [ ] `DELETE` sets REVOKED, not hard delete

### TDD Anchors
```typescript
describe('AuthorizationsService', () => {
  it('should reject authorization creation if delegate KYC is not APPROVED')
  it('should create authorization with ACTIVE status on parent approval')
  it('should notify delegate via SMS on authorization activation')
  it('should enforce allowedDays rule at pickup time')
  it('should enforce allowedTimeStart/End rule at pickup time')
  it('should enforce validUntil expiry rule at pickup time')
  it('should set status to REVOKED on delete, not hard delete')
  it('should notify parent when authorization is about to expire')
})
```

### Deploy Gate ✅
- [x] Parent can approve a KYC-verified delegate with custom rules
- [x] Authorization rules are enforced correctly
- [x] Delegate receives SMS confirmation
- [x] Edit rules modal is fully functional with success toast
- [x] Suspend, revoke, revoke-all all work correctly
- [ ] All TDD anchors passing

---

## Feature 06 — Attendance: Morning Drop-Off Clock-In

**Flowchart:** Blocks D1 → D2 → D3
**PRD ref:** Section 7.1 (Attendance), Section 7.3
**Status:** ✅ COMPLETE

### Scope
School staff logs child arrival. Parent receives push notification. Attendance record created. Dashboard activity feed populated for the first time.

### API Contract

#### `POST /attendance/clock-in`
```json
// REQUEST
{ "safepickId": "SP-2025-00142", "schoolId": "sch_01HXYZ", "method": "MANUAL" }
// RESPONSE 201
{
  "attendance": {
    "id": "att_01HXYZ", "childId": "chd_01HXYZ", "childName": "Zara Osei",
    "schoolId": "sch_01HXYZ", "type": "CLOCK_IN",
    "timestamp": "2025-01-06T07:42:00Z", "loggedBy": "usr_staff_01", "method": "MANUAL"
  },
  "parentNotified": true
}
// RESPONSE 404
{ "error": "CHILD_NOT_FOUND", "message": "No child with SafePick ID SP-2025-00142 is enrolled at this school." }
```

#### `GET /attendance?childId=chd_01HXYZ&from=2025-01-01&to=2025-01-31`
```json
// RESPONSE 200
{
  "records": [
    { "id": "att_01HXYZ", "type": "CLOCK_IN", "timestamp": "2025-01-06T07:42:00Z", "method": "MANUAL" },
    { "id": "att_02HXYZ", "type": "CLOCK_OUT", "timestamp": "2025-01-06T15:10:00Z", "delegateName": "David Mensah", "method": "QR" }
  ],
  "summary": { "totalDaysPresent": 18, "totalDaysAbsent": 2, "month": "2025-01" }
}
```

#### `GET /attendance/school/:schoolId/daily?date=2025-01-06`
```json
// RESPONSE 200
{ "date": "2025-01-06", "present": 312, "absent": 18, "records": [] }
```

### Frontend Checklist — `apps/web` (parent)
- [x] Drop-off push + in-app notification
- [x] Attendance history view — monthly, filterable
- [x] Monthly summary card on child profile
- [x] Recent activity feed on dashboard

### Frontend Checklist — `apps/school`
- [x] Clock-in interface — SafePick ID entry or QR scan
- [x] Student found card + already clocked-in state
- [x] Success state with parent notified confirmation
- [x] Daily attendance dashboard with export CSV

### Backend Checklist — `apps/api`
- [ ] `AttendanceModule` — `AttendanceRecord` entity
- [ ] Clock-in validates child enrolled at requesting school
- [ ] No duplicate clock-in for same child same day
- [ ] FCM push to parent on clock-in
- [ ] Attendance summary via DB aggregation

### TDD Anchors
```typescript
describe('AttendanceService', () => {
  it('should reject clock-in if child not enrolled at requesting school')
  it('should not create duplicate clock-in for same child same day')
  it('should send push notification to parent on clock-in')
  it('should return correct monthly attendance summary')
  it('should return 404 for unknown SafePick ID')
})
```

### Deploy Gate ✅
- [x] School staff can log morning arrival
- [x] Parent receives push notification within 3 seconds
- [x] Duplicate clock-ins blocked
- [x] Attendance history visible to parent
- [ ] All TDD anchors passing

---

## Feature 07 — Gate Verification: QR → OTP → Biometric Chain

**Flowchart:** Blocks E1 → E2 → E3 → E4 → E5/E6 → E7 → E8/E9 → E10/E11
**PRD ref:** Section 5.1, Decisions #1, #5, #9
**Status:** 🔄 IN PROGRESS

### Scope
Delegate displays dynamic QR code. School staff scans it. System validates or falls back to OTP then biometric. Feature ends when session status = AWAITING_PARENT.

**Security note:** The `/gate` QR page built in this feature is currently
a public route. Feature 08 secures it behind delegate authentication.
No UI rework required — Feature 08 only adds middleware protection and
replaces the `authorizationId` query param with the delegate's session.

### API Contract

#### `GET /verification/qr-token?authorizationId=auth_01HXYZ`
```json
// RESPONSE 200
{
  "qrToken": "eyJhbGci...",
  "qrPayload": "SP-QR:eyJhbGci...",
  "expiresAt": "2025-01-06T15:25:00Z",
  "delegateName": "David Mensah",
  "childName": "Zara Osei"
}
// RESPONSE 403
{ "error": "AUTHORIZATION_NOT_ACTIVE", "message": "Your authorization for Zara is not valid today or at this time." }
```

#### `POST /verification/scan-qr`
```json
// REQUEST
{ "qrPayload": "SP-QR:eyJhbGci...", "schoolId": "sch_01HXYZ" }
// RESPONSE 200
{
  "verificationSessionId": "vsn_01HXYZ",
  "status": "QR_VERIFIED",
  "delegate": { "id": "dlg_01HXYZ", "fullName": "David Mensah", "photoUrl": "...", "relationship": "DRIVER" },
  "child": { "id": "chd_01HXYZ", "fullName": "Zara Osei", "photoUrl": "..." },
  "authorizationId": "auth_01HXYZ",
  "nextStep": "PARENT_AUTHORIZATION"
}
// RESPONSE 400
{ "error": "QR_EXPIRED", "verificationSessionId": "vsn_01HXYZ", "nextStep": "OTP_FALLBACK" }
// RESPONSE 403
{ "error": "AUTHORIZATION_RULES_VIOLATED", "message": "David Mensah is not authorized to pick up Zara today (Saturday).", "nextStep": "DENY" }
```

#### `POST /verification/trigger-otp`
```json
// REQUEST
{ "verificationSessionId": "vsn_01HXYZ" }
// RESPONSE 200
{ "message": "OTP sent.", "otpToken": "eyJhbGci...", "expiresIn": 120 }
```

#### `POST /verification/submit-otp`
```json
// REQUEST
{ "verificationSessionId": "vsn_01HXYZ", "otp": "847291" }
// RESPONSE 200
{ "status": "OTP_VERIFIED", "nextStep": "PARENT_AUTHORIZATION" }
// RESPONSE 400
{ "error": "OTP_INVALID", "attemptsRemaining": 2, "nextStep": "BIOMETRIC_FALLBACK" }
```

#### `POST /verification/submit-biometric`
```json
// REQUEST
{ "verificationSessionId": "vsn_01HXYZ", "biometricTemplate": "base64...", "deviceId": "gate_device_01" }
// RESPONSE 200
{ "status": "BIOMETRIC_VERIFIED", "nextStep": "PARENT_AUTHORIZATION" }
// RESPONSE 400
{ "error": "BIOMETRIC_FAILED", "nextStep": "OTP_FALLBACK", "message": "Biometric failed. Falling back to OTP." }
```

#### `GET /verification/session/:sessionId`
```json
// RESPONSE 200
{
  "sessionId": "vsn_01HXYZ",
  "status": "AWAITING_PARENT",
  "verificationMethod": "QR",
  "delegate": {},
  "child": {},
  "createdAt": "...",
  "expiresAt": "..."
}
```

### Frontend Checklist — `apps/web` (delegate PWA)
- [x] `/gate` — full-screen QR display with countdown timer
- [x] Auto-refresh QR on expiry
- [x] Authorization not valid error state

### Frontend Checklist — `apps/school` (gate kiosk)
- [x] Full-screen kiosk layout — landscape tablet
- [x] Animated QR scanner with corner brackets
- [x] Manual SafePick ID entry fallback
- [x] OTP entry — 6 boxes tablet-sized
- [x] Biometric prompt with fingerprint animation
- [x] Session status banner throughout
- [x] Fallback amber banner on method switch
- [x] Rules violated overlay
- [x] Awaiting parent countdown state

### Backend Checklist — `apps/api`
- [ ] `VerificationModule` — `VerificationSession` entity
- [ ] QR token: server-signed JWT, 15-min expiry, single-use
- [ ] QR scan validates: signature, expiry, authorization rules
- [ ] OTP: session-scoped, 2-min expiry, 3 attempts max
- [ ] Biometric stub — auto-fallback to OTP on failure (Decision #9)
- [ ] Session state machine — enforce valid transitions only
- [ ] WebSocket gateway for real-time status push to school

### TDD Anchors
```typescript
describe('VerificationService', () => {
  it('should generate a signed, time-bound QR token')
  it('should reject expired QR token')
  it('should reject QR token used more than once')
  it('should reject QR when authorization rules are violated (wrong day)')
  it('should reject QR when authorization rules are violated (outside time window)')
  it('should fall back to OTP when QR is expired')
  it('should auto-fall back to OTP when biometric fails (Decision #9)')
  it('should block OTP after 3 failed attempts')
  it('should transition session status correctly through the chain')
  it('should not allow session status to regress')
})
```

### Deploy Gate ✅
- [x] Delegate can display valid QR in the PWA
- [x] School staff can scan QR and see delegate + child info
- [x] QR expiry triggers automatic OTP fallback
- [x] OTP fallback works end-to-end
- [x] Biometric failure auto-reverts to OTP (Decision #9)
- [x] Authorization rule violations enforced at scan time
- [ ] `/gate` page secured behind delegate auth (done in Feature 08)
- [ ] All TDD anchors passing

---
---

## Feature 08 — Delegate Authentication & Dashboard ← NEW

**Flowchart:** Extension of Blocks C4–C14 (delegate actor expanded)
**PRD ref:** Section 7.2 (Delegate Experience)
**Status:** 🔲 NOT STARTED
**Depends on:** Features 04, 05, 07

### Scope

Delegates get a fully authenticated identity and a dedicated dashboard.
This feature upgrades the delegate from a passive profile to an active
authenticated user with their own workspace.

**What gets built:**
1. Delegate account creation — triggered after KYC approval in Feature 04
2. Delegate login — phone + OTP (no password, same pattern as parent)
3. Delegate dashboard — today's pickups, authorized children, pending requests
4. Authorized children list — all children they are cleared to pick up
5. Pickup request inbox — real-time notifications from schools
6. Pickup schedule + alarm — set reminders per child per day
7. Schools list — schools they are authorized at with gate entry info
8. SOS button — panic during active pickup, alerts parents + emergency contacts
9. `/gate` page secured — QR display now requires delegate to be logged in

**Architecture decision:** Delegate app lives as a separate route group
in `apps/web` — `app/(delegate)/` — sharing all components, design system,
hooks, and services with the parent app. No separate app needed until scale.

### API Contract

#### `POST /auth/delegate/login`
```json
// REQUEST
{ "phone": "+2348055544433" }
// RESPONSE 200
{ "message": "OTP sent.", "otpToken": "eyJhbGci...", "expiresIn": 300 }
```

#### `POST /auth/delegate/verify-otp`
```json
// REQUEST
{ "otpToken": "eyJhbGci...", "otp": "847291" }
// RESPONSE 200
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "delegate": {
    "id": "dlg_01HXYZ",
    "fullName": "David Mensah",
    "phone": "+2348055544433",
    "photoUrl": null,
    "kycStatus": "APPROVED",
    "role": "DELEGATE",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
// RESPONSE 403
{ "error": "DELEGATE_NOT_VERIFIED", "message": "Your identity has not been verified yet." }
```

#### `GET /delegate/me`
```json
// RESPONSE 200
{
  "id": "dlg_01HXYZ",
  "fullName": "David Mensah",
  "phone": "+2348055544433",
  "photoUrl": null,
  "kycStatus": "APPROVED",
  "totalAuthorizations": 4,
  "activeAuthorizations": 3,
  "pendingPickupsToday": 2
}
```

#### `GET /delegate/authorizations`
```json
// RESPONSE 200
{
  "authorizations": [
    {
      "id": "auth_01HXYZ",
      "status": "ACTIVE",
      "authType": "RECURRING",
      "allowedDays": ["MON","TUE","WED","THU","FRI"],
      "allowedTimeStart": "14:00",
      "allowedTimeEnd": "17:00",
      "child": {
        "id": "chd_01HXYZ",
        "fullName": "Zara Osei",
        "grade": "Primary 3",
        "photoUrl": null,
        "safepickId": "SP-2025-00142"
      },
      "school": {
        "id": "sch_01HXYZ",
        "name": "Greenfield Academy",
        "address": "15 Palm Avenue, Lagos",
        "gateInstructions": "Report to the security desk. Show your QR code."
      },
      "parent": {
        "fullName": "Amara Osei",
        "phone": "+2348012345678"
      }
    }
  ]
}
```

#### `GET /delegate/schedule?date=2025-01-06`
```json
// RESPONSE 200
{
  "date": "2025-01-06",
  "pickups": [
    {
      "authorizationId": "auth_01HXYZ",
      "childName": "Zara Osei",
      "schoolName": "Greenfield Academy",
      "pickupWindowStart": "14:00",
      "pickupWindowEnd": "17:00",
      "alarmSet": true,
      "alarmTime": "13:30",
      "status": "PENDING"
    }
  ]
}
```

#### `POST /delegate/schedule/alarm`
```json
// REQUEST
{
  "authorizationId": "auth_01HXYZ",
  "date": "2025-01-06",
  "alarmTime": "13:30",
  "enabled": true
}
// RESPONSE 200
{ "alarmId": "alm_01HXYZ", "alarmTime": "13:30", "enabled": true }
```

#### `GET /delegate/pickup-requests`
```json
// RESPONSE 200
{
  "requests": [
    {
      "id": "pkr_01HXYZ",
      "status": "PENDING_GATE",
      "child": { "fullName": "Zara Osei", "photoUrl": null },
      "school": { "name": "Greenfield Academy", "address": "..." },
      "requestedAt": "2025-01-06T14:55:00Z",
      "qrAvailable": true,
      "authorizationId": "auth_01HXYZ"
    }
  ]
}
```

#### `POST /delegate/sos`
```json
// REQUEST
{
  "authorizationId": "auth_01HXYZ",
  "location": { "latitude": 6.5244, "longitude": 3.3792 },
  "reason": "SUSPECTED_THREAT"
}
// RESPONSE 200
{
  "sosId": "sos_01HXYZ",
  "parentNotified": true,
  "emergencyServicesAlerted": false,
  "createdAt": "2025-01-06T15:30:00Z"
}
```

#### `GET /verification/qr-token` _(updated — now uses delegate session)_
```json
// Previously: GET /verification/qr-token?authorizationId=auth_01HXYZ (public)
// Now: GET /verification/qr-token?authorizationId=auth_01HXYZ
//      with Authorization: Bearer [delegate JWT] header
// Response shape unchanged — only authentication requirement added
```

### Frontend Checklist — `apps/web/(delegate)/`

#### Auth pages
- [ ] `/delegate/login` — phone entry + OTP verification
  Same dark navy auth card pattern as parent login
  Section label "DELEGATE LOGIN"
  After verify: router.push('/delegate/dashboard')

- [ ] `/delegate/verify` — OTP screen
  Same OtpInput component reused
  Error state: DELEGATE_NOT_VERIFIED — show KYC pending message

#### Dashboard
- [ ] `/delegate/dashboard` — home
  Greeting + delegate name
  Today's pickup summary card: how many pickups today
  Active authorizations count
  Upcoming pickup cards (next 2 pickups chronologically)
  Quick action buttons: "Show my QR" + "My schedule" + "SOS"

- [ ] Today's pickup card component
  Child avatar + name + school + pickup window
  Status badge: PENDING / IN_PROGRESS / COMPLETE
  "Show QR" button → opens full-screen QR for that authorization

#### Authorized children
- [ ] `/delegate/children` — list
  Card per authorization showing:
  Child photo + name + grade
  School name + address
  Parent name (first name only for privacy)
  Allowed days chips + time window
  Authorization status badge
  Empty state: "You have no active authorizations."

#### Schedule + alarms
- [ ] `/delegate/schedule` — weekly view
  Day selector row (Mon–Sun chips)
  Pickup cards for selected day
  Each card: child + school + time window
  Alarm toggle per pickup: off / set time
  Time picker for alarm (30/45/60 min before pickup)
  Push notification scheduled on alarm set

#### Pickup requests
- [ ] `/delegate/pickups` — inbox
  Real-time list via WebSocket or polling
  Pending request card:
    Child name + school + "Gate is ready for you"
    "Show QR code" primary button → full-screen QR display
  Past pickups history — last 10

- [ ] `/delegate/gate` — protected QR display
  Same full-screen QR UI built in Feature 07
  Now protected: requires delegate JWT
  QR fetched using delegate session — no authorizationId query param needed
  Delegate selects which authorization to show QR for
    if only one active today: auto-selects
    if multiple: shows child selector first

#### Schools
- [ ] `/delegate/schools` — list
  Card per unique school they are authorized at:
  School name + address
  Gate instructions text
  Children they pick up from this school (chips)
  Map link (opens native maps app)

#### SOS
- [ ] SOS button — available from dashboard and gate page
  Floating red button bottom-right on delegate app
  On tap: 3-second hold to confirm (prevents accidental trigger)
    Hold progress ring around button
    "Hold to send SOS" label
  Confirmation sent screen:
    "SOS sent. Parent has been notified."
    Location sharing toggle
    Cancel SOS button (within 30 seconds)

#### Layout
- [ ] `app/(delegate)/layout.tsx`
  Same dark navy sidebar pattern as parent app
  Nav items:
    /delegate/dashboard    Home icon         "Home"
    /delegate/children     Users icon        "My children"
    /delegate/schedule     Calendar icon     "Schedule"
    /delegate/pickups      Bell icon         "Pickups"
    /delegate/schools      Building icon     "Schools"
  Mobile: bottom nav with 5 items
  Persistent SOS button: absolute bottom-right floating

### Backend Checklist — `apps/api`

- [ ] `DelegateAuthModule` — separate from parent auth
  `POST /auth/delegate/login` — phone OTP flow
  OTP delivery and verification same pattern as parent
  JWT role: `DELEGATE`
  Enforce: delegate KYC must be `APPROVED` before login is permitted

- [ ] `DelegateModule` — delegate-scoped endpoints
  `GET /delegate/me` — profile + stats
  `GET /delegate/authorizations` — all active authorizations with nested child, school, parent
  `GET /delegate/schedule?date=` — pickups for a day
  `POST /delegate/schedule/alarm` — set/update alarm for a pickup
  `GET /delegate/pickup-requests` — incoming requests
  `POST /delegate/sos` — trigger SOS event

- [ ] Update `VerificationModule`
  `GET /verification/qr-token` — add `JwtDelegateAuthGuard`
  Derive authorizationId from authenticated delegate session
  Accept explicit authorizationId param only if it belongs to the delegate

- [ ] `SosModule` — `SosEvent` entity
  Store: delegateId, authorizationId, location, reason, createdAt
  Trigger: FCM push to parent(s) of affected child(ren)
  Trigger: SMS to parent phone
  Audit log entry: SOS_TRIGGERED

- [ ] Update Prisma schema
  Add `DelegateAccount` model (separate from `DelegateProfile`)
  DelegateAccount links to DelegateProfile
  Add `SosEvent` model
  Add `PickupAlarm` model

- [ ] `DelegateAuthGuard` — new JWT guard for DELEGATE role

### Updated Prisma Schema Additions
```prisma
model DelegateAccount {
  id                String          @id @default(cuid())
  delegateProfileId String          @unique
  phone             String          @unique
  fcmToken          String?
  phoneVerified     Boolean         @default(false)
  createdAt         DateTime        @default(now())

  profile    DelegateProfile @relation(fields: [delegateProfileId], references: [id])
  alarms     PickupAlarm[]
  sosEvents  SosEvent[]
}

model PickupAlarm {
  id                String          @id @default(cuid())
  delegateAccountId String
  authorizationId   String
  date              DateTime
  alarmTime         String
  enabled           Boolean         @default(true)
  createdAt         DateTime        @default(now())

  delegate DelegateAccount @relation(fields: [delegateAccountId], references: [id])
}

model SosEvent {
  id                String          @id @default(cuid())
  delegateAccountId String
  authorizationId   String
  latitude          Float?
  longitude         Float?
  reason            String?
  parentNotified    Boolean         @default(false)
  resolvedAt        DateTime?
  createdAt         DateTime        @default(now())

  delegate DelegateAccount @relation(fields: [delegateAccountId], references: [id])
}
```

### TDD Anchors
```typescript
describe('DelegateAuthService', () => {
  it('should reject login if delegate KYC is not APPROVED')
  it('should issue DELEGATE role JWT on successful OTP verification')
  it('should reject PARENT JWT on delegate-only endpoints')
  it('should reject DELEGATE JWT on parent-only endpoints')
})

describe('DelegateService', () => {
  it('should return only authorizations belonging to the authenticated delegate')
  it('should return correct schedule for the requested date')
  it('should create alarm and not duplicate for same authorization + date')
  it('should delete alarm when enabled is set to false')
  it('should trigger FCM push to parent on SOS event')
  it('should trigger SMS to parent on SOS event')
  it('should create audit log entry on SOS trigger')
  it('should scope GET /verification/qr-token to authenticated delegate only')
  it('should reject qr-token request if authorization does not belong to delegate')
})
```

### Deploy Gate ✅
- [ ] Delegate can log in with phone OTP
- [ ] Unverified delegate (KYC pending) cannot log in
- [ ] Delegate dashboard shows today's pickups correctly
- [ ] Authorized children list shows all active authorizations
- [ ] Schedule view shows correct pickups per day
- [ ] Alarm can be set, updated, and disabled per pickup
- [ ] QR display page requires delegate login
- [ ] QR page shows child selector when multiple active authorizations exist
- [ ] Schools list shows gate instructions per school
- [ ] SOS button requires 3-second hold before triggering
- [ ] SOS notifies parent via push + SMS
- [ ] SOS creates audit log entry
- [ ] All TDD anchors passing

---
---

## Feature 09 — Real-Time Parent Pickup Authorization

**Flowchart:** Blocks F1 → F2 → F3 → F4/F5
**PRD ref:** Section 7.1 (Pickup Authorization)
**Status:** 🔲 NOT STARTED
**Depends on:** Feature 08 (delegate auth secured)

### Scope
After gate identity is verified (Feature 07), system sends the primary parent a
real-time push + SMS notification requesting approval or denial. Parent responds
within a configurable timeout window.

### API Contract

#### `POST /pickup/request`
```json
// REQUEST (internal — triggered by verification service)
{ "verificationSessionId": "vsn_01HXYZ", "verificationMethod": "QR" }
// RESPONSE 201
{
  "pickupRequestId": "pkp_01HXYZ",
  "status": "AWAITING_PARENT",
  "timeoutSeconds": 180,
  "notifiedAt": "2025-01-06T15:05:00Z"
}
```

#### `POST /pickup/:pickupRequestId/respond`
```json
// REQUEST
{ "decision": "APPROVE", "responderId": "usr_01HXYZ" }
// RESPONSE 200 — approved
{
  "pickupRequestId": "pkp_01HXYZ",
  "status": "APPROVED",
  "respondedBy": "PRIMARY_PARENT",
  "respondedAt": "2025-01-06T15:06:12Z",
  "schoolNotified": true
}
// RESPONSE 200 — denied
{
  "pickupRequestId": "pkp_01HXYZ",
  "status": "DENIED",
  "respondedBy": "PRIMARY_PARENT",
  "incidentId": "inc_01HXYZ",
  "schoolNotified": true
}
```

#### `GET /pickup/:pickupRequestId`
```json
// RESPONSE 200
{
  "pickupRequestId": "pkp_01HXYZ",
  "status": "AWAITING_PARENT",
  "delegate": {},
  "child": {},
  "timeoutAt": "2025-01-06T15:08:00Z",
  "secondsRemaining": 112
}
```

#### FCM Push Notification Payload
```json
{
  "title": "Pickup request for Zara",
  "body": "David Mensah (Driver) is at Greenfield Academy gate.",
  "data": {
    "type": "PICKUP_REQUEST",
    "pickupRequestId": "pkp_01HXYZ",
    "delegatePhotoUrl": "...",
    "childName": "Zara Osei",
    "schoolName": "Greenfield Academy",
    "deepLink": "safepick://pickup/pkp_01HXYZ"
  }
}
```

### Frontend Checklist — `apps/web` (parent)
- [ ] Real-time pickup notification banner (WebSocket or FCM foreground)
- [ ] Pickup approval modal — delegate photo, name, relationship, child, school, timestamp
- [ ] One-tap Approve / Deny buttons — large, accessible
- [ ] Countdown timer showing seconds remaining
- [ ] Post-approval confirmation: "Release authorized. School has been notified."
- [ ] Post-denial confirmation: "Release denied. Incident logged."
- [ ] Deep link handler for background FCM tap → `/pickup/:id`

### Frontend Checklist — `apps/school` (gate kiosk)
- [ ] Wire Feature 07 AWAITING_PARENT state to real WebSocket events
- [ ] Approved state — "Release authorized by Amara Osei"
- [ ] Denied state — "Release denied. Do not release child."
- [ ] Timed out state — triggers secondary guardian flow (Feature 10)

### Frontend Checklist — `apps/web/(delegate)/`
- [ ] Delegate receives notification when their pickup is approved
  Toast: "Zara's pickup has been approved. You're clear to go."
- [ ] Delegate receives notification when denied
  Toast danger: "Pickup denied by parent. Please contact Amara Osei."

### Backend Checklist — `apps/api`
- [ ] `PickupModule` — `PickupRequest` entity
- [ ] Pickup request created on verification session completion
- [ ] FCM push + Twilio SMS sent to primary parent simultaneously
- [ ] Timeout job via BullMQ — fires at `timeoutSeconds`
- [ ] On timeout: escalate to secondary guardian (Feature 10)
- [ ] WebSocket event emitted to school gate session on status change
- [ ] FCM push to delegate on approval or denial
- [ ] Audit log entry on every status transition

### TDD Anchors
```typescript
describe('PickupService', () => {
  it('should create a pickup request on verification session completion')
  it('should send FCM push to primary parent immediately')
  it('should send SMS to primary parent immediately')
  it('should accept APPROVE decision from primary parent')
  it('should accept DENY decision from primary parent')
  it('should reject response from non-authorized user')
  it('should trigger timeout job at correct interval')
  it('should escalate to secondary guardian on timeout')
  it('should not allow response after timeout has expired')
  it('should emit WebSocket event to school on status change')
  it('should notify delegate via FCM on approval or denial')
})
```

### Deploy Gate ✅
- [ ] Parent receives push + SMS within 3 seconds of gate scan
- [ ] Parent can approve or deny from the app
- [ ] School gate UI updates in real time on parent decision
- [ ] Delegate receives notification on approval or denial
- [ ] Timeout triggers correctly and escalates
- [ ] All TDD anchors passing

---

## Feature 10 — Secondary Guardian Fallback & Emergency Override

**Flowchart:** Blocks F6 → F7 → F8 → F9 → F10/F11
**PRD ref:** Sections 5.2, 7.1 (Emergency Controls), Decision #2
**Status:** 🔲 NOT STARTED

### Scope
If primary parent doesn't respond, secondary guardian is auto-notified.
If both unreachable, school uses a pre-generated emergency override code.
If no override code, child is held and incident is filed.

### API Contract

#### `POST /pickup/:pickupRequestId/escalate`
```json
// RESPONSE 200
{
  "pickupRequestId": "pkp_01HXYZ",
  "status": "AWAITING_SECONDARY",
  "secondaryGuardianNotifiedAt": "2025-01-06T15:08:01Z",
  "newTimeoutSeconds": 180
}
```

#### `POST /override-codes/generate`
```json
// REQUEST
{ "childId": "chd_01HXYZ", "schoolId": "sch_01HXYZ", "validForHours": 72, "maxUses": 1 }
// RESPONSE 201
{
  "overrideCode": {
    "id": "ovc_01HXYZ",
    "code": "SAFE-7742-XPQR",
    "childId": "chd_01HXYZ",
    "schoolId": "sch_01HXYZ",
    "expiresAt": "2025-01-09T15:00:00Z",
    "maxUses": 1,
    "usesRemaining": 1
  },
  "sentToSchool": true
}
```

#### `POST /pickup/:pickupRequestId/override`
```json
// REQUEST
{ "overrideCode": "SAFE-7742-XPQR", "schoolAdminId": "usr_staff_01" }
// RESPONSE 200
{
  "status": "APPROVED_VIA_OVERRIDE",
  "overrideCodeId": "ovc_01HXYZ",
  "auditEntryId": "aud_01HXYZ",
  "parentNotifiedAt": "2025-01-06T15:15:00Z"
}
// RESPONSE 400
{ "error": "OVERRIDE_CODE_INVALID", "message": "The code entered is invalid, expired, or already used." }
```

#### `POST /pickup/:pickupRequestId/hold`
```json
// REQUEST
{ "reason": "No override code available. Parent unreachable." }
// RESPONSE 200
{ "status": "CHILD_HELD", "incidentId": "inc_01HXYZ", "message": "Incident filed." }
```

#### `GET /override-codes?childId=chd_01HXYZ`
```json
// RESPONSE 200
{
  "overrideCodes": [{
    "id": "ovc_01HXYZ",
    "code": "SAFE-7742-XPQR",
    "schoolName": "Greenfield Academy",
    "expiresAt": "2025-01-09T15:00:00Z",
    "usesRemaining": 1,
    "status": "ACTIVE"
  }]
}
```

### Frontend Checklist — `apps/web` (parent)
- [ ] "Generate override code" button on child settings page
- [ ] Override code display — styled, easy to read, copy button
- [ ] Active override codes list with expiry countdown
- [ ] Post-override notification: "Override code used at Greenfield Academy at 3:15pm"

### Frontend Checklist — `apps/school`
- [ ] Both guardians unreachable state — override code entry
- [ ] Override code input — uppercase, dashes auto-inserted
- [ ] Override success + failure states
- [ ] Child hold confirmation with incident reference number

### Backend Checklist — `apps/api`
- [ ] `OverrideCodesModule` — `OverrideCode` entity
- [ ] Override code: crypto-random, human-readable, stored as hash
- [ ] Code validation: hash, expiry, uses remaining, school match
- [ ] Single-use enforcement: decrement `usesRemaining` atomically
- [ ] Immediate push + SMS to parent AND secondary guardian on override use
- [ ] `IncidentModule` — `Incident` entity

### TDD Anchors
```typescript
describe('OverrideService', () => {
  it('should generate a unique, human-readable override code')
  it('should store code as hash, not plaintext')
  it('should reject expired override code')
  it('should reject used override code (usesRemaining = 0)')
  it('should reject code used at wrong school')
  it('should decrement usesRemaining atomically on use')
  it('should notify parent and secondary guardian on override use')
  it('should create audit log entry on override use')
})
```

### Deploy Gate ✅
- [ ] Secondary guardian receives notification on primary parent timeout
- [ ] Secondary guardian can approve or deny
- [ ] Parent can generate an override code, school can enter it
- [ ] Override code validated correctly
- [ ] Child hold triggers incident record
- [ ] All TDD anchors passing

---

## Feature 11 — Release Confirmation & Clock-Out Attendance

**Flowchart:** Blocks G1 → G2 → G3
**PRD ref:** Section 7.1 (Attendance), Section 7.3
**Status:** 🔲 NOT STARTED

### Scope
After pickup approval, school confirms child is released. Clock-out logged with delegate and verification method. Parent receives final confirmation.

### API Contract

#### `POST /attendance/clock-out`
```json
// REQUEST
{ "pickupRequestId": "pkp_01HXYZ", "safepickId": "SP-2025-00142", "schoolId": "sch_01HXYZ" }
// RESPONSE 201
{
  "attendance": {
    "id": "att_02HXYZ",
    "childId": "chd_01HXYZ",
    "childName": "Zara Osei",
    "type": "CLOCK_OUT",
    "timestamp": "2025-01-06T15:10:00Z",
    "delegate": { "id": "dlg_01HXYZ", "fullName": "David Mensah", "relationship": "DRIVER" },
    "verificationMethod": "QR",
    "authorizationId": "auth_01HXYZ",
    "pickupRequestId": "pkp_01HXYZ"
  },
  "parentNotified": true
}
// RESPONSE 400
{ "error": "PICKUP_NOT_APPROVED", "message": "Cannot clock out — this pickup request was not approved." }
```

#### FCM Push Notification Payload
```json
{
  "title": "Zara has left school",
  "body": "Picked up by David Mensah (Driver) at 3:10pm · Greenfield Academy",
  "data": {
    "type": "CLOCK_OUT_CONFIRMATION",
    "attendanceId": "att_02HXYZ",
    "childName": "Zara Osei",
    "delegateName": "David Mensah",
    "timestamp": "2025-01-06T15:10:00Z",
    "verificationMethod": "QR"
  }
}
```

### Frontend Checklist — `apps/school`
- [ ] Post-approval screen: "Release child to David Mensah" CTA
- [ ] Clock-out confirmation — one button
- [ ] Success state with timestamp

### Frontend Checklist — `apps/web` (parent)
- [ ] Clock-out push notification (foreground + background)
- [ ] Notification detail view — child, delegate, time, method, school
- [ ] Today's activity feed shows both clock-in and clock-out

### Frontend Checklist — `apps/web/(delegate)/`
- [ ] Delegate receives clock-out confirmation notification
  "Pickup complete. Zara Osei has been logged as picked up."
  This closes the active pickup in their pickup requests inbox.

### Backend Checklist — `apps/api`
- [ ] Clock-out validates `pickupRequestId` is APPROVED
- [ ] Clock-out is idempotent
- [ ] Attendance record linked to delegateProfileId + verificationMethod
- [ ] FCM push + SMS to parent
- [ ] FCM push to delegate confirming pickup logged
- [ ] Pickup request status updated to COMPLETED

### TDD Anchors
```typescript
describe('AttendanceService.clockOut', () => {
  it('should reject clock-out if pickup request is not APPROVED')
  it('should reject duplicate clock-out for same pickup request')
  it('should link clock-out record to delegate and verification method')
  it('should update pickup request status to COMPLETED on clock-out')
  it('should send push + SMS to parent on clock-out')
  it('should send FCM push to delegate on clock-out')
})
```

### Deploy Gate ✅
- [ ] School staff can confirm release and trigger clock-out
- [ ] Parent receives notification with delegate name, time, method
- [ ] Duplicate clock-outs blocked
- [ ] Delegate receives pickup completion notification
- [ ] All TDD anchors passing

---

## Feature 12 — Audit Log & Incident Reporting

**Flowchart:** Block I1, F5, F10, F11
**PRD ref:** Section 9 (Audit Integrity), Section 7.3
**Status:** 🔲 NOT STARTED

### Scope
Every significant event creates an immutable audit log entry.
Incidents are stored as structured records. Parents and school admins query their logs.

### API Contract

#### `GET /audit-log?childId=chd_01HXYZ&from=2025-01-01&to=2025-01-31`
```json
// RESPONSE 200
{
  "entries": [{
    "id": "aud_01HXYZ",
    "eventType": "PICKUP_APPROVED",
    "actorId": "usr_01HXYZ",
    "actorRole": "PARENT",
    "childId": "chd_01HXYZ",
    "childName": "Zara Osei",
    "delegateId": "dlg_01HXYZ",
    "delegateName": "David Mensah",
    "verificationMethod": "QR",
    "outcome": "RELEASED",
    "schoolId": "sch_01HXYZ",
    "metadata": {},
    "timestamp": "2025-01-06T15:10:00Z"
  }],
  "total": 47,
  "page": 1
}
```

**Audit Event Types:**
```
CHILD_REGISTERED, DELEGATE_KYC_SUBMITTED, DELEGATE_KYC_APPROVED,
DELEGATE_KYC_REJECTED, DELEGATE_ACCOUNT_CREATED, AUTHORIZATION_CREATED,
AUTHORIZATION_REVOKED, PICKUP_REQUEST_CREATED, PICKUP_APPROVED,
PICKUP_DENIED, PICKUP_TIMEOUT_ESCALATED, SECONDARY_GUARDIAN_APPROVED,
SECONDARY_GUARDIAN_DENIED, OVERRIDE_CODE_GENERATED, OVERRIDE_CODE_USED,
CHILD_HELD, PANIC_TRIGGERED, DELEGATE_SUSPENDED, CLOCK_IN, CLOCK_OUT,
SOS_TRIGGERED
```

#### `GET /incidents?childId=chd_01HXYZ`
```json
// RESPONSE 200
{
  "incidents": [{
    "id": "inc_01HXYZ",
    "type": "PICKUP_DENIED",
    "childId": "chd_01HXYZ",
    "delegateId": "dlg_01HXYZ",
    "reportedBy": "PARENT",
    "resolvedAt": null,
    "description": "Parent denied pickup by David Mensah at 3:05pm.",
    "createdAt": "2025-01-06T15:05:00Z"
  }]
}
```

### Frontend Checklist — `apps/web` (parent)
- [ ] Audit log viewer per child — filterable by date, event type
- [ ] Event timeline — visual, chronological
- [ ] Incident list with resolution status
- [ ] Export as PDF or CSV

### Frontend Checklist — `apps/school`
- [ ] School-wide audit log — filterable
- [ ] Incident report view with detail modal
- [ ] Export daily incident report

### Backend Checklist — `apps/api`
- [ ] `AuditModule` — `AuditEntry` entity — append-only
- [ ] Audit entries as side effects in all relevant services
- [ ] `IncidentModule` — `Incident` entity
- [ ] Audit log queries scoped to actor's authorized children/schools
- [ ] Pagination on all log endpoints

### TDD Anchors
```typescript
describe('AuditService', () => {
  it('should create an audit entry for every pickup approval')
  it('should create an audit entry for every pickup denial')
  it('should create an audit entry for every override code use')
  it('should create an audit entry for every SOS trigger')
  it('should not allow audit entries to be updated or deleted')
  it('should scope audit log queries to authenticated user only')
  it('should paginate results correctly')
})
```

### Deploy Gate ✅
- [ ] Every gate event generates an audit entry automatically
- [ ] Parent can view full audit history per child
- [ ] School admin can view school-scoped log
- [ ] Audit entries cannot be modified
- [ ] All TDD anchors passing

---

## Feature 13 — Emergency Controls: Panic, Revoke, Override Gen, Delegate SOS

**Flowchart:** Blocks J1 → J2/J3/J4 + Delegate SOS
**PRD ref:** Section 7.1 (Emergency Controls)
**Status:** 🔲 NOT STARTED

**Note:** Delegate SOS is now included in this feature since both parent panic
and delegate SOS are two sides of the same emergency system. SOS API contract
was defined in Feature 08 — this feature builds the full emergency UI for both sides.

### API Contract

#### `POST /emergency/panic`
```json
// REQUEST
{ "childIds": ["chd_01HXYZ"], "reason": "SUSPECTED_THREAT" }
// RESPONSE 200
{
  "panicEventId": "pan_01HXYZ",
  "affectedChildren": ["chd_01HXYZ"],
  "delegatesSuspended": 3,
  "schoolsNotified": ["sch_01HXYZ"],
  "activatedAt": "2025-01-06T15:00:00Z",
  "auditEntryId": "aud_01HXYZ"
}
```

#### `POST /authorizations/:authId/suspend`
```json
// REQUEST
{ "scope": "THIS_CHILD", "reason": "Revoked until further notice" }
// RESPONSE 200
{ "suspended": true, "authorizationsAffected": 1, "effectiveAt": "2025-01-06T15:01:00Z" }
```

### Frontend Checklist — `apps/web` (parent)
- [ ] Emergency section on dashboard — red zone UI
- [ ] Panic button — double-confirm dialog
- [ ] Post-panic state — lockdown active with deactivate button
- [ ] Per-delegate revoke button
- [ ] Revoke scope selector
- [ ] Override code generator per child + school

### Frontend Checklist — `apps/web/(delegate)/`
- [ ] SOS button — 3-second hold confirmation (built in Feature 08, wired here)
- [ ] Active SOS state: "SOS sent. Parent notified."
- [ ] Cancel SOS within 30 seconds
- [ ] Delegate receives notification if parent triggers panic affecting their authorization
  Toast danger: "Your access to Zara has been suspended by the parent."

### Backend Checklist — `apps/api`
- [ ] `EmergencyModule` — `PanicEvent` entity
- [ ] Panic suspends all ACTIVE authorizations atomically
- [ ] School notification on panic
- [ ] Panic deactivation restores previous authorization states
- [ ] `SosModule` — wired to emit FCM + SMS + audit log
- [ ] Delegate notified when their authorization is suspended via panic

### TDD Anchors
```typescript
describe('EmergencyService', () => {
  it('should suspend all active authorizations on panic trigger')
  it('should notify all relevant schools on panic trigger')
  it('should create audit entry on panic trigger')
  it('should block pickup verification when panic is active')
  it('should restore authorizations on panic deactivation')
  it('should notify delegate when their authorization is suspended via panic')
  it('should trigger FCM + SMS to parent on delegate SOS')
  it('should create audit log entry on SOS trigger')
})
```

### Deploy Gate ✅
- [ ] Panic button suspends all delegates, notifies school in real time
- [ ] Panic can be deactivated with state restored
- [ ] Delegates are notified when their access is suspended via panic
- [ ] SOS 3-second hold fires correctly
- [ ] SOS notifies parent via push + SMS
- [ ] Emergency actions in audit log
- [ ] All TDD anchors passing

---
---

# SPRINT 2 — GPS TRACKING

## Feature 14 — GPS Movement Tracking

**Flowchart:** Blocks H1–H10
**PRD ref:** Section 8 (GPS Tracking)
**Status:** 🔴 BLOCKED — Decision #6 (GPS source) must be confirmed first

### Open Decision Required Before This Sprint

| Question | Options | Owner |
|----------|---------|-------|
| Whose device carries the GPS signal? | (A) Delegate's phone — requires app, easiest to build · (B) Child GPS tag — hardware, most reliable · (C) Child's phone — limited to older children | Product Owner |

```
GPS_SOURCE_DECISION: _______________
DECIDED_BY: _______________
DECIDED_ON: _______________
```

### API Contract (placeholder)

#### `POST /tracking/start`
```json
// REQUEST
{ "pickupRequestId": "pkp_01HXYZ", "trackingWindowMinutes": 30, "expectedRouteId": "rte_01HXYZ" }
```

#### `POST /tracking/:sessionId/location`
```json
// REQUEST
{ "latitude": 6.5244, "longitude": 3.3792, "accuracy": 8.5, "timestamp": "2025-01-06T15:12:00Z" }
```

### TDD Anchors (to be written after GPS decision)
```typescript
describe('TrackingService', () => {
  it('should start tracking session after approved pickup')
  it('should stop tracking on safe destination arrival')
  it('should stop tracking on time window expiry')
  it('should detect prolonged stop outside safe zone')
  it('should detect route deviation beyond threshold')
  it('should detect GPS signal loss')
  it('should alert parent immediately on anomaly detection')
  it('should encrypt route data at rest')
  it('should scope route data to parent only')
})
```

### Deploy Gate ✅
- [ ] GPS source decision recorded above
- [ ] Parent can enable tracking after pickup
- [ ] Live route visible on parent map view
- [ ] Anomaly detection fires correctly
- [ ] Tracking auto-stops on destination arrival or timeout
- [ ] All TDD anchors passing

---
---

# SPRINT 3 — MONETISATION

## Feature 15 — Pricing & Subscription

**Status:** 🔴 BLOCKED — Decision #8 (monetisation model) must be confirmed first

```
MONETISATION_MODEL_DECISION: _______________
DECIDED_BY: _______________
DECIDED_ON: _______________
```

*Full feature spec to be written after decision is made.*

---
---

# Appendix A — Prisma Schema (Updated for v2.0)

```prisma
model User {
  id            String   @id @default(cuid())
  fullName      String
  phone         String   @unique
  email         String?  @unique
  passwordHash  String
  phoneVerified Boolean  @default(false)
  role          UserRole @default(PARENT)
  fcmToken      String?
  createdAt     DateTime @default(now())

  childrenAsParent    Child[]         @relation("ParentChildren")
  childrenAsSecondary Child[]         @relation("SecondaryGuardianChildren")
  authorizations      Authorization[]
  auditEntries        AuditEntry[]
}

enum UserRole {
  PARENT
  SCHOOL_ADMIN
  SCHOOL_STAFF
  SUPER_ADMIN
}

model DelegateProfile {
  id               String    @id @default(cuid())
  fullName         String
  phone            String    @unique
  photoUrl         String?
  idType           String?
  idNumber         String?
  biometricHash    String?
  kycStatus        KYCStatus @default(PENDING)
  createdAt        DateTime  @default(now())

  account              DelegateAccount?
  authorizations       Authorization[]
  verificationSessions VerificationSession[]
}

model DelegateAccount {
  id                String   @id @default(cuid())
  delegateProfileId String   @unique
  phone             String   @unique
  fcmToken          String?
  phoneVerified     Boolean  @default(false)
  createdAt         DateTime @default(now())

  profile   DelegateProfile @relation(fields: [delegateProfileId], references: [id])
  alarms    PickupAlarm[]
  sosEvents SosEvent[]
}

model PickupAlarm {
  id                String          @id @default(cuid())
  delegateAccountId String
  authorizationId   String
  date              DateTime
  alarmTime         String
  enabled           Boolean         @default(true)
  createdAt         DateTime        @default(now())

  delegate DelegateAccount @relation(fields: [delegateAccountId], references: [id])
}

model SosEvent {
  id                String   @id @default(cuid())
  delegateAccountId String
  authorizationId   String
  latitude          Float?
  longitude         Float?
  reason            String?
  parentNotified    Boolean  @default(false)
  resolvedAt        DateTime?
  createdAt         DateTime @default(now())

  delegate DelegateAccount @relation(fields: [delegateAccountId], references: [id])
}

enum KYCStatus {
  PENDING
  APPROVED
  REJECTED
}

model Child {
  id                   String           @id @default(cuid())
  safepickId           String           @unique
  fullName             String
  dateOfBirth          DateTime
  grade                String
  photoUrl             String?
  parentId             String
  secondaryGuardianId  String
  schoolId             String?
  enrollmentStatus     EnrollmentStatus @default(PENDING_SCHOOL)
  createdAt            DateTime         @default(now())

  parent             User              @relation("ParentChildren", fields: [parentId], references: [id])
  secondaryGuardian  User              @relation("SecondaryGuardianChildren", fields: [secondaryGuardianId], references: [id])
  school             School?           @relation(fields: [schoolId], references: [id])
  authorizations     Authorization[]
  attendanceRecords  AttendanceRecord[]
  pickupRequests     PickupRequest[]
}

enum EnrollmentStatus {
  PENDING_SCHOOL
  PENDING_VERIFICATION
  VERIFIED
  REJECTED
  SCHOOL_NOT_ON_SAFEPICK
}

model School {
  id        String       @id @default(cuid())
  name      String
  address   String
  city      String
  country   String
  status    SchoolStatus @default(PENDING_ONBOARDING)
  createdAt DateTime     @default(now())

  children         Child[]
  adoptionRequests AdoptionRequest[]
  overrideCodes    OverrideCode[]
}

enum SchoolStatus {
  PENDING_ONBOARDING
  ACTIVE
  SUSPENDED
}

model Authorization {
  id                String              @id @default(cuid())
  delegateProfileId String
  childId           String
  parentId          String
  authType          AuthType
  allowedDays       String[]
  allowedTimeStart  String?
  allowedTimeEnd    String?
  validFrom         DateTime
  validUntil        DateTime?
  status            AuthorizationStatus @default(ACTIVE)
  createdAt         DateTime            @default(now())

  delegate DelegateProfile @relation(fields: [delegateProfileId], references: [id])
  child    Child           @relation(fields: [childId], references: [id])
  parent   User            @relation(fields: [parentId], references: [id])
  alarms   PickupAlarm[]
}

enum AuthType {
  ONE_TIME
  RECURRING
  DATE_RANGE
}

enum AuthorizationStatus {
  ACTIVE
  SUSPENDED
  REVOKED
  EXPIRED
}

model AttendanceRecord {
  id                 String         @id @default(cuid())
  childId            String
  schoolId           String
  type               AttendanceType
  timestamp          DateTime
  delegateProfileId  String?
  verificationMethod String?
  pickupRequestId    String?
  loggedBy           String
  method             String

  child Child @relation(fields: [childId], references: [id])
}

enum AttendanceType {
  CLOCK_IN
  CLOCK_OUT
}

model VerificationSession {
  id                 String             @id @default(cuid())
  delegateProfileId  String
  childId            String
  schoolId           String
  authorizationId    String
  status             VerificationStatus @default(QR_PENDING)
  verificationMethod String?
  createdAt          DateTime           @default(now())
  expiresAt          DateTime

  delegate DelegateProfile @relation(fields: [delegateProfileId], references: [id])
}

enum VerificationStatus {
  QR_PENDING
  OTP_PENDING
  BIOMETRIC_PENDING
  AWAITING_PARENT
  APPROVED
  DENIED
  EXPIRED
}

model PickupRequest {
  id                    String       @id @default(cuid())
  verificationSessionId String
  childId               String
  delegateProfileId     String
  status                PickupStatus @default(AWAITING_PARENT)
  responderId           String?
  responderRole         String?
  respondedAt           DateTime?
  timeoutAt             DateTime
  createdAt             DateTime     @default(now())

  child Child @relation(fields: [childId], references: [id])
}

enum PickupStatus {
  AWAITING_PARENT
  AWAITING_SECONDARY
  APPROVED
  DENIED
  TIMED_OUT
  COMPLETED
  CHILD_HELD
}

model OverrideCode {
  id            String   @id @default(cuid())
  codeHash      String   @unique
  childId       String
  schoolId      String
  generatedById String
  maxUses       Int      @default(1)
  usesRemaining Int      @default(1)
  expiresAt     DateTime
  status        String   @default("ACTIVE")
  createdAt     DateTime @default(now())

  school School @relation(fields: [schoolId], references: [id])
}

model AuditEntry {
  id                 String   @id @default(cuid())
  eventType          String
  actorId            String
  actorRole          String
  childId            String?
  delegateId         String?
  schoolId           String?
  verificationMethod String?
  outcome            String?
  metadata           Json?
  timestamp          DateTime @default(now())

  actor User @relation(fields: [actorId], references: [id])

  @@index([childId])
  @@index([timestamp])
}

model Incident {
  id          String    @id @default(cuid())
  type        String
  childId     String
  delegateId  String?
  reportedBy  String
  description String
  resolvedAt  DateTime?
  createdAt   DateTime  @default(now())

  @@index([childId])
}

model AdoptionRequest {
  id        String   @id @default(cuid())
  parentId  String
  schoolId  String
  createdAt DateTime @default(now())

  school School @relation(fields: [schoolId], references: [id])

  @@unique([parentId, schoolId])
}
```

---

# Appendix B — Environment Variables

```env
# Database
DATABASE_URL=

# Auth
JWT_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_DELEGATE_SECRET=
JWT_DELEGATE_ACCESS_EXPIRY=8h

# OTP
OTP_EXPIRY_SECONDS=300
OTP_MAX_ATTEMPTS=5

# SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# Push Notifications
FCM_SERVER_KEY=

# Object Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# School Adoption
SCHOOL_ADOPTION_THRESHOLD=10

# Pickup Timeout
PICKUP_TIMEOUT_SECONDS=180
SECONDARY_GUARDIAN_TIMEOUT_SECONDS=180

# QR Token
QR_TOKEN_EXPIRY_SECONDS=900

# SOS
SOS_CANCEL_WINDOW_SECONDS=30

# Feature Flags
ENABLE_BIOMETRIC=false
ENABLE_GPS_TRACKING=false
ENABLE_MONETISATION=false
```

---

# Appendix C — Testing Strategy

```
Unit tests:     All service methods — jest
Integration:    All API endpoints — supertest + jest
E2E:            Full pickup flows — playwright
Load:           Gate verification under concurrent sessions — k6
```

**Coverage target:** ≥ 80% on all service files before any deploy gate passes.

**Test data seeding** (`prisma/seed.ts`):
- 2 parents, 1 secondary guardian
- 1 KYC-approved delegate with a linked DelegateAccount
- 2 children, 1 active school
- 1 active authorization
- Sufficient to run the full pickup flow end-to-end in dev

---

*End of SafePick Implementation Plan v2.0*