"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Clock } from 'lucide-react';
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

  if (pickup.status === 'COMPLETE' || pickup.status === 'RELEASED') {
    return (
      <div className="bg-[var(--bg-surface)] rounded-[14px] border border-[var(--border)] overflow-hidden opacity-80 shadow-sm transition-all hover:shadow-md">
        <div className="p-4 flex items-center gap-3">
          <div className="w-[38px] h-[38px] rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] text-[0.7rem] font-medium flex-shrink-0">
            {getInitials(pickup.childName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-dm-sans text-[0.875rem] font-medium text-[var(--text-primary)]">
              {pickup.childName}
            </p>
            <p className="font-dm-sans text-[0.72rem] text-[var(--text-secondary)] mt-[2px]">
              {pickup.schoolName}
            </p>
          </div>
          <div className="bg-[#0FA37F]/10 rounded-full px-3 py-[6px] flex-shrink-0 flex items-center gap-1.5 border border-[#0FA37F]/20">
            <CheckCircle className="w-3.5 h-3.5 text-[#0FA37F]" />
            <p className="font-dm-sans text-[0.65rem] font-bold text-[#0FA37F] uppercase tracking-wider">
              Done
            </p>
          </div>
        </div>
        <div className="px-4 pb-4 flex items-center gap-2 text-[var(--text-secondary)]/60">
          <Clock className="w-3.5 h-3.5" />
          <p className="text-[0.7rem] font-medium italic">Completed at {pickup.completedAt || '3:45 PM'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-surface)] rounded-[14px] border border-[var(--border)] overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="p-4 flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-[0.7rem] font-medium flex-shrink-0">
          {getInitials(pickup.childName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-dm-sans text-[0.875rem] font-medium text-[var(--text-primary)]">
            {pickup.childName}
          </p>
          <p className="font-dm-sans text-[0.72rem] text-[var(--text-secondary)] mt-[2px]">
            {pickup.schoolName}
          </p>
        </div>
        <div className="bg-[#EEF2FF] rounded-[10px] px-3 py-[6px] flex-shrink-0 border border-[#3730A3]/10 shadow-sm">
          <p className="font-dm-sans text-[0.75rem] font-bold text-[#3730A3]">
            {pickup.pickupWindowStart} – {pickup.pickupWindowEnd}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--border)] p-4 bg-[var(--bg-muted)]/20">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#3730A3]" />
            <p className="font-dm-sans text-[0.875rem] font-medium text-[var(--text-primary)]">
              Alarm
            </p>
          </div>
          <div
            onClick={handleToggle}
            className={`w-10 h-5 rounded-full cursor-pointer flex items-center px-[3px] transition-colors ${
              isAlarmOn ? 'bg-[#0FA37F]' : 'bg-[var(--border-strong)]'
            }`}
          >
            <motion.div
              className="w-[14px] h-[14px] bg-white rounded-full shadow-sm"
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
                    className={`rounded-full font-dm-sans text-[0.75rem] font-medium px-4 py-[7px] transition-all shadow-sm ${
                      selectedTime === value
                        ? 'bg-[#0B1A2C] text-white'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-muted)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {selectedTime && (
                 <p className="font-dm-sans text-[0.75rem] text-[#0FA37F] mt-3 font-medium flex items-center gap-1.5">
                   <Clock className="w-3.5 h-3.5" />
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
