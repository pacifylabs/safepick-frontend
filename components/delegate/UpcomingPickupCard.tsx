"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';
import { SchedulePickup } from '@/types/delegate.types';
import { getInitials } from '@/lib/utils';
import { format } from 'date-fns';

interface UpcomingPickupCardProps {
  pickup: SchedulePickup;
  index: number;
}

const avatarColors = ['bg-[#1D9E75]', 'bg-[#185FA5]'];

const UpcomingPickupCard = ({ pickup, index }: UpcomingPickupCardProps) => {
  const router = useRouter();

  const handleQrClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/delegate/gate?authorizationId=${pickup.authorizationId}`);
  };

  const cardVariants = {
    hover: { y: -2 },
  };

  const time = new Date(`1970-01-01T${pickup.pickupWindowStart}`);
  const hour = format(time, 'h:mm');
  const ampm = format(time, 'a');

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      transition={{ duration: 0.2 }}
      className={`rounded-[12px] p-3 px-[14px] border flex items-center gap-3 cursor-pointer ${
        pickup.status === 'IN_PROGRESS'
          ? 'bg-[#E1F5EE] border-[rgba(15,163,127,0.22)]'
          : 'bg-white border-[rgba(11,26,44,0.07)]'
      }`}
    >
      <div className="min-w-[40px] md:min-w-[46px] text-center flex-shrink-0">
        <p className="font-fraunces text-[1rem] font-semibold text-[#0B1A2C] leading-none">
          {hour}
        </p>
        <p className="font-dm-sans text-[0.6rem] text-[#6B7280] mt-[1px]">{ampm}</p>
      </div>

      <div className="hidden md:block w-px h-8 bg-[rgba(11,26,44,0.07)] flex-shrink-0" />

      <div
        className={`w-[36px] h-[36px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[0.7rem] font-medium ${
          avatarColors[index % avatarColors.length]
        }`}
      >
        {getInitials(pickup.childName)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-dm-sans text-[0.82rem] font-medium text-[#0B1A2C] truncate">
          {pickup.childName}
        </p>
        <p className="font-dm-sans text-[0.7rem] text-[#6B7280] mt-[2px] truncate">
          {pickup.schoolName}
        </p>
        <div className="flex items-center gap-1 mt-[3px]">
          {pickup.alarmSet ? (
            <>
              <Clock className="w-[9px] h-[9px] stroke-[#0FA37F]" />
              <span className="font-dm-sans text-[0.65rem] text-[#0FA37F]">
                Alarm &middot; {pickup.alarmTime}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-[9px] h-[9px] stroke-[#EF9F27]" />
              <span className="font-dm-sans text-[0.65rem] text-[#EF9F27]">
                No alarm set
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-[5px] flex-shrink-0">
        <span
          className={`font-dm-sans text-[0.6rem] font-medium rounded-full px-[7px] py-[3px] ${
            pickup.status === 'IN_PROGRESS'
              ? 'bg-[#E1F5EE] text-[#085041]'
              : pickup.status === 'PENDING'
              ? 'bg-[#FAEEDA] text-[#854F0B]'
              : 'bg-[#F2F0EB] text-[#6B7280]'
          }`}
        >
          {pickup.status === 'IN_PROGRESS'
            ? 'Active now'
            : pickup.status === 'PENDING'
            ? 'Upcoming'
            : 'Done'}
        </span>
        <button
          onClick={handleQrClick}
          className="font-dm-sans text-[0.68rem] font-medium text-[#0FA37F] bg-[rgba(15,163,127,0.1)] border border-[rgba(15,163,127,0.2)] rounded-[6px] px-[9px] py-[3px] cursor-pointer hover:bg-[rgba(15,163,127,0.18)] transition-colors"
        >
          QR
        </button>
      </div>
    </motion.div>
  );
};

export default UpcomingPickupCard;
