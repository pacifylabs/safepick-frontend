'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDelegatePickupRequests } from '@/hooks/useDelegate';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import DelegateRightPanel from '@/components/delegate/DelegateRightPanel';
import { getInitials } from '@/lib/utils';
import { Bell, QrCode, LogOut, XCircle } from 'lucide-react';

const PickupsPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState('active');
  const [historyFilter, setHistoryFilter] = useState('ALL');

  const { data: pickupRequests, isLoading } = useDelegatePickupRequests();

  const activeRequests = useMemo(() => 
    pickupRequests?.filter((req: any) => req.status === 'PENDING_GATE') || [],
    [pickupRequests]
  );

  const historyRequests = useMemo(() => {
    const past = pickupRequests?.filter((req: any) => req.status !== 'PENDING_GATE') || [];
    if (historyFilter === 'ALL') return past;
    return past.filter((req: any) => req.status === historyFilter);
  }, [pickupRequests, historyFilter]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <main className="flex-1 bg-[#E8EAF0] px-4 py-5 space-y-4 md:px-5 md:py-6 md:space-y-5">
        <div>
          <p className="font-dm-sans text-[0.68rem] text-[#6B7280] mb-1">
            <span className="cursor-pointer hover:text-[#0FA37F]" onClick={() => router.push('/delegate/dashboard')}>
              Dashboard
            </span>
            <span className="text-[#6B7280]/50 mx-1">/</span>
            <span className="text-[#0B1A2C]">Pickups</span>
          </p>
          <h1 className="font-fraunces text-[1.2rem] md:text-[1.4rem] font-semibold text-[#0B1A2C] tracking-[-0.03em]">
            Pickups
          </h1>
          <p className="font-dm-sans text-[0.75rem] md:text-[0.78rem] text-[#6B7280]">
            Incoming requests and pickup history
          </p>
        </div>

        <div className="flex gap-0 bg-white rounded-[10px] border border-[rgba(11,26,44,0.07)] p-1 w-full md:w-fit">
          <button onClick={() => setTab('active')} className={`flex-1 md:flex-none text-center px-3 md:px-5 py-[7px] rounded-[8px] cursor-pointer font-dm-sans text-[0.78rem] md:text-[0.8rem] font-medium transition-all ${
            tab === 'active' ? 'bg-[#0B1A2C] text-white' : 'text-[#6B7280] hover:text-[#0B1A2C]'
          }`}>
            Active requests
            {activeRequests.length > 0 && (
              <span className="bg-[#D85A30] text-white rounded-full text-[0.6rem] font-medium px-[6px] py-[2px] ml-2">
                {activeRequests.length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('history')} className={`flex-1 md:flex-none text-center px-3 md:px-5 py-[7px] rounded-[8px] cursor-pointer font-dm-sans text-[0.78rem] md:text-[0.8rem] font-medium transition-all ${
            tab === 'history' ? 'bg-[#0B1A2C] text-white' : 'text-[#6B7280] hover:text-[#0B1A2C]'
          }`}>
            Past pickups
          </button>
        </div>

        {tab === 'active' && (
          <div className="space-y-3">
            {isLoading ? (
              <>
                <div className="h-[88px] bg-white animate-pulse rounded-[12px]"></div>
                <div className="h-[88px] bg-white animate-pulse rounded-[12px]"></div>
              </>
            ) : activeRequests.length > 0 ? (
              activeRequests.map((request: any) => (
                <motion.div 
                  key={request.id} 
                  initial={{ opacity: 0, y: -8 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3 }}
                  className="bg-[#E1F5EE] border border-[rgba(15,163,127,0.22)] rounded-[14px] p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-[10px] h-[10px] rounded-full bg-[#0FA37F] border-2 border-[rgba(15,163,127,0.3)] animate-pulse"></div>
                    <span className="font-dm-sans text-[0.65rem] md:text-[0.68rem] font-medium text-[#0F6E56] uppercase tracking-[0.08em]">GATE IS READY</span>
                    <span className="font-dm-sans text-[0.65rem] md:text-[0.68rem] text-[#6B7280] ml-auto">
                      {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-[38px] h-[38px] md:w-[40px] md:h-[40px] bg-[#1D9E75] rounded-full flex items-center justify-center text-white text-[0.7rem] md:text-[0.72rem] font-medium">
                      {getInitials(request.child.fullName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-dm-sans text-[0.82rem] md:text-[0.875rem] font-medium text-[#0B1A2C] truncate">{request.child.fullName}</p>
                      <p className="font-dm-sans text-[0.7rem] md:text-[0.75rem] text-[#6B7280] mt-[2px] truncate">
                        {request.school.name} &middot; {request.school.address}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => router.push(`/delegate/gate?authorizationId=${request.authorizationId}`)} className="w-full bg-[#0FA37F] rounded-[10px] py-[10px] md:py-[11px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[#0d9472] transition-colors">
                    <QrCode className="stroke-white w-4 h-4" />
                    <span className="font-dm-sans text-[0.8rem] md:text-[0.82rem] font-medium text-white">Show my QR code</span>
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center py-10 md:py-12 text-center">
                <div className="w-16 h-16 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 stroke-[#0FA37F]" />
                </div>
                <h2 className="font-fraunces text-[1.3rem] md:text-[1.4rem] text-[#0B1A2C]">No pending requests</h2>
                <p className="font-dm-sans text-[0.82rem] md:text-[0.875rem] text-[#6B7280] max-w-[240px] mx-auto mt-2">
                  When a school sends a request, it appears here.
                </p>
                <p className="font-dm-sans text-[0.72rem] text-[#0FA37F] mt-3">Checking every 5 seconds...</p>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-3">
              {['ALL', 'COMPLETED', 'DENIED'].map(filter => (
                <button 
                  key={filter} 
                  onClick={() => setHistoryFilter(filter)}
                  className={`rounded-full px-4 py-[7px] font-dm-sans text-[0.75rem] font-medium whitespace-nowrap cursor-pointer ${
                    historyFilter === filter
                      ? 'bg-[#0B1A2C] text-white'
                      : 'bg-white text-[#6B7280] border border-[rgba(11,26,44,0.07)]'
                  }`}>
                  {filter.charAt(0) + filter.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {isLoading ? (
                <>
                  <div className="h-[64px] bg-white animate-pulse rounded-[12px]"></div>
                  <div className="h-[64px] bg-white animate-pulse rounded-[12px]"></div>
                </>
              ) : historyRequests.length > 0 ? (
                historyRequests.map((request: any) => (
                  <div key={request.id} className="bg-white rounded-[12px] border border-[rgba(11,26,44,0.07)] p-3 md:p-[14px] flex items-center gap-3">
                    <div className={`w-[32px] h-[32px] md:w-[34px] md:h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0 ${
                      request.status === 'COMPLETED' ? 'bg-[#E1F5EE]' : 'bg-[#FAECE7]'
                    }`}>
                      {request.status === 'COMPLETED' ? <LogOut className="stroke-[#0FA37F] w-5 h-5" /> : <XCircle className="stroke-[#D85A30] w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-dm-sans text-[0.82rem] md:text-[0.85rem] font-medium text-[#0B1A2C] truncate">
                        {request.child.fullName} &mdash; {request.status.toLowerCase()}
                      </p>
                      <p className="font-dm-sans text-[0.7rem] md:text-[0.72rem] text-[#6B7280] mt-[2px] truncate">{request.school.name}</p>
                    </div>
                    <span className="font-dm-sans text-[0.68rem] md:text-[0.72rem] text-[#6B7280] text-right flex-shrink-0">
                      {format(new Date(request.requestedAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <LogOut className="w-7 h-7 stroke-[#0FA37F]" />
                  </div>
                  <p className="font-dm-sans text-[#6B7280]">No past pickups yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <div className="hidden lg:flex">
        <DelegateRightPanel />
      </div>
    </div>
  );
};

export default PickupsPage;
