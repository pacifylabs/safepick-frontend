import { http, HttpResponse } from "msw";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAuditLogs = [
  {
    id: "audit_1",
    eventType: "LOGIN",
    timestamp: new Date().toISOString(),
    description: "Successfully signed in via OTP",
    actorId: "dlg_01HXYZ",
    actorName: "David Mensah",
    status: "SUCCESS"
  },
  {
    id: "audit_2",
    eventType: "PICKUP_APPROVED",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    description: "Pickup for Zara Osei approved by parent",
    actorId: "parent_123",
    actorName: "Obinna Okafor",
    status: "SUCCESS"
  },
  {
    id: "audit_3",
    eventType: "SOS_ALERT_SENT",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    description: "Emergency SOS alert triggered",
    actorId: "dlg_01HXYZ",
    actorName: "David Mensah",
    status: "WARNING"
  },
  {
    id: "audit_4",
    eventType: "ALARM_SET",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    description: "Reminder set for 15:30 pickup",
    actorId: "dlg_01HXYZ",
    actorName: "David Mensah",
    status: "SUCCESS"
  },
  {
    id: "audit_5",
    eventType: "PICKUP_DENIED",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    description: "Pickup request denied by school staff",
    actorId: "staff_456",
    actorName: "Security Guard A",
    status: "FAILURE"
  }
];

export const auditHandlers = [
  http.get("/delegate/audit-logs", async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    await delay(800);

    return HttpResponse.json({
      entries: mockAuditLogs,
      total: mockAuditLogs.length,
      page,
      limit
    });
  }),
];
