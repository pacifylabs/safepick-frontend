import { http, HttpResponse } from "msw";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSessions: Record<string, any> = {
  "vsn_01HXYZ": {
    id: "vsn_01HXYZ",
    status: "QR_VERIFIED",
    delegate: {
      id: "dlg_01HXYZ",
      fullName: "David Mensah",
      relationship: "DRIVER",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      phone: "+234 803 123 4433",
    },
    child: {
      id: "chd_01HXYZ",
      fullName: "Zara Osei",
      photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara",
    },
    parentName: "Amara Osei",
  }
};

export const verificationHandlers = [
  // GET /verification/qr-token
  http.get("/verification/qr-token", async ({ request }: any) => {
    const url = new URL(request.url);
    const authId = url.searchParams.get("authorizationId");

    if (authId === "invalid") {
      return new HttpResponse(
        JSON.stringify({ error: "AUTHORIZATION_NOT_ACTIVE" }),
        { status: 403 }
      );
    }

    await delay(500);
    return HttpResponse.json({
      qrToken: "tok_67890",
      qrPayload: "SP-QR:eyJmock",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      delegateName: "David Mensah",
      childName: "Zara Osei",
    });
  }),

  // POST /verification/scan-qr
  http.post("/verification/scan-qr", async ({ request }: any) => {
    const { qrPayload } = (await request.json()) as any;

    await delay(1000);

    if (qrPayload.includes("EXPIRED")) {
      return HttpResponse.json({
        error: "QR_EXPIRED",
        sessionId: "vsn_01HXYZ",
        fallbackMethod: "OTP",
      }, { status: 400 });
    }

    if (qrPayload.includes("VIOLATION")) {
      return HttpResponse.json({
        error: "AUTHORIZATION_RULES_VIOLATED",
        message: "This delegate is not authorized for pickup at this time.",
      }, { status: 403 });
    }

    return HttpResponse.json(mockSessions["vsn_01HXYZ"]);
  }),

  // POST /verification/trigger-otp
  http.post("/verification/trigger-otp", async () => {
    await delay(500);
    return HttpResponse.json({
      message: "OTP sent to delegate's phone",
      otpToken: "otp_998877",
      expiresIn: 120,
    });
  }),

  // POST /verification/submit-otp
  http.post("/verification/submit-otp", async ({ request }: any) => {
    const { otp } = (await request.json()) as any;
    await delay(800);

    if (otp === "000000") {
      return HttpResponse.json({ error: "OTP_INVALID", attemptsRemaining: 2 }, { status: 400 });
    }
    if (otp === "111111") {
      return HttpResponse.json({ error: "OTP_INVALID", attemptsRemaining: 0 }, { status: 400 });
    }

    return HttpResponse.json({ ...mockSessions["vsn_01HXYZ"], status: "OTP_VERIFIED" });
  }),

  // POST /verification/submit-biometric
  http.post("/verification/submit-biometric", async ({ request }: any) => {
    const { template } = (await request.json()) as any;
    await delay(1500);

    if (template === "FAIL") {
      return HttpResponse.json({ error: "BIOMETRIC_FAILED", fallbackMethod: "OTP" }, { status: 400 });
    }

    return HttpResponse.json({ ...mockSessions["vsn_01HXYZ"], status: "BIOMETRIC_VERIFIED" });
  }),

  // GET /verification/session/:sessionId
  http.get("/verification/session/:sessionId", async ({ params }: any) => {
    const { sessionId } = params;
    await delay(300);

    const session = mockSessions[sessionId as string] || mockSessions["vsn_01HXYZ"];
    return HttpResponse.json({
      ...session,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    });
  }),
];
