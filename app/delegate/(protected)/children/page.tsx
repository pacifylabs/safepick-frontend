"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDelegateAuthorizations } from '@/hooks/useDelegate';
import DelegateRightPanel from '@/components/delegate/DelegateRightPanel';
import DelegateChildCard from '@/components/delegate/DelegateChildCard';
import { Users } from 'lucide-react';

const FILTERS = ["ALL", "ACTIVE", "SUSPENDED", "REVOKED"];

const ChildrenPage = () => {
  const router = useRouter();
  const { data: authorizations, isLoading } = useDelegateAuthorizations();
  const [filter, setFilter] = useState('ALL');

  const filteredAuthorizations = useMemo(() => {
    if (!authorizations) return [];
    if (filter === 'ALL') return authorizations;
    return authorizations.filter((auth: any) => auth.status === filter);
  }, [authorizations, filter]);

  const activeCount = useMemo(() => 
    authorizations?.filter((auth: any) => auth.status === 'ACTIVE').length || 0,
  [authorizations]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <main className="flex-1 bg-[var(--bg-page)] px-4 py-5 space-y-4 md:px-5 md:py-6 md:space-y-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-dm-sans text-[0.68rem] text-[var(--text-secondary)] mb-1">
              <span className="cursor-pointer hover:text-[#0FA37F]" onClick={() => router.push('/delegate/dashboard')}>
                Dashboard
              </span>
              <span className="text-[var(--text-secondary)]/50 mx-1">/</span>
              <span className="text-[var(--text-primary)]">My children</span>
            </p>
            <p className="font-fraunces text-[1.2rem] md:text-[1.4rem] font-semibold text-[var(--text-primary)] tracking-[-0.03em]">
              My Children
            </p>
            <p className="font-dm-sans text-[0.75rem] text-[var(--text-secondary)] mt-[2px]">
              {activeCount} active authorization{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
          <span className="bg-[#E1F5EE] rounded-full px-3 py-1 font-dm-sans text-[0.75rem] font-medium text-[#0FA37F]">
            {authorizations?.length || 0} total
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-[7px] font-dm-sans text-[0.78rem] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                filter === f
                  ? 'bg-[#0B1A2C] text-white'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-muted)]'
              }`}>
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-[220px] bg-[var(--bg-surface)] animate-pulse rounded-[14px]"></div>
            <div className="h-[220px] bg-[var(--bg-surface)] animate-pulse rounded-[14px]"></div>
          </div>
        ) : !authorizations || authorizations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E1F5EE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 stroke-[#0FA37F]" />
            </div>
            <h2 className="font-fraunces text-xl font-semibold text-[var(--text-primary)]">No authorizations</h2>
            <p className="font-dm-sans text-sm text-[var(--text-secondary)] mt-2">When a parent approves your access, children appear here.</p>
          </div>
        ) : filteredAuthorizations.length === 0 ? (
            <div className="text-center py-12">
                <h2 className="font-fraunces text-xl font-semibold text-[var(--text-primary)]">No {filter.toLowerCase()} authorizations</h2>
                <p className="font-dm-sans text-sm text-[var(--text-secondary)] mt-2">Try a different filter.</p>
            </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredAuthorizations.map((auth: any) => (
              <DelegateChildCard key={auth.id} authorization={auth} />
            ))}
          </div>
        )}
      </main>
      <div className="hidden lg:flex">
        <DelegateRightPanel />
      </div>
    </div>
  );
};

export default ChildrenPage;
