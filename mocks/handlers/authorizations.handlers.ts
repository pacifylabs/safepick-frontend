import { http, HttpResponse } from "msw";

/**
 * Mock data for authorizations
 */
let mockAuthorizations = [
  {
    id: "auth_01HXYZ",
    delegate: {
      id: "dlg_01HXYZ",
      fullName: "David Mensah",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      relationship: "DRIVER",
    },
    childId: "chd_01HXYZ",
    childName: "Zara Osei",
    authType: "RECURRING",
    allowedDays: ["MON", "TUE", "WED", "THU", "FRI"],
    allowedTimeStart: "14:00",
    allowedTimeEnd: "17:00",
    status: "ACTIVE",
    validFrom: "2025-01-01",
    validUntil: null,
    createdAt: "2025-01-01T00:00:00Z",
  },
];

const mockPendingDelegates = [
  {
    id: "dlg_01HXYZ",
    fullName: "David Mensah",
    phone: "+234 803 123 4567",
    relationship: "DRIVER",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    kycStatus: "APPROVED",
    kycVerifiedAt: "2025-01-01T10:00:00Z",
    authorizations: [
      {
        childId: "chd_01HXYZ",
        childName: "Zara Osei",
        status: "PENDING_PARENT_APPROVAL",
        authType: "RECURRING",
      }
    ]
  }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authorizationsHandlers = [
  // GET /delegates?status=PENDING_PARENT_APPROVAL
  http.get("/delegates", async ({ request }: { request: any }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    if (status === "PENDING_PARENT_APPROVAL") {
      await delay(500);
      return HttpResponse.json(mockPendingDelegates);
    }
    
    return HttpResponse.json([]);
  }),

  // GET /authorizations?childId=...
  http.get("/authorizations", async ({ request }: { request: any }) => {
    await delay(800);
    const url = new URL(request.url);
    const childId = url.searchParams.get("childId");
    const delegateId = url.searchParams.get("delegateId");

    let filtered = [...mockAuthorizations];
    if (childId) filtered = filtered.filter((auth) => auth.childId === childId);
    if (delegateId) filtered = filtered.filter((auth) => auth.delegate.id === delegateId);

    return HttpResponse.json({
      authorizations: filtered,
    });
  }),

  // POST /authorizations (Approve delegate)
  http.post("/authorizations", async ({ request }: { request: any }) => {
    await delay(1000);
    const body = (await request.json()) as any;

    if (body.delegateProfileId === "dlg_PENDING_KYC") {
      return HttpResponse.json(
        {
          error: "KYC_NOT_APPROVED",
          message: "Authorization can only be created for delegates with approved KYC.",
        },
        { status: 400 }
      );
    }

    const newAuth = {
      id: `auth_${Math.random().toString(36).substr(2, 9)}`,
      delegate: {
        id: body.delegateProfileId,
        fullName: "David Mensah",
        photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        relationship: "DRIVER",
      },
      childId: body.childId,
      childName: "Zara Osei",
      authType: body.authType,
      allowedDays: body.allowedDays,
      allowedTimeStart: body.allowedTimeStart,
      allowedTimeEnd: body.allowedTimeEnd,
      validFrom: body.validFrom,
      validUntil: body.validUntil,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    mockAuthorizations.push(newAuth);
    return HttpResponse.json({ authorization: newAuth }, { status: 201 });
  }),

  // PATCH /authorizations/:authId
  http.patch("/authorizations/:authId", async ({ params, request }: { params: any; request: any }) => {
    await delay(800);
    const { authId } = params;
    const body = (await request.json()) as any;

    const index = mockAuthorizations.findIndex((a) => a.id === authId);
    if (index === -1) {
      return HttpResponse.json(
        { error: "AUTHORIZATION_NOT_FOUND", message: "The specified authorization record was not found." },
        { status: 404 }
      );
    }

    mockAuthorizations[index] = {
      ...mockAuthorizations[index],
      ...body,
    };

    return HttpResponse.json(mockAuthorizations[index]);
  }),

  // DELETE /authorizations/:authId (Revoke)
  http.delete("/authorizations/:authId", async ({ params }: { params: any }) => {
    await delay(800);
    const { authId } = params;

    const index = mockAuthorizations.findIndex((a) => a.id === authId);
    if (index === -1) {
      return HttpResponse.json(
        { error: "AUTHORIZATION_NOT_FOUND", message: "The specified authorization record was not found." },
        { status: 404 }
      );
    }

    mockAuthorizations.splice(index, 1);
    return HttpResponse.json({
      message: "Authorization revoked. Takes effect immediately.",
      revokedAt: new Date().toISOString(),
    });
  }),

  // DELETE /authorizations?delegateId=... (Revoke all)
  http.delete("/authorizations", async ({ request }: { request: any }) => {
    await delay(1000);
    const url = new URL(request.url);
    const delegateId = url.searchParams.get("delegateId");

    if (!delegateId) {
      return HttpResponse.json({ error: "MISSING_DELEGATE_ID" }, { status: 400 });
    }

    const initialCount = mockAuthorizations.length;
    mockAuthorizations = mockAuthorizations.filter(a => a.delegate.id !== delegateId);
    const revokedCount = initialCount - mockAuthorizations.length;

    return HttpResponse.json({
      message: "All authorizations revoked.",
      revokedCount,
    });
  }),
];
