"use client";

import React from 'react';
import { Download, X, Filter } from 'lucide-react';
import { AuditLogFilters, AuditEventType, AUDIT_EVENT_LABELS } from '@/types/audit.types';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

interface AuditLogFilterBarProps {
  filters: AuditLogFilters;
  onChange: (filters: AuditLogFilters) => void;
  isExporting?: boolean;
  onExport: () => void;
  showChildFilter?: boolean;
}

const EVENT_CATEGORIES = [
  { 
    label: 'Pickup', 
    events: ['PICKUP_REQUEST_CREATED', 'PICKUP_APPROVED', 'PICKUP_DENIED', 'PICKUP_TIMEOUT_ESCALATED'] 
  },
  { 
    label: 'Attendance', 
    events: ['CLOCK_IN', 'CLOCK_OUT'] 
  },
  { 
    label: 'Delegates', 
    events: ['AUTHORIZATION_CREATED', 'AUTHORIZATION_REVOKED', 'AUTHORIZATION_UPDATED', 'DELEGATE_KYC_SUBMITTED', 'DELEGATE_KYC_APPROVED', 'DELEGATE_KYC_REJECTED'] 
  },
  { 
    label: 'Emergency', 
    events: ['PANIC_TRIGGERED', 'PANIC_DEACTIVATED', 'SOS_TRIGGERED', 'CHILD_HELD', 'OVERRIDE_CODE_USED'] 
  },
];

export const AuditLogFilterBar: React.FC<AuditLogFilterBarProps> = ({ 
  filters, 
  onChange, 
  isExporting, 
  onExport,
  showChildFilter = false
}) => {
  const hasActiveFilters = !!(filters.eventType || filters.from || filters.to);

  const handleReset = () => {
    onChange({
      ...filters,
      eventType: undefined,
      from: undefined,
      to: undefined,
      page: 1,
    });
  };

  const dropdownItems = [
    { label: 'All events', onClick: () => onChange({ ...filters, eventType: undefined, page: 1 }) },
    ...EVENT_CATEGORIES.flatMap(cat => [
      ...cat.events.map(ev => ({
        label: AUDIT_EVENT_LABELS[ev as AuditEventType],
        onClick: () => onChange({ ...filters, eventType: ev as AuditEventType, page: 1 })
      }))
    ])
  ];

  return (
    <div className="flex flex-wrap gap-4 items-end mb-6">
      {/* FROM DATE */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-secondary)]/60 px-1">
          From
        </label>
        <div className="relative">
          <input
            type="date"
            value={filters.from || ''}
            onChange={(e) => onChange({ ...filters, from: e.target.value || undefined, page: 1 })}
            className="bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-2.5 text-white text-[0.875rem] font-body focus:outline-none focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/10 w-[160px] color-scheme-dark"
          />
        </div>
      </div>

      {/* TO DATE */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-secondary)]/60 px-1">
          To
        </label>
        <div className="relative">
          <input
            type="date"
            value={filters.to || ''}
            onChange={(e) => onChange({ ...filters, to: e.target.value || undefined, page: 1 })}
            className="bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-2.5 text-white text-[0.875rem] font-body focus:outline-none focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/10 w-[160px] color-scheme-dark"
          />
        </div>
      </div>

      {/* EVENT TYPE DROPDOWN */}
      <div className="flex flex-col gap-1.5">
        <label className="font-body text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-secondary)]/60 px-1">
          Event Type
        </label>
        <Dropdown
          align="left"
          trigger={
            <button className="flex items-center justify-between gap-3 bg-white/[0.07] border border-white/[0.12] rounded-xl px-4 py-2.5 text-white text-[0.875rem] font-body focus:outline-none focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/10 w-[200px] text-left hover:bg-white/10 transition-colors">
              <span className="truncate">
                {filters.eventType ? AUDIT_EVENT_LABELS[filters.eventType] : 'All events'}
              </span>
              <Filter className="w-4 h-4 text-white/40" />
            </button>
          }
          items={dropdownItems}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-3">
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset}
            className="text-[var(--text-secondary)] h-11 px-6 rounded-xl hover:bg-white/5"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          loading={isExporting}
          className="bg-white/[0.05] border-white/10 text-white h-11 px-6 rounded-xl hover:bg-white/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <style jsx global>{`
        .color-scheme-dark {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
};
