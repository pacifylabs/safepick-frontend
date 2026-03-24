"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  FileSearch, 
  ShieldCheck, 
  ChevronLeft, 
  AlertCircle,
  History,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useChild } from '@/hooks/useChildren';
import { useAuditLog, useIncidents, useResolveIncident, useExportAuditLog } from '@/hooks/useAudit';
import { AuditLogFilters } from '@/types/audit.types';
import { AuditEntryRow } from '@/components/audit/AuditEntryRow';
import { IncidentCard } from '@/components/audit/IncidentCard';
import { AuditLogFilterBar } from '@/components/audit/AuditLogFilters';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ChildAuditPage() {
  const { childId } = useParams<{ childId: string }>();
  const router = useRouter();
  const { data: child } = useChild(childId);
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'incidents'>('timeline');
  const [filters, setFilters] = useState<AuditLogFilters>({
    childId,
    page: 1,
    limit: 20
  });
  
  const [incidentFilter, setIncidentFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  const { 
    data: auditData, 
    isLoading: auditLoading, 
    isError: auditError,
    refetch: refetchAudit
  } = useAuditLog(filters);

  const { 
    data: incidentsData, 
    isLoading: incidentsLoading,
    isError: incidentsError
  } = useIncidents({ 
    childId, 
    resolved: incidentFilter === 'ALL' ? undefined : incidentFilter === 'RESOLVED' 
  });

  const resolveIncidentMutation = useResolveIncident();
  const exportMutation = useExportAuditLog();

  const unresolvedCount = useMemo(() => {
    if (!incidentsData) return 0;
    // If API doesn't return total unresolved, we count from current page
    // For now assuming we need to show a count if any are unresolved
    return incidentsData.incidents.filter(i => !i.resolvedAt).length;
  }, [incidentsData]);

  const handleResolve = (incidentId: string, note: string) => {
    resolveIncidentMutation.mutate({ 
      incidentId, 
      payload: { 
        resolvedBy: 'Parent', // In real app, get from auth
        resolutionNote: note 
      } 
    });
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  if (!child) return null;

  return (
    <div className="w-full px-6 py-8 max-w-7xl mx-auto">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[0.875rem] mb-6">
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/dashboard/children/${childId}`} className="hover:text-[var(--text-primary)] transition-colors">My Children</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text-primary)] font-medium">Audit Log</span>
      </div>

      {/* HEADER */}
      <div className="mb-8">
        <SectionLabel className="text-[#0FA37F]">AUDIT LOG</SectionLabel>
        <h1 className="font-display text-[2.5rem] font-semibold text-[var(--text-primary)] leading-tight mt-2">
          {child.fullName.split(' ')[0]}'s activity
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Immutable history of all security events and pickup requests.
        </p>
      </div>

      {/* TABS */}
      <div className="flex bg-[var(--bg-muted)] rounded-full p-1 w-fit mb-8 border border-[var(--border)]">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.875rem] font-semibold transition-all ${
            activeTab === 'timeline' 
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <History className="w-4 h-4" />
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-[0.875rem] font-semibold transition-all relative ${
            activeTab === 'incidents' 
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Incidents
          {unresolvedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D85A30] text-white text-[0.65rem] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[var(--bg-page)]">
              {unresolvedCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === 'timeline' ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <AuditLogFilterBar 
              filters={filters} 
              onChange={setFilters} 
              onExport={handleExport}
              isExporting={exportMutation.isPending}
            />

            {auditLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-4 p-4">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : auditError ? (
              <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-2xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-[#D85A30] mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">Failed to load logs</h3>
                <p className="text-[var(--text-secondary)] mb-6">There was an error connecting to the audit service.</p>
                <Button variant="primary" onClick={() => refetchAudit()}>Retry Connection</Button>
              </div>
            ) : auditData?.entries.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center">
                  <FileSearch className="w-8 h-8 text-[var(--text-muted)]/40" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-[var(--text-primary)]">No activity found</p>
                  <p className="text-[var(--text-secondary)] mt-1">Try adjusting your filters or date range.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFilters({ childId, page: 1, limit: 20 })} className="mt-2">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)] px-5">
                  {auditData?.entries.map(entry => (
                    <AuditEntryRow key={entry.id} entry={entry} showChild={false} />
                  ))}
                </div>

                {/* PAGINATION */}
                <div className="flex items-center justify-between py-4">
                  <p className="font-body text-[0.75rem] text-[var(--text-secondary)]">
                    Page {auditData?.page} of {auditData?.totalPages} &middot; {auditData?.total} events
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={auditData?.page === 1}
                      onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) - 1 }))}
                      className="h-9 px-4 rounded-xl border border-[var(--border)]"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={auditData?.page === auditData?.totalPages}
                      onClick={() => setFilters(f => ({ ...f, page: (f.page || 1) + 1 }))}
                      className="h-9 px-4 rounded-xl border border-[var(--border)]"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="incidents"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* INCIDENT FILTERS */}
            <div className="flex bg-[var(--bg-muted)] rounded-full p-1 w-fit mb-8 border border-[var(--border)]">
              {(['ALL', 'OPEN', 'RESOLVED'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setIncidentFilter(type)}
                  className={`rounded-full px-5 py-1.5 text-[0.75rem] font-bold uppercase tracking-wider transition-all ${
                    incidentFilter === type 
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {incidentsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>
            ) : incidentsError ? (
              <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-2xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-[#D85A30] mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">Failed to load incidents</h3>
                <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : incidentsData?.incidents.length === 0 ? (
              <div className="flex flex-col items-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E1F5EE] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#0FA37F]/40" />
                </div>
                <div>
                  <p className="font-display text-xl font-bold text-[var(--text-primary)]">All clear</p>
                  <p className="text-[var(--text-secondary)] mt-1">No incidents on record for this child.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {incidentsData?.incidents.map(incident => (
                  <IncidentCard 
                    key={incident.id} 
                    incident={incident} 
                    onResolve={handleResolve}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
