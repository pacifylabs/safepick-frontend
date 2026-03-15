"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Authorization } from "../../types/authorizations.types";
import { DelegateAuthorization } from "../../types/delegates.types";
import { useAuthorizations } from "../../hooks/useAuthorizations";
import { useToastStore } from "@/stores/toast.store";

interface EditRulesModalProps {
  authorization: Authorization | DelegateAuthorization;
  delegateName: string;
  childName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditRulesModal({
  authorization,
  delegateName,
  childName,
  isOpen,
  onClose,
  onSaved,
}: EditRulesModalProps) {
  // Use casting or internal validation to ensure ID exists
  const authId = authorization.id!;
  
  const [authType, setAuthType] = useState(authorization.authType);
  const [allowedDays, setAllowedDays] = useState<string[]>(authorization.allowedDays || []);
  const [startTime, setStartTime] = useState(authorization.allowedTimeStart || "");
  const [endTime, setEndTime] = useState(authorization.allowedTimeEnd || "");
  const [validFrom, setValidFrom] = useState(authorization.validFrom || "");
  const [validUntil, setValidUntil] = useState(authorization.validUntil || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { updateAuthorization } = useAuthorizations();
  const { addToast } = useToastStore();

  useEffect(() => {
    if (isOpen) {
      setAuthType(authorization.authType);
      setAllowedDays(authorization.allowedDays || []);
      setStartTime(authorization.allowedTimeStart || "");
      setEndTime(authorization.allowedTimeEnd || "");
      setValidFrom(authorization.validFrom || "");
      setValidUntil(authorization.validUntil || "");
      setErrors({});
    }
  }, [isOpen, authorization]);

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const toggleDay = (day: string) => {
    setAllowedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (authType === "RECURRING" || authType === "DATE_RANGE") {
      if (allowedDays.length === 0) newErrors.allowedDays = "Select at least one day";
      if (!startTime) newErrors.startTime = "Start time required";
      if (!endTime) newErrors.endTime = "End time required";
      if (startTime && endTime && startTime >= endTime) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (authType === "ONE_TIME" || authType === "DATE_RANGE") {
      if (!validFrom) newErrors.validFrom = "Date required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateAuthorization.mutateAsync({
        authId: authId as string,
        data: {
          authType,
          allowedDays,
          allowedTimeStart: startTime,
          allowedTimeEnd: endTime,
          validFrom: validFrom || undefined,
          validUntil: validUntil || null,
        } as any,
      });

      addToast({
        message: `Rules updated for ${childName}`,
        variant: "success",
        icon: <CheckCircle className="w-5 h-5 text-[#0FA37F]" />,
      });

      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Failed to update rules:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-t-[28px] md:rounded-[28px] w-full max-w-[480px] shadow-2xl relative"
      >
        <div className="px-6 pt-6 flex items-center justify-between">
          <p className="font-body text-[0.72rem] font-medium uppercase tracking-widest text-[#0FA37F]">
            EDIT RULES
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F0EB] flex items-center justify-center text-[#0B1A2C] hover:bg-[#E8E6E1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 mt-4">
          <h2 className="font-display text-[1.25rem] font-semibold text-[#0B1A2C]">
            Rules for {delegateName}
          </h2>
          <p className="font-body text-[0.875rem] text-[#6B7280] mt-1 leading-relaxed">
            Updating authorization for <span className="font-semibold text-[#0B1A2C]">{childName}</span>
          </p>

          <div className="mt-6 flex gap-2">
            {(["RECURRING", "ONE_TIME", "DATE_RANGE"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setAuthType(type)}
                className={`flex-1 py-2 px-3 rounded-full font-body text-[0.7rem] font-medium transition-all ${
                  authType === type
                    ? "bg-[#0B1A2C] text-white shadow-md"
                    : "bg-[#F2F0EB] text-[#6B7280] hover:bg-[#E8E6E1]"
                }`}
              >
                {type === "RECURRING" ? "RECURRING" : type === "ONE_TIME" ? "ONE-TIME" : "DATE RANGE"}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {(authType === "RECURRING" || authType === "DATE_RANGE") && (
              <motion.div
                key="recurring-fields"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                <div className="flex justify-between gap-1">
                  {days.map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      type="button"
                      className={`w-10 h-10 rounded-xl font-body text-[0.7rem] font-medium transition-all ${
                        allowedDays.includes(day)
                          ? "bg-[#0B1A2C] text-white shadow-sm"
                          : "bg-[#F2F0EB] text-[#6B7280] hover:bg-[#E8E6E1]"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {errors.allowedDays && (
                  <p className="font-body text-[0.74rem] text-[#D85A30] mt-2 ml-1">
                    {errors.allowedDays}
                  </p>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-[0.75rem] text-[#6B7280] mb-1.5 ml-1">From</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className={`w-full pl-9 pr-4 py-3 bg-[#F2F0EB] rounded-xl font-body text-[0.875rem] outline-none border transition-all ${
                          errors.startTime ? "border-[#D85A30]" : "border-transparent focus:border-[#0FA37F]/30"
                        }`}
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
                        className={`w-full pl-9 pr-4 py-3 bg-[#F2F0EB] rounded-xl font-body text-[0.875rem] outline-none border transition-all ${
                          errors.endTime ? "border-[#D85A30]" : "border-transparent focus:border-[#0FA37F]/30"
                        }`}
                      />
                    </div>
                  </div>
                </div>
                {errors.endTime && (
                  <p className="font-body text-[0.74rem] text-[#D85A30] mt-2 ml-1">
                    {errors.endTime}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(authType === "ONE_TIME" || authType === "DATE_RANGE") && (
              <motion.div
                key="date-fields"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 grid grid-cols-2 gap-4"
              >
                <div>
                  <label className="block font-body text-[0.75rem] text-[#6B7280] mb-1.5 ml-1">
                    {authType === "ONE_TIME" ? "Date" : "Valid from"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 bg-[#F2F0EB] rounded-xl font-body text-[0.875rem] outline-none border transition-all ${
                        errors.validFrom ? "border-[#D85A30]" : "border-transparent focus:border-[#0FA37F]/30"
                      }`}
                    />
                  </div>
                  {errors.validFrom && (
                    <p className="font-body text-[0.74rem] text-[#D85A30] mt-2 ml-1">
                      {errors.validFrom}
                    </p>
                  )}
                </div>
                {authType === "DATE_RANGE" && (
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {updateAuthorization.isError && (
          <div className="mx-6 mt-6 bg-[#FAECE7] border border-[#D85A30]/20 rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#D85A30]" />
              <p className="font-body text-[0.82rem] text-[#993C1D]">
                Could not update rules. Please try again.
              </p>
            </div>
            <button
              onClick={() => updateAuthorization.reset()}
              className="text-[0.78rem] font-medium text-[#D85A30] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="px-6 py-6">
          <Button
            fullWidth
            loading={updateAuthorization.isPending}
            onClick={handleSave}
          >
            Save changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
