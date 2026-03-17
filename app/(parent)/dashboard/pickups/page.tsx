"use client";

import { usePickupStore } from "@/stores/pickup.store";
import { useRecentPickupRequests } from "@/hooks/usePickupRequest";
import { PickupRequestCard } from "@/components/pickup/PickupRequestCard";
import { ShieldCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function ParentPickupsPage() {
  const { activePickupRequestId, setActivePickupRequestId } = usePickupStore();
  const { data: history, isLoading: historyLoading } = useRecentPickupRequests();

  const isEmpty = !activePickupRequestId && (!history || history.length === 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8 px-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy">Pickups</h1>
        <p className="font-body text-navy/40 mt-1 text-sm">Manage authorizations and view pickup history</p>
      </div>

      {/* ACTIVE REQUEST */}
      {activePickupRequestId && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#D85A30] animate-pulse" />
            <h2 className="font-body text-[0.7rem] font-bold text-[#D85A30] uppercase tracking-widest">
              Needs Your Response
            </h2>
          </div>
          <PickupRequestCard
            pickupRequestId={activePickupRequestId}
            onRespond={() => setActivePickupRequestId(null)}
          />
        </section>
      )}

      {/* HISTORY */}
      <section className="space-y-4">
        <h2 className="font-body text-[0.7rem] font-bold text-navy/40 uppercase tracking-widest">
          Recent Activity
        </h2>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 w-full bg-white rounded-xl border border-black/[0.04] animate-pulse" />
            ))}
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-black/[0.04] p-4 flex items-center gap-4 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.status === 'APPROVED' ? 'bg-[#E1F5EE]' : 
                  item.status === 'DENIED' ? 'bg-[#FAECE7]' : 'bg-gray-100'
                }`}>
                  {item.status === 'APPROVED' ? <CheckCircle className="w-5 h-5 text-[#0FA37F]" /> : 
                   item.status === 'DENIED' ? <XCircle className="w-5 h-5 text-[#D85A30]" /> : 
                   <Clock className="w-5 h-5 text-navy/20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-navy truncate">
                    {item.childName} collected by {item.delegateName}
                  </p>
                  <p className="font-body text-xs text-navy/40 mt-0.5 truncate">
                    {item.schoolName} &middot; {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
                {item.incidentId && (
                  <div className="px-2 py-1 rounded bg-[#FAECE7] border border-[#D85A30]/10">
                    <p className="text-[0.6rem] font-bold text-[#D85A30]">INCIDENT</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="bg-white rounded-2xl border border-black/[0.04] p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-[#0FA37F]" />
            </div>
            <div>
              <p className="font-display font-bold text-navy text-lg">All clear</p>
              <p className="font-body text-navy/40 text-sm mt-1">No active pickup requests or recent history.</p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
