import { apiFetch } from "./apiClient";
import { 
  AuditLogFilters, 
  AuditLogResponse, 
  AuditLogResponseSchema,
  IncidentResponse,
  IncidentResponseSchema,
  ResolveIncidentPayload,
  Incident,
  IncidentSchema
} from "@/types/audit.types";

export const auditService = {
  getAuditLog: async (filters: AuditLogFilters): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    if (filters.childId) params.append('childId', filters.childId);
    if (filters.schoolId) params.append('schoolId', filters.schoolId);
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const data = await apiFetch<any>(`/audit-log?${params.toString()}`);
    return AuditLogResponseSchema.parse(data);
  },

  getIncidents: async (filters: { 
    childId?: string; 
    schoolId?: string; 
    resolved?: boolean;
    page?: number;
    limit?: number;
  }): Promise<IncidentResponse> => {
    const params = new URLSearchParams();
    if (filters.childId) params.append('childId', filters.childId);
    if (filters.schoolId) params.append('schoolId', filters.schoolId);
    if (filters.resolved !== undefined) params.append('resolved', filters.resolved.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const data = await apiFetch<any>(`/incidents?${params.toString()}`);
    return IncidentResponseSchema.parse(data);
  },

  resolveIncident: async (incidentId: string, payload: ResolveIncidentPayload): Promise<Incident> => {
    const data = await apiFetch<any>(`/incidents/${incidentId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return IncidentSchema.parse(data);
  },

  exportAuditLog: async (filters: AuditLogFilters): Promise<void> => {
    const params = new URLSearchParams();
    if (filters.childId) params.append('childId', filters.childId);
    if (filters.schoolId) params.append('schoolId', filters.schoolId);
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    params.append('format', 'csv');

    const data = await apiFetch<string>(`/audit-log/export?${params.toString()}`, {
      headers: { 'Accept': 'text/csv' }
    });

    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Filename generation
    const dateStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const filename = `safepick-audit-${filters.childId || filters.schoolId || 'export'}-${dateStr}.csv`;
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
