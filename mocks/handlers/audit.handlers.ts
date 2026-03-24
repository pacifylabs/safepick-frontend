import { http, HttpResponse } from "msw";
import { AuditEntry, AuditEventType, AuditActorRole, Incident } from "@/types/audit.types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate mock audit entries
const generateAuditEntries = (childId?: string, schoolId?: string): AuditEntry[] => {
  const entries: AuditEntry[] = [
    {
      id: "ae_1",
      eventType: "CLOCK_OUT",
      actorId: "staff_01",
      actorRole: "SCHOOL_STAFF",
      actorName: "Security Guard A",
      childId: childId || "child_1",
      childName: "Zara Osei",
      delegateId: "del_1",
      delegateName: "David Mensah",
      verificationMethod: "QR Scan",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      timestamp: new Date().toISOString(),
    },
    {
      id: "ae_2",
      eventType: "PICKUP_APPROVED",
      actorId: "parent_1",
      actorRole: "PARENT",
      actorName: "Obinna Okafor",
      childId: childId || "child_1",
      childName: "Zara Osei",
      delegateId: "del_1",
      delegateName: "David Mensah",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "ae_3",
      eventType: "PICKUP_REQUEST_CREATED",
      actorId: "del_1",
      actorRole: "DELEGATE",
      actorName: "David Mensah",
      childId: childId || "child_1",
      childName: "Zara Osei",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      timestamp: new Date(Date.now() - 3700000).toISOString(),
    },
    {
      id: "ae_4",
      eventType: "CLOCK_IN",
      actorId: "staff_01",
      actorRole: "SCHOOL_STAFF",
      actorName: "Receptionist",
      childId: childId || "child_1",
      childName: "Zara Osei",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      timestamp: new Date(Date.now() - 28800000).toISOString(),
    },
    {
      id: "ae_5",
      eventType: "CHILD_HELD",
      actorId: "staff_01",
      actorRole: "SCHOOL_STAFF",
      actorName: "Security Guard A",
      childId: childId || "child_1",
      childName: "Zara Osei",
      delegateId: "del_2",
      delegateName: "Unknown Person",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "ae_6",
      eventType: "OVERRIDE_CODE_USED",
      actorId: "staff_02",
      actorRole: "SCHOOL_ADMIN",
      actorName: "Principal Smith",
      childId: childId || "child_1",
      childName: "Zara Osei",
      verificationMethod: "Emergency Code",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    }
  ];

  return entries;
};

// Generate mock incidents
const generateIncidents = (childId?: string, schoolId?: string): Incident[] => {
  return [
    {
      id: "inc_1",
      type: "CHILD_HELD",
      childId: childId || "child_1",
      childName: "Zara Osei",
      delegateId: "del_2",
      delegateName: "Unknown Person",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      reportedBy: "SCHOOL_STAFF",
      reportedByName: "Security Guard A",
      description: "A person claiming to be a delegate attempted to pick up the child without valid authorization. Child is currently being held in the administrative office.",
      auditEntryId: "ae_5",
      resolvedAt: null,
      resolvedBy: null,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "inc_2",
      type: "PICKUP_DENIED",
      childId: childId || "child_1",
      childName: "Zara Osei",
      delegateId: "del_3",
      delegateName: "James Wilson",
      schoolId: schoolId || "sch_01",
      schoolName: "Greenfield Academy",
      reportedBy: "PARENT",
      reportedByName: "Obinna Okafor",
      description: "Parent explicitly denied the pickup request from this delegate due to unauthorized timing.",
      auditEntryId: "ae_7",
      resolvedAt: new Date(Date.now() - 43200000).toISOString(),
      resolvedBy: "Parent",
      resolutionNote: "Spoke with the delegate, it was a misunderstanding of the schedule. Everything is fine now.",
      createdAt: new Date(Date.now() - 129600000).toISOString(),
    }
  ];
};

export const auditHandlers = [
  // GET AUDIT LOG
  http.get("/audit-log", async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const childId = url.searchParams.get("childId") || undefined;
    const schoolId = url.searchParams.get("schoolId") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    await delay(500);

    const entries = generateAuditEntries(childId, schoolId);

    return HttpResponse.json({
      entries,
      total: entries.length,
      page,
      totalPages: 1,
    });
  }),

  // GET INCIDENTS
  http.get("/incidents", async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const childId = url.searchParams.get("childId") || undefined;
    const schoolId = url.searchParams.get("schoolId") || undefined;
    const resolved = url.searchParams.get("resolved");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    await delay(500);

    let incidents = generateIncidents(childId, schoolId);
    
    if (resolved === "true") {
      incidents = incidents.filter(i => !!i.resolvedAt);
    } else if (resolved === "false") {
      incidents = incidents.filter(i => !i.resolvedAt);
    }

    return HttpResponse.json({
      incidents,
      total: incidents.length,
      page,
      totalPages: 1,
    });
  }),

  // RESOLVE INCIDENT
  http.patch("/incidents/:incidentId/resolve", async ({ params, request }: { params: any; request: Request }) => {
    const { incidentId } = params;
    const body = await request.json() as any;

    await delay(800);

    const incidents = generateIncidents();
    const incident = incidents.find(i => i.id === incidentId) || incidents[0];

    return HttpResponse.json({
      ...incident,
      resolvedAt: new Date().toISOString(),
      resolvedBy: body.resolvedBy,
      resolutionNote: body.resolutionNote,
    });
  }),

  // EXPORT AUDIT LOG
  http.get("/audit-log/export", async () => {
    await delay(1000);
    
    const csvContent = `Timestamp,Event,Actor,Role,Child,Delegate,Method,School,Outcome
${new Date().toISOString()},CLOCK_OUT,Security Guard A,SCHOOL_STAFF,Zara Osei,David Mensah,QR Scan,Greenfield Academy,SUCCESS
${new Date(Date.now() - 3600000).toISOString()},PICKUP_APPROVED,Obinna Okafor,PARENT,Zara Osei,David Mensah,,Greenfield Academy,SUCCESS`;

    return new HttpResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="audit-log.csv"'
      }
    });
  }),
];
