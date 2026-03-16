import { http, HttpResponse } from "msw";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockDelegate = {
  id: "del_123",
  fullName: "John Driver",
  phone: "+2348012345678",
  photoUrl: null,
  kycStatus: "APPROVED",
  role: "DELEGATE",
  createdAt: "2024-03-15T10:00:00Z",
  totalAuthorizations: 2,
  activeAuthorizations: 2,
  pendingPickupsToday: 1,
};

const mockAuthorizations = [
  {
    id: "auth_1",
    status: "ACTIVE",
    authType: "RECURRING",
    allowedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    allowedTimeStart: "15:00",
    allowedTimeEnd: "17:00",
    child: {
      id: "child_1",
      fullName: "Kelechi Okafor",
      grade: "Primary 4",
      safepickId: "SP-KEO-92",
    },
    school: {
      id: "sch_1",
      name: "Grange School",
      address: "Harold Shodipo Crescent, Ikeja",
      gateInstructions: "Park at Gate B and present QR code to the security staff.",
    },
    parent: {
      fullName: "Obinna Okafor",
      phone: "+2348022223333",
    },
  },
  {
    id: "auth_2",
    status: "ACTIVE",
    authType: "ONE_TIME",
    allowedDays: ["2026-03-15"],
    allowedTimeStart: "14:00",
    allowedTimeEnd: "16:00",
    child: {
      id: "child_2",
      fullName: "Amaka Okafor",
      grade: "Primary 2",
      safepickId: "SP-AMO-11",
    },
    school: {
      id: "sch_1",
      name: "Grange School",
      address: "Harold Shodipo Crescent, Ikeja",
      gateInstructions: "Park at Gate B and present QR code to the security staff.",
    },
    parent: {
      fullName: "Obinna Okafor",
      phone: "+2348022223333",
    },
  },
];

const mockPickups = [
  {
    authorizationId: "auth_1",
    childName: "Kelechi Okafor",
    schoolName: "Grange School",
    pickupWindowStart: "15:00",
    pickupWindowEnd: "17:00",
    alarmSet: false,
    status: "PENDING",
  },
  {
    authorizationId: "auth_2",
    childName: "Amaka Okafor",
    schoolName: "Grange School",
    pickupWindowStart: "14:00",
    pickupWindowEnd: "16:00",
    alarmSet: true,
    alarmTime: "13:45",
    status: "IN_PROGRESS",
  },
];

const mockRequests = [
  {
    id: "req_1",
    status: "PENDING_GATE",
    child: {
      fullName: "Kelechi Okafor",
      photoUrl: null,
    },
    school: {
      name: "Grange School",
      address: "Harold Shodipo Crescent, Ikeja",
    },
    requestedAt: new Date().toISOString(),
    qrAvailable: true,
    authorizationId: "auth_1",
  },
];

export const delegateAuthHandlers = [
  http.post("/auth/delegate/login", async ({ request }: { request: Request }) => {
    const body = (await request.json()) as { phone: string };
    const phone = body.phone.replace(/[\s-]/g, "");
    await delay(800);

    if (phone === "+2348000000000") {
      return HttpResponse.json(
        { error: "DELEGATE_NOT_FOUND", message: "Account not found" },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      message: "OTP sent successfully",
      otpToken: "mock_otp_token_123",
      expiresIn: 300,
    });
  }),

  http.post("/auth/delegate/verify-otp", async ({ request }: { request: Request }) => {
    const { otpToken, otp } = (await request.json()) as {
      otpToken: string;
      otp: string;
    };
    await delay(1000);

    if (otp === "000000") {
      return HttpResponse.json(
        { error: "DELEGATE_NOT_VERIFIED", message: "KYC Pending" },
        { status: 403 }
      );
    }

    if (otp !== "123456") {
      return HttpResponse.json(
        { error: "INVALID_OTP", message: "Incorrect code" },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      accessToken: "mock_delegate_jwt_token",
      refreshToken: "mock_delegate_refresh_token",
      delegate: mockDelegate,
    });
  }),

  http.get("/delegate/me", async () => {
    await delay(500);
    return HttpResponse.json(mockDelegate);
  }),

  http.get("/delegate/authorizations", async () => {
    await delay(500);
    return HttpResponse.json({ authorizations: mockAuthorizations });
  }),

  http.get("/delegate/schedule", async () => {
    await delay(500);
    return HttpResponse.json({ pickups: mockPickups });
  }),

  http.get("/delegate/pickup-requests", async () => {
    await delay(500);
    return HttpResponse.json({ requests: mockRequests });
  }),

  http.post("/delegate/schedule/alarm", async () => {
    await delay(500);
    return HttpResponse.json({ message: "Alarm updated" });
  }),

  http.post("/delegate/sos", async () => {
    await delay(1000);
    return HttpResponse.json({ sosId: "sos_999", message: "SOS alert sent to parent" });
  }),

  http.post("/delegate/sos/:id/cancel", async () => {
    await delay(500);
    return HttpResponse.json({ message: "SOS alert cancelled" });
  }),
];
