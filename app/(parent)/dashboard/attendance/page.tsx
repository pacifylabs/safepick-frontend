"use client";

import { useState } from "react";
import { useChildren } from "@/hooks/useChildren";
import { useAttendanceByChild } from "@/hooks/useAttendance";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isWeekend, isFuture, isSameDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function AttendancePage() {
  const { data: childrenData = [], isLoading: loadingChildren } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Set initial child if not set
  if (!selectedChildId && childrenData.length > 0) {
    setSelectedChildId(childrenData[0].id);
  }

  const getChildColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-[#1D9E75]", "bg-[#185FA5]", "bg-[#BA7517]", "bg-[#993556]"];
    return colors[Math.abs(hash) % 4];
  };

  const monthStr = format(currentMonth, "yyyy-MM");
  const { data: attendanceData, isLoading: loadingAttendance } = useAttendanceByChild(selectedChildId, monthStr);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getStatusColor = (status: string, date: Date) => {
    if (isWeekend(date) || isFuture(date)) return "bg-[var(--bg-muted)] text-[var(--text-secondary)]/40";
    switch (status) {
      case "PRESENT": return "bg-[#0FA37F]/10 text-[#0FA37F] border-[#0FA37F]/20";
      case "ABSENT": return "bg-[#D85A30]/10 text-[#D85A30] border-[#D85A30]/20";
      case "LATE": return "bg-[#EF9F27]/10 text-[#EF9F27] border-[#EF9F27]/20";
      default: return "bg-[var(--bg-muted)] text-[var(--text-secondary)]/40 border-[var(--border)]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT": return <CheckCircle2 className="w-4 h-4" />;
      case "ABSENT": return <XCircle className="w-4 h-4" />;
      case "LATE": return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-8xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-[1.5rem] font-semibold text-[var(--text-primary)]">Attendance</h1>
          <p className="text-[0.875rem] text-[var(--text-secondary)]">Track daily presence and clock-out logs.</p>
        </div>

        {/* Scalable Child Selector */}
        <div className="w-full md:w-auto">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]/60 mb-2 md:text-right px-1">
            Switch Child
          </p>
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 md:justify-end">
            {childrenData.map((child: any) => {
              const isSelected = selectedChildId === child.id;
              const initials = child.fullName.split(" ").map((n: string) => n[0]).join("");
              
              return (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`group relative flex-shrink-0 flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-2xl border transition-all duration-200 ${
                    isSelected 
                      ? "bg-[#EEF2FF] border-[#3730A3]/20 shadow-sm" 
                      : "bg-[var(--bg-surface)] border-[var(--border)] hover:border-[var(--text-secondary)]/30"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[0.7rem] font-bold text-white transition-transform duration-200 ${
                    isSelected ? "scale-110 shadow-md" : "opacity-80 group-hover:scale-105"
                  } ${getChildColor(child.id)}`}>
                    {initials}
                  </div>
                  <div className="text-left">
                    <p className={`text-[0.82rem] font-bold leading-none transition-colors ${
                      isSelected ? "text-[#3730A3]" : "text-[var(--text-primary)]"
                    }`}>
                      {child.fullName.split(" ")[0]}
                    </p>
                    <p className="text-[0.6rem] text-[var(--text-secondary)] mt-1 font-medium uppercase tracking-wider">
                      {child.grade}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div 
                      layoutId="active-child-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#3730A3] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[var(--text-secondary)] text-[0.875rem] mb-6">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-primary)] transition-colors font-bold">Attendance</span>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
            {/* Month Selector */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-[#3730A3]" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{format(currentMonth, "MMMM yyyy")}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-[var(--bg-muted)] rounded-xl text-[var(--text-secondary)] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-2 text-sm font-bold text-[#3730A3] hover:bg-[#EEF2FF] rounded-xl transition-colors"
                >
                  Today
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-[var(--bg-muted)] rounded-xl text-[var(--text-secondary)] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="p-8">
              <div className="grid grid-cols-7 gap-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-[0.7rem] font-bold uppercase tracking-widest text-[var(--text-secondary)]/50 pb-4">
                    {day}
                  </div>
                ))}
                
                {/* Empty slots for month start */}
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {days.map((date) => {
                  const record = attendanceData?.records.find(r => isSameDay(new Date(r.date), date));
                  const isToday = isSameDay(date, new Date());
                  const status = record?.status || "PENDING";
                  const colorClass = getStatusColor(status, date);

                  return (
                    <motion.div
                      key={date.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative border transition-all ${colorClass} ${
                        isToday ? "ring-2 ring-teal ring-offset-2 ring-offset-[var(--bg-surface)]" : ""
                      }`}
                    >
                      <span className="text-sm font-bold">{format(date, "d")}</span>
                      {!isWeekend(date) && !isFuture(date) && record && (
                        <div className="mt-1">
                          {getStatusIcon(status)}
                        </div>
                      )}
                      {isToday && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal rounded-full shadow-sm" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="p-6 bg-[var(--bg-muted)]/30 border-t border-[var(--border)] flex flex-wrap gap-6 justify-center">
              {[
                { label: "Present", color: "bg-[#0FA37F]" },
                { label: "Absent", color: "bg-[#D85A30]" },
                { label: "Late", color: "bg-[#EF9F27]" },
                { label: "Future/Weekend", color: "bg-[var(--text-secondary)]/20" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Column */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border)] shadow-sm p-8 space-y-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Monthly Summary</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0FA37F]/10 flex items-center justify-center text-[#0FA37F]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">Present</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{attendanceData?.summary.presentCount || 0}</p>
                  </div>
                </div>
                <Badge variant="teal">Good</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#EF9F27]/10 flex items-center justify-center text-[#EF9F27]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">Late</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{attendanceData?.summary.lateCount || 0}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D85A30]/10 flex items-center justify-center text-[#D85A30]">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">Absent</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{attendanceData?.summary.absentCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--border)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-[var(--text-secondary)]">Attendance Rate</span>
                <span className="text-lg font-bold text-[#0FA37F]">{attendanceData?.summary.attendanceRate || 0}%</span>
              </div>
              <div className="w-full h-2.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${attendanceData?.summary.attendanceRate || 0}%` }}
                  className="h-full bg-[#0FA37F] rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-[#EEF2FF] rounded-3xl p-8 border border-[#3730A3]/10">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-[#3730A3]" />
              <h4 className="font-bold text-[#3730A3]">Attendance Policy</h4>
            </div>
            <p className="text-sm text-[#3730A3]/70 leading-relaxed">
              Attendance is marked automatically upon clock-out at the school gate. 
              Late marks are applied for pickups after 4:00 PM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
