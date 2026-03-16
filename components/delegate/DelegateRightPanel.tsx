"use client";

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDelegateProfile, useDelegateAuthorizations } from '@/hooks/useDelegate';
import { getInitials } from '@/lib/utils';
import { Building, ChevronRight, Plus, User, X } from 'lucide-react';
import { SosButton } from '@/components/delegate/SosButton';
import { DelegateAuthorization, DelegateKycStatus } from '@/types/delegate.types';

const DelegateRightPanel = () => {
  const router = useRouter();
  const { data: profile } = useDelegateProfile();
  const { data: authorizations } = useDelegateAuthorizations();

  const relationship = useMemo(() => {
    if (!authorizations || authorizations.length === 0) return 'Delegate';
    return authorizations[0].relationship;
  }, [authorizations]);

  const schools = useMemo(() => {
    if (!authorizations) return [];
    const schoolMap = new Map<string, { school: DelegateAuthorization['school']; children: string[] }>();
    authorizations.forEach((auth: any) => {
      if (!schoolMap.has(auth.school.id)) {
        schoolMap.set(auth.school.id, { school: auth.school, children: [] });
      }
      schoolMap.get(auth.school.id)!.children.push(auth.child.fullName);
    });
    return Array.from(schoolMap.values());
  }, [authorizations]);

  const parents = useMemo(() => {
    if (!authorizations) return [];
    const parentMap = new Map<string, { parent: DelegateAuthorization['parent']; child: DelegateAuthorization['child'] }>();
    authorizations.forEach((auth: any) => {
      if (!parentMap.has(auth.parent.fullName)) {
        parentMap.set(auth.parent.fullName, { parent: auth.parent, child: auth.child });
      }
    });
    return Array.from(parentMap.values());
  }, [authorizations]);

  const parentBgColors = ['bg-[#1D9E75]', 'bg-[#185FA5]', 'bg-[#0FA37F]'];

  return (
    <aside className="hidden lg:flex lg:w-[256px] bg-white border-l border-[rgba(11,26,44,0.07)] px-5 py-6 flex-col min-h-screen">
      {profile && (
        <div className="bg-[#0B1A2C] rounded-[14px] p-[18px] text-center mb-6">
          <div className="w-[56px] h-[56px] rounded-full bg-[#1D9E75] flex items-center justify-center border-[2.5px] border-white/10 mx-auto mb-[10px]">
            <span className="text-white font-medium text-lg">{getInitials(profile.fullName)}</span>
          </div>
          <p className="font-fraunces text-[0.95rem] font-semibold text-white">{profile.fullName}</p>
          <p className="font-dm-sans text-[0.68rem] text-white/38 mt-[2px] capitalize">
            {relationship} &middot; Delegate
          </p>
          
          <div className="mt-[10px] inline-flex items-center gap-1 rounded-full px-[9px] py-1 bg-[rgba(15,163,127,0.18)]">
            <div className="w-[5px] h-[5px] rounded-full flex-shrink-0 bg-[#0FA37F]"></div>
            <span className="font-dm-sans text-[0.65rem] font-medium text-[#0FA37F]">Identity verified</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-white/[0.06] rounded-[9px] p-[9px] text-center">
              <p className="font-fraunces text-[1.05rem] font-semibold text-white">{authorizations?.length || 0}</p>
              <p className="font-dm-sans text-[0.6rem] text-white/30 mt-[1px]">Children</p>
            </div>
            <div className="bg-white/[0.06] rounded-[9px] p-[9px] text-center">
              <p className="font-fraunces text-[1.05rem] font-semibold text-white">47</p>
              <p className="font-dm-sans text-[0.6rem] text-white/30 mt-[1px]">Pickups</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-dm-sans text-[0.68rem] font-medium text-[#6B7280] uppercase tracking-[0.08em]">My schools</h3>
          <div className="w-[22px] h-[22px] bg-[#F2F0EB] rounded-[6px] flex items-center justify-center cursor-pointer">
            <Plus className="w-[11px] h-[11px] stroke-[#6B7280]" />
          </div>
        </div>
        {schools.length > 0 ? (
          schools.map(({ school, children }) => (
            <div key={school.id} onClick={() => router.push('/delegate/schools')} className="flex items-center gap-[9px] p-[9px] rounded-[10px] border border-[rgba(11,26,44,0.07)] cursor-pointer mb-[7px] hover:bg-[#F2F0EB] transition-colors">
              <div className="w-[32px] h-[32px] bg-[#0B1A2C] rounded-[8px] flex items-center justify-center flex-shrink-0">
                <Building className="w-[14px] h-[14px] stroke-[#0FA37F]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-dm-sans text-[0.78rem] font-medium text-[#0B1A2C] truncate">{school.name}</p>
                <p className="font-dm-sans text-[0.65rem] text-[#6B7280] mt-[1px] truncate">{children.join(', ')}</p>
              </div>
              <ChevronRight className="w-[13px] h-[13px] stroke-[#6B7280] opacity-30 flex-shrink-0" />
            </div>
          ))
        ) : (
          <p className="font-dm-sans text-[0.78rem] text-[#6B7280] text-center py-4">No schools yet</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-dm-sans text-[0.68rem] font-medium text-[#6B7280] uppercase tracking-[0.08em] mb-2">Authorized by</h3>
        {parents.map(({ parent, child }, index) => (
          <div key={parent.fullName} className="flex items-center gap-[9px] p-[9px] rounded-[10px] border border-[rgba(11,26,44,0.07)] mb-[7px]">
            <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 text-white text-[0.65rem] font-medium ${parentBgColors[index % parentBgColors.length]}`}>
              {getInitials(parent.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-dm-sans text-[0.76rem] font-medium text-[#0B1A2C]">{parent.fullName.split(' ')[0]}</p>
              <p className="font-dm-sans text-[0.65rem] text-[#6B7280] mt-[1px]">Parent &middot; {child.fullName}</p>
            </div>
            <div className="w-[6px] h-[6px] bg-[#0FA37F] rounded-full ml-auto flex-shrink-0"></div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-[18px] border-t border-[rgba(11,26,44,0.07)]">
        <SosButton />
        <p className="font-dm-sans text-[0.65rem] text-[rgba(216,90,48,0.5)] text-center mt-[5px]">
          Hold 3 seconds to activate
        </p>
      </div>
    </aside>
  );
};

export default DelegateRightPanel;
