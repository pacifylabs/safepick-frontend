"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight,
  User,
  Bell
} from "lucide-react";
import { useSecondaryAuthStore } from "@/stores/secondaryAuth.store";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function SecondaryWelcomePage() {
  const router = useRouter();
  const { secondaryGuardian, pendingPickupRequestId } = useSecondaryAuthStore();

  const handleFinish = () => {
    if (pendingPickupRequestId) {
      router.push(`/secondary/pickup/${pendingPickupRequestId}`);
    } else {
      router.push("/secondary/history");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1A2C] flex flex-col overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col items-center justify-center px-8 text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
          >
            <CheckCircle className="w-20 h-20 text-[#0FA37F] mx-auto" />
          </motion.div>
          <h1 className="font-display text-[2rem] text-white mt-6 mb-3">
            Welcome, {secondaryGuardian?.fullName.split(" ")[0]}!
          </h1>
          <p className="font-body text-[0.875rem] text-white/50 max-w-[280px] mx-auto leading-relaxed">
            You're all set as a secondary guardian. We'll only contact you when your primary parent is unreachable.
          </p>
        </div>

        <div className="w-full max-w-[340px] space-y-4 mb-12">
          <div className="bg-white/5 rounded-2xl p-4 flex items-start gap-4 text-left border border-white/5">
            <Bell className="w-5 h-5 text-[#0FA37F] flex-shrink-0 mt-1" />
            <div>
              <p className="font-body text-[0.875rem] font-bold text-white mb-1">
                Stay Alert
              </p>
              <p className="font-body text-[0.78rem] text-white/50 leading-relaxed">
                You'll receive an SMS or WhatsApp notification when your authorization is needed.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex items-start gap-4 text-left border border-white/5">
            <ShieldCheck className="w-5 h-5 text-[#0FA37F] flex-shrink-0 mt-1" />
            <div>
              <p className="font-body text-[0.875rem] font-bold text-white mb-1">
                Fast Approval
              </p>
              <p className="font-body text-[0.78rem] text-white/50 leading-relaxed">
                Quickly approve or deny pickup requests from your phone without downloading an app.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[340px]">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleFinish}
            className="gap-2 h-14"
          >
            {pendingPickupRequestId ? "Go to pickup request" : "Go to dashboard"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
