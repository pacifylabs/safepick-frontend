# SafePick — Full Implementation Plan
**Version:** 1.0  
**Stack:** Next.js (App Router) · NestJS · PostgreSQL · Prisma · FCM · Twilio  
**Methodology:** Agile · TDD · Feature-by-feature deploy  
**Source:** PRD v2.0 + Flowchart v2.0

---

## How to Use This Document

Each feature is structured as a self-contained implementation unit with:

- **Scope** — what is built (frontend + backend)
- **Flowchart ref** — which blocks this feature covers
- **API contract** — exact request/response payloads (fill these in as you build)
- **Frontend checklist** — components and states to implement
- **Backend checklist** — endpoints, services, guards to implement
- **TDD anchors** — the test cases to write BEFORE coding
- **Deploy gate** — what must pass before you ship this feature

Work through each sprint in order. Every feature has a deploy gate — do not proceed to the next feature until the gate passes.

---

## Project Structure Overview

```
safepick/
├── apps/
│   ├── web/                  # Next.js — Parent + Delegate PWA
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

| Sprint | Features | Deployable After |
|--------|----------|-----------------|
| **Sprint 1A** | Auth — Parent signup + OTP | Feature 01 |
| **Sprint 1B** | Child registration + secondary guardian | Feature 02 |
| **Sprint 1C** | School linking + adoption request | Feature 03 |
| **Sprint 1D** | Delegate invite + KYC flow | Feature 04 |
| **Sprint 1E** | Parent delegate approval + authorization rules | Feature 05 |
| **Sprint 1F** | Attendance — drop-off clock-in | Feature 06 |
| **Sprint 1G** | Gate verification — QR + OTP chain | Feature 07 |
| **Sprint 1H** | Real-time parent pickup authorization | Feature 08 |
| **Sprint 1I** | Secondary guardian fallback + override codes | Feature 09 |
| **Sprint 1J** | Release confirmation + clock-out attendance | Feature 10 |
| **Sprint 1K** | Audit log + incident reporting | Feature 11 |
| **Sprint 1L** | Emergency controls — panic, revoke, override gen | Feature 12 |
| **Sprint 2** | GPS tracking (blocked — Decision #6 pending) | Feature 13 |
| **Sprint 3** | Monetisation (blocked — Decision #8 pending) | Feature 14 |

---
---

# SPRINT 1 — CORE SYSTEM

---

## Feature 01 — Parent Authentication & OTP Verification

**Flowchart:** Blocks A1 → A2 → A3  
**PRD ref:** Section 7.1 (Parent App)

### Scope
Full auth lifecycle: signup, phone OTP verification, JWT session, and the empty parent dashboard state.

---

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
  "otpToken": "eyJhbGci...",   // short-lived JWT wrapping the phone number
  "expiresIn": 300              // seconds
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
{
  "otpToken": "eyJhbGci...",
  "otp": "847291"
}

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
{
  "error": "OTP_INVALID_OR_EXPIRED",
  "message": "The code entered is incorrect or has expired."
}
```

#### `POST /auth/resend-otp`
```json
// REQUEST
{
  "otpToken": "eyJhbGci..."
}

// RESPONSE 200
{
  "message": "New OTP sent.",
  "otpToken": "eyJhbGci...", // refreshed token
  "expiresIn": 300
}
```

#### `POST /auth/refresh`
```json
// REQUEST
{
  "refreshToken": "eyJhbGci..."
}

// RESPONSE 200
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

#### `POST /auth/login`
```json
// REQUEST
{
  "phone": "+2348012345678",
  "password": "plain_password"
}

// RESPONSE 200 — same shape as verify-otp response
```

---

### Frontend Checklist — `apps/web`

- [ ] `/signup` — multi-step form: name + phone + email + password
- [ ] `/verify` — OTP input (6-digit, auto-submit on complete)
- [ ] Resend OTP with 60s cooldown timer
- [ ] Error states: invalid OTP, expired OTP, phone taken
- [ ] `/login` — phone + password form
- [ ] JWT storage in httpOnly cookie (not localStorage)
- [ ] Auth context / provider — exposes `user`, `isAuthenticated`
- [ ] Protected route HOC — redirects unauthenticated users to `/login`
- [ ] Empty parent dashboard shell at `/dashboard`

### Backend Checklist — `apps/api`

- [ ] `AuthModule` with `AuthService`, `AuthController`
- [ ] `UsersModule` — `User` entity (Prisma)
- [ ] OTP generation (6-digit, crypto-random)
- [ ] OTP stored as bcrypt hash in DB with expiry
- [ ] Twilio SMS integration for OTP delivery
- [ ] In-app OTP fallback (return in response body for dev env only)
- [ ] JWT strategy — access token (15min) + refresh token (7d)
- [ ] `JwtAuthGuard` + `RolesGuard` scaffolded
- [ ] Rate limiting on `/auth/verify-otp` (5 attempts max)

---

### TDD Anchors

```typescript
// auth.service.spec.ts
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

---

### Deploy Gate ✅

- [ ] Parent can sign up, receive OTP via SMS, verify, and land on dashboard
- [ ] Invalid OTP is rejected with correct error
- [ ] JWT auth guard blocks unauthenticated requests
- [ ] All TDD anchors passing

---
---

## Feature 02 — Child Registration & Mandatory Secondary Guardian

**Flowchart:** Blocks B1 → B2 → B3  
**PRD ref:** Sections 5.2, 7.1 (Child Registration)

### Scope
Parent registers a child, system generates a unique SafePick ID, and parent assigns a mandatory secondary guardian (who must have a verified account).

---

### API Contract

#### `POST /children`
```json
// REQUEST
{
  "fullName": "Zara Osei",
  "dateOfBirth": "2017-03-15",
  "grade": "Grade 3",
  "photo": "base64_or_upload_url",
  "secondaryGuardian": {
    "phone": "+2348099887766"   // must be a registered SafePick user
  }
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

// RESPONSE 400 — secondary guardian not found
{
  "error": "SECONDARY_GUARDIAN_NOT_FOUND",
  "message": "No verified SafePick account found for this phone number. Ask them to sign up first."
}

// RESPONSE 400 — secondary guardian is same as parent
{
  "error": "SECONDARY_GUARDIAN_CONFLICT",
  "message": "Secondary guardian cannot be the same account as the primary parent."
}
```

#### `GET /children`
```json
// RESPONSE 200
{
  "children": [
    {
      "id": "chd_01HXYZ",
      "safepickId": "SP-2025-00142",
      "fullName": "Zara Osei",
      "grade": "Grade 3",
      "photoUrl": "...",
      "school": null,
      "enrollmentStatus": "PENDING_SCHOOL",
      "secondaryGuardian": {
        "id": "usr_02HABC",
        "fullName": "Kwame Osei",
        "phone": "+2348099887766"
      }
    }
  ]
}
```

#### `GET /children/:childId`
```json
// RESPONSE 200 — full child record with delegates and authorization summary
```

#### `PATCH /children/:childId`
```json
// REQUEST — update name, grade, photo, or secondary guardian
{
  "grade": "Grade 4"
}
// RESPONSE 200 — updated child object
```

---

### Frontend Checklist — `apps/web`

- [ ] `/dashboard/children/new` — multi-step form:
  - Step 1: Child name, DOB, grade, photo upload
  - Step 2: Secondary guardian phone number input + lookup
  - Step 3: Review + confirm
- [ ] Secondary guardian lookup UI: show matched name when phone is found
- [ ] Error state: guardian not found — prompt to invite them to sign up
- [ ] Error state: guardian is self
- [ ] SafePick ID displayed on child card after creation
- [ ] Child card component on dashboard showing status badge
- [ ] `PENDING_SCHOOL` empty state — prompt to link school

### Backend Checklist — `apps/api`

- [ ] `ChildrenModule` — `Child` entity, service, controller
- [ ] SafePick ID generation — format `SP-{YEAR}-{5-digit-seq}`, unique index
- [ ] Secondary guardian phone lookup against `Users` table
- [ ] Enforce: secondary guardian ≠ primary parent
- [ ] Enforce: secondary guardian must have `emailVerified: true` or `phoneVerified: true`
- [ ] Photo upload to object storage (S3-compatible), store URL
- [ ] `GET /children` scoped to authenticated parent's children only

---

### TDD Anchors

```typescript
// children.service.spec.ts
describe('ChildrenService', () => {
  it('should generate a unique SafePick ID on child creation')
  it('should reject secondary guardian with unregistered phone')
  it('should reject secondary guardian who is the parent themselves')
  it('should require secondaryGuardian field — cannot be null')
  it('should scope GET /children to the authenticated parent only')
  it('should store photo URL, not raw binary')
})
```

---

### Deploy Gate ✅

- [ ] Parent can register a child end-to-end
- [ ] Secondary guardian phone lookup works (found / not found)
- [ ] SafePick ID is unique and formatted correctly
- [ ] Child appears on dashboard with correct status badge
- [ ] All TDD anchors passing

---
---

## Feature 03 — School Linking & Parent-Led Adoption Request

**Flowchart:** Blocks B4 → B5 → B6 → B7/B8 → B9 → B10 → B11/B12  
**PRD ref:** Sections 6.1, 6.2 (School Onboarding)

### Scope
Parent searches for their child's school. If the school exists, child is linked and enrollment is requested. If not, a school adoption request is logged. When enough parents request the same school, the school admin receives a self-serve onboarding link.

---

### API Contract

#### `GET /schools/search?q=greenfield`
```json
// RESPONSE 200
{
  "schools": [
    {
      "id": "sch_01HXYZ",
      "name": "Greenfield Academy",
      "address": "15 Palm Avenue, Lagos",
      "city": "Lagos",
      "country": "NG",
      "status": "ACTIVE",         // ACTIVE | PENDING_ONBOARDING | NOT_REGISTERED
      "studentCount": 420,
      "pendingRequests": null      // only visible to admins
    }
  ]
}
```

#### `POST /children/:childId/school`
```json
// REQUEST — link child to an existing school
{
  "schoolId": "sch_01HXYZ"
}

// RESPONSE 200 — school is ACTIVE
{
  "enrollmentStatus": "PENDING_VERIFICATION",
  "message": "Your enrollment request has been sent to Greenfield Academy."
}

// RESPONSE 200 — school is NOT_REGISTERED
{
  "enrollmentStatus": "SCHOOL_NOT_ON_SAFEPICK",
  "adoptionRequestId": "req_01HXYZ",
  "message": "Greenfield Academy is not yet on SafePick. Your request has been logged. We'll notify you when they join.",
  "requestCount": 4,
  "threshold": 10
}
```

#### `POST /schools/request`
```json
// REQUEST — school not in system at all
{
  "childId": "chd_01HXYZ",
  "schoolName": "Sunrise Montessori",
  "schoolAddress": "42 Broad Street, Abuja",
  "city": "Abuja",
  "country": "NG"
}

// RESPONSE 201
{
  "adoptionRequestId": "req_01HABC",
  "message": "Request logged. You'll be notified when Sunrise Montessori joins SafePick."
}
```

#### `POST /schools/onboard` _(school admin — triggered by system email link)_
```json
// REQUEST
{
  "inviteToken": "tok_secure_onboard_abc123",
  "adminName": "Mrs. Adeola Bello",
  "adminEmail": "admin@greenfield.edu.ng",
  "adminPhone": "+2348011122233",
  "password": "..."
}

// RESPONSE 201
{
  "school": {
    "id": "sch_01HXYZ",
    "name": "Greenfield Academy",
    "status": "ACTIVE"
  },
  "admin": {
    "id": "usr_03HABC",
    "role": "SCHOOL_ADMIN"
  }
}
```

#### `PATCH /schools/:schoolId/enrollment/:childId` _(school admin)_
```json
// REQUEST
{
  "action": "APPROVE" // or "REJECT"
}

// RESPONSE 200
{
  "enrollmentStatus": "VERIFIED",
  "attendanceSyncEnabled": true
}
```

---

### Frontend Checklist — `apps/web`

- [ ] School search with debounced autocomplete
- [ ] School result card: name, city, status badge (Active / Coming Soon)
- [ ] "Request SafePick at this school" CTA when school not active
- [ ] Adoption request confirmation screen with request count progress bar
- [ ] "Notify me when live" confirmation state
- [ ] Enrollment pending state on child card

### Frontend Checklist — `apps/school`

- [ ] School onboarding flow — triggered from email link with `inviteToken`
- [ ] Admin profile setup form
- [ ] Pending enrollment requests list
- [ ] Approve / reject enrollment UI per student

### Backend Checklist — `apps/api`

- [ ] `SchoolsModule` — `School`, `AdoptionRequest`, `Enrollment` entities
- [ ] School search endpoint with fuzzy name match
- [ ] Adoption request deduplication — one request per parent-school pair
- [ ] Adoption threshold check — configurable env var `SCHOOL_ADOPTION_THRESHOLD` (default: 10)
- [ ] Auto-trigger onboarding email when threshold reached (use queue / job)
- [ ] Secure onboarding invite token — signed JWT, single-use, 7-day expiry
- [ ] `SchoolAdmin` role seeded on onboarding completion
- [ ] Enrollment status state machine: `PENDING_VERIFICATION` → `VERIFIED` / `REJECTED`

---

### TDD Anchors

```typescript
// schools.service.spec.ts
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

---

### Deploy Gate ✅

- [ ] Parent can search and link child to an active school
- [ ] Adoption request is created for unlisted schools
- [ ] School receives onboarding email when threshold is met
- [ ] School admin can complete self-serve onboarding
- [ ] School admin can approve / reject enrollments
- [ ] All TDD anchors passing

---
---

## Feature 04 — Delegate Invite & KYC Flow

**Flowchart:** Blocks C1 → C2 → C3 → C4 → C5 → C6 → C7 → C8/C9  
**PRD ref:** Section 7.1 (Delegate Management), Section 5.3

### Scope
Parent generates a secure invite link for a delegate. Delegate opens the link, verifies their phone via OTP, submits KYC (name + ID upload + optional biometric). System validates KYC and matches or creates a delegate profile. Parent is notified.

---

### API Contract

#### `POST /delegates/invite`
```json
// REQUEST
{
  "childIds": ["chd_01HXYZ"],       // which children this invite covers
  "relationship": "DRIVER",          // DRIVER | NANNY | RELATIVE | OTHER
  "kycLevel": "STANDARD",           // STANDARD | ENHANCED
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
// RESPONSE 200 — token valid
{
  "valid": true,
  "inviterName": "Amara Osei",
  "childNames": ["Zara Osei"],
  "relationship": "DRIVER",
  "expiresAt": "2025-01-03T00:00:00Z"
}

// RESPONSE 400 — token expired or used
{
  "error": "INVITE_INVALID",
  "message": "This invite link has expired or already been used."
}
```

#### `POST /delegates/kyc/start`
```json
// REQUEST
{
  "inviteToken": "tok_abc123...",
  "phone": "+2348055544433"
}

// RESPONSE 200
{
  "otpToken": "eyJhbGci...",
  "expiresIn": 300,
  "existingProfile": false   // true if phone already has a delegate profile
}
```

#### `POST /delegates/kyc/submit`
```json
// REQUEST (multipart or JSON with upload URLs)
{
  "otpToken": "eyJhbGci...",
  "otp": "928471",
  "fullName": "David Mensah",
  "idType": "NATIONAL_ID",   // NATIONAL_ID | PASSPORT | DRIVERS_LICENSE
  "idNumber": "NGA-1234567",
  "idPhotoFront": "upload_url_or_base64",
  "idPhotoBack": "upload_url_or_base64",
  "selfiePhoto": "upload_url_or_base64",
  "biometricTemplate": null   // optional — base64 encoded fingerprint template
}

// RESPONSE 200 — KYC submitted, pending validation
{
  "kycStatus": "PENDING",
  "delegateProfileId": "dlg_01HXYZ",
  "message": "Your identity is being verified. The parent will be notified."
}

// RESPONSE 200 — existing profile matched (phone already in system)
{
  "kycStatus": "MATCHED",
  "delegateProfileId": "dlg_EXISTING",
  "message": "Your identity was matched from a previous verification."
}
```

#### `GET /delegates/kyc/:kycId/status` _(webhook or polling)_
```json
// RESPONSE 200
{
  "status": "APPROVED",   // PENDING | APPROVED | REJECTED
  "delegateProfileId": "dlg_01HXYZ",
  "failureReason": null
}
```

#### `GET /delegates` _(parent — list all delegates linked to their children)_
```json
// RESPONSE 200
{
  "delegates": [
    {
      "id": "dlg_01HXYZ",
      "fullName": "David Mensah",
      "phone": "+2348055544433",
      "relationship": "DRIVER",
      "photoUrl": "...",
      "kycStatus": "APPROVED",
      "authorizations": [
        {
          "childId": "chd_01HXYZ",
          "childName": "Zara Osei",
          "status": "PENDING_PARENT_APPROVAL"
        }
      ]
    }
  ]
}
```

---

### Frontend Checklist — `apps/web` (parent side)

- [ ] `/dashboard/delegates/invite` — invite form: select children, relationship, KYC level, expiry
- [ ] Generated invite link with copy + share buttons
- [ ] Delegate list on dashboard with KYC status badges
- [ ] KYC pending state — "Waiting for David to complete verification"
- [ ] KYC failed notification — "David's verification failed. You can re-invite."

### Frontend Checklist — `apps/web` (delegate side — public route)

- [ ] `/delegate/join?token=...` — invite landing page showing inviter name and children
- [ ] Step 1: Phone number entry + OTP verification
- [ ] Step 2: KYC form — name, ID type, ID photo upload (front + back), selfie
- [ ] Step 3: Optional biometric enrollment UI (device-native WebAuthn or prompt)
- [ ] Step 4: Submission confirmation — "Verification submitted. The parent will be notified."
- [ ] Existing profile detected — "We found your previous verification. Linking now."
- [ ] Expired/invalid token error page

### Backend Checklist — `apps/api`

- [ ] `DelegatesModule` — `DelegateProfile`, `DelegateInvite`, `KYCRecord` entities
- [ ] Invite token — signed JWT, configurable expiry, single-use flag
- [ ] Phone deduplication — if delegate phone exists, match to existing profile
- [ ] KYC document upload to object storage, encrypted at rest
- [ ] KYC validation — MVP: manual review queue; stub auto-approval for dev
- [ ] KYC webhook handler for future third-party integration (e.g. Smile Identity)
- [ ] Parent notification on KYC pass/fail (push + SMS)
- [ ] `DelegateProfile` is independent of any single child/parent — reusable entity

---

### TDD Anchors

```typescript
// delegates.service.spec.ts
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

---

### Deploy Gate ✅

- [ ] Parent can generate and share invite link
- [ ] Delegate can open link, verify phone, and submit KYC
- [ ] Existing delegate profile is matched by phone
- [ ] Parent receives notification on KYC outcome
- [ ] All TDD anchors passing

---
---

## Feature 05 — Parent Delegate Approval & Authorization Rules

**Flowchart:** Blocks C10 → C11 → C12/C13 → C14  
**PRD ref:** Section 5.3, Section 7.1 (Authorization Management)

### Scope
After KYC passes, parent receives a notification and approves or rejects the delegate for each specific child. On approval, an authorization record is created with rules (allowed days, time windows, type).

---

### API Contract

#### `POST /authorizations`
```json
// REQUEST — parent approves delegate for a specific child
{
  "delegateProfileId": "dlg_01HXYZ",
  "childId": "chd_01HXYZ",
  "authType": "RECURRING",           // ONE_TIME | RECURRING | DATE_RANGE
  "allowedDays": ["MON", "TUE", "WED", "THU", "FRI"],
  "allowedTimeStart": "14:00",
  "allowedTimeEnd": "17:00",
  "validFrom": "2025-01-01",
  "validUntil": null                 // null = indefinite for RECURRING
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
{
  "delegateProfileId": "dlg_01HXYZ",
  "childId": "chd_01HXYZ",
  "reason": "No longer needed"     // optional
}

// RESPONSE 200
{
  "message": "Delegate rejected for Zara Osei. Their profile is retained for future use."
}
```

#### `GET /authorizations?childId=chd_01HXYZ`
```json
// RESPONSE 200
{
  "authorizations": [
    {
      "id": "auth_01HXYZ",
      "delegate": {
        "id": "dlg_01HXYZ",
        "fullName": "David Mensah",
        "photoUrl": "...",
        "relationship": "DRIVER"
      },
      "authType": "RECURRING",
      "allowedDays": ["MON","TUE","WED","THU","FRI"],
      "allowedTimeStart": "14:00",
      "allowedTimeEnd": "17:00",
      "status": "ACTIVE",           // ACTIVE | SUSPENDED | REVOKED | EXPIRED
      "validUntil": null
    }
  ]
}
```

#### `PATCH /authorizations/:authId`
```json
// REQUEST — edit existing authorization rules
{
  "allowedDays": ["MON", "WED", "FRI"],
  "allowedTimeEnd": "16:30"
}
// RESPONSE 200 — updated authorization object
```

#### `DELETE /authorizations/:authId`
```json
// RESPONSE 200
{
  "message": "Authorization revoked. Takes effect immediately.",
  "revokedAt": "2025-01-10T14:32:00Z"
}
```

---

### Frontend Checklist — `apps/web`

- [ ] Pending approval notification card on dashboard
- [ ] Delegate approval modal — shows delegate photo, name, KYC status
- [ ] Authorization rules form:
  - Auth type selector (one-time / recurring / date range)
  - Day-of-week multi-select
  - Time window picker (start + end)
  - Valid from / until date pickers
- [ ] Active authorizations list per child — sortable by status
- [ ] Edit authorization rules inline
- [ ] Revoke authorization — confirm dialog + immediate feedback
- [ ] Delegate confirmation SMS shown as success state ("David has been notified")

### Backend Checklist — `apps/api`

- [ ] `AuthorizationsModule` — `Authorization` entity with status state machine
- [ ] Enforce: authorization can only be created if KYC is `APPROVED`
- [ ] Authorization validity check helper — called at pickup time to enforce day/time rules
- [ ] SMS notification to delegate on approval (`C14` in flowchart)
- [ ] Push notification to parent on any authorization status change
- [ ] `PATCH` — partial update, enforce that `status` cannot be set directly (use dedicated revoke endpoint)
- [ ] `DELETE` sets status to `REVOKED`, not hard delete — preserves audit trail

---

### TDD Anchors

```typescript
// authorizations.service.spec.ts
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

---

### Deploy Gate ✅

- [ ] Parent can approve a KYC-verified delegate with custom rules
- [ ] Authorization rules are enforced correctly (day, time, date range)
- [ ] Delegate receives SMS confirmation
- [ ] Parent can revoke authorization with immediate effect
- [ ] All TDD anchors passing

---
---

## Feature 06 — Attendance: Morning Drop-Off Clock-In

**Flowchart:** Blocks D1 → D2 → D3  
**PRD ref:** Section 7.1 (Attendance & Notifications), Section 7.3 (School Staff)

### Scope
School staff logs a child's arrival in the morning. Parent receives a push notification confirming drop-off. Attendance record is created.

---

### API Contract

#### `POST /attendance/clock-in`
```json
// REQUEST (school staff — authenticated as SCHOOL_STAFF role)
{
  "safepickId": "SP-2025-00142",   // scanned or entered
  "schoolId": "sch_01HXYZ",
  "method": "MANUAL"               // MANUAL | QR_SCAN
}

// RESPONSE 201
{
  "attendance": {
    "id": "att_01HXYZ",
    "childId": "chd_01HXYZ",
    "childName": "Zara Osei",
    "schoolId": "sch_01HXYZ",
    "type": "CLOCK_IN",
    "timestamp": "2025-01-06T07:42:00Z",
    "loggedBy": "usr_staff_01",
    "method": "MANUAL"
  },
  "parentNotified": true
}

// RESPONSE 404
{
  "error": "CHILD_NOT_FOUND",
  "message": "No child with SafePick ID SP-2025-00142 is enrolled at this school."
}
```

#### `GET /attendance?childId=chd_01HXYZ&from=2025-01-01&to=2025-01-31`
```json
// RESPONSE 200
{
  "records": [
    {
      "id": "att_01HXYZ",
      "type": "CLOCK_IN",
      "timestamp": "2025-01-06T07:42:00Z",
      "method": "MANUAL"
    },
    {
      "id": "att_02HXYZ",
      "type": "CLOCK_OUT",
      "timestamp": "2025-01-06T15:10:00Z",
      "delegateName": "David Mensah",
      "method": "QR"
    }
  ],
  "summary": {
    "totalDaysPresent": 18,
    "totalDaysAbsent": 2,
    "month": "2025-01"
  }
}
```

#### `GET /attendance/school/:schoolId/daily?date=2025-01-06` _(school admin)_
```json
// RESPONSE 200
{
  "date": "2025-01-06",
  "present": 312,
  "absent": 18,
  "records": [ /* array of attendance records */ ]
}
```

---

### Frontend Checklist — `apps/web` (parent)

- [ ] Drop-off notification push + in-app: "Zara arrived at Greenfield Academy at 7:42am"
- [ ] Attendance history view per child — calendar or list format
- [ ] Monthly summary card on child profile

### Frontend Checklist — `apps/school`

- [ ] Clock-in interface — SafePick ID entry or QR scan
- [ ] Student found confirmation card (shows photo + name)
- [ ] Not found error state
- [ ] Daily attendance dashboard — present / absent count
- [ ] Exportable attendance CSV

### Backend Checklist — `apps/api`

- [ ] `AttendanceModule` — `AttendanceRecord` entity
- [ ] Clock-in validates child is enrolled at the school making the request
- [ ] No duplicate clock-in for same child on same day (idempotent)
- [ ] Push notification via FCM to parent on clock-in
- [ ] Attendance summary computed via DB aggregation (not in-memory)

---

### TDD Anchors

```typescript
// attendance.service.spec.ts
describe('AttendanceService', () => {
  it('should reject clock-in if child not enrolled at requesting school')
  it('should not create duplicate clock-in for same child same day')
  it('should send push notification to parent on clock-in')
  it('should return correct monthly attendance summary')
  it('should return 404 for unknown SafePick ID')
})
```

---

### Deploy Gate ✅

- [ ] School staff can log a child's morning arrival
- [ ] Parent receives push notification within 3 seconds
- [ ] Duplicate clock-ins are blocked
- [ ] Attendance history visible to parent
- [ ] All TDD anchors passing

---
---

## Feature 07 — Gate Verification: QR → OTP → Biometric Chain

**Flowchart:** Blocks E1 → E2 → E3 → E4 → E5/E6 → E7 → E8/E9 → E10/E11  
**PRD ref:** Sections 5.1 (Verification Methods), Decision #1, #5, #9

### Scope
Delegate arrives at gate with a dynamic QR code. School staff scans it. System validates QR or falls back to OTP. Biometric is tertiary. On any successful verification, the flow proceeds to parent authorization (Feature 08).

---

### API Contract

#### `GET /verification/qr-token?authorizationId=auth_01HXYZ` _(delegate app)_
```json
// RESPONSE 200 — returns a time-bound signed token for QR display
{
  "qrToken": "eyJhbGci...",    // signed JWT, 15-minute expiry
  "qrPayload": "SP-QR:eyJhbGci...",  // string to encode into QR image
  "expiresAt": "2025-01-06T15:25:00Z",
  "delegateName": "David Mensah",
  "childName": "Zara Osei"
}

// RESPONSE 403 — authorization not valid right now
{
  "error": "AUTHORIZATION_NOT_ACTIVE",
  "message": "Your authorization for Zara is not valid today or at this time."
}
```

#### `POST /verification/scan-qr` _(school staff)_
```json
// REQUEST
{
  "qrPayload": "SP-QR:eyJhbGci...",
  "schoolId": "sch_01HXYZ"
}

// RESPONSE 200 — QR valid
{
  "verificationSessionId": "vsn_01HXYZ",
  "status": "QR_VERIFIED",
  "delegate": {
    "id": "dlg_01HXYZ",
    "fullName": "David Mensah",
    "photoUrl": "...",
    "relationship": "DRIVER"
  },
  "child": {
    "id": "chd_01HXYZ",
    "fullName": "Zara Osei",
    "photoUrl": "..."
  },
  "authorizationId": "auth_01HXYZ",
  "nextStep": "PARENT_AUTHORIZATION"
}

// RESPONSE 400 — QR expired
{
  "error": "QR_EXPIRED",
  "verificationSessionId": "vsn_01HXYZ",
  "nextStep": "OTP_FALLBACK",
  "message": "QR code has expired. Falling back to OTP."
}

// RESPONSE 403 — authorization rules violated
{
  "error": "AUTHORIZATION_RULES_VIOLATED",
  "message": "David Mensah is not authorized to pick up Zara today (Saturday).",
  "nextStep": "DENY"
}
```

#### `POST /verification/trigger-otp` _(school staff — fallback)_
```json
// REQUEST
{
  "verificationSessionId": "vsn_01HXYZ"
}

// RESPONSE 200
{
  "message": "OTP sent to David's registered phone.",
  "otpToken": "eyJhbGci...",  // session-scoped OTP token
  "expiresIn": 120
}
```

#### `POST /verification/submit-otp` _(school staff enters OTP delegate reads aloud)_
```json
// REQUEST
{
  "verificationSessionId": "vsn_01HXYZ",
  "otp": "847291"
}

// RESPONSE 200
{
  "status": "OTP_VERIFIED",
  "nextStep": "PARENT_AUTHORIZATION"
}

// RESPONSE 400
{
  "error": "OTP_INVALID",
  "attemptsRemaining": 2,
  "nextStep": "BIOMETRIC_FALLBACK"
}
```

#### `POST /verification/submit-biometric` _(school staff with biometric device)_
```json
// REQUEST
{
  "verificationSessionId": "vsn_01HXYZ",
  "biometricTemplate": "base64_encoded_template",
  "deviceId": "gate_device_01"
}

// RESPONSE 200
{
  "status": "BIOMETRIC_VERIFIED",
  "nextStep": "PARENT_AUTHORIZATION"
}

// RESPONSE 400 — biometric fails, auto-revert to OTP
{
  "error": "BIOMETRIC_FAILED",
  "nextStep": "OTP_FALLBACK",
  "message": "Biometric match failed. Falling back to OTP automatically."
}
```

#### `GET /verification/session/:sessionId`
```json
// RESPONSE 200 — used for polling session state
{
  "sessionId": "vsn_01HXYZ",
  "status": "AWAITING_PARENT",   // QR_PENDING | OTP_PENDING | BIOMETRIC_PENDING | AWAITING_PARENT | APPROVED | DENIED | EXPIRED
  "verificationMethod": "QR",
  "delegate": { ... },
  "child": { ... },
  "createdAt": "...",
  "expiresAt": "..."
}
```

---

### Frontend Checklist — `apps/web` (delegate PWA)

- [ ] `/gate` — full-screen QR code display (generated from `qrPayload`)
- [ ] Auto-refresh QR every 14 minutes (before 15-min expiry)
- [ ] QR expiry countdown timer
- [ ] Authorization not valid error state with reason

### Frontend Checklist — `apps/school` (gate tablet/kiosk)

- [ ] QR scanner UI (camera-based, using `@zxing/browser` or native)
- [ ] Scan result card — delegate photo, name, child photo, name
- [ ] OTP fallback UI — "Enter the 6-digit code sent to delegate's phone"
- [ ] Biometric prompt UI (device-dependent, optional)
- [ ] Error states for each failure mode
- [ ] Session status polling (WebSocket or 2s interval)

### Backend Checklist — `apps/api`

- [ ] `VerificationModule` — `VerificationSession` entity
- [ ] QR token: server-signed JWT, 15-min expiry, single-use
- [ ] QR scan validates: token signature, expiry, authorization rules (day/time/date)
- [ ] Verification session created on first scan — tracks method chain
- [ ] OTP for verification: scoped to session, 2-min expiry, max 3 attempts
- [ ] Biometric comparison logic (stub for MVP; real integration Sprint 3)
- [ ] Auto-fallback to OTP when biometric fails (Decision #9)
- [ ] Session state machine: enforce valid transitions only
- [ ] WebSocket gateway for real-time session status push to school dashboard

---

### TDD Anchors

```typescript
// verification.service.spec.ts
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
  it('should not allow session status to regress (e.g. APPROVED → OTP_PENDING)')
})
```

---

### Deploy Gate ✅

- [ ] Delegate can display a valid QR code in the PWA
- [ ] School staff can scan QR and see delegate + child info
- [ ] QR expiry triggers automatic OTP fallback
- [ ] OTP fallback works end-to-end
- [ ] Biometric failure auto-reverts to OTP (Decision #9)
- [ ] Authorization rule violations (day/time) are enforced at scan time
- [ ] All TDD anchors passing

---
---

## Feature 08 — Real-Time Parent Pickup Authorization

**Flowchart:** Blocks F1 → F2 → F3 → F4/F5  
**PRD ref:** Section 7.1 (Pickup Authorization)

### Scope
After identity is verified at the gate, the system sends the primary parent a real-time push + SMS notification requesting approval or denial. Parent responds within a configurable timeout window.

---

### API Contract

#### `POST /pickup/request` _(internal — triggered by verification service on session verified)_
```json
// REQUEST
{
  "verificationSessionId": "vsn_01HXYZ",
  "verificationMethod": "QR"
}

// RESPONSE 201
{
  "pickupRequestId": "pkp_01HXYZ",
  "status": "AWAITING_PARENT",
  "timeoutSeconds": 180,           // 3-minute window (configurable)
  "notifiedAt": "2025-01-06T15:05:00Z"
}
```

#### `POST /pickup/:pickupRequestId/respond`
```json
// REQUEST (authenticated parent or secondary guardian)
{
  "decision": "APPROVE",    // APPROVE | DENY
  "responderId": "usr_01HXYZ"
}

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

#### `GET /pickup/:pickupRequestId` _(school — polls or receives via WebSocket)_
```json
// RESPONSE 200
{
  "pickupRequestId": "pkp_01HXYZ",
  "status": "AWAITING_PARENT",    // AWAITING_PARENT | AWAITING_SECONDARY | APPROVED | DENIED | TIMED_OUT
  "delegate": { ... },
  "child": { ... },
  "timeoutAt": "2025-01-06T15:08:00Z",
  "secondsRemaining": 112
}
```

#### Push Notification Payload _(FCM — sent to parent device)_
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

---

### Frontend Checklist — `apps/web` (parent)

- [ ] Real-time pickup notification banner (WebSocket or FCM foreground handler)
- [ ] Pickup approval modal — delegate photo, name, relationship, child name, school, timestamp
- [ ] One-tap Approve / Deny buttons — large, accessible
- [ ] Countdown timer showing seconds remaining
- [ ] Post-approval confirmation: "Release authorized. School has been notified."
- [ ] Post-denial confirmation: "Release denied. Incident logged."
- [ ] Deep link handler for FCM background notification tap → `/pickup/:id`

### Frontend Checklist — `apps/school`

- [ ] Waiting for parent screen — shows delegate and child, animated countdown
- [ ] Approved state — "Release authorized by Amara Osei"
- [ ] Denied state — "Release denied. Do not release child."
- [ ] Timed out state — triggers secondary guardian flow (Feature 09)

### Backend Checklist — `apps/api`

- [ ] `PickupModule` — `PickupRequest` entity
- [ ] Pickup request created immediately on verification session completion
- [ ] FCM push + Twilio SMS sent to primary parent simultaneously
- [ ] Timeout job — scheduled via Bull/BullMQ, fires at `timeoutSeconds`
- [ ] On timeout: escalate to secondary guardian (triggers Feature 09)
- [ ] WebSocket event emitted to school gate session on status change
- [ ] Audit log entry created on every status transition

---

### TDD Anchors

```typescript
// pickup.service.spec.ts
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
})
```

---

### Deploy Gate ✅

- [ ] Parent receives push + SMS notification within 3 seconds of gate scan
- [ ] Parent can approve or deny from the app
- [ ] School gate UI updates in real time on parent decision
- [ ] Timeout triggers correctly and escalates to secondary guardian
- [ ] All TDD anchors passing

---
---

## Feature 09 — Secondary Guardian Fallback & Emergency Override

**Flowchart:** Blocks F6 → F7 → F8 → F9 → F10/F11  
**PRD ref:** Sections 5.2, 7.1 (Emergency Controls), Decision #2

### Scope
If primary parent doesn't respond within timeout, secondary guardian is auto-notified. If both are unreachable, school uses a pre-generated emergency override code. If no override code, child is held and incident is filed.

---

### API Contract

#### `POST /pickup/:pickupRequestId/escalate` _(internal — triggered by timeout job)_
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
// REQUEST (authenticated parent)
{
  "childId": "chd_01HXYZ",
  "schoolId": "sch_01HXYZ",
  "validForHours": 72,
  "maxUses": 1
}

// RESPONSE 201
{
  "overrideCode": {
    "id": "ovc_01HXYZ",
    "code": "SAFE-7742-XPQR",     // human-readable, uppercase, no ambiguous chars
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
// REQUEST (school admin)
{
  "overrideCode": "SAFE-7742-XPQR",
  "schoolAdminId": "usr_staff_01"
}

// RESPONSE 200 — override valid
{
  "status": "APPROVED_VIA_OVERRIDE",
  "overrideCodeId": "ovc_01HXYZ",
  "auditEntryId": "aud_01HXYZ",
  "parentNotifiedAt": "2025-01-06T15:15:00Z",
  "secondaryGuardianNotifiedAt": "2025-01-06T15:15:01Z"
}

// RESPONSE 400 — code invalid
{
  "error": "OVERRIDE_CODE_INVALID",
  "message": "The code entered is invalid, expired, or already used."
}
```

#### `POST /pickup/:pickupRequestId/hold`
```json
// REQUEST (school admin — no valid override code)
{
  "reason": "No override code available. Parent unreachable."
}

// RESPONSE 200
{
  "status": "CHILD_HELD",
  "incidentId": "inc_01HXYZ",
  "message": "Incident filed. Parent has been notified via all available channels."
}
```

#### `GET /override-codes?childId=chd_01HXYZ` _(parent)_
```json
// RESPONSE 200
{
  "overrideCodes": [
    {
      "id": "ovc_01HXYZ",
      "code": "SAFE-7742-XPQR",
      "schoolName": "Greenfield Academy",
      "expiresAt": "2025-01-09T15:00:00Z",
      "usesRemaining": 1,
      "status": "ACTIVE"   // ACTIVE | USED | EXPIRED | REVOKED
    }
  ]
}
```

---

### Frontend Checklist — `apps/web` (parent)

- [ ] "Generate override code" button on child settings page
- [ ] Override code display — styled, easy to read, copy button
- [ ] Code sent to school confirmation
- [ ] Active override codes list with expiry countdown
- [ ] Post-override notification: "Override code used at Greenfield Academy at 3:15pm"

### Frontend Checklist — `apps/school`

- [ ] "Both guardians unreachable" state — override code entry prompt
- [ ] Override code input field — uppercase, dashes auto-inserted
- [ ] Override success confirmation
- [ ] Override failure state with "Hold child" option
- [ ] Child hold confirmation with incident reference number

### Backend Checklist — `apps/api`

- [ ] `OverrideCodesModule` — `OverrideCode` entity
- [ ] Override code generation: crypto-random, human-readable format, stored as hash
- [ ] Code validation: check hash, expiry, uses remaining, school match
- [ ] Single-use enforcement: decrement `usesRemaining` atomically
- [ ] Override use creates audit log entry with school admin ID
- [ ] Immediate push + SMS to parent AND secondary guardian on override use
- [ ] `IncidentModule` — `Incident` entity with type enum
- [ ] Incident created on: DENIED, CHILD_HELD, OVERRIDE_USED

---

### TDD Anchors

```typescript
// override.service.spec.ts
describe('OverrideService', () => {
  it('should generate a unique, human-readable override code')
  it('should store code as hash, not plaintext')
  it('should reject expired override code')
  it('should reject used override code (usesRemaining = 0)')
  it('should reject code used at wrong school')
  it('should decrement usesRemaining atomically on use')
  it('should notify parent and secondary guardian immediately on override use')
  it('should create audit log entry on override use')
  it('should auto-escalate to secondary guardian before override is attempted')
})
```

---

### Deploy Gate ✅

- [ ] Secondary guardian receives notification on primary parent timeout
- [ ] Secondary guardian can approve or deny the request
- [ ] Parent can generate an override code and school can enter it
- [ ] Override code is validated correctly (expiry, uses, school)
- [ ] Child hold triggers incident record and parent notification
- [ ] All TDD anchors passing

---
---

## Feature 10 — Release Confirmation & Clock-Out Attendance

**Flowchart:** Blocks G1 → G2 → G3  
**PRD ref:** Section 7.1 (Attendance), Section 7.3

### Scope
After pickup is approved, school confirms child is released. Clock-out attendance is logged with delegate and verification method. Parent receives final confirmation notification.

---

### API Contract

#### `POST /attendance/clock-out`
```json
// REQUEST (school staff)
{
  "pickupRequestId": "pkp_01HXYZ",
  "safepickId": "SP-2025-00142",
  "schoolId": "sch_01HXYZ"
}

// RESPONSE 201
{
  "attendance": {
    "id": "att_02HXYZ",
    "childId": "chd_01HXYZ",
    "childName": "Zara Osei",
    "type": "CLOCK_OUT",
    "timestamp": "2025-01-06T15:10:00Z",
    "delegate": {
      "id": "dlg_01HXYZ",
      "fullName": "David Mensah",
      "relationship": "DRIVER"
    },
    "verificationMethod": "QR",
    "authorizationId": "auth_01HXYZ",
    "pickupRequestId": "pkp_01HXYZ"
  },
  "parentNotified": true
}

// RESPONSE 400 — pickup not approved
{
  "error": "PICKUP_NOT_APPROVED",
  "message": "Cannot clock out — this pickup request was not approved."
}
```

#### Push Notification Payload _(parent — clock-out confirmation)_
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

---

### Frontend Checklist — `apps/school`

- [ ] Post-approval screen shows "Release child to David Mensah" CTA
- [ ] Clock-out confirmation tap — one button
- [ ] Success state with timestamp

### Frontend Checklist — `apps/web` (parent)

- [ ] Clock-out push notification (foreground + background)
- [ ] Notification detail view — child, delegate, time, method, school
- [ ] Today's activity feed on dashboard showing both clock-in and clock-out events

### Backend Checklist — `apps/api`

- [ ] Clock-out validates `pickupRequestId` is in `APPROVED` status
- [ ] Clock-out is idempotent — cannot clock out same child twice for same pickup
- [ ] Attendance record linked to `delegateProfileId` and `verificationMethod`
- [ ] FCM push + SMS to parent on clock-out
- [ ] Pickup request status updated to `COMPLETED`

---

### TDD Anchors

```typescript
// attendance.service.spec.ts (clock-out additions)
describe('AttendanceService.clockOut', () => {
  it('should reject clock-out if pickup request is not APPROVED')
  it('should reject duplicate clock-out for same pickup request')
  it('should link clock-out record to delegate and verification method')
  it('should update pickup request status to COMPLETED on clock-out')
  it('should send push + SMS notification to parent on clock-out')
})
```

---

### Deploy Gate ✅

- [ ] School staff can confirm release and trigger clock-out
- [ ] Parent receives notification with delegate name, time, and method
- [ ] Duplicate clock-outs are blocked
- [ ] Attendance history shows both clock-in and clock-out with delegate info
- [ ] All TDD anchors passing

---
---

## Feature 11 — Audit Log & Incident Reporting

**Flowchart:** Block I1, F5, F10, F11  
**PRD ref:** Section 9 (Audit Integrity), Section 7.3

### Scope
Every significant event in the system creates an immutable audit log entry. Incidents (denials, holds, overrides) are stored as structured records. Parents and school admins can query their respective logs.

---

### API Contract

#### `GET /audit-log?childId=chd_01HXYZ&from=2025-01-01&to=2025-01-31`
```json
// RESPONSE 200
{
  "entries": [
    {
      "id": "aud_01HXYZ",
      "eventType": "PICKUP_APPROVED",   // See event type enum below
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
    }
  ],
  "total": 47,
  "page": 1
}
```

**Audit Event Types Enum:**
```
CHILD_REGISTERED
DELEGATE_KYC_SUBMITTED
DELEGATE_KYC_APPROVED
DELEGATE_KYC_REJECTED
AUTHORIZATION_CREATED
AUTHORIZATION_REVOKED
PICKUP_REQUEST_CREATED
PICKUP_APPROVED
PICKUP_DENIED
PICKUP_TIMEOUT_ESCALATED
SECONDARY_GUARDIAN_APPROVED
SECONDARY_GUARDIAN_DENIED
OVERRIDE_CODE_GENERATED
OVERRIDE_CODE_USED
CHILD_HELD
PANIC_TRIGGERED
DELEGATE_SUSPENDED
CLOCK_IN
CLOCK_OUT
```

#### `GET /incidents?childId=chd_01HXYZ`
```json
// RESPONSE 200
{
  "incidents": [
    {
      "id": "inc_01HXYZ",
      "type": "PICKUP_DENIED",
      "childId": "chd_01HXYZ",
      "delegateId": "dlg_01HXYZ",
      "reportedBy": "PARENT",
      "resolvedAt": null,
      "description": "Parent denied pickup by David Mensah at 3:05pm.",
      "createdAt": "2025-01-06T15:05:00Z"
    }
  ]
}
```

#### `GET /audit-log/school/:schoolId?date=2025-01-06` _(school admin)_
```json
// RESPONSE 200 — school-scoped audit events for the day
```

---

### Frontend Checklist — `apps/web` (parent)

- [ ] Audit log viewer per child — filterable by date, event type
- [ ] Event timeline — visual, chronological
- [ ] Incident list with resolution status
- [ ] Export audit log as PDF or CSV

### Frontend Checklist — `apps/school`

- [ ] School-wide audit log — filterable by date, child, event type
- [ ] Incident report view with detail modal
- [ ] Export daily incident report

### Backend Checklist — `apps/api`

- [ ] `AuditModule` — `AuditEntry` entity — append-only (no updates, no deletes)
- [ ] Audit entries created as side effect in all relevant services (not opt-in)
- [ ] `IncidentModule` — `Incident` entity linked to audit entries
- [ ] Audit log queries scoped strictly to actor's authorized children/schools
- [ ] Pagination on all log endpoints

---

### TDD Anchors

```typescript
// audit.service.spec.ts
describe('AuditService', () => {
  it('should create an audit entry for every pickup approval')
  it('should create an audit entry for every pickup denial')
  it('should create an audit entry for every override code use')
  it('should not allow audit entries to be updated or deleted')
  it('should scope audit log queries to authenticated user only')
  it('should paginate results correctly')
})
```

---

### Deploy Gate ✅

- [ ] Every gate event generates an audit entry automatically
- [ ] Parent can view full audit history per child
- [ ] School admin can view school-scoped log
- [ ] Audit entries cannot be modified after creation
- [ ] All TDD anchors passing

---
---

## Feature 12 — Emergency Controls: Panic, Revoke, Override Generation

**Flowchart:** Blocks J1 → J2/J3/J4  
**PRD ref:** Section 7.1 (Emergency Controls)

### Scope
Parent can trigger three emergency actions from anywhere: (1) Panic lockdown — all delegates suspended for all children, school notified; (2) Instant delegate revocation — per child or all children; (3) Override code generation — pre-emptively sent to school admin.

---

### API Contract

#### `POST /emergency/panic`
```json
// REQUEST (authenticated parent)
{
  "childIds": ["chd_01HXYZ"],   // or omit for all children
  "reason": "SUSPECTED_THREAT"  // optional
}

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
{
  "scope": "THIS_CHILD",    // THIS_CHILD | ALL_CHILDREN
  "reason": "Revoked until further notice"
}

// RESPONSE 200
{
  "suspended": true,
  "authorizationsAffected": 1,
  "effectiveAt": "2025-01-06T15:01:00Z"
}
```

#### `POST /override-codes/generate` _(same as Feature 09 — pre-emptive generation)_

---

### Frontend Checklist — `apps/web` (parent)

- [ ] Emergency section on dashboard — red zone UI
- [ ] Panic button — double-confirm dialog ("Are you sure? This will suspend all pickups.")
- [ ] Post-panic state — "Lockdown active. All delegates suspended." with deactivate button
- [ ] Per-delegate revoke button on authorization card
- [ ] Revoke scope selector: this child / all children
- [ ] Override code generator — per child, per school

### Backend Checklist — `apps/api`

- [ ] `EmergencyModule` — `PanicEvent` entity
- [ ] Panic suspends all `ACTIVE` authorizations for specified children atomically
- [ ] School notification on panic (push to all school staff accounts)
- [ ] Panic can be deactivated by parent — restores previous authorization states
- [ ] Authorization suspension is immediate and reflected in gate verification
- [ ] Audit log entry for every emergency action

---

### TDD Anchors

```typescript
// emergency.service.spec.ts
describe('EmergencyService', () => {
  it('should suspend all active authorizations on panic trigger')
  it('should notify all relevant schools on panic trigger')
  it('should create audit entry on panic trigger')
  it('should block pickup verification when panic is active')
  it('should restore authorizations on panic deactivation')
  it('should revoke single authorization with THIS_CHILD scope')
  it('should revoke all child authorizations with ALL_CHILDREN scope')
})
```

---

### Deploy Gate ✅

- [ ] Panic button suspends all delegates and notifies school in real time
- [ ] Panic can be deactivated with state restored
- [ ] Individual delegation revocation works with correct scope
- [ ] Emergency actions appear in audit log
- [ ] Gate verification correctly blocks after panic is active
- [ ] All TDD anchors passing

---
---

# SPRINT 2 — GPS TRACKING
## Feature 13 — GPS Movement Tracking

**Flowchart:** Blocks H1–H10  
**PRD ref:** Section 8 (GPS Tracking)  
**Status:** 🔴 BLOCKED — Decision #6 (GPS source) must be confirmed first

---

### Open Decision Required Before This Sprint

| Question | Options | Owner |
|----------|---------|-------|
| Whose device carries the GPS signal? | (A) Delegate's phone — requires app, easiest to build · (B) Child GPS tag — hardware, most reliable · (C) Child's phone — limited to older children | Product Owner |

**This sprint cannot begin until this decision is recorded here:**

```
GPS_SOURCE_DECISION: _______________
DECIDED_BY: _______________
DECIDED_ON: _______________
```

---

### API Contract (placeholder — finalize after decision)

#### `POST /tracking/start`
```json
// REQUEST
{
  "pickupRequestId": "pkp_01HXYZ",
  "trackingWindowMinutes": 30,
  "expectedRouteId": "rte_01HXYZ"   // optional
}
// RESPONSE 201 — tracking session started
```

#### `POST /tracking/:sessionId/location` _(GPS source device)_
```json
// REQUEST
{
  "latitude": 6.5244,
  "longitude": 3.3792,
  "accuracy": 8.5,
  "timestamp": "2025-01-06T15:12:00Z"
}
```

#### `GET /tracking/:sessionId/live` _(parent — real-time)_
```json
// RESPONSE 200 — WebSocket or SSE stream
```

#### `POST /tracking/:sessionId/anomaly`
```json
// Internal — triggered by anomaly detection service
```

---

### TDD Anchors (to be written after GPS decision)

```typescript
// tracking.service.spec.ts
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

---

### Deploy Gate ✅ _(complete after sprint)_

- [ ] GPS source decision recorded above
- [ ] Parent can enable tracking after pickup
- [ ] Live route visible on parent map view
- [ ] Anomaly detection fires correctly
- [ ] Tracking auto-stops on destination arrival or timeout
- [ ] All TDD anchors passing

---
---

# SPRINT 3 — MONETISATION
## Feature 14 — Pricing & Subscription

**Status:** 🔴 BLOCKED — Decision #8 (monetisation model) must be confirmed first

```
MONETISATION_MODEL_DECISION: _______________
DECIDED_BY: _______________
DECIDED_ON: _______________
```

---

_Full feature spec to be written after decision is made._

---
---

# Appendix A — Prisma Schema Skeleton

```prisma
// prisma/schema.prisma

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

  childrenAsParent    Child[]              @relation("ParentChildren")
  childrenAsSecondary Child[]              @relation("SecondaryGuardianChildren")
  authorizations      Authorization[]
  auditEntries        AuditEntry[]
}

enum UserRole {
  PARENT
  SCHOOL_ADMIN
  SCHOOL_STAFF
  SUPER_ADMIN
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

  parent             User            @relation("ParentChildren", fields: [parentId], references: [id])
  secondaryGuardian  User            @relation("SecondaryGuardianChildren", fields: [secondaryGuardianId], references: [id])
  school             School?         @relation(fields: [schoolId], references: [id])
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

  authorizations  Authorization[]
  verificationSessions VerificationSession[]
}

enum KYCStatus {
  PENDING
  APPROVED
  REJECTED
}

model Authorization {
  id                String            @id @default(cuid())
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
  createdAt         DateTime          @default(now())

  delegate  DelegateProfile @relation(fields: [delegateProfileId], references: [id])
  child     Child           @relation(fields: [childId], references: [id])
  parent    User            @relation(fields: [parentId], references: [id])
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
  id                 String          @id @default(cuid())
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
  id                String            @id @default(cuid())
  delegateProfileId String
  childId           String
  schoolId          String
  authorizationId   String
  status            VerificationStatus @default(QR_PENDING)
  verificationMethod String?
  createdAt         DateTime          @default(now())
  expiresAt         DateTime

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
  id                   String              @id @default(cuid())
  verificationSessionId String
  childId              String
  delegateProfileId    String
  status               PickupStatus        @default(AWAITING_PARENT)
  responderId          String?
  responderRole        String?
  respondedAt          DateTime?
  timeoutAt            DateTime
  createdAt            DateTime            @default(now())

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
  id             String   @id @default(cuid())
  codeHash       String   @unique
  childId        String
  schoolId       String
  generatedById  String
  maxUses        Int      @default(1)
  usesRemaining  Int      @default(1)
  expiresAt      DateTime
  status         String   @default("ACTIVE")
  createdAt      DateTime @default(now())

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
  id          String   @id @default(cuid())
  type        String
  childId     String
  delegateId  String?
  reportedBy  String
  description String
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())

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

# Feature Flags
ENABLE_BIOMETRIC=false
ENABLE_GPS_TRACKING=false   # Sprint 2 — blocked
ENABLE_MONETISATION=false   # Sprint 3 — blocked
```

---

# Appendix C — Testing Strategy

```
Unit tests:     All service methods — jest
Integration:    All API endpoints — supertest + jest
E2E:            Full pickup flows — playwright
Load:           Gate verification under concurrent sessions — k6
```

**Coverage target:** ≥ 80% on all service files before any deploy gate is marked complete.

**Test data seeding:**
- Seed script at `prisma/seed.ts` must provide: 2 parents, 1 secondary guardian, 2 children, 1 active school, 1 KYC-approved delegate, 1 active authorization — sufficient to run the full pickup flow in dev.

---

*End of SafePick Implementation Plan v1.0*