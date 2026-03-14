import { http, HttpResponse } from "msw";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_SCHOOLS = [
  {
    id: "sch_01HXYZ",
    name: "Greenfield Academy",
    address: "15 Palm Avenue",
    city: "Lagos",
    country: "Nigeria",
    status: "ACTIVE",
    studentCount: 420,
    pendingRequests: null,
  },
  {
    id: "sch_02HABC",
    name: "Green Valley Montessori",
    address: "8 Hillside Road",
    city: "Lagos",
    country: "Nigeria",
    status: "PENDING_ONBOARDING",
    studentCount: 0,
    pendingRequests: 4,
  },
  {
    id: "sch_03HDEF",
    name: "Sunrise International School",
    address: "22 Airport Road",
    city: "Abuja",
    country: "Nigeria",
    status: "PENDING_ONBOARDING",
    studentCount: 0,
    pendingRequests: 7,
  },
];

export const schoolsHandlers = [
  // GET /schools/search?q=
  http.get("/schools/search", async ({ request }: any) => {
    await delay(600);
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.toLowerCase() || "";

    if (query.length < 2) {
      return HttpResponse.json({ schools: [] });
    }

    const filtered = MOCK_SCHOOLS.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.city.toLowerCase().includes(query)
    );

    return HttpResponse.json({ schools: filtered });
  }),

  // POST /children/:childId/school
  http.post("/children/:childId/school", async ({ params, request }: any) => {
    await delay(1000);
    const body = (await request.json()) as any;
    const school = MOCK_SCHOOLS.find((s) => s.id === body.schoolId);

    if (!school) {
      return new HttpResponse(null, { status: 404 });
    }

    if (school.status === "ACTIVE") {
      return HttpResponse.json({
        enrollmentStatus: "PENDING_VERIFICATION",
        message: `Your enrollment request has been sent to ${school.name}.`,
      });
    } else {
      return HttpResponse.json({
        enrollmentStatus: "SCHOOL_NOT_ON_SAFEPICK",
        adoptionRequestId: `req_${Math.random().toString(36).substr(2, 9)}`,
        message: "School not yet on SafePick. Request logged.",
        requestCount: (school.pendingRequests || 0) + 1,
        threshold: 10,
      });
    }
  }),

  // POST /schools/request
  http.post("/schools/request", async ({ request }: any) => {
    await delay(1000);
    const body = (await request.json()) as any;

    return HttpResponse.json(
      {
        adoptionRequestId: `req_${Math.random().toString(36).substr(2, 9)}`,
        message: "Request logged. You'll be notified when they join SafePick.",
        requestCount: body.schoolId ? 5 : 1,
        threshold: 10,
      },
      { status: 201 }
    );
  }),

  // GET /children/:childId/enrollment
  http.get("/children/:childId/enrollment", async ({ params }: any) => {
    await delay(500);
    const childId = params.childId as string;

    if (childId === "child_1") {
      return HttpResponse.json({
        childId,
        status: "PENDING_SCHOOL",
        school: null,
      });
    }

    if (childId === "child_2") {
      return HttpResponse.json({
        childId,
        status: "VERIFIED",
        school: MOCK_SCHOOLS[0],
      });
    }

    return HttpResponse.json({
      childId,
      status: "PENDING_VERIFICATION",
      school: MOCK_SCHOOLS[0],
    });
  }),

  // GET /schools/onboard/validate?token=
  http.get("/schools/onboard/validate", async ({ request }: any) => {
    await delay(800);
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (token === "tok_safepick_test_2026") {
      return HttpResponse.json({
        valid: true,
        school: MOCK_SCHOOLS[0],
      });
    }

    return HttpResponse.json({ valid: false });
  }),

  // POST /schools/onboard
  http.post("/schools/onboard", async ({ request }: any) => {
    await delay(1200);
    return HttpResponse.json(
      {
        school: { ...MOCK_SCHOOLS[0], status: "ACTIVE" },
        admin: { id: "usr_admin_01", role: "SCHOOL_ADMIN" },
        otpToken: "tok_otp_test_2026",
      },
      { status: 201 }
    );
  }),

  // POST /schools/onboard/verify
  http.post("/schools/onboard/verify", async ({ request }: any) => {
    await delay(800);
    const body = (await request.json()) as any;
    if (body.otp === "123456") {
      return HttpResponse.json({ message: "OTP verified successfully" });
    }
    return new HttpResponse(JSON.stringify({ error: "INVALID_OTP" }), { status: 400 });
  }),

  // POST /schools/onboard/kyc
  http.post("/schools/onboard/kyc", async ({ request }: any) => {
    await delay(1000);
    return HttpResponse.json({ message: "KYC documents submitted for review" });
  }),
];
