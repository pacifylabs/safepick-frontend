import { apiFetch } from "./apiClient";
import { 
  AttendanceResponseSchema, 
  AttendanceResponse, 
  ClockOutPayload, 
  ClockOutResponse 
} from "@/types/attendance.types";

export const attendanceService = {
  getAttendanceByChild: async (childId: string, month: string): Promise<AttendanceResponse> => {
    const params = new URLSearchParams({ month });
    const data = await apiFetch<unknown>(`/attendance/child/${childId}?${params.toString()}`);
    return AttendanceResponseSchema.parse(data);
  },

  clockOut: async (payload: ClockOutPayload): Promise<ClockOutResponse> => {
    try {
      const data = await apiFetch<any>(`/attendance/clock-out`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      return {
        success: true,
        clockOutTime: data.clockOutTime,
        attendanceRecordId: data.attendanceRecordId,
      };
    } catch (error: any) {
      // Check for ALREADY_CLOCKED_OUT in the error data
      if (error.data?.error === "ALREADY_CLOCKED_OUT") {
        return {
          success: true,
          clockOutTime: error.data.clockOutTime || new Date().toISOString(),
          attendanceRecordId: error.data.attendanceRecordId || "",
        };
      }
      throw error;
    }
  },
};
