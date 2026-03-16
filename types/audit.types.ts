import { z } from "zod";

export const AuditEventTypeEnum = z.enum([
  "LOGIN",
  "LOGOUT",
  "PICKUP_REQUESTED",
  "PICKUP_APPROVED",
  "PICKUP_DENIED",
  "SOS_ALERT_SENT",
  "SOS_ALERT_CANCELLED",
  "ALARM_SET",
  "ALARM_DISABLED",
  "KYC_SUBMITTED",
  "PROFILE_UPDATED"
]);

export const AuditEntrySchema = z.object({
  id: z.string(),
  eventType: AuditEventTypeEnum,
  timestamp: z.string(),
  description: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  actorId: z.string(),
  actorName: z.string(),
  status: z.enum(["SUCCESS", "FAILURE", "WARNING"])
});

export type AuditEventType = z.infer<typeof AuditEventTypeEnum>;
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

export interface AuditLogResponse {
  entries: AuditEntry[];
  total: number;
  page: number;
  limit: number;
}
