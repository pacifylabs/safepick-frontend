'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDelegateSchedule, useSetAlarm } from '@/hooks/useDelegate';
import { startOfWeek, addDays, format, isToday, isEqual, parseISO } from 'date-fns';
import DelegateRightPanel from '@/components/delegate/DelegateRightPanel';
import SchedulePickupCard from '@/components/delegate/SchedulePickupCard';
import { CalendarX } from 'lucide-react';

const SchedulePage = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedDateISO = useMemo(() => {
    if (!selectedDate) return new Date().toISOString().split('T')[0];
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  const { data: scheduleData, isLoading } = useDelegateSchedule(selectedDateISO);
  const schedule = (scheduleData as any)?.pickups ?? scheduleData ?? [];
  const { mutate: setAlarm } = useSetAlarm();

  const week = useMemo(() => {
    const baseDate = selectedDate || new Date();
    const monday = startOfWeek(baseDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(monday, i));
  }, [selectedDate]);

  // This is a placeholder as the API only fetches for one day.
  // A real implementation would fetch the whole week's schedule.
  const totalWeekPickups = schedule?.length || 0;

  const handleAlarmChange = (alarmData: {
    authorizationId: string;
    date: string;
    alarmTime: string;
    enabled: boolean;
  }) => {
    setAlarm(alarmData);
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <main className="flex-1 bg-[#E8EAF0] px-4 py-5 space-y-4 md:px-5 md:py-6 md:space-y-5">
        <div>
          <p className="font-dm-sans text-[0.68rem] text-[#6B7280] mb-1">
            <span className="cursor-pointer hover:text-[#0FA37F]" onClick={() => router.push('/delegate/dashboard')}>
              Dashboard
            </span>
            <span className="text-[#6B7280]/50 mx-1">/</span>
            <span className="text-[#0B1A2C]">Schedule</span>
          </p>
          <p className="font-fraunces text-[1.2rem] md:text-[1.4rem] font-semibold text-[#0B1A2C] tracking-[-0.03em]">
            Schedule
          </p>
          <p className="font-dm-sans text-[0.75rem] text-[#6B7280] mt-[2px]">
            Manage your pickup reminders
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {week.map(day => {
            const isSelected = selectedDateISO === day.toISOString().split('T')[0];
            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`flex flex-col items-center rounded-[14px] px-4 py-[10px] cursor-pointer transition-all min-w-[50px] md:min-w-[54px] ${
                  isSelected
                    ? 'bg-[#0B1A2C]'
                    : 'bg-white border border-[rgba(11,26,44,0.07)]'
                }`}
              >
                <span className={`font-dm-sans text-[0.62rem] uppercase ${isSelected ? 'text-white/50' : 'text-[#6B7280]'}`}>
                  {format(day, 'EEE')}
                </span>
                <span className={`font-fraunces text-[1.2rem] font-semibold ${isSelected ? 'text-white' : 'text-[#0B1A2C]'}`}>
                  {format(day, 'd')}
                </span>
                {isToday(day) && !isSelected && (
                  <div className="w-[5px] h-[5px] bg-[#0FA37F] rounded-full mx-auto mt-[3px]"></div>
                )}
              </div>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-[120px] bg-white animate-pulse rounded-[12px]"></div>
            <div className="h-[120px] bg-white animate-pulse rounded-[12px]"></div>
          </div>
        ) : Array.isArray(schedule) && schedule.length > 0 ? (
          <div className="flex flex-col gap-4">
            {schedule.map((pickup: any, index: number) => (
              <SchedulePickupCard
                key={pickup.id || index}
                pickup={pickup}
                selectedDate={selectedDateISO}
                onAlarmChange={handleAlarmChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <CalendarX className="w-12 h-12 stroke-gray-400 opacity-30 mb-4" />
            <p className="font-dm-sans text-[#6B7280]">No pickups on {format(selectedDate || new Date(), 'eeee')}.</p>
          </div>
        )}

        <div className="bg-white rounded-[12px] border border-[rgba(11,26,44,0.07)] p-4 flex items-center justify-between mt-4">
          <span className="font-dm-sans text-[0.78rem] text-[#6B7280]">This week</span>
          <span className="font-fraunces text-[1.1rem] font-semibold text-[#0B1A2C]">
            {totalWeekPickups} pickup{totalWeekPickups !== 1 ? 's' : ''}
          </span>
        </div>
      </main>
      <div className="hidden lg:flex">
        <DelegateRightPanel />
      </div>
    </div>
  );
};

export default SchedulePage;
