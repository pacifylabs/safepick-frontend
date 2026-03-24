import { http, HttpResponse } from "msw";
import { EmergencyStatus, TriggerPanicResponse, SendSosResponse, SosAlert } from "@/types/emergency.types";

// Helper function to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let emergencyStatus: EmergencyStatus = {
  panicActive: false,
  delegatesSuspended: 0,
  schoolsNotified: 0,
  activeSosId: null,
};

const mockSosAlerts: Record<string, SosAlert> = {
  "sos_001": {
    id: "sos_001",
    delegateId: "del_001",
    delegateName: "John Doe",
    childId: "child_001",
    childName: "Alice Smith",
    location: {
      lat: 6.5244,
      lng: 3.3792,
      accuracy: 10,
    },
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  }
};

export const emergencyHandlers = [
  // GET status
  http.get("*/emergency/status", async () => {
    await delay(500);
    return HttpResponse.json(emergencyStatus);
  }),

  // POST trigger panic
  http.post("*/emergency/panic/trigger", async () => {
    await delay(1000);
    emergencyStatus = {
      ...emergencyStatus,
      panicActive: true,
      delegatesSuspended: 12,
      schoolsNotified: 3,
    };
    
    // Simulate WebSocket event to other windows (Gate, etc.)
    window.postMessage({ type: "emergency.panic", data: { panicActive: true } }, "*");
    
    return HttpResponse.json({
      success: true,
      delegatesSuspended: 12,
      schoolsNotified: 3,
    } as TriggerPanicResponse);
  }),

  // POST deactivate panic
  http.post("*/emergency/panic/deactivate", async () => {
    await delay(1000);
    emergencyStatus = {
      ...emergencyStatus,
      panicActive: false,
      delegatesSuspended: 0,
      schoolsNotified: 0,
    };
    
    // Simulate WebSocket event to other windows
    window.postMessage({ type: "emergency.panic", data: { panicActive: false } }, "*");
    
    return HttpResponse.json({ success: true });
  }),

  // POST send SOS
  http.post("*/emergency/sos/send", async ({ request }: { request: Request }) => {
    await delay(1000);
    const body = (await request.json()) as any;
    const sosId = `sos_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAlert: SosAlert = {
      id: sosId,
      delegateId: "del_001", // Mock current delegate
      delegateName: "John Doe",
      childId: body.childId,
      childName: "Alice Smith", // Mock child name
      location: body.location,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    
    mockSosAlerts[sosId] = newAlert;
    emergencyStatus.activeSosId = sosId;
    
    // Simulate FCM message to parent
    window.postMessage({ 
      type: "DELEGATE_SOS", 
      alert: newAlert 
    }, "*");

    return HttpResponse.json({
      success: true,
      sosId,
    } as SendSosResponse);
  }),

  // POST cancel SOS
  http.post("*/emergency/sos/:sosId/cancel", async ({ params }: { params: Record<string, string> }) => {
    await delay(500);
    const { sosId } = params;
    if (mockSosAlerts[sosId as string]) {
      mockSosAlerts[sosId as string].status = "CANCELLED";
    }
    emergencyStatus.activeSosId = null;
    return HttpResponse.json({ success: true });
  }),

  // GET SOS alert
  http.get("*/emergency/sos/:sosId", async ({ params }: { params: Record<string, string> }) => {
    await delay(300);
    const { sosId } = params;
    const alert = mockSosAlerts[sosId as string];
    if (!alert) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(alert);
  }),
];
