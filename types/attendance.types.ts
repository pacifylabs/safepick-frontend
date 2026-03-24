import { z } from "zod";

export const AttendanceStatusSchema = z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "PENDING"]);
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

export const DailyAttendanceSchema = z.object({
  id: z.string(),
  date: z.string(), // ISO date YYYY-MM-DD
  status: AttendanceStatusSchema,
  clockInTime: z.string().optional(),
  clockOutTime: z.string().optional(),
  releasedTo: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  }).optional(),
});

export type DailyAttendance = z.infer<typeof DailyAttendanceSchema>;

export const AttendanceSummarySchema = z.object({
  presentCount: z.number(),
  absentCount: z.number(),
  lateCount: z.number(),
  attendanceRate: z.number(),
});

export type AttendanceSummary = z.infer<typeof AttendanceSummarySchema>;

export const AttendanceResponseSchema = z.object({
  childId: z.string(),
  month: z.string(), // YYYY-MM
  records: z.array(DailyAttendanceSchema),
  summary: AttendanceSummarySchema,
});

export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>;

export interface ClockOutPayload {
  pickupRequestId: string;
  gateKeeperId: string;
}

export interface ClockOutResponse {
  success: boolean;
  clockOutTime: string;
  attendanceRecordId: string;
}
