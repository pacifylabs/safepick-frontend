"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useDelegateProfile } from '@/hooks/useDelegate';
import { useDelegateSchedule } from '@/hooks/useDelegate';
import { useDelegatePickupRequests } from '@/hooks/useDelegate';
import { useDelegateAuthorizations } from '@/hooks/useDelegate';
import DelegateRightPanel from '@/components/delegate/DelegateRightPanel';
import UpcomingPickupCard from '@/components/delegate/UpcomingPickupCard';
import {
  Bell,
  Search,
  QrCode,
  Clock,
  Users,
  CheckCircle,
  Building,
  FileText,
  LogOut,
} from 'lucide-react';

const HeroContent = ({ pendingGateRequest, upcomingPickup, router }: { pendingGateRequest: any, upcomingPickup: any, router: any }) => {
  if (pendingGateRequest) {
    const { child, school, id, requestedAt } = pendingGateRequest;
    return (
      <>
        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-[5px] bg-[rgba(15,163,127,0.15)] rounded-full px-[9px] py-[3px] mb-2">
            <span className="w-[5px] h-[5px] bg-[#0FA37F] rounded-full animate-pulse"></span>
            <span className="font-dm-sans text-[0.6rem] font-medium text-[#0FA37F] uppercase">Gate is ready</span>
          </div>
          <p className="font-fraunces text-[1.1rem] md:text-[1.2rem] font-semibold text-white leading-[1.2] tracking-[-0.02em] mb-1">
            {child.fullName.split(' ')[0]} is waiting at the gate for{" "}
            <em className="italic font-light text-[#1D9E75]">your pickup today</em>
          </p>
          <p className="font-dm-sans text-[0.73rem] text-white/40 mb-3">
            {school.name} &middot; {format(new Date(requestedAt), 'h:mm a')}
          </p>
          <button onClick={() => router.push(`/delegate/gate?authorizationId=${id}`)} className="flex items-center justify-center md:inline-flex md:w-auto gap-[7px] bg-[#0FA37F] rounded-[9px] px-4 py-[10px] cursor-pointer hover:bg-[#0d9472] transition-colors">
            <QrCode className="w-[13px] h-[13px] stroke-white" />
            <span className="font-dm-sans text-[0.78rem] font-medium text-white">Show my QR code</span>
          </button>
        </div>
        <div className="hidden md:flex gap-[10px]">
          {/* Stat boxes can be added here based on pendingGateRequest */}
        </div>
      </>
    );
  } else if (upcomingPickup) {
    const { childName, schoolName, pickupWindowStart } = upcomingPickup;
    return (
      <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-[5px] bg-[rgba(15,163,127,0.15)] rounded-full px-[9px] py-[3px] mb-2">
            <Clock className="w-[9px] h-[9px] stroke-[#0FA37F]" />
            <span className="font-dm-sans text-[0.6rem] font-medium text-[#0FA37F] uppercase">Today's pickup</span>
          </div>
        <p className="font-fraunces text-[1.1rem] md:text-[1.2rem] font-semibold text-white leading-[1.2] tracking-[-0.02em] mb-1">
          {childName.split(' ')[0]}'s pickup at {pickupWindowStart}
        </p>
        <p className="font-dm-sans text-[0.73rem] text-white/40 mb-3">{schoolName}</p>
        <button onClick={() => router.push('/delegate/schedule')} className="flex items-center justify-center md:inline-flex md:w-auto gap-[7px] bg-transparent rounded-[9px] px-4 py-[10px] cursor-pointer">
          <span className="font-dm-sans text-[0.78rem] font-medium text-white">View my schedule &rarr;</span>
        </button>
      </div>
    );
  } else {
    return (
      <div className="relative z-10 flex-1">
        <p className="font-fraunces text-[1.1rem] md:text-[1.2rem] font-semibold text-white leading-[1.2] tracking-[-0.02em] mb-1">
          No pickups today, <em className="italic font-light text-[#1D9E75]">enjoy your day</em>
        </p>
        <p className="font-dm-sans text-[0.73rem] text-white/40 mt-1 mb-3">None scheduled</p>
        <button onClick={() => router.push('/delegate/children')} className="flex items-center justify-center md:inline-flex md:w-auto gap-[7px] bg-transparent rounded-[9px] px-4 py-[10px] cursor-pointer">
          <span className="font-dm-sans text-[0.78rem] font-medium text-white">My children &rarr;</span>
        </button>
      </div>
    );
  }
};

const DashboardPage = () => {
  const router = useRouter();
  const todayISO = new Date().toISOString().split('T')[0];

  const { data: profile, isLoading: isLoadingProfile } = useDelegateProfile();
  const { data: schedule, isLoading: isLoadingSchedule } = useDelegateSchedule(todayISO);
  const { data: pickupRequests } = useDelegatePickupRequests();
  const { data: authorizations } = useDelegateAuthorizations();

  const pendingGateRequest = useMemo(() => 
    pickupRequests?.find((req: any) => req.status === 'PENDING_GATE') || null, 
    [pickupRequests]
  );

  const upcomingPickup = useMemo(() => 
    schedule?.find((p: any) => p.status === 'PENDING' || p.status === 'IN_PROGRESS'),
    [schedule]
  );

  const uniqueSchools = useMemo(() => {
    if (!authorizations) return 0;
    const schoolIds = new Set(authorizations.map((auth: any) => auth.school.id));
    return schoolIds.size;
  }, [authorizations]);

  if (isLoadingProfile) {
    return <div>Loading...</div>;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const todayFormatted = format(new Date(), "eeee, MMMM d");

  const firstName = profile?.fullName.split(' ')[0] || 'Delegate';
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <main className="flex-1 bg-[var(--bg-page)] px-4 py-5 space-y-4 md:px-5 md:py-6 md:space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-dm-sans text-[0.68rem] font-medium text-[var(--text-secondary)] uppercase tracking-[0.07em]">{greeting}</p>
            <p className="font-fraunces text-[1.2rem] md:text-[1.4rem] font-semibold text-[var(--text-primary)] tracking-[-0.03em]">
              {firstName}, <em className="italic font-light text-[#1D9E75]">here's your day</em>
            </p>
            <p className="font-dm-sans text-[0.72rem] text-[var(--text-secondary)] mt-[2px]">{todayFormatted}</p>
          </div>
          <div className="flex gap-2">
            <div className="w-9 h-9 bg-[var(--bg-surface)] rounded-[9px] border border-[var(--border)] flex items-center justify-center relative cursor-pointer hover:bg-[var(--bg-muted)]">
              <Bell className="w-[15px] h-[15px] stroke-[var(--text-secondary)]" />
              {schedule && schedule.filter((p: any) => p.status === 'PENDING').length > 0 && (
                <span className="w-[7px] h-[7px] bg-[#D85A30] rounded-full absolute top-[7px] right-[7px] border-[1.5px] border-[var(--bg-surface)]"></span>
              )}
            </div>
            <div className="w-9 h-9 bg-[var(--bg-surface)] rounded-[9px] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-muted)]">
              <Search className="w-[15px] h-[15px] stroke-[var(--text-secondary)]" />
            </div>
          </div>
        </div>

        <div className="bg-[#0B1A2C] rounded-[14px] p-4 md:p-5 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="absolute -top-16 right-12 w-[200px] h-[200px] rounded-full bg-[rgba(15,163,127,0.09)] z-0"></div>
            <div className="absolute -bottom-12 right-2 w-[120px] h-[120px] rounded-full bg-[rgba(15,163,127,0.05)] z-0"></div>
            <HeroContent pendingGateRequest={pendingGateRequest} upcomingPickup={upcomingPickup} router={router} />
        </div>

        <div className="grid grid-cols-3 gap-[8px] md:gap-[10px]">
            <div className="bg-[var(--bg-surface)] rounded-[12px] border border-[var(--border)] p-[14px] flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center bg-[#E1F5EE]">
                    <Users className="w-5 h-5 stroke-[#0FA37F]" />
                </div>
                <div>
                    <p className="font-fraunces text-[1.2rem] md:text-[1.35rem] font-semibold text-[var(--text-primary)]">{authorizations?.length || 0}</p>
                    <p className="font-dm-sans text-[0.68rem] text-[var(--text-secondary)] mt-[2px]">Children authorized</p>
                </div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-[12px] border border-[var(--border)] p-[14px] flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center bg-[#FAEEDA]">
                    <CheckCircle className="w-5 h-5 stroke-[#EF9F27]" />
                </div>
                <div>
                    <p className="font-fraunces text-[1.2rem] md:text-[1.35rem] font-semibold text-[var(--text-primary)]">47</p>
                    <p className="font-dm-sans text-[0.68rem] text-[var(--text-secondary)] mt-[2px]">Total pickups done</p>
                </div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-[12px] border border-[var(--border)] p-[14px] flex items-center gap-3">
                <div className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center bg-[#E6F1FB]">
                    <Building className="w-5 h-5 stroke-[#185FA5]" />
                </div>
                <div>
                    <p className="font-fraunces text-[1.2rem] md:text-[1.35rem] font-semibold text-[var(--text-primary)]">{uniqueSchools}</p>
                    <p className="font-dm-sans text-[0.68rem] text-[var(--text-secondary)] mt-[2px]">School linked</p>
                </div>
            </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-fraunces text-lg font-semibold text-[var(--text-primary)]">Today's pickups</h3>
            <a onClick={() => router.push('/delegate/schedule')} className="font-dm-sans text-sm text-[#0FA37F] cursor-pointer">View schedule &rarr;</a>
          </div>
          {isLoadingSchedule ? (
            <div className="space-y-2">
                <div className="h-[72px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
                <div className="h-[72px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
            </div>
          ) : schedule && schedule.length > 0 ? (
            <div className="flex flex-col gap-[8px]">
              {schedule.slice(0, 2).map((pickup: any, index: number) => (
                <UpcomingPickupCard key={pickup.id || index} pickup={pickup} index={index} />
              ))}
              {schedule.length > 2 && (
                <a onClick={() => router.push('/delegate/schedule')} className="font-dm-sans text-sm text-[#0FA37F] cursor-pointer text-center mt-2">View all {schedule.length} pickups &rarr;</a>
              )}
            </div>
          ) : (
            <p className="text-center py-6 font-dm-sans text-[var(--text-secondary)]">No pickups today</p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-fraunces text-lg font-semibold text-[var(--text-primary)]">Recent activity</h3>
            <a onClick={() => router.push('/delegate/pickups')} className="font-dm-sans text-sm text-[#0FA37F] cursor-pointer">See all &rarr;</a>
          </div>
          <div className="bg-[var(--bg-surface)] rounded-[12px] border border-[var(--border)] px-[14px] py-0">
            <div className="flex items-start gap-[10px] py-[10px] border-b border-[var(--border)]">
                <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-[#E1F5EE] flex-shrink-0">
                    <CheckCircle className="w-4 h-4 stroke-[#0FA37F]" />
                </div>
                <div>
                    <p className="font-dm-sans text-[0.75rem] text-[var(--text-primary)] leading-[1.4]">Zara Osei clocked in at Greenfield Academy</p>
                    <p className="font-dm-sans text-[0.65rem] text-[var(--text-secondary)] mt-[2px]">Today &middot; 7:42am</p>
                </div>
            </div>
            <div className="flex items-start gap-[10px] py-[10px] border-b border-[var(--border)]">
                <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-[#FAEEDA] flex-shrink-0">
                    <FileText className="w-4 h-4 stroke-[#EF9F27]" />
                </div>
                <div>
                    <p className="font-dm-sans text-[0.75rem] text-[var(--text-primary)] leading-[1.4]">Authorization updated by Amara Osei</p>
                    <p className="font-dm-sans text-[0.65rem] text-[var(--text-secondary)] mt-[2px]">Yesterday &middot; 4:15pm</p>
                </div>
            </div>
            <div className="flex items-start gap-[10px] py-[10px]">
                <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center bg-[#E6F1FB] flex-shrink-0">
                    <LogOut className="w-4 h-4 stroke-[#185FA5]" />
                </div>
                <div>
                    <p className="font-dm-sans text-[0.75rem] text-[var(--text-primary)] leading-[1.4]">Kofi Mensah pickup completed &middot; QR verified</p>
                    <p className="font-dm-sans text-[0.65rem] text-[var(--text-secondary)] mt-[2px]">Mon &middot; 3:10pm</p>
                </div>
            </div>
          </div>
        </div>

      </main>
      <div className="hidden lg:flex">
        <DelegateRightPanel />
      </div>
    </div>
  );
};

export default DashboardPage;
