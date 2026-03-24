"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  XCircle, 
  ShieldOff, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  User, 
  Shield, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Incident } from '@/types/audit.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface IncidentCardProps {
  incident: Incident;
  onResolve?: (id: string, note: string) => void;
}

const getIncidentIcon = (type: string) => {
  switch (type) {
    case 'PICKUP_DENIED':
      return { Icon: XCircle, bg: 'bg-[#FAECE7]', color: 'text-[#D85A30]', label: 'Pickup denied' };
    case 'CHILD_HELD':
      return { Icon: ShieldOff, bg: 'bg-[#FAECE7]', color: 'text-[#D85A30]', label: 'Child held at school' };
    case 'SECONDARY_GUARDIAN_DENIED':
      return { Icon: AlertTriangle, bg: 'bg-[#FAEEDA]', color: 'text-[#EF9F27]', label: 'Emergency guardian denied pickup' };
    default:
      return { Icon: AlertCircle, bg: 'bg-[#FAECE7]', color: 'text-[#D85A30]', label: type };
  }
};

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onResolve }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const { Icon, bg, color, label } = getIncidentIcon(incident.type);
  const isResolved = !!incident.resolvedAt;

  return (
    <div className={`bg-[var(--bg-surface)] border rounded-2xl overflow-hidden transition-all duration-300 ${
      isResolved ? 'border-[var(--border)]' : 'border-[#D85A30]/20 shadow-sm'
    }`}>
      {/* HEADER */}
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>

          <div className="min-w-0">
            <p className="font-body text-[0.875rem] font-bold text-[var(--text-primary)]">
              {label}
            </p>
            <p className="font-body text-[0.75rem] text-[var(--text-secondary)] mt-0.5 truncate">
              {incident.childName} &middot; {incident.schoolName}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isResolved ? (
            <Badge variant="teal" className="bg-[#E1F5EE] text-[#0F6E56] border-none text-[0.65rem] py-0.5">
              Resolved
            </Badge>
          ) : (
            <Badge variant="danger" className="bg-[#FAECE7] text-[#D85A30] border-none flex items-center gap-1.5 text-[0.65rem] py-0.5">
              <motion.div 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-[#D85A30] rounded-full"
              />
              Open
            </Badge>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="px-5 pb-4">
        <p className="font-body text-[0.82rem] text-[var(--text-secondary)] leading-relaxed mb-4 bg-[var(--bg-muted)]/30 p-3 rounded-xl">
          {incident.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5" />
            <p className="font-body text-[0.72rem]">Reported {format(new Date(incident.createdAt), 'MMM d, yyyy · h:mm a')}</p>
          </div>

          {incident.delegateName && (
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <User className="w-3.5 h-3.5" />
              <p className="font-body text-[0.72rem]">Delegate: <span className="text-[var(--text-secondary)] font-medium">{incident.delegateName}</span></p>
            </div>
          )}

          {incident.reportedByName && (
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Shield className="w-3.5 h-3.5" />
              <p className="font-body text-[0.72rem]">Reported by: <span className="text-[var(--text-secondary)] font-medium">{incident.reportedByName}</span></p>
            </div>
          )}
        </div>

        {isResolved && (
          <div className="bg-[#E1F5EE]/50 rounded-xl px-4 py-3 mt-4 border border-[#0F6E56]/10">
            <div className="flex items-center gap-2 text-[#0F6E56] mb-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <p className="font-body text-[0.72rem] font-bold">Resolved {format(new Date(incident.resolvedAt!), 'MMM d · h:mm a')}</p>
            </div>
            {incident.resolutionNote && (
              <p className="font-body text-[0.72rem] text-[#0F6E56]/80 leading-relaxed pl-5">
                {incident.resolutionNote}
              </p>
            )}
          </div>
        )}

        {!isResolved && onResolve && (
          <div className="mt-4">
            {!isResolving ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[var(--text-secondary)] h-9 px-4 rounded-xl hover:bg-[var(--bg-muted)]"
                onClick={() => setIsResolving(true)}
              >
                Mark as resolved
              </Button>
            ) : (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="overflow-hidden space-y-3 pt-2"
              >
                <div className="relative">
                  <textarea
                    placeholder="Resolution note (optional)"
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="w-full bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl px-4 py-3 font-body text-[0.82rem] text-[var(--text-primary)] focus:outline-none focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/10 min-h-[80px] resize-none"
                    rows={2}
                  />
                  <MessageSquare className="absolute right-3 bottom-3 w-4 h-4 text-[var(--text-muted)]/30" />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="h-9 px-6 rounded-xl text-[0.78rem]"
                    onClick={() => onResolve(incident.id, resolutionNote)}
                  >
                    Confirm resolve
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-6 rounded-xl text-[0.78rem]"
                    onClick={() => {
                      setIsResolving(false);
                      setResolutionNote('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
