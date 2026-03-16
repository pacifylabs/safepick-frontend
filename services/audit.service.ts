import { delegateApiFetch } from "./delegateApiClient";
import { AuditEntrySchema, AuditLogResponse } from "@/types/audit.types";
import { z } from "zod";

export const auditService = {
  getDelegateAuditLogs: async (page = 1, limit = 20): Promise<AuditLogResponse> => {
    const data = await delegateApiFetch<any>(`/delegate/audit-logs?page=${page}&limit=${limit}`);
    return {
      entries: z.array(AuditEntrySchema).parse(data.entries),
      total: z.number().parse(data.total),
      page: z.number().parse(data.page),
      limit: z.number().parse(data.limit),
    };
  }
};
