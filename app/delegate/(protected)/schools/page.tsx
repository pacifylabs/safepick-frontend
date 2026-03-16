'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDelegateAuthorizations } from '@/hooks/useDelegate';
import DelegateRightPanel from '@/components/delegate/DelegateRightPanel';
import SchoolCard from '@/components/delegate/SchoolCard';
import { Building, Info } from 'lucide-react';

const SchoolsPage = () => {
  const router = useRouter();
  const { data: authorizations, isLoading } = useDelegateAuthorizations();

  const schoolsWithChildren = useMemo(() => {
    if (!authorizations) return [];
    const schoolMap = new Map();
    authorizations.forEach((auth: any) => {
      if (!schoolMap.has(auth.school.id)) {
        schoolMap.set(auth.school.id, {
          ...auth.school,
          children: [],
        });
      }
      schoolMap.get(auth.school.id).children.push({
        childName: auth.child.fullName,
        authorizationId: auth.id,
      });
    });
    return Array.from(schoolMap.values());
  }, [authorizations]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <main className="flex-1 bg-[#E8EAF0] px-4 py-5 space-y-4 md:px-5 md:py-6 md:space-y-5">
        <div>
          <p className="font-dm-sans text-[0.68rem] text-[#6B7280] mb-1">
            <span className="cursor-pointer hover:text-[#0FA37F]" onClick={() => router.push('/delegate/dashboard')}>
              Dashboard
            </span>
            <span className="text-[#6B7280]/50 mx-1">/</span>
            <span className="text-[#0B1A2C]">Schools</span>
          </p>
          <h1 className="font-fraunces text-[1.2rem] md:text-[1.4rem] font-semibold text-[#0B1A2C] tracking-[-0.03em]">
            Schools
          </h1>
          <p className="font-dm-sans text-[0.75rem] md:text-[0.78rem] text-[#6B7280]">
            {schoolsWithChildren.length} school{schoolsWithChildren.length !== 1 ? 's' : ''} you are authorized at
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-[180px] md:h-[200px] bg-white animate-pulse rounded-[14px]"></div>
            <div className="h-[180px] md:h-[200px] bg-white animate-pulse rounded-[14px]"></div>
          </div>
        ) : schoolsWithChildren.length > 0 ? (
          <div className="flex flex-col gap-4">
            {schoolsWithChildren.map((school: any) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 stroke-[#0FA37F]" />
            </div>
            <h2 className="font-fraunces text-xl font-semibold text-[#0B1A2C]">No schools yet</h2>
            <p className="font-dm-sans text-sm text-[#6B7280] mt-2">Schools appear once a parent authorizes you.</p>
          </div>
        )}

        <div className="bg-[#E6F1FB] rounded-[12px] p-3.5 md:p-4 border border-[rgba(24,95,165,0.15)] flex items-start gap-3 mt-4">
          <Info className="w-4 h-4 stroke-[#185FA5] flex-shrink-0 mt-[2px]" />
          <div>
            <p className="font-dm-sans text-[0.75rem] md:text-[0.78rem] font-medium text-[#0B1A2C] mb-1">
              Need access to another school?
            </p>
            <p className="font-dm-sans text-[0.72rem] md:text-[0.75rem] text-[#6B7280] leading-relaxed">
              Ask the parent to add you as a delegate for their child at that school.
            </p>
          </div>
        </div>
      </main>
      <div className="hidden lg:flex">
        <DelegateRightPanel />
      </div>
    </div>
  );
};

export default SchoolsPage;
