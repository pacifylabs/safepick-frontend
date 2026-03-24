import { http, HttpResponse } from "msw";
import { mockPickupScenarios } from "./pickup.handlers";

export const attendanceHandlers = [
  http.get("/attendance/child/:childId", ({ params, request }: { params: Record<string, any>; request: Request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const childId = params.childId as string;

    // Generate mock attendance records for the month
    const records = Array.from({ length: 30 }, (_, i) => {
      const day = i + 1;
      const date = `${month}-${day.toString().padStart(2, "0")}`;
      const isWeekend = new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
      const isFuture = new Date(date) > new Date();

      let status: "PRESENT" | "ABSENT" | "LATE" | "PENDING" = "PENDING";
      if (isWeekend) status = "PENDING";
      else if (isFuture) status = "PENDING";
      else {
        const rand = Math.random();
        if (rand > 0.9) status = "ABSENT";
        else if (rand > 0.8) status = "LATE";
        else status = "PRESENT";
      }

      return {
        id: `att-${childId}-${date}`,
        date,
        status,
        clockInTime: status === "PRESENT" || status === "LATE" ? "08:15" : undefined,
        clockOutTime: status === "PRESENT" || status === "LATE" ? "15:45" : undefined,
        releasedTo: status === "PRESENT" || status === "LATE" ? {
          id: "del-123",
          name: "John Doe",
          role: "Driver",
        } : undefined,
      };
    });

    return HttpResponse.json({
      childId,
      month,
      records,
      summary: {
        presentCount: records.filter(r => r.status === "PRESENT").length,
        absentCount: records.filter(r => r.status === "ABSENT").length,
        lateCount: records.filter(r => r.status === "LATE").length,
        attendanceRate: 92.5,
      },
    });
  }),

  http.post("/attendance/clock-out", async ({ request }: { request: Request }) => {
    const body = await request.json() as any;

    if (body.pickupRequestId === "ALREADY_DONE") {
      return HttpResponse.json({
        error: "ALREADY_CLOCKED_OUT",
        clockOutTime: new Date().toISOString(),
        attendanceRecordId: "att-already-done",
      }, { status: 400 });
    }

    mockPickupScenarios.setReleased();

    return HttpResponse.json({
      success: true,
      clockOutTime: new Date().toISOString(),
      attendanceRecordId: "att-" + Math.random().toString(36).slice(2),
    });
  }),
];
