"use client";

import React from 'react';
import { 
  CheckCircle, 
  LogIn, 
  LogOut, 
  UserPlus, 
  AlertTriangle, 
  Clock, 
  Key, 
  XCircle, 
  ShieldOff, 
  AlertOctagon, 
  Info, 
  Users, 
  UserCheck,
  ShieldCheck,
  UserX,
  UserMinus,
  Smartphone,
  ShieldAlert
} from 'lucide-react';
import { AuditEventType, AUDIT_EVENT_SEVERITY } from '@/types/audit.types';

interface AuditEventIconProps {
  eventType: AuditEventType;
  size?: 'sm' | 'md';
}

const getIcon = (eventType: AuditEventType) => {
  switch (eventType) {
    case 'PICKUP_APPROVED':
    case 'SECONDARY_GUARDIAN_APPROVED':
    case 'DELEGATE_KYC_APPROVED':
      return CheckCircle;
    case 'CLOCK_IN':
      return LogIn;
    case 'CLOCK_OUT':
      return LogOut;
    case 'AUTHORIZATION_CREATED':
    case 'CHILD_REGISTERED':
    case 'SECONDARY_GUARDIAN_INVITED':
    case 'DELEGATE_ACCOUNT_CREATED':
      return UserPlus;
    case 'OVERRIDE_CODE_USED':
    case 'OVERRIDE_CODE_GENERATED':
      return Key;
    case 'SECONDARY_GUARDIAN_TIMEOUT':
      return Clock;
    case 'PICKUP_DENIED':
    case 'SECONDARY_GUARDIAN_DENIED':
    case 'DELEGATE_KYC_REJECTED':
      return XCircle;
    case 'AUTHORIZATION_REVOKED':
    case 'SECONDARY_GUARDIAN_REVOKED':
      return UserMinus;
    case 'CHILD_HELD':
      return ShieldOff;
    case 'PANIC_TRIGGERED':
    case 'SOS_TRIGGERED':
      return ShieldAlert;
    case 'PANIC_DEACTIVATED':
      return ShieldCheck;
    case 'DELEGATE_SUSPENDED':
      return UserX;
    case 'PICKUP_REQUEST_CREATED':
      return Smartphone;
    case 'DELEGATE_KYC_SUBMITTED':
      return UserCheck;
    default:
      return Info;
  }
};

export const AuditEventIcon: React.FC<AuditEventIconProps> = ({ eventType, size = 'md' }) => {
  const severity = AUDIT_EVENT_SEVERITY[eventType] || 'info';
  const Icon = getIcon(eventType);

  const containerStyles = {
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-9 h-9 rounded-xl',
  };

  const iconStyles = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  const severityStyles = {
    safe: 'bg-[#E1F5EE] text-[#0FA37F]',
    warning: 'bg-[#FAEEDA] text-[#EF9F27]',
    danger: 'bg-[#FAECE7] text-[#D85A30]',
    info: 'bg-[var(--bg-muted)] text-[var(--text-secondary)]',
  };

  return (
    <div className={`${containerStyles[size]} ${severityStyles[severity]} flex items-center justify-center`}>
      <Icon className={iconStyles[size]} />
    </div>
  );
};
