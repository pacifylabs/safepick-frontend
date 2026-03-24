import { z } from "zod";

export const EmergencyStatusSchema = z.object({
  panicActive: z.boolean(),
  delegatesSuspended: z.number(),
  schoolsNotified: z.number(),
  activeSosId: z.string().nullable(),
});

export type EmergencyStatus = z.infer<typeof EmergencyStatusSchema>;

export const SosAlertSchema = z.object({
  id: z.string(),
  delegateId: z.string(),
  delegateName: z.string(),
  childId: z.string(),
  childName: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number(),
  }),
  status: z.enum(["ACTIVE", "RESOLVED", "CANCELLED"]),
  createdAt: z.string(),
});

export type SosAlert = z.infer<typeof SosAlertSchema>;

export interface TriggerPanicResponse {
  success: boolean;
  delegatesSuspended: number;
  schoolsNotified: number;
}

export interface SendSosPayload {
  childId: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
  };
}

export interface SendSosResponse {
  success: boolean;
  sosId: string;
}
