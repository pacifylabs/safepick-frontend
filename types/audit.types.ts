import { z } from "zod";

export const AuditEventTypeEnum = z.enum([
  // Child lifecycle
  'CHILD_REGISTERED',
  'CHILD_UPDATED',

  // Delegate lifecycle
  'DELEGATE_KYC_SUBMITTED',
  'DELEGATE_KYC_APPROVED',
  'DELEGATE_KYC_REJECTED',
  'DELEGATE_ACCOUNT_CREATED',
  'DELEGATE_SUSPENDED',

  // Authorization lifecycle
  'AUTHORIZATION_CREATED',
  'AUTHORIZATION_REVOKED',
  'AUTHORIZATION_UPDATED',

  // Secondary guardian
  'SECONDARY_GUARDIAN_INVITED',
  'SECONDARY_GUARDIAN_ACCOUNT_CREATED',
  'SECONDARY_GUARDIAN_REVOKED',
  'SECONDARY_GUARDIAN_APPROVED',
  'SECONDARY_GUARDIAN_DENIED',
  'SECONDARY_GUARDIAN_TIMEOUT',

  // Pickup lifecycle
  'PICKUP_REQUEST_CREATED',
  'PICKUP_APPROVED',
  'PICKUP_DENIED',
  'PICKUP_TIMEOUT_ESCALATED',

  // Override + hold
  'OVERRIDE_CODE_GENERATED',
  'OVERRIDE_CODE_USED',
  'OVERRIDE_CODE_REVOKED',
  'CHILD_HELD',

  // Attendance
  'CLOCK_IN',
  'CLOCK_OUT',

  // Emergency
  'PANIC_TRIGGERED',
  'PANIC_DEACTIVATED',
  'SOS_TRIGGERED',
]);

export type AuditEventType = z.infer<typeof AuditEventTypeEnum>;

export const AuditActorRoleEnum = z.enum([
  'PARENT',
  'SCHOOL_STAFF',
  'SCHOOL_ADMIN',
  'DELEGATE',
  'SECONDARY_GUARDIAN',
  'SUPER_ADMIN',
  'SYSTEM',
]);

export type AuditActorRole = z.infer<typeof AuditActorRoleEnum>;

export const AuditEntrySchema = z.object({
  id: z.string(),
  eventType: AuditEventTypeEnum,
  actorId: z.string(),
  actorRole: AuditActorRoleEnum,
  actorName: z.string(),
  childId: z.string().optional(),
  childName: z.string().optional(),
  delegateId: z.string().optional(),
  delegateName: z.string().optional(),
  verificationMethod: z.string().optional(),
  outcome: z.string().optional(),
  schoolId: z.string().optional(),
  schoolName: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.string(),
});

export type AuditEntry = z.infer<typeof AuditEntrySchema>;

export const AuditLogResponseSchema = z.object({
  entries: z.array(AuditEntrySchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;

export const AuditLogFiltersSchema = z.object({
  childId: z.string().optional(),
  schoolId: z.string().optional(),
  eventType: AuditEventTypeEnum.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;

export const IncidentTypeEnum = z.enum([
  'PICKUP_DENIED',
  'CHILD_HELD',
  'SECONDARY_GUARDIAN_DENIED',
  'UNAUTHORIZED_ATTEMPT',
]);

export type IncidentType = z.infer<typeof IncidentTypeEnum>;

export const IncidentSchema = z.object({
  id: z.string(),
  type: IncidentTypeEnum,
  childId: z.string(),
  childName: z.string(),
  delegateId: z.string().optional(),
  delegateName: z.string().optional(),
  schoolId: z.string(),
  schoolName: z.string(),
  reportedBy: AuditActorRoleEnum,
  reportedByName: z.string(),
  description: z.string(),
  auditEntryId: z.string(),
  resolvedAt: z.string().nullable(),
  resolvedBy: z.string().nullable(),
  resolutionNote: z.string().optional(),
  createdAt: z.string(),
});

export type Incident = z.infer<typeof IncidentSchema>;

export const IncidentResponseSchema = z.object({
  incidents: z.array(IncidentSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
});

export type IncidentResponse = z.infer<typeof IncidentResponseSchema>;

export const ResolveIncidentPayloadSchema = z.object({
  resolvedBy: z.string(),
  resolutionNote: z.string().optional(),
});

export type ResolveIncidentPayload = z.infer<typeof ResolveIncidentPayloadSchema>;

export const AUDIT_EVENT_LABELS: Record<AuditEventType, string> = {
  CHILD_REGISTERED: 'Child registered',
  CHILD_UPDATED: 'Child updated',
  DELEGATE_KYC_SUBMITTED: 'Delegate KYC submitted',
  DELEGATE_KYC_APPROVED: 'Delegate KYC approved',
  DELEGATE_KYC_REJECTED: 'Delegate KYC rejected',
  DELEGATE_ACCOUNT_CREATED: 'Delegate account created',
  DELEGATE_SUSPENDED: 'Delegate suspended',
  AUTHORIZATION_CREATED: 'Delegate authorized',
  AUTHORIZATION_REVOKED: 'Delegate access revoked',
  AUTHORIZATION_UPDATED: 'Authorization updated',
  SECONDARY_GUARDIAN_INVITED: 'Emergency guardian invited',
  SECONDARY_GUARDIAN_ACCOUNT_CREATED: 'Emergency guardian account created',
  SECONDARY_GUARDIAN_REVOKED: 'Emergency guardian revoked',
  SECONDARY_GUARDIAN_APPROVED: 'Emergency guardian approved pickup',
  SECONDARY_GUARDIAN_DENIED: 'Emergency guardian denied pickup',
  SECONDARY_GUARDIAN_TIMEOUT: 'Emergency guardian timeout',
  PICKUP_REQUEST_CREATED: 'Pickup request created',
  PICKUP_APPROVED: 'Pickup approved',
  PICKUP_DENIED: 'Pickup denied',
  PICKUP_TIMEOUT_ESCALATED: 'Pickup timeout escalated',
  OVERRIDE_CODE_GENERATED: 'Override code generated',
  OVERRIDE_CODE_USED: 'Override code used',
  OVERRIDE_CODE_REVOKED: 'Override code revoked',
  CHILD_HELD: 'Child held at school',
  CLOCK_IN: 'Arrived at school',
  CLOCK_OUT: 'Left school',
  PANIC_TRIGGERED: 'Emergency panic triggered',
  PANIC_DEACTIVATED: 'Panic deactivated',
  SOS_TRIGGERED: 'SOS alert triggered',
};

export const AUDIT_EVENT_SEVERITY: Record<AuditEventType, 'safe' | 'warning' | 'danger' | 'info'> = {
  CHILD_REGISTERED: 'info',
  CHILD_UPDATED: 'info',
  DELEGATE_KYC_SUBMITTED: 'info',
  DELEGATE_KYC_APPROVED: 'safe',
  DELEGATE_KYC_REJECTED: 'danger',
  DELEGATE_ACCOUNT_CREATED: 'info',
  DELEGATE_SUSPENDED: 'danger',
  AUTHORIZATION_CREATED: 'safe',
  AUTHORIZATION_REVOKED: 'danger',
  AUTHORIZATION_UPDATED: 'info',
  SECONDARY_GUARDIAN_INVITED: 'info',
  SECONDARY_GUARDIAN_ACCOUNT_CREATED: 'info',
  SECONDARY_GUARDIAN_REVOKED: 'danger',
  SECONDARY_GUARDIAN_APPROVED: 'safe',
  SECONDARY_GUARDIAN_DENIED: 'danger',
  SECONDARY_GUARDIAN_TIMEOUT: 'warning',
  PICKUP_REQUEST_CREATED: 'info',
  PICKUP_APPROVED: 'safe',
  PICKUP_DENIED: 'danger',
  PICKUP_TIMEOUT_ESCALATED: 'danger',
  OVERRIDE_CODE_GENERATED: 'warning',
  OVERRIDE_CODE_USED: 'warning',
  OVERRIDE_CODE_REVOKED: 'warning',
  CHILD_HELD: 'danger',
  CLOCK_IN: 'info',
  CLOCK_OUT: 'info',
  PANIC_TRIGGERED: 'danger',
  PANIC_DEACTIVATED: 'info',
  SOS_TRIGGERED: 'danger',
};
