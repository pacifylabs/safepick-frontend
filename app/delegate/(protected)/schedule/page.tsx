'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDelegateSchedule, useSetAlarm } from '@/hooks/useDelegate';
import { startOfWeek, addDays, format, isToday } from 'date-fns';
import DelegateRightPanel from '@/components/delegate/DelegateRightPanel';
import SchedulePickupCard from '@/components/delegate/SchedulePickupCard';
import { CalendarX } from 'lucide-react';

const SchedulePage = () => {
  console.log('SCHEDULE RENDER START');
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedDateISO = useMemo(() => {
    if (!selectedDate) return new Date().toISOString().split('T')[0];
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  const { data: scheduleData, isLoading } = useDelegateSchedule(selectedDateISO);
  const schedule = (scheduleData as any)?.pickups ?? scheduleData ?? [];
  console.log('SCHEDULE DATA:', scheduleData);
  console.log('SCHEDULE ARRAY:', schedule);
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

  try {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <main className="flex-1 bg-[var(--bg-page)] px-4 py-5 space-y-4 md:px-5 md:py-6 md:space-y-5">
          <div>
            <p className="font-dm-sans text-[0.68rem] text-[var(--text-secondary)] mb-1">
              <span className="cursor-pointer hover:text-[#0FA37F]" onClick={() => router.push('/delegate/dashboard')}>
                Dashboard
              </span>
              <span className="text-[var(--text-secondary)]/50 mx-1">/</span>
              <span className="text-[var(--text-primary)]">Schedule</span>
            </p>
            <p className="font-fraunces text-[1.2rem] md:text-[1.4rem] font-semibold text-[var(--text-primary)] tracking-[-0.03em]">
              Schedule
            </p>
            <p className="font-dm-sans text-[0.75rem] text-[var(--text-secondary)] mt-[2px]">
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
                      : 'bg-[var(--bg-surface)] border border-[var(--border)]'
                  }`}
                >
                  <span className={`font-dm-sans text-[0.62rem] uppercase ${isSelected ? 'text-white/50' : 'text-[var(--text-secondary)]'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`font-fraunces text-[1.2rem] font-semibold ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
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
              <div className="h-[120px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
              <div className="h-[120px] bg-[var(--bg-surface)] animate-pulse rounded-[12px]"></div>
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
              <p className="font-dm-sans text-[var(--text-secondary)]">No pickups on {format(selectedDate || new Date(), 'eeee')}.</p>
            </div>
          )}

          <div className="bg-[var(--bg-surface)] rounded-[12px] border border-[var(--border)] p-4 flex items-center justify-between mt-4">
            <span className="font-dm-sans text-[0.78rem] text-[var(--text-secondary)]">This week</span>
            <span className="font-fraunces text-[1.1rem] font-semibold text-[var(--text-primary)]">
              {totalWeekPickups} pickup{totalWeekPickups !== 1 ? 's' : ''}
            </span>
          </div>
        </main>
        <div className="hidden lg:flex">
          <DelegateRightPanel />
        </div>
      </div>
    );
  } catch (error) {
    console.error('SCHEDULE RENDER ERROR:', error);
    return (
      <div className="flex-1 bg-[var(--bg-page)] p-10">
        <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-red-100 shadow-sm">
          <h2 className="text-red-600 font-semibold text-lg mb-2">Render Error</h2>
          <pre className="bg-red-50 p-4 rounded text-xs overflow-auto text-red-800">
            {String(error)}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default SchedulePage;
