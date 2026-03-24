import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { auditService } from "@/services/audit.service";
import { AuditLogFilters, ResolveIncidentPayload } from "@/types/audit.types";

export const useAuditLog = (filters: AuditLogFilters) => {
  return useQuery({
    queryKey: ["audit-log", filters],
    queryFn: () => auditService.getAuditLog(filters),
    enabled: !!filters.childId || !!filters.schoolId,
    staleTime: 30000,
  });
};

export const useIncidents = (filters: { 
  childId?: string; 
  schoolId?: string; 
  resolved?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => auditService.getIncidents(filters),
    enabled: !!filters.childId || !!filters.schoolId,
    staleTime: 60000,
  });
};

export const useResolveIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ incidentId, payload }: { incidentId: string; payload: ResolveIncidentPayload }) =>
      auditService.resolveIncident(incidentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });
};

export const useExportAuditLog = () => {
  return useMutation({
    mutationFn: (filters: AuditLogFilters) => auditService.exportAuditLog(filters),
  });
};
