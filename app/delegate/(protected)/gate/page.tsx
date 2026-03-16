'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDelegateAuthorizations, useDelegateQrToken } from '@/hooks/useDelegate';
import QRCode from 'react-qr-code';
import { getInitials } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ShieldOff } from 'lucide-react';

const GatePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GateContent />
    </Suspense>
  );
};

const GateContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authorizationId = searchParams.get('authorizationId');

  const { data: authorizations, isLoading: isLoadingAuths } = useDelegateAuthorizations();
  const { data: qrToken, isLoading: isLoadingQr } = useDelegateQrToken(authorizationId);

  if (authorizationId) {
    // QR Display Logic (Preserved from Feature 07)
    return (
      <div className="bg-[#0B1A2C] min-h-screen flex flex-col items-center justify-center text-white p-4">
        {isLoadingQr ? (
          <p>Loading QR Code...</p>
        ) : qrToken ? (
          <div className="bg-white p-4 rounded-lg">
            <QRCode value={qrToken} size={256} />
          </div>
        ) : (
          <p>Could not load QR Code.</p>
        )}
        <button onClick={() => router.back()} className="mt-8 text-white/50 hover:text-white transition-colors">
          Back
        </button>
      </div>
    );
  }

  // Child Selector Screen
  return (
    <div className="bg-[#0B1A2C] min-h-screen min-h-[100dvh] flex flex-col">
      <div className="px-4 md:px-6 pt-5 md:pt-6 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[8px] h-[8px] bg-[#0FA37F] rounded-full"></div>
          <p className="font-fraunces text-[1rem] md:text-[1.1rem] font-semibold text-white">SafePick</p>
        </div>
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/delegate/dashboard')}>
          <ChevronLeft className="w-4 h-4 stroke-white opacity-50" />
          <p className="font-dm-sans text-[0.78rem] md:text-[0.82rem] text-white/50 hover:text-white/80 transition-colors">Back</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 pb-8 md:pb-12">
        <h1 className="font-fraunces text-[1.3rem] md:text-[1.5rem] font-semibold text-white text-center tracking-[-0.02em] mb-2">
          Which child today?
        </h1>
        <p className="font-dm-sans text-[0.82rem] md:text-[0.875rem] text-white/45 text-center mb-8 md:mb-10">
          Select to display their QR code
        </p>

        {isLoadingAuths ? (
          <p className="text-white/50">Loading authorizations...</p>
        ) : authorizations && authorizations.length > 0 ? (
          <div className="flex flex-col gap-3 w-full max-w-full md:max-w-[380px] mx-auto">
            {authorizations.map((auth: any) => (
              <div
                key={auth.id}
                onClick={() => router.push(`/delegate/gate?authorizationId=${auth.id}`)}
                className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.1] rounded-[14px] p-4 cursor-pointer hover:bg-white/[0.1] active:scale-[0.99] transition-all"
              >
                <div className="w-[44px] h-[44px] md:w-[46px] md:h-[46px] bg-[#1D9E75] rounded-full flex items-center justify-center text-white text-[0.78rem] md:text-[0.8rem] font-medium flex-shrink-0">
                  {getInitials(auth.child.fullName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-fraunces text-[0.95rem] md:text-[1rem] font-semibold text-white truncate tracking-[-0.02em]">
                    {auth.child.fullName}
                  </p>
                  <p className="font-dm-sans text-[0.7rem] md:text-[0.72rem] text-white/45 mt-[2px] truncate">
                    {auth.school.name} &middot; {auth.allowedTimeStart}&ndash;{auth.allowedTimeEnd}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 stroke-white opacity-30 flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <ShieldOff className="w-10 h-10 md:w-12 md:h-12 stroke-white opacity-20 mb-4" />
            <p className="font-fraunces text-[1.1rem] md:text-[1.2rem] text-white/70 text-center">No active authorizations</p>
            <p className="font-dm-sans text-[0.78rem] md:text-[0.82rem] text-white/35 text-center mt-2 max-w-[240px] md:max-w-[260px] mx-auto">
              No pickup windows are active at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GatePage;
