"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Users, ArrowLeft, Clock, Calendar } from "lucide-react";
import { Button } from "../ui/Button";
import { DelegateProfile } from "../../types/delegates.types";
import { useAuthorizations, useRejectDelegate } from "../../hooks/useAuthorizations";

interface ApprovalModalProps {
  delegate: DelegateProfile;
  child: { id: string; fullName: string };
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
  onRejected: () => void;
}

type Step = "REVIEW" | "SET_RULES";

export function ApprovalModal({
  delegate,
  child,
  isOpen,
  onClose,
  onApproved,
  onRejected,
}: ApprovalModalProps) {
  const [step, setStep] = useState<Step>("REVIEW");
  const [authType, setAuthType] = useState<"RECURRING" | "ONE_TIME" | "DATE_RANGE">("RECURRING");
  const [allowedDays, setAllowedDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("17:00");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [validUntil, setValidUntil] = useState("");

  const { createAuthorization } = useAuthorizations();
  const rejectDelegate = useRejectDelegate();

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const toggleDay = (day: string) => {
    setAllowedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleApprove = async () => {
    try {
      await createAuthorization.mutateAsync({
        delegateProfileId: delegate.id,
        childId: child.id,
        authType,
        allowedDays,
        allowedTimeStart: startTime,
        allowedTimeEnd: endTime,
        validFrom,
        validUntil: validUntil || null,
      });
      onApproved();
      onClose();
    } catch (error) {
      console.error("Failed to approve delegate:", error);
    }
  };

  const handleReject = async () => {
    if (window.confirm("Are you sure you want to reject this delegate?")) {
      try {
        await rejectDelegate.mutateAsync({
          delegateProfileId: delegate.id,
          childId: child.id,
        });
        onRejected();
        onClose();
      } catch (error) {
        console.error("Failed to reject delegate:", error);
      }
    }
  };

  const initials = delegate.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-t-[28px] md:rounded-[28px] w-full max-w-[480px] overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === "REVIEW" ? (
            <motion.div
              key="review"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 pt-6 pb-0 flex items-center justify-between">
                <p className="font-body text-[0.72rem] font-medium uppercase tracking-widest text-[#0FA37F]">
                  DELEGATE REVIEW
                </p>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F2F0EB] flex items-center justify-center text-[#0B1A2C]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mx-6 mt-4 mb-0 bg-[#F2F0EB] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#1D9E75] flex items-center justify-center overflow-hidden text-white font-body font-semibold text-xl">
                  {delegate.photoUrl ? (
                    <img src={delegate.photoUrl} alt={delegate.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-[1.1rem] font-semibold text-[#0B1A2C]">
                    {delegate.fullName}
                  </h3>
                  <p className="font-body text-[0.78rem] text-[#6B7280] mt-0.5">
                    {delegate.relationship}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 bg-[#E1F5EE] rounded-full px-2.5 py-1 w-fit">
                    <CheckCircle className="w-3.5 h-3.5 text-[#0FA37F]" />
                    <span className="font-body text-[0.7rem] font-medium text-[#0FA37F]">
                      Identity verified
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 mt-4 space-y-2">
                <div className="flex justify-between text-[0.8rem] font-body">
                  <span className="text-[#6B7280]">Phone</span>
                  <span className="text-[#0B1A2C]">{delegate.phone}</span>
                </div>
                <div className="flex justify-between text-[0.8rem] font-body">
                  <span className="text-[#6B7280]">ID type</span>
                  <span className="text-[#0B1A2C]">National ID</span>
                </div>
                <div className="flex justify-between text-[0.8rem] font-body">
                  <span className="text-[#6B7280]">ID number</span>
                  <span className="text-[#0B1A2C]">•••• •••• 1234</span>
                </div>
              </div>

              <div className="px-6 mt-4">
                <div className="bg-[#F2F0EB] rounded-xl p-3 flex items-center gap-2 font-body text-[0.8rem]">
                  <Users className="w-4 h-4 text-[#0FA37F]" />
                  <span>
                    Approving access for <span className="font-semibold">{child.fullName}</span>
                  </span>
                </div>
              </div>

              <div className="px-6 py-6 flex flex-col gap-3">
                <Button fullWidth onClick={() => setStep("SET_RULES")}>
                  Approve & set rules
                </Button>
                <Button variant="danger" fullWidth onClick={handleReject}>
                  Reject this delegate
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="rules"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 pt-6 flex items-center gap-4">
                <button
                  onClick={() => setStep("REVIEW")}
                  className="w-8 h-8 rounded-full bg-[#F2F0EB] flex items-center justify-center text-[#0B1A2C]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <p className="font-body text-[0.72rem] font-medium uppercase tracking-widest text-[#0FA37F]">
                  AUTHORIZATION RULES
                </p>
              </div>

              <div className="px-6 mt-4">
                <h2 className="font-display text-[1.25rem] font-semibold text-[#0B1A2C]">
                  When can {delegate.fullName.split(" ")[0]} pick up?
                </h2>
                <p className="font-body text-[0.875rem] text-[#6B7280] mt-1">
                  Set the days and times this delegate is authorized.
                </p>

                <div className="mt-6 flex gap-2">
                  {(["RECURRING", "ONE_TIME", "DATE_RANGE"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAuthType(type)}
                      className={`flex-1 py-2 px-3 rounded-full font-body text-[0.7rem] font-medium transition-colors ${
                        authType === type
                          ? "bg-[#0B1A2C] text-white"
                          : "bg-[#F2F0EB] text-[#6B7280]"
                      }`}
                    >
                      {type === "RECURRING" ? "RECURRING" : type === "ONE_TIME" ? "ONE-TIME" : "DATE RANGE"}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <div className="flex justify-between gap-1">
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-10 h-10 rounded-xl font-body text-[0.7rem] font-medium transition-colors ${
                          allowedDays.includes(day)
                            ? "bg-[#0B1A2C] text-white"
                            : "bg-[#F2F0EB] text-[#6B7280]"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-[0.75rem] text-[#6B7280] mb-1.5 ml-1">From</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-[#F2F0EB] rounded-xl font-body text-[0.875rem] outline-none border border-transparent focus:border-[#0FA37F]/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-[0.75rem] text-[#6B7280] mb-1.5 ml-1">Until</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 bg-[#F2F0EB] rounded-xl font-body text-[0.875rem] outline-none border border-transparent focus:border-[#0FA37F]/30"
                      />
                    </div>
                  </div>
                </div>

                {authType === "DATE_RANGE" && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-body text-[0.75rem] text-[#6B7280] mb-1.5 ml-1">Valid from</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type="date"
                          value={validFrom}
                          onChange={(e) => setValidFrom(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 bg-[#F2F0EB] rounded-xl font-body text-[0.875rem] outline-none border border-transparent focus:border-[#0FA37F]/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-body text-[0.75rem] text-[#6B7280] mb-1.5 ml-1">Valid until</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type="date"
                          value={validUntil}
                          onChange={(e) => setValidUntil(e.target.value)}
                          className="w-full pl-9 pr-4 py-3 bg-[#F2F0EB] rounded-xl font-body text-[0.875rem] outline-none border border-transparent focus:border-[#0FA37F]/30"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-6">
                <Button
                  fullWidth
                  loading={createAuthorization.isPending}
                  onClick={handleApprove}
                >
                  Confirm authorization
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
