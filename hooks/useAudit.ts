import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/audit.service";

export const useDelegateAuditLogs = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["delegate", "audit-logs", page, limit],
    queryFn: () => auditService.getDelegateAuditLogs(page, limit),
  });
};
