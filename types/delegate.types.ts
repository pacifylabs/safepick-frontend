import { z } from "zod";

export const RelationshipEnum = z.enum([
  "DRIVER",
  "NANNY",
  "RELATIVE",
  "TEACHER",
  "SCHOOL_BUS",
  "OTHER",
]);

export const KYCStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const AuthTypeEnum = z.enum(["ONE_TIME", "RECURRING", "DATE_RANGE"]);

export const AuthorizationStatusEnum = z.enum([
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
  "EXPIRED",
]);

export const SosReasonEnum = z.enum(["SUSPECTED_THREAT", "ACCIDENT", "OTHER"]);

export const DelegateAccountSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  phone: z.string(),
  photoUrl: z.string().nullable().optional(),
  kycStatus: KYCStatusEnum,
  role: z.literal("DELEGATE"),
  createdAt: z.string(),
  totalAuthorizations: z.number().optional(),
  activeAuthorizations: z.number().optional(),
  pendingPickupsToday: z.number().optional(),
});

export const DelegateAuthorizationSchema = z.object({
  id: z.string(),
  status: AuthorizationStatusEnum,
  authType: AuthTypeEnum,
  relationship: RelationshipEnum.optional(),
  allowedDays: z.array(z.string()),
  allowedTimeStart: z.string().nullable().optional(),
  allowedTimeEnd: z.string().nullable().optional(),
  child: z.object({
    id: z.string(),
    fullName: z.string(),
    grade: z.string(),
    photoUrl: z.string().nullable().optional(),
    safepickId: z.string(),
  }),
  school: z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    gateInstructions: z.string().optional(),
  }),
  parent: z.object({
    fullName: z.string(),
    phone: z.string(),
  }),
});

export const SchedulePickupSchema = z.object({
  authorizationId: z.string(),
  childName: z.string(),
  schoolName: z.string(),
  pickupWindowStart: z.string(),
  pickupWindowEnd: z.string(),
  alarmSet: z.boolean(),
  alarmTime: z.string().nullable().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETE"]),
});

export const PickupRequestSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING_GATE", "APPROVED", "DENIED", "COMPLETED"]),
  child: z.object({
    fullName: z.string(),
    photoUrl: z.string().nullable().optional(),
  }),
  school: z.object({
    name: z.string(),
    address: z.string(),
  }),
  requestedAt: z.string(),
  qrAvailable: z.boolean(),
  authorizationId: z.string(),
});

export const AlarmPayloadSchema = z.object({
  authorizationId: z.string(),
  date: z.string(),
  alarmTime: z.string(),
  enabled: z.boolean(),
});

export const SosPayloadSchema = z.object({
  authorizationId: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  reason: SosReasonEnum.optional(),
});

export type DelegateAccount = z.infer<typeof DelegateAccountSchema>;
export type DelegateAuthorization = z.infer<typeof DelegateAuthorizationSchema>;
export type DelegateKycStatus = z.infer<typeof KYCStatusEnum>;
export type AuthorizationStatus = z.infer<typeof AuthorizationStatusEnum>;
export type SchedulePickup = z.infer<typeof SchedulePickupSchema>;
export type PickupRequest = z.infer<typeof PickupRequestSchema>;
export type AlarmPayload = z.infer<typeof AlarmPayloadSchema>;
export type SosPayload = z.infer<typeof SosPayloadSchema>;
export type SosReason = z.infer<typeof SosReasonEnum>;
