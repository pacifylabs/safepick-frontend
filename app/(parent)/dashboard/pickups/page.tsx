"use client";

import { usePickupStore } from "@/stores/pickup.store";
import { useRecentPickupRequests } from "@/hooks/usePickupRequest";
import { PickupRequestCard } from "@/components/pickup/PickupRequestCard";
import { ShieldCheck, Clock, CheckCircle, XCircle, Key, ShieldOff } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ParentPickupsPage() {
  const { activePickupRequestId, setActivePickupRequestId } = usePickupStore();
  const { data: history, isLoading: historyLoading } = useRecentPickupRequests();

  return (
    <div className="w-full px-6 py-8">
      {/* Page title row */}
      <div className="mb-6">
        <p className="font-display text-[1.75rem] font-semibold text-[var(--text-primary)]">Pickups</p>
        <p className="font-body text-[0.875rem] text-[var(--text-secondary)] mt-1">Manage authorizations and view pickup history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN — Active requests */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <p className={`font-body text-[0.72rem] uppercase tracking-widest ${activePickupRequestId ? 'text-[#D85A30]' : 'text-[var(--text-secondary)]'}`}>
              ACTIVE REQUESTS
            </p>
            {activePickupRequestId && (
              <motion.div 
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-[#D85A30] rounded-full"
              />
            )}
          </div>

          {activePickupRequestId ? (
            <div className="bg-[var(--bg-surface)] border border-[#D85A30]/20 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-[#0B1A2C] px-5 py-3 flex items-center gap-2">
                <motion.div 
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 bg-[#EF9F27] rounded-full"
                />
                <p className="font-body text-[0.72rem] uppercase tracking-widest text-[#EF9F27]">
                  NEEDS YOUR RESPONSE
                </p>
              </div>
              <div className="px-5 py-5">
                <PickupRequestCard
                  pickupRequestId={activePickupRequestId}
                  onRespond={() => setActivePickupRequestId(null)}
                />
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--bg-muted)] rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
              <ShieldCheck className="w-10 h-10 text-[var(--text-secondary)]/30 mb-3" />
              <p className="font-body text-[0.875rem] text-[var(--text-secondary)]">No active pickup requests</p>
              <p className="font-body text-[0.75rem] text-[var(--text-secondary)]/60 mt-1">
                Requests appear here in real time when a delegate arrives at the school gate.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Pickup history */}
        <div>
          <div className="mb-3">
            <p className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-secondary)]">
              RECENT ACTIVITY
            </p>
          </div>

          {historyLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="flex flex-col gap-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    item.status === 'APPROVED' || item.status === 'APPROVED_VIA_OVERRIDE' ? 'bg-[#E1F5EE]' : 
                    item.status === 'DENIED' || item.status === 'CHILD_HELD' ? 'bg-[#FAECE7]' : 
                    'bg-[#FAEEDA]'
                  }`}>
                    {item.status === 'APPROVED' ? <CheckCircle className="w-5 h-5 text-[#0FA37F]" /> : 
                     item.status === 'DENIED' ? <XCircle className="w-5 h-5 text-[#D85A30]" /> : 
                     item.status === 'APPROVED_VIA_OVERRIDE' ? <Key className="w-5 h-5 text-[#0FA37F]" /> :
                     item.status === 'CHILD_HELD' ? <ShieldOff className="w-5 h-5 text-[#D85A30]" /> :
                     <Clock className="w-5 h-5 text-[#EF9F27]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[0.875rem] font-medium text-[var(--text-primary)] truncate">
                      {item.delegateName} → {item.childName}
                    </p>
                    <p className="font-body text-[0.75rem] text-[var(--text-secondary)] mt-0.5 truncate">
                      {item.schoolName} &middot; {format(new Date(item.timestamp), 'h:mm a')}
                    </p>
                    {item.respondedBy === 'SECONDARY_GUARDIAN' && (
                      <p className="font-body text-[0.68rem] text-[var(--text-secondary)]/60 mt-0.5">
                        Approved by emergency guardian
                      </p>
                    )}
                  </div>
                  <div className={`font-body text-[0.68rem] font-medium rounded-full px-2.5 py-1 ${
                    item.status === 'APPROVED' || item.status === 'APPROVED_VIA_OVERRIDE' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 
                    item.status === 'DENIED' || item.status === 'CHILD_HELD' ? 'bg-[#FAECE7] text-[#D85A30]' : 
                    'bg-[#FAEEDA] text-[#BA7517]'
                  }`}>
                    {item.status === 'APPROVED' ? "Approved" : 
                     item.status === 'DENIED' ? "Denied" : 
                     item.status === 'APPROVED_VIA_OVERRIDE' ? "Override" :
                     item.status === 'CHILD_HELD' ? "Held" :
                     item.status === 'TIMED_OUT' ? "Expired" : "Awaiting"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--bg-surface)] border border-dashed border-[var(--bg-muted)] rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
              <Clock className="w-10 h-10 text-[var(--text-secondary)]/30 mb-3" />
              <p className="font-body text-[0.875rem] text-[var(--text-secondary)]">No pickup history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

