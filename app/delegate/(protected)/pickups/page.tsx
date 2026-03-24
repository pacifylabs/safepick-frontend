'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDelegatePickupRequests } from '@/hooks/useDelegate';
import { useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import DelegateRightPanel from '@/components/delegate/DelegateRightPanel';
import { getInitials } from '@/lib/utils';
import { Bell, QrCode, LogOut, XCircle, Smartphone, Timer, CheckCircle } from 'lucide-react';
import { usePickupStore } from '@/stores/pickup.store';
import { QrOverlay } from '@/components/delegate/QrOverlay';

const PickupsPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState('active');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const { qrOverlayAuthorizationId, setQrOverlayAuthorizationId } = usePickupStore();
  const { data: pickupRequests, isLoading } = useDelegatePickupRequests();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PICKUP_APPROVED") {
        setActiveToast({
          title: "Pickup Approved!",
          message: `Parent authorized release of ${event.data.childName}.`,
          type: "success"
        });
      } else if (event.data?.type === "PICKUP_DENIED") {
        setActiveToast({
          title: "Pickup Denied",
          message: `Parent denied release of ${event.data.childName}.`,
          type: "error"
        });
      } else if (event.data?.type === "PICKUP_COMPLETED") {
        setActiveToast({
          title: "Pickup Completed!",
          message: `${event.data.childName} has been safely released.`,
          type: "success"
        });
        queryClient.invalidateQueries({ queryKey: ["delegate", "pickup-requests"] });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [queryClient]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING_GATE': return { label: 'At Gate', bg: 'bg-[#EF9F27]/10', text: '#EF9F27', icon: Timer };
      case 'AWAITING_PARENT': return { label: 'Awaiting Parent', bg: 'bg-[#185FA5]/10', text: '#185FA5', icon: Smartphone };
      case 'APPROVED': return { label: 'Approved', bg: 'bg-[#0FA37F]/10', text: '#0FA37F', icon: CheckCircle };
      case 'DENIED': return { label: 'Denied', bg: 'bg-[#D85A30]/10', text: '#D85A30', icon: XCircle };
      case 'RELEASED': return { label: 'Completed', bg: 'bg-[#0FA37F]/10', text: '#0FA37F', icon: CheckCircle };
      case 'COMPLETED': return { label: 'Completed', bg: 'bg-[#0FA37F]/10', text: '#0FA37F', icon: CheckCircle };
      default: return { label: status, bg: 'bg-white/10', text: '#FFFFFF', icon: Bell };
    }
  };

  const activeRequests = useMemo(() => 
    pickupRequests?.filter((req: any) => ['PENDING_GATE', 'AWAITING_PARENT', 'APPROVED'].includes(req.status)) || [],
    [pickupRequests]
  );

  const historyRequests = useMemo(() => {
    const past = pickupRequests?.filter((req: any) => !['PENDING_GATE', 'AWAITING_PARENT', 'APPROVED'].includes(req.status)) || [];
    if (historyFilter === 'ALL') return past;
    if (historyFilter === 'COMPLETED') return past.filter((req: any) => ['COMPLETED', 'RELEASED'].includes(req.status));
    return past.filter((req: any) => req.status === historyFilter);
  }, [pickupRequests, historyFilter]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <main className="flex-1 bg-[var(--bg-page)] px-4 py-5 md:px-8 md:py-8 overflow-y-auto">
        <div>
          <p className="font-dm-sans text-[0.68rem] text-[var(--text-secondary)] mb-1">
            <span className="cursor-pointer hover:text-[#0FA37F]" onClick={() => router.push('/delegate/dashboard')}>
              Dashboard
            </span>
            <span className="text-[var(--text-secondary)]/50 mx-1">/</span>
            <span className="text-[var(--text-primary)]">Pickups</span>
          </p>
          <h1 className="font-fraunces text-[1.2rem] md:text-[1.4rem] font-semibold text-[var(--text-primary)] tracking-[-0.03em]">
            Pickups
          </h1>
          <p className="font-dm-sans text-[0.75rem] md:text-[0.78rem] text-[var(--text-secondary)]">
            Incoming requests and pickup history
          </p>
        </div>

        <div className="mt-6 flex gap-0 bg-[var(--bg-surface)] rounded-[10px] border border-[var(--border)] p-1 w-full md:w-fit">
          <button onClick={() => setTab('active')} className={`flex-1 md:flex-none text-center px-3 md:px-5 py-[7px] rounded-[8px] cursor-pointer font-dm-sans text-[0.78rem] md:text-[0.8rem] font-medium transition-all ${
            tab === 'active' ? 'bg-[#0B1A2C] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}>
            Active requests
            {activeRequests.length > 0 && (
              <span className="bg-[#D85A30] text-white rounded-full text-[0.6rem] font-medium px-[6px] py-[2px] ml-2">
                {activeRequests.length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('history')} className={`flex-1 md:flex-none text-center px-3 md:px-5 py-[7px] rounded-[8px] cursor-pointer font-dm-sans text-[0.78rem] md:text-[0.8rem] font-medium transition-all ${
            tab === 'history' ? 'bg-[#0B1A2C] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}>
            Past pickups
          </button>
        </div>

        {tab === 'active' && (
          <div className="mt-6 space-y-3">
            {isLoading ? (
              <>
                <div className="h-[88px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
                <div className="h-[88px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
              </>
            ) : activeRequests.length > 0 ? (
              activeRequests.map((request: any) => {
                const styles = getStatusStyles(request.status);
                const StatusIcon = styles.icon;
                
                return (
                  <motion.div 
                    key={request.id} 
                    initial={{ opacity: 0, y: -8 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.3 }}
                    className={`${
                      request.status === 'APPROVED' 
                        ? 'bg-[#E1F5EE] border-[#0FA37F]/20' 
                        : request.status === 'DENIED'
                        ? 'bg-[#FAECE7] border-[#D85A30]/20'
                        : 'bg-[var(--bg-surface)] border-[var(--border)]'
                    } border rounded-[14px] p-4 shadow-sm`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${styles.bg}`}>
                        <StatusIcon className="w-3 h-3" style={{ color: styles.text }} />
                        <span className="font-dm-sans text-[0.6rem] font-bold uppercase tracking-[0.05em]" style={{ color: styles.text }}>
                          {styles.label}
                        </span>
                      </div>
                      <span className="font-dm-sans text-[0.65rem] md:text-[0.68rem] text-[var(--text-secondary)] ml-auto">
                        {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-[38px] h-[38px] md:w-[40px] md:h-[40px] bg-[#1D9E75] rounded-full flex items-center justify-center text-white text-[0.7rem] md:text-[0.72rem] font-medium">
                        {getInitials(request.child.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-dm-sans text-[0.82rem] md:text-[0.875rem] font-medium text-[var(--text-primary)] truncate">{request.child.fullName}</p>
                        <p className="font-dm-sans text-[0.7rem] md:text-[0.75rem] text-[var(--text-secondary)] mt-[2px] truncate">
                          {request.school.name} &middot; {request.school.address}
                        </p>
                      </div>
                    </div>
                    {request.status !== 'APPROVED' && request.status !== 'DENIED' && (
                      <button 
                        onClick={() => setQrOverlayAuthorizationId(request.authorizationId)} 
                        className="w-full bg-[#0FA37F] rounded-[10px] py-[10px] md:py-[11px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0d9472] transition-colors shadow-sm active:scale-[0.98]"
                      >
                        <QrCode className="stroke-white w-4 h-4" />
                        <span className="font-dm-sans text-[0.8rem] md:text-[0.82rem] font-medium text-white">Show my QR code</span>
                      </button>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center py-10 md:py-12 text-center">
                <div className="w-16 h-16 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 stroke-[#0FA37F]" />
                </div>
                <h2 className="font-fraunces text-[1.3rem] md:text-[1.4rem] text-[var(--text-primary)]">No pending requests</h2>
                <p className="font-dm-sans text-[0.82rem] md:text-[0.875rem] text-[var(--text-secondary)] max-w-[240px] mx-auto mt-2">
                  When a school sends a request, it appears here.
                </p>
                <p className="font-dm-sans text-[0.72rem] text-[#0FA37F] mt-3">Checking every 5 seconds...</p>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="mt-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-3">
              {['ALL', 'COMPLETED', 'DENIED'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setHistoryFilter(filter)}
                  className={`rounded-full px-4 py-[7px] font-dm-sans text-[0.75rem] font-medium whitespace-nowrap cursor-pointer transition-all ${
                    historyFilter === filter
                      ? 'bg-[#0B1A2C] text-white shadow-md'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}>
                  {filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <div className="h-[64px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
                  <div className="h-[64px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
                </>
              ) : historyRequests.length > 0 ? (
                historyRequests.map((request: any) => (
                  <div key={request.id} className="bg-[var(--bg-surface)] rounded-[12px] border border-[var(--border)] p-3 md:p-[14px] flex items-center gap-3 shadow-sm">
                    <div className={`w-[32px] h-[32px] md:w-[34px] md:h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0 ${
                      request.status === 'COMPLETED' ? 'bg-[#E1F5EE]' : 'bg-[#FAECE7]'
                    }`}>
                      {request.status === 'COMPLETED' ? <LogOut className="stroke-[#0FA37F] w-5 h-5" /> : <XCircle className="stroke-[#D85A30] w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-dm-sans text-[0.82rem] md:text-[0.85rem] font-medium text-[var(--text-primary)] truncate">
                        {request.child.fullName} &mdash; {request.status.toLowerCase()}
                      </p>
                      <p className="font-dm-sans text-[0.7rem] md:text-[0.72rem] text-[var(--text-secondary)] mt-[2px] truncate">{request.school.name}</p>
                    </div>
                    <span className="font-dm-sans text-[0.68rem] md:text-[0.72rem] text-[var(--text-secondary)] text-right flex-shrink-0">
                      {format(new Date(request.requestedAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-7 h-7 stroke-[#0FA37F]" />
                  </div>
                  <p className="font-dm-sans text-[var(--text-secondary)]">No past pickups yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <div className="hidden lg:flex">
        <DelegateRightPanel />
      </div>

      {qrOverlayAuthorizationId && (
        <QrOverlay 
          authorizationId={qrOverlayAuthorizationId} 
          onClose={() => setQrOverlayAuthorizationId(null)} 
        />
      )}
    </div>
  );
};

export default PickupsPage;
