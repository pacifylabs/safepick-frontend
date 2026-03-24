"use client";

import React from 'react';
import { format } from 'date-fns';
import { QrCode, Hash, Fingerprint, School as SchoolIcon, User } from 'lucide-react';
import { AuditEntry, AUDIT_EVENT_LABELS } from '@/types/audit.types';
import { AuditEventIcon } from './AuditEventIcon';
import { Badge } from '@/components/ui/Badge';

interface AuditEntryRowProps {
  entry: AuditEntry;
  showChild?: boolean;
}

const getVerificationIcon = (method: string) => {
  const m = method.toLowerCase();
  if (m.includes('qr')) return QrCode;
  if (m.includes('hash') || m.includes('code')) return Hash;
  if (m.includes('fingerprint') || m.includes('biometric')) return Fingerprint;
  return null;
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'PARENT': return 'Parent';
    case 'SCHOOL_STAFF': return 'School staff';
    case 'SCHOOL_ADMIN': return 'School admin';
    case 'SYSTEM': return 'System';
    case 'SECONDARY_GUARDIAN': return 'Guardian';
    case 'DELEGATE': return 'Delegate';
    default: return role;
  }
};

export const AuditEntryRow: React.FC<AuditEntryRowProps> = ({ entry, showChild = false }) => {
  const VerificationIcon = entry.verificationMethod ? getVerificationIcon(entry.verificationMethod) : null;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-[var(--border)] last:border-0 cursor-default">
      <div className="flex-shrink-0">
        <AuditEventIcon eventType={entry.eventType} size="md" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="font-body text-[0.875rem] font-medium text-[var(--text-primary)]">
            {AUDIT_EVENT_LABELS[entry.eventType]}
          </p>

          {entry.delegateName && (
            <span className="font-body text-[0.75rem] text-[var(--text-secondary)]">
              &middot; {entry.delegateName}
            </span>
          )}

          {showChild && entry.childName && (
            <Badge variant="navy" className="bg-[var(--bg-muted)] text-[var(--text-secondary)] border-none text-[0.65rem] py-0.5">
              {entry.childName}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <p className="font-body text-[0.72rem] text-[var(--text-muted)]">
            {format(new Date(entry.timestamp), 'MMM d · h:mm a')}
          </p>

          {entry.verificationMethod && (
            <div className="flex items-center gap-1">
              {VerificationIcon && <VerificationIcon className="w-3 h-3 text-[var(--text-muted)]" />}
              <p className="font-body text-[0.68rem] text-[var(--text-muted)]">
                {entry.verificationMethod}
              </p>
            </div>
          )}

          {entry.schoolName && (
            <div className="flex items-center gap-1">
              <p className="font-body text-[0.68rem] text-[var(--text-muted)]">
                &middot; {entry.schoolName}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <p className="font-body text-[0.68rem] text-[var(--text-muted)] font-medium uppercase tracking-wider">
          {getRoleLabel(entry.actorRole)}
        </p>
      </div>
    </div>
  );
};
