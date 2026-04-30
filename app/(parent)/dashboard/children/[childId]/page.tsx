"use client";

import { useParams, useRouter } from "next/navigation";
import { useChild } from "@/hooks/useChildren";
import { useSecondaryGuardians } from "@/hooks/useSecondaryGuardian";
import { useDelegatesForChild } from "@/hooks/useDelegates";
import { 
  ChevronRight, 
  Shield, 
  School, 
  Users2, 
  Calendar, 
  Clock, 
  AlertTriangle,
  MapPin,
  CheckCircle2,
  History
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { AvatarStack } from "@/components/dashboard/AvatarStack";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { OverrideCodeCard } from "@/components/override/OverrideCodeCard";
import { FileSearch } from "lucide-react";

// Check if MSW is enabled
const isMswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === "true";

export default function ChildProfilePage() {
  const { childId } = useParams<{ childId: string }>();
  const router = useRouter();
  const { data: child, isLoading: childLoading } = useChild(childId);
  const { data: guardians = [] } = useSecondaryGuardians();
  const { data: delegates = [], isLoading: delegatesLoading } = useDelegatesForChild(childId);

  const secondaryGuardian = guardians.find(g => g.status === "ACTIVE");
  const isLoading = childLoading || delegatesLoading;

  if (isLoading) {
    return (
      <div className="px-6 py-8 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
        <div className="h-32 w-full bg-gray-200 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!child) return null;

  return (
    <div className="w-full px-6 py-4 min-h-[calc(100vh-56px)] overflow-y-scroll">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[0.875rem] mb-6">
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">My Children</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--text-primary)] font-medium">{child.fullName}</span>
      </div>

      {/* HEADER CARD */}
      <div className="bg-[#0B1A2C] rounded-2xl p-6 mb-6 flex items-center gap-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#1D9E75] flex items-center justify-center text-white overflow-hidden flex-shrink-0">
          {child.photoUrl ? (
            <img src={child.photoUrl} alt={child.fullName} className="w-full h-full object-cover" />
          ) : (
            <p className="font-display text-[1.5rem] font-semibold">
              {(child.fullName || '').split(' ').map(n => n[0]).join('')}
            </p>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <p className="font-display text-[1.5rem] font-semibold text-white truncate">
              {child.fullName}
            </p>
            <Badge variant={child.school ? "teal" : "cream"} className="bg-[#0FA37F]/20 text-[#E1F5EE] border-none">
              {child.school ? "Enrolled" : "Pending Enrollment"}
            </Badge>
          </div>
          <p className="font-body text-[0.875rem] text-white/50">
            {child.grade} &middot; {child.school?.name || "No school yet"}
          </p>
          <p className="font-body text-[0.72rem] text-white/30 mt-1">
            ID: {child.safepickId}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {secondaryGuardian && (
            <div className="bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-white/50" />
              <p className="font-body text-[0.72rem] text-white/60">
                Backup: {secondaryGuardian.fullName}
              </p>
            </div>
          )}
          <p className="font-body text-[0.68rem] text-white/25">
            Registered {child.createdAt ? format(new Date(child.createdAt), 'MMM d, yyyy') : 'Unknown date'}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/60 hover:text-white mt-2 h-9 px-4 rounded-xl bg-white/5 hover:bg-white/10"
            onClick={() => router.push(`/dashboard/children/${childId}/audit`)}
          >
            <FileSearch className="w-4 h-4 mr-2" />
            View audit log
          </Button>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* SCHOOL SECTION */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 col-span-1">
          <p className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
            SCHOOL
          </p>
          {child.school ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-primary)]">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-body font-bold text-[var(--text-primary)]">{child.school.name}</p>
                  <p className="font-body text-[0.82rem] text-[var(--text-secondary)]">School active on SafePick</p>
                </div>
              </div>
              <div className="bg-[var(--bg-muted)] rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-2)] flex items-center justify-center text-[#0FA37F]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="font-body text-[0.78rem] text-[var(--text-primary)]">
                  School gate active for pickup authorizations.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="font-body text-sm text-[var(--text-secondary)]">Not currently enrolled in a school.</p>
              <Button variant="ghost" size="sm" className="mt-2 text-[#0FA37F]">Connect to school</Button>
            </div>
          )}
        </div>

        {/* AUTHORIZED DELEGATES */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <p className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-secondary)]">
              AUTHORIZED DELEGATES
            </p>
            <Link href="/dashboard/delegates" className="text-[0.72rem] font-bold text-[#0FA37F] hover:underline">
              Manage
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <AvatarStack users={delegates.map(d => ({ id: d.id, fullName: d.fullName, photoUrl: d.photoUrl || undefined }))} />
            <p className="font-body text-[0.82rem] text-[var(--text-secondary)]">
              {delegates.length} {delegates.length === 1 ? 'delegate' : 'delegates'} authorized to collect {(child.fullName || '').split(' ')[0]}.
            </p>
          </div>
        </div>

        {/* ATTENDANCE */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 col-span-2">
          <p className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
            ATTENDANCE
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-muted)] rounded-2xl p-4">
              <p className="text-[0.68rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Current Status</p>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-2 h-2 rounded-full text-center ${isMswEnabled ? 'bg-[#0FA37F]' : 'bg-[#6B7280]'}`} />
                <p className="font-body font-bold text-xs text-[var(--text-primary)] text-center">
                  {isMswEnabled ? 'In School' : (child.enrollmentStatus || 'Pending')}
                </p>
              </div>
            </div>
            <div className="bg-[var(--bg-muted)] rounded-2xl p-4">
              <p className="text-[0.68rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Check-in</p>
              <p className="font-body font-bold text-xs text-[var(--text-primary)]">
                {isMswEnabled ? '7:42 AM' : 'N/A'}
              </p>
            </div>
            <div className="bg-[var(--bg-muted)] rounded-2xl p-4">
              <p className="text-[0.68rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Weekly Avg</p>
              <p className="font-body font-bold text-xs text-[var(--text-primary)]">
                {isMswEnabled ? '98%' : 'N/A'}
              </p>
            </div>
            <div className="bg-[var(--bg-muted)] rounded-2xl p-4">
              <p className="text-[0.68rem] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Late days</p>
              <p className="font-body font-bold text-xs text-[var(--text-primary)]">
                {isMswEnabled ? '0 this term' : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* RECENT PICKUPS */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 col-span-2">
          <div className="flex justify-between items-center mb-4">
            <p className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-secondary)]">
              RECENT PICKUPS
            </p>
            <Link href="/dashboard/pickups" className="text-[0.72rem] font-bold text-[#0FA37F] hover:underline">
              View All
            </Link>
          </div>
          {isMswEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0FA37F]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-body text-[0.875rem] font-medium text-[var(--text-primary)]">Collected by David Mensah</p>
                    <p className="font-body text-[0.75rem] text-[var(--text-secondary)]">Yesterday &middot; 3:15 PM</p>
                  </div>
                </div>
                <Badge variant="teal" className="bg-[#E1F5EE] text-[#0F6E56] border-none">Approved</Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[#0FA37F]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-body text-[0.875rem] font-medium text-[var(--text-primary)]">Collected by Efua Mensah</p>
                    <p className="font-body text-[0.75rem] text-[var(--text-secondary)]">Oct 12 &middot; 3:20 PM</p>
                  </div>
                </div>
                <Badge variant="teal" className="bg-[#E1F5EE] text-[#0F6E56] border-none">Approved</Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="w-8 h-8 text-[#6B7280]/30 mb-2" />
              <p className="font-body text-[0.78rem] text-[#6B7280]/60">
                No recent pickups recorded
              </p>
            </div>
          )}
        </div>

        {/* EMERGENCY OVERRIDE CODES */}
        {child.school && (
          <div className="col-span-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5">
            <p className="font-body text-[0.72rem] uppercase tracking-widest text-[var(--text-secondary)] mb-4">
              EMERGENCY OVERRIDE CODES
            </p>
            <OverrideCodeCard 
              childId={child.id}
              schoolId={child.school.id}
              schoolName={child.school.name}
            />
          </div>
        )}

      </div>

      {/* DANGER ZONE */}
      <div className="bg-[#FAECE7] rounded-2xl p-5 border border-[#D85A30]/20 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#D85A30]" />
          <p className="font-body font-bold text-[#D85A30]">Danger Zone</p>
        </div>
        <p className="font-body text-sm text-[#D85A30]/70 mb-4 leading-relaxed">
          Once you delete a child profile, all history and school enrollment data will be permanently removed. 
          This action cannot be undone.
        </p>
        <Button variant="danger" className="bg-[#D85A30] text-white border-none h-12 px-6 rounded-xl font-bold">
          Remove {(child.fullName || '').split(' ')[0]}
        </Button>
      </div>
    </div>
  );
}
