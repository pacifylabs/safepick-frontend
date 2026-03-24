"use client";

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  User, 
  Shield, 
  AlertCircle,
  MessageSquare,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Incident, AuditEntry } from '@/types/audit.types';
import { useAuditLog, useResolveIncident } from '@/hooks/useAudit';
import { AuditEntryRow } from './AuditEntryRow';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({ incident, onClose }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const resolveMutation = useResolveIncident();

  // Fetch the linked audit entry
  const { data: auditData, isLoading: auditLoading } = useAuditLog({
    // We don't have a direct getById for audit entries in the spec, 
    // but the linked auditEntryId is in the incident.
    // For now, we'll assume we can filter by it or it's provided.
    // If not, we'll just show the incident details.
  });

  const isResolved = !!incident.resolvedAt;

  const handleResolve = async () => {
    await resolveMutation.mutateAsync({
      incidentId: incident.id,
      payload: {
        resolvedBy: 'Admin', // In real app, get from auth
        resolutionNote: resolutionNote
      }
    });
    setIsResolving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-[var(--bg-surface)] rounded-t-[28px] md:rounded-[28px] w-full md:max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl border border-[var(--border)]"
      >
        {/* HEADER */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between sticky top-0 bg-[var(--bg-surface)] z-10 border-b border-[var(--border)]">
          <div>
            <p className="font-body text-[0.68rem] uppercase tracking-widest text-[var(--text-muted)] mb-1 font-bold">
              INCIDENT REPORT
            </p>
            <p className="font-display text-[1.25rem] font-semibold text-[var(--text-primary)]">
              {incident.type.replace(/_/g, ' ')}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-muted)] rounded-full text-[var(--text-secondary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 space-y-8">
          {/* STATUS BANNER */}
          <div>
            {isResolved ? (
              <div className="bg-[#E1F5EE] border border-[#0FA37F]/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0FA37F]/10 flex items-center justify-center text-[#0FA37F]">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-body text-[0.875rem] font-bold text-[#0F6E56]">Resolved</p>
                  <p className="font-body text-[0.75rem] text-[#0F6E56]/70">
                    This incident was marked as resolved on {format(new Date(incident.resolvedAt!), 'MMM d, yyyy')}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D85A30]/10 flex items-center justify-center text-[#D85A30]">
                  <motion.div 
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-[#D85A30] rounded-full"
                  />
                </div>
                <div>
                  <p className="font-body text-[0.875rem] font-bold text-[#D85A30]">This incident is open</p>
                  <p className="font-body text-[0.75rem] text-[#D85A30]/70">
                    Awaiting resolution and confirmation from authorized personnel.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* WHAT HAPPENED */}
          <section>
            <h4 className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-bold">
              WHAT HAPPENED
            </h4>
            <div className="bg-[var(--bg-muted)]/30 rounded-2xl p-4 border border-[var(--border)]">
              <p className="font-body text-[0.875rem] text-[var(--text-secondary)] leading-relaxed">
                {incident.description}
              </p>
            </div>
          </section>

          {/* INVOLVED PARTIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <section>
              <h4 className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-bold">
                CHILD
              </h4>
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-bold text-[0.8rem]">
                  {incident.childName[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-[0.82rem] font-bold text-[var(--text-primary)] truncate">{incident.childName}</p>
                  <p className="font-body text-[0.65rem] text-[var(--text-secondary)]">Protected child</p>
                </div>
              </div>
            </section>

            {incident.delegateName && (
              <section>
                <h4 className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-bold">
                  DELEGATE
                </h4>
                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#185FA5] flex items-center justify-center text-white font-bold text-[0.8rem]">
                    {incident.delegateName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-[0.82rem] font-bold text-[var(--text-primary)] truncate">{incident.delegateName}</p>
                    <p className="font-body text-[0.65rem] text-[var(--text-secondary)]">Attempted pickup</p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* TIMELINE */}
          <section>
            <h4 className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-bold flex items-center gap-2">
              <History className="w-3 h-3" />
              RELATED EVENT
            </h4>
            {auditLoading ? (
              <Skeleton className="h-16 w-full rounded-2xl" />
            ) : (
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl px-4">
                {/* For demo, we'll just show a placeholder if we can't find the specific entry */}
                <p className="py-4 text-[0.75rem] text-[var(--text-secondary)] italic">
                  Linked to audit entry: {incident.auditEntryId}
                </p>
              </div>
            )}
          </section>

          {/* RESOLUTION */}
          {isResolved ? (
            <section>
              <h4 className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-bold">
                RESOLUTION
              </h4>
              <div className="bg-[#E1F5EE]/50 border border-[#0FA37F]/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-[#0F6E56] mb-2">
                  <Clock className="w-4 h-4" />
                  <p className="font-body text-[0.75rem] font-bold">
                    Resolved by {incident.resolvedBy} on {format(new Date(incident.resolvedAt!), 'MMM d, h:mm a')}
                  </p>
                </div>
                {incident.resolutionNote && (
                  <p className="font-body text-[0.82rem] text-[#0F6E56]/80 leading-relaxed pl-6">
                    {incident.resolutionNote}
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section>
              <h4 className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)] mb-3 font-bold">
                TAKE ACTION
              </h4>
              {!isResolving ? (
                <Button 
                  variant="primary" 
                  fullWidth 
                  className="h-12 rounded-xl"
                  onClick={() => setIsResolving(true)}
                >
                  Mark as resolved
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      placeholder="Enter resolution notes..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="w-full bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl px-4 py-3 font-body text-[0.875rem] text-[var(--text-primary)] focus:outline-none focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/10 min-h-[100px] resize-none"
                    />
                    <MessageSquare className="absolute right-4 bottom-4 w-5 h-5 text-[var(--text-muted)]/30" />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="primary" 
                      className="flex-1 h-12 rounded-xl"
                      onClick={handleResolve}
                      loading={resolveMutation.isPending}
                    >
                      Confirm Resolution
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="h-12 px-6 rounded-xl"
                      onClick={() => setIsResolving(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </motion.div>
    </div>
  );
};
