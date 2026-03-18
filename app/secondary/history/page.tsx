"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  History, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ChevronRight,
  LogOut,
  User,
  ShieldCheck
} from "lucide-react";
import { useSecondaryHistory } from "@/hooks/useSecondaryGuardian";
import { useSecondaryAuthStore } from "@/stores/secondaryAuth.store";
import { Logo } from "@/components/ui/Logo";
import { format } from "date-fns";

export default function SecondaryHistoryPage() {
  const router = useRouter();
  const { secondaryGuardian, clearSecondaryGuardian } = useSecondaryAuthStore();
  const { data: history = [], isLoading } = useSecondaryHistory();

  const handleLogout = () => {
    clearSecondaryGuardian();
    router.push("/secondary/login");
  };

  return (
    <main className="bg-[var(--auth-bg)] min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] mx-auto flex flex-col items-center"
      >
        <div className="w-full flex justify-between items-center mb-8">
          <Logo variant="light" size="sm" />
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-[var(--auth-surface)] flex items-center justify-center text-[var(--auth-text-muted)] hover:text-white transition-colors border border-[var(--auth-border)]"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <span className="font-body text-[0.7rem] font-medium uppercase tracking-[0.08em] text-[#0FA37F] mb-3">
          ACTIVITY HISTORY
        </span>
        
        <h1 className="font-display text-[2rem] font-semibold text-white text-center leading-[1.08] tracking-[-0.03em] mb-2">
          Past authorizations
        </h1>
        
        <p className="font-body text-[0.875rem] text-[var(--auth-text-muted)] text-center leading-relaxed mb-8">
          View your recent activity as a secondary guardian.
        </p>

        <div className="w-full space-y-2 mb-10">
          {isLoading ? (
            <>
              <div className="h-20 bg-[var(--auth-surface)] rounded-2xl animate-pulse border border-[var(--auth-border)]" />
              <div className="h-20 bg-[var(--auth-surface)] rounded-2xl animate-pulse border border-[var(--auth-border)]" />
            </>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="w-12 h-12 text-white/10 mb-4" />
              <p className="font-body text-[0.875rem] text-[var(--auth-text-muted)]/60">No activity yet</p>
            </div>
          ) : (
            history.map((item: any) => (
              <div 
                key={item.id}
                className="bg-[var(--auth-surface)] rounded-2xl px-4 py-4 flex items-center gap-4 border border-[var(--auth-border)]"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.decision === "APPROVE" ? "bg-[#0FA37F]/20" : "bg-[#D85A30]/20"
                }`}>
                  {item.decision === "APPROVE" ? (
                    <CheckCircle className="w-5 h-5 text-[#0FA37F]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#D85A30]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-[0.9375rem] font-medium text-white truncate">
                    {item.decision === "APPROVE" ? "Approved release" : "Denied release"}
                  </p>
                  <p className="font-body text-[0.78rem] text-[var(--auth-text-muted)] mt-0.5 truncate">
                    {item.childName} &middot; {format(new Date(item.respondedAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="w-full bg-[var(--auth-surface)] border border-[var(--auth-border)] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#0FA37F]" />
            <p className="font-body text-[0.875rem] font-bold text-white uppercase tracking-wider">
              Guardian Security
            </p>
          </div>
          <p className="font-body text-[0.82rem] text-[var(--auth-text-muted)] leading-relaxed">
            As a secondary guardian, your authorization is legally binding. The school and primary parent are notified immediately of your decision.
          </p>
        </div>
      </motion.div>
    </main>
  );
}
