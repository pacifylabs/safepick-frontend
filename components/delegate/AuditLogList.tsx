"use client";

import { motion } from "framer-motion";
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Clock, 
  Settings,
  AlertTriangle
} from "lucide-react";
import { AuditEntry, AuditEventType, AUDIT_EVENT_LABELS } from "@/types/audit.types";
import { format } from "date-fns";

const iconMap: Partial<Record<AuditEventType, any>> = {
  PICKUP_REQUEST_CREATED: Bell,
  PICKUP_APPROVED: CheckCircle2,
  PICKUP_DENIED: XCircle,
  SOS_TRIGGERED: ShieldAlert,
  PANIC_DEACTIVATED: XCircle,
  CLOCK_IN: Clock,
  CLOCK_OUT: Clock,
  DELEGATE_KYC_SUBMITTED: Settings,
  CHILD_UPDATED: Settings
};

const statusColors: Record<string, string> = {
  SUCCESS: "text-teal bg-teal/10",
  FAILURE: "text-coral bg-coral/10",
  WARNING: "text-amber bg-amber/10"
};

interface AuditLogListProps {
  entries: AuditEntry[];
}

export function AuditLogList({ entries }: AuditLogListProps) {
  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const Icon = iconMap[entry.eventType] || AlertTriangle;
        
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-black/5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusColors[entry.outcome || ''] || statusColors.WARNING}`}>
              <Icon size={20} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-navy text-[0.875rem] truncate">
                  {AUDIT_EVENT_LABELS[entry.eventType]}
                </p>
                <span className="text-[0.7rem] text-muted whitespace-nowrap ml-2">
                  {format(new Date(entry.timestamp), "MMM d, h:mm a")}
                </span>
              </div>
              <p className="text-[0.75rem] text-muted truncate">
                {entry.actorName} • {entry.eventType.replace(/_/g, " ")}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
