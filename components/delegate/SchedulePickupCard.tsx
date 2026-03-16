"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { SchedulePickup } from '@/types/delegate.types';

interface SchedulePickupCardProps {
  pickup: SchedulePickup;
  selectedDate: string;
  onAlarmChange: (alarm: {
    authorizationId: string;
    date: string;
    alarmTime: string;
    enabled: boolean;
  }) => void;
}

const alarmOptions = [
  { label: '30 min before', value: 30 },
  { label: '45 min before', value: 45 },
  { label: '1 hr before', value: 60 },
];

const SchedulePickupCard = ({
  pickup,
  selectedDate,
  onAlarmChange,
}: SchedulePickupCardProps) => {
  const [isAlarmOn, setIsAlarmOn] = useState(pickup.alarmSet);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const handleToggle = () => {
    const newState = !isAlarmOn;
    setIsAlarmOn(newState);
    if (!newState) {
      setSelectedTime(null);
      onAlarmChange({
        authorizationId: pickup.authorizationId,
        date: selectedDate,
        alarmTime: '',
        enabled: false,
      });
    }
  };

  const handleTimeSelect = (minutes: number) => {
    setSelectedTime(minutes);
    const pickupTime = new Date(`${selectedDate}T${pickup.pickupWindowStart}`);
    const alarmTime = new Date(pickupTime.getTime() - minutes * 60000);
    const formattedAlarmTime = alarmTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    onAlarmChange({
      authorizationId: pickup.authorizationId,
      date: selectedDate,
      alarmTime: formattedAlarmTime,
      enabled: true,
    });
  };

  const getAlarmTimeFromMinutes = (minutes: number) => {
    const pickupTime = new Date(`${selectedDate}T${pickup.pickupWindowStart}`);
    const alarmTime = new Date(pickupTime.getTime() - minutes * 60000);
    return alarmTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="bg-white rounded-[12px] border border-[rgba(11,26,44,0.07)] overflow-hidden">
      <div className="p-4 flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[0.7rem] font-medium flex-shrink-0">
          {getInitials(pickup.childName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-dm-sans text-[0.875rem] font-medium text-[#0B1A2C]">
            {pickup.childName}
          </p>
          <p className="font-dm-sans text-[0.72rem] text-[#6B7280] mt-[2px]">
            {pickup.schoolName}
          </p>
        </div>
        <div className="bg-[#E1F5EE] rounded-[9px] px-3 py-[6px] flex-shrink-0">
          <p className="font-dm-sans text-[0.75rem] font-medium text-[#0F6E56]">
            {pickup.pickupWindowStart} – {pickup.pickupWindowEnd}
          </p>
        </div>
      </div>

      <div className="border-t border-[#F2F0EB] p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 stroke-[#0FA37F]" />
            <p className="font-dm-sans text-[0.875rem] font-medium text-[#0B1A2C]">
              Alarm
            </p>
          </div>
          <div
            onClick={handleToggle}
            className={`w-10 h-5 rounded-full cursor-pointer flex items-center px-[3px] transition-colors ${
              isAlarmOn ? 'bg-[#0FA37F]' : 'bg-[#E8E6E1]'
            }`}
          >
            <motion.div
              className="w-[14px] h-[14px] bg-white rounded-full"
              layout
              transition={{ type: 'spring', stiffness: 700, damping: 30 }}
              initial={{ x: 0 }}
              animate={{ x: isAlarmOn ? 20 : 0 }}
            />
          </div>
        </div>

        <AnimatePresence>
          {isAlarmOn && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 flex-wrap pt-1">
                {alarmOptions.map(({ label, value }) => (
                  <button
                    key={label}
                    onClick={() => handleTimeSelect(value)}
                    className={`rounded-full font-dm-sans text-[0.75rem] font-medium px-3 py-[6px] ${
                      selectedTime === value
                        ? 'bg-[#0B1A2C] text-white'
                        : 'bg-[#F2F0EB] text-[#6B7280]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selectedTime && (
                 <p className="font-dm-sans text-[0.75rem] text-[#0FA37F] mt-2">
                   Reminder set for {getAlarmTimeFromMinutes(selectedTime)}
                 </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SchedulePickupCard;
