"use client";

import { useRouter } from 'next/navigation';
import { DelegateAuthorization } from '@/types/delegate.types';
import { getInitials } from '@/lib/utils';
import { Building, Clock, Calendar, ShieldCheck, QrCode } from 'lucide-react';

interface DelegateChildCardProps {
  authorization: DelegateAuthorization;
}

const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const DelegateChildCard = ({ authorization }: DelegateChildCardProps) => {
  const router = useRouter();

  const handleQrClick = () => {
    router.push(`/delegate/gate?authorizationId=${authorization.id}`);
  };

  const getStatusBadge = () => {
    switch (authorization.status) {
      case 'ACTIVE':
        return <span className="font-dm-sans text-[0.62rem] font-medium rounded-full px-[8px] py-[3px] bg-[rgba(15,163,127,0.2)] text-[#9FE1CB]">Active</span>;
      case 'SUSPENDED':
        return <span className="font-dm-sans text-[0.62rem] font-medium rounded-full px-[8px] py-[3px] bg-[rgba(239,159,39,0.2)] text-[#FAC775]">Suspended</span>;
      case 'REVOKED':
        return <span className="font-dm-sans text-[0.62rem] font-medium rounded-full px-[8px] py-[3px] bg-[rgba(216,90,48,0.2)] text-[#F0997B]">Revoked</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-[14px] border border-[rgba(11,26,44,0.07)] overflow-hidden">
      <div className="bg-[#0B1A2C] p-4 flex items-center gap-3">
        <div className="w-[46px] h-[46px] rounded-full flex-shrink-0 bg-[#1D9E75] flex items-center justify-center text-white text-[0.78rem] font-medium border-2 border-white/10">
          {getInitials(authorization.child.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-fraunces text-[1rem] font-semibold text-white tracking-[-0.02em] truncate">
            {authorization.child.fullName}
          </p>
          <p className="font-dm-sans text-[0.72rem] text-white/50 mt-[1px]">
            {authorization.child.grade}
          </p>
          <p className="font-dm-sans text-[0.62rem] text-white/22 mt-[2px]">
            ID: {authorization.child.safepickId}
          </p>
        </div>
        <div className="ml-auto flex-shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Building className="w-4 h-4 stroke-[#0FA37F] flex-shrink-0 mt-[2px]" />
          <div>
            <p className="font-dm-sans text-[0.82rem] font-medium text-[#0B1A2C]">
              {authorization.school.name}
            </p>
            <p className="font-dm-sans text-[0.72rem] text-[#6B7280] mt-[1px]">
              {authorization.school.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 stroke-[#0FA37F]" />
          <p className="font-dm-sans text-[0.82rem] text-[#0B1A2C]">
            {authorization.allowedTimeStart} – {authorization.allowedTimeEnd}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 stroke-[#0FA37F] flex-shrink-0" />
          {weekDays.map(day => (
            <span
              key={day}
              className={`font-dm-sans text-[0.68rem] font-medium rounded-full px-2 py-[3px] ${
                authorization.allowedDays.includes(day)
                  ? 'bg-[#0B1A2C] text-white'
                  : 'bg-[#F2F0EB] text-[#6B7280]'
              }`}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 stroke-[#6B7280] opacity-40" />
          <p className="font-dm-sans text-[0.75rem] text-[#6B7280]">
            Parent: {authorization.parent.fullName.split(' ')[0]}
          </p>
        </div>

        <button
          onClick={handleQrClick}
          className="w-full mt-1 bg-[rgba(15,163,127,0.08)] border border-[rgba(15,163,127,0.18)] rounded-[10px] py-[10px] flex items-center justify-center gap-2 cursor-pointer hover:bg-[rgba(15,163,127,0.14)] transition-colors"
        >
          <QrCode className="w-4 h-4 stroke-[#0FA37F]" />
          <span className="font-dm-sans text-[0.8rem] font-medium text-[#0FA37F]">
            Show QR for pickup
          </span>
        </button>
      </div>
    </div>
  );
};

export default DelegateChildCard;
