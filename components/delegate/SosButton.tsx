"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneCall, CheckCircle, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDelegateAuthorizations } from "@/hooks/useDelegate";
import { useSendSos, useCancelSos } from "@/hooks/useEmergency";
import { SosReason } from "@/types/delegate.types";

type Step = "IDLE" | "HOLDING" | "CONFIRMING" | "SENT" | "CANCELLED";

interface SosButtonProps {
  childId?: string; // Optional if we want to force a specific child
}

const getCurrentLocation = (): Promise<{ lat: number; lng: number; accuracy: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
};

export function SosButton({ childId }: SosButtonProps) {
  const [step, setStep] = useState<Step>("IDLE");
  const [holdProgress, setHoldingProgress] = useState(0);
  const [selectedAuthId, setSelectedAuthId] = useState<string>("");
  const [shareLocation, setShareLocation] = useState(true);
  const [cancelCountdown, setCancelCountdown] = useState(30);
  const [sosId, setSosId] = useState<string | null>(null);
  
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: auths } = useDelegateAuthorizations();
  const sendSos = useSendSos();
  const cancelSos = useCancelSos();

  useEffect(() => {
    if (auths && auths.length > 0 && !selectedAuthId) {
      setSelectedAuthId(auths[0].id);
    }
  }, [auths, selectedAuthId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "SENT" && cancelCountdown > 0) {
      timer = setInterval(() => {
        setCancelCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cancelCountdown]);

  const startHolding = () => {
    if (step !== "IDLE") return;
    setStep("HOLDING");
    setHoldingProgress(0);
    
    const startTime = Date.now();
    const duration = 3000;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setHoldingProgress(progress);
      if (progress >= 100) {
        clearInterval(progressIntervalRef.current!);
      }
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      setStep("CONFIRMING");
      setHoldingProgress(0);
    }, duration);
  };

  const stopHolding = () => {
    if (step === "HOLDING") {
      setStep("IDLE");
      setHoldingProgress(0);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
  };

  const handleSendSos = async () => {
    const activeAuth = auths?.find(a => a.id === selectedAuthId);
    const targetChildId = childId || activeAuth?.child?.id;

    if (!targetChildId) {
      console.error("No child selected for SOS");
      return;
    }

    try {
      const loc = await getCurrentLocation().catch(() => ({
        lat: 0,
        lng: 0,
        accuracy: 0
      }));
      
      const res = await sendSos.mutateAsync({
        childId: targetChildId,
        location: loc
      });
      setSosId(res.sosId);
      setStep("SENT");
      setCancelCountdown(30);
    } catch (err) {
      console.error("SOS failed:", err);
      setStep("IDLE");
    }
  };

  const handleCancelSos = async () => {
    try {
      await cancelSos.mutateAsync();
      setStep("CANCELLED");
      setTimeout(() => setStep("IDLE"), 2000);
    } catch (err) {
      console.error("Failed to cancel SOS", err);
    }
  };

  return (
    <>
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50">
        <motion.button
          className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-colors ${
            step === "HOLDING" ? "bg-[#D85A30]/90 scale-92" : "bg-[#D85A30]"
          }`}
          onMouseDown={startHolding}
          onMouseUp={stopHolding}
          onTouchStart={startHolding}
          onTouchEnd={stopHolding}
          whileHover={{ scale: step === "IDLE" ? 1.05 : 1 }}
        >
          {step === "HOLDING" && (
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeDasharray="163.36"
                strokeDashoffset={163.36 - (163.36 * holdProgress) / 100}
                className="transition-all duration-50 ease-linear"
              />
            </svg>
          )}
          
          <PhoneCall size={20} className="text-white" />
          <span className="text-[0.55rem] text-white font-bold uppercase mt-0.5">
            {step === "HOLDING" ? "Hold..." : "SOS"}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {step === "CONFIRMING" && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-white rounded-t-[28px] p-6 pb-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#FAECE7] rounded-full flex items-center justify-center text-[#D85A30]">
                  <PhoneCall size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold font-display">Send SOS alert?</h2>
                  <p className="text-sm text-[#6B7280]">This will immediately notify the parent.</p>
                </div>
              </div>

              {auths && auths.length > 1 && (
                <div className="mb-6">
                  <p className="text-sm font-medium mb-3">Who are you with right now?</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {auths.map((auth) => (
                      <button
                        key={auth.id}
                        onClick={() => setSelectedAuthId(auth.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                          selectedAuthId === auth.id
                            ? "bg-[#0B1A2C] text-white"
                            : "bg-[#F2F0EB] text-[#6B7280]"
                        }`}
                      >
                        {auth.child.fullName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-[#F2F0EB] rounded-2xl mb-8">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-[#0FA37F]" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Share my location</p>
                    <p className="text-xs text-[#6B7280]">Helps parent locate you faster</p>
                  </div>
                </div>
                <button
                  onClick={() => setShareLocation(!shareLocation)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    shareLocation ? "bg-[#0FA37F]" : "bg-[#E8E6E1]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      shareLocation ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleSendSos}
                  disabled={!selectedAuthId || sendSos.isPending}
                  loading={sendSos.isPending}
                >
                  Send SOS now
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setStep("IDLE")}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {step === "SENT" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm bg-white rounded-[28px] p-8 text-center"
            >
              <div className="w-16 h-16 bg-[#E1F5EE] rounded-full flex items-center justify-center text-[#0FA37F] mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              
              <h2 className="text-2xl font-semibold font-display mb-2">SOS sent</h2>
              <p className="text-[#6B7280] mb-8">Parent has been notified.</p>

              <div className="p-4 bg-[#F2F0EB] rounded-2xl mb-8">
                <p className="text-sm text-[#6B7280] mb-1">
                  {cancelCountdown > 0 ? "You can cancel within" : "Alert confirmed."}
                </p>
                {cancelCountdown > 0 && (
                  <p className="text-2xl font-bold text-[#0B1A2C]">{cancelCountdown}s</p>
                )}
              </div>

              {cancelCountdown > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleCancelSos}
                  disabled={cancelSos.isPending}
                  loading={cancelSos.isPending}
                >
                  Cancel this SOS
                </Button>
              )}
            </motion.div>
          </div>
        )}

        {step === "CANCELLED" && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-full px-6 py-3 shadow-xl flex items-center gap-3 border border-[#D85A30]/20"
            >
              <X size={20} className="text-[#D85A30]" />
              <span className="font-medium">SOS cancelled</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
