import { z } from "zod";

export const SchoolRequestStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const RequestSchoolRequestSchema = z.object({
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolAddress: z.string().min(5, "Address must be at least 5 characters"),
  schoolPhone: z.string().min(7, "Enter a valid phone number").optional().or(z.literal("")),
  schoolEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  notes: z.string().max(500, "Notes must be under 500 characters").optional().or(z.literal("")),
});

export const RequestSchoolResponseSchema = z.object({
  id: z.string(),
  status: z.literal("PENDING"),
  message: z.string(),
  createdAt: z.string(),
});

export const SchoolRequestItemSchema = z.object({
  id: z.string(),
  parentId: z.string(),
  parentName: z.string(),
  parentPhone: z.string(),
  schoolName: z.string(),
  schoolAddress: z.string(),
  schoolPhone: z.string().nullable(),
  schoolEmail: z.string().nullable(),
  notes: z.string().nullable(),
  status: SchoolRequestStatusSchema,
  adminNotes: z.string().nullable(),
  reviewedBy: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  parent: z.object({
    id: z.string(),
    fullName: z.string(),
    phone: z.string(),
  }).optional(),
});

export const ListRequestsResponseSchema = z.object({
  requests: z.array(SchoolRequestItemSchema),
  total: z.number(),
  page: z.number(),
});

export const ListRequestsQuerySchema = z.object({
  status: SchoolRequestStatusSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const ReviewRequestRequestSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().optional(),
});

export const ReviewRequestResponseSchema = z.object({
  id: z.string(),
  status: SchoolRequestStatusSchema,
  message: z.string(),
});

export type SchoolRequestStatus = z.infer<typeof SchoolRequestStatusSchema>;
export type RequestSchoolPayload = z.infer<typeof RequestSchoolRequestSchema>;
export type RequestSchoolResponse = z.infer<typeof RequestSchoolResponseSchema>;
export type SchoolRequestItem = z.infer<typeof SchoolRequestItemSchema>;
export type ListRequestsResponse = z.infer<typeof ListRequestsResponseSchema>;
export type ListRequestsQuery = z.infer<typeof ListRequestsQuerySchema>;
export type ReviewRequestPayload = z.infer<typeof ReviewRequestRequestSchema>;
export type ReviewRequestResponse = z.infer<typeof ReviewRequestResponseSchema>;
