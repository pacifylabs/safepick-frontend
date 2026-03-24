"use client";

import React, { useState, useMemo } from 'react';
import { 
  FileSearch, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  History,
  AlertTriangle,
  Download,
  Users,
  LogIn,
  LogOut,
  XCircle,
  ShieldOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuditLog, useIncidents, useResolveIncident, useExportAuditLog } from '@/hooks/useAudit';
import { AuditLogFilters } from '@/types/audit.types';
import { AuditEntryRow } from '@/components/audit/AuditEntryRow';
import { IncidentCard } from '@/components/audit/IncidentCard';
import { AuditLogFilterBar } from '@/components/audit/AuditLogFilters';
import { Button } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

export default function SchoolAuditPage() {
  // In real app, get schoolId from auth context
  const schoolId = 'sch_01HXYZ'; 
  const schoolName = 'Greenfield Academy';

  const [activeTab, setActiveTab] = useState<'timeline' | 'incidents'>('timeline');
  const [filters, setFilters] = useState<AuditLogFilters>({
    schoolId,
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
    schoolId, 
    resolved: incidentFilter === 'ALL' ? undefined : incidentFilter === 'RESOLVED' 
  });

  const resolveIncidentMutation = useResolveIncident();
  const exportMutation = useExportAuditLog();

  const unresolvedCount = useMemo(() => {
    if (!incidentsData) return 0;
    return incidentsData.incidents.filter(i => !i.resolvedAt).length;
  }, [incidentsData]);

  // Daily stats for summary card
  const todayStats = useMemo(() => {
    if (!auditData) return { arrived: 0, departed: 0, denied: 0, held: 0, total: 0 };
    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = auditData.entries.filter(e => e.timestamp.startsWith(today));
    
    return {
      arrived: todayEntries.filter(e => e.eventType === 'CLOCK_IN').length,
      departed: todayEntries.filter(e => e.eventType === 'CLOCK_OUT').length,
      denied: todayEntries.filter(e => e.eventType === 'PICKUP_DENIED').length,
      held: todayEntries.filter(e => e.eventType === 'CHILD_HELD').length,
      total: todayEntries.length
    };
  }, [auditData]);

  const handleResolve = (incidentId: string, note: string) => {
    resolveIncidentMutation.mutate({ 
      incidentId, 
      payload: { 
        resolvedBy: 'School Admin', 
        resolutionNote: note 
      } 
    });
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  const handleExportToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    exportMutation.mutate({ schoolId, from: today, to: today });
  };

  return (
    <div className="w-full px-6 py-8 max-w-[1200px] mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <SectionLabel className="text-[#0FA37F]">SCHOOL AUDIT</SectionLabel>
        <h1 className="font-display text-[2.5rem] font-semibold text-[var(--text-primary)] leading-tight mt-2">
          Activity log
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Comprehensive audit trail for all security events at {schoolName}.
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
            {/* DAILY SUMMARY */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <p className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-bold">
                  TODAY'S OVERVIEW
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[2rem] font-bold text-[var(--text-primary)]">
                    {todayStats.total}
                  </span>
                  <span className="text-[var(--text-secondary)] font-medium">events recorded</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:px-8 border-l border-[var(--border)] md:border-l-0 md:border-x">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#0FA37F]">
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="text-[1.1rem] font-bold">{todayStats.arrived}</span>
                  </div>
                  <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Arrived</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="text-[1.1rem] font-bold">{todayStats.departed}</span>
                  </div>
                  <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Departed</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#D85A30]">
                    <XCircle className="w-3.5 h-3.5" />
                    <span className="text-[1.1rem] font-bold">{todayStats.denied}</span>
                  </div>
                  <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Denied</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#EF9F27]">
                    <ShieldOff className="w-3.5 h-3.5" />
                    <span className="text-[1.1rem] font-bold">{todayStats.held}</span>
                  </div>
                  <p className="text-[0.65rem] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Held</p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleExportToday}
                  loading={exportMutation.isPending}
                  className="h-12 px-6 rounded-xl"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export today
                </Button>
              </div>
            </div>

            <AuditLogFilterBar 
              filters={filters} 
              onChange={setFilters} 
              onExport={handleExport}
              isExporting={exportMutation.isPending}
            />

            {auditLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : auditError ? (
              <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-2xl p-8 text-center">
                <AlertCircle className="w-12 h-12 text-[#D85A30] mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">Failed to load logs</h3>
                <Button variant="primary" onClick={() => refetchAudit()}>Retry</Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)] px-5">
                  {auditData?.entries.map(entry => (
                    <AuditEntryRow key={entry.id} entry={entry} showChild={true} />
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
                  <p className="text-[var(--text-secondary)] mt-1">No incidents on record for your school.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
