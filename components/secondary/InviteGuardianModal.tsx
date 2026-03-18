"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquare, Phone, X } from "lucide-react";
import { 
  InvitePayload, 
  InvitePayloadSchema, 
  NotifyChannel 
} from "@/types/secondaryGuardian.types";
import { InputField } from "@/components/ui/InputField";
import { Button } from "@/components/ui/Button";
import { useInviteSecondaryGuardian } from "@/hooks/useSecondaryGuardian";
import { useToastStore } from "@/stores/toast.store";

interface InviteGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteGuardianModal({ isOpen, onClose }: InviteGuardianModalProps) {
  const { addToast } = useToastStore();
  const inviteMutation = useInviteSecondaryGuardian();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<InvitePayload>({
    resolver: zodResolver(InvitePayloadSchema),
    defaultValues: {
      notifyChannel: "SMS",
    },
  });

  const notifyChannel = watch("notifyChannel");

  const onSubmit = async (data: InvitePayload) => {
    try {
      await inviteMutation.mutateAsync(data);
      addToast({
        message: `Invite sent to ${data.fullName} via ${data.notifyChannel}`,
        variant: "success",
      });
      reset();
      onClose();
    } catch (err: any) {
      if (err.data?.error === "SECONDARY_GUARDIAN_EXISTS") {
        setError("phone", { message: "Already added." });
      } else {
        addToast({
          message: err.message || "Failed to send invite",
          variant: "danger",
        });
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Sheet/Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            sm-animate={{ scale: 1, y: 0 }}
            sm-initial={{ scale: 0.95, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-[480px] p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-start mb-1">
              <h2 className="font-display text-[1.25rem] font-semibold text-[#0B1A2C]">
                Add secondary guardian
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[#F2F0EB] rounded-lg text-[#6B7280] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="font-body text-[0.875rem] text-[#6B7280] mb-6">
              They will be notified when you don't respond to a pickup request.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                label="Full name"
                name="fullName"
                register={register}
                error={errors.fullName?.message}
                placeholder="e.g. Kwame Osei"
              />

              <InputField
                label="Phone number"
                name="phone"
                type="tel"
                register={register}
                error={errors.phone?.message}
                placeholder="+234 801 234 5678"
              />

              <div className="mt-4">
                <p className="font-body text-[0.78rem] font-medium text-[#0B1A2C] mb-2">
                  Send alerts via
                </p>
                <div className="flex gap-3">
                  <div
                    onClick={() => setValue("notifyChannel", "SMS")}
                    className={`flex-1 rounded-2xl px-5 py-3 cursor-pointer flex items-center gap-2 transition-colors border ${
                      notifyChannel === "SMS"
                        ? "bg-[#0B1A2C] text-white border-[#0B1A2C]"
                        : "bg-white text-[#6B7280] border-black/[0.12] hover:border-black/20"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-body text-[0.875rem] font-medium">SMS</span>
                  </div>

                  <div
                    onClick={() => setValue("notifyChannel", "WHATSAPP")}
                    className={`flex-1 rounded-2xl px-5 py-3 cursor-pointer flex items-center gap-2 transition-colors border ${
                      notifyChannel === "WHATSAPP"
                        ? "bg-[#0B1A2C] text-white border-[#0B1A2C]"
                        : "bg-white text-[#6B7280] border-black/[0.12] hover:border-black/20"
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span className="font-body text-[0.875rem] font-medium">WhatsApp</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={inviteMutation.isPending}
                >
                  {inviteMutation.isPending ? "Sending invite..." : "Send invite"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  fullWidth
                  className="mt-2"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
