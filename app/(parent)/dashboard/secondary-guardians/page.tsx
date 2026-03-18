"use client";

import { useState } from "react";
import { UserPlus, ShieldCheck } from "lucide-react";
import { useSecondaryGuardians } from "@/hooks/useSecondaryGuardian";
import { Button } from "@/components/ui/Button";
import { SecondaryGuardianCard } from "@/components/secondary/SecondaryGuardianCard";
import { InviteGuardianModal } from "@/components/secondary/InviteGuardianModal";

export default function SecondaryGuardiansPage() {
  const { data: guardians = [], isLoading } = useSecondaryGuardians();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const activeGuardians = guardians.filter(g => g.status !== "REMOVED");

  return (
    <div className="max-w-[680px] mx-auto px-6 py-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="font-body text-[0.72rem] font-bold uppercase tracking-widest text-[#0FA37F] mb-1">
            SECONDARY GUARDIANS
          </p>
          <h1 className="font-display text-[1.75rem] font-semibold text-[#0B1A2C]">
            {activeGuardians.length === 0 ? "No guardians yet" : 
             activeGuardians.length === 1 ? "1 Guardian" : 
             `${activeGuardians.length} Guardians`}
          </h1>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => setIsInviteModalOpen(true)}
          className="gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add guardian</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* CONTENT */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-32 bg-white border border-black/[0.06] rounded-2xl animate-pulse" />
          <div className="h-32 bg-white border border-black/[0.06] rounded-2xl animate-pulse" />
        </div>
      ) : activeGuardians.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E1F5EE] flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-[#0FA37F]" />
          </div>
          <h2 className="font-display text-[1.25rem] font-semibold text-[#0B1A2C] mb-2">
            No secondary guardian yet
          </h2>
          <p className="font-body text-[0.875rem] text-[#6B7280] max-w-[280px] leading-relaxed mb-6">
            A secondary guardian is notified when you cannot be reached during a pickup request.
          </p>
          <Button 
            variant="primary" 
            onClick={() => setIsInviteModalOpen(true)}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add secondary guardian
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {activeGuardians.map((guardian) => (
            <SecondaryGuardianCard key={guardian.id} guardian={guardian} />
          ))}
        </div>
      )}

      {/* FOOTER NOTE */}
      <div className="mt-12 bg-[#F2F0EB] rounded-2xl p-5 flex items-start gap-4">
        <ShieldCheck className="w-5 h-5 text-[#0FA37F] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-body text-[0.875rem] font-bold text-[#0B1A2C] mb-1">
            How it works
          </p>
          <p className="font-body text-[0.82rem] text-[#6B7280] leading-relaxed">
            Secondary guardians are trusted contacts who can authorize pickups if you're unavailable. 
            They'll receive an SMS or WhatsApp alert with a login link when needed.
          </p>
        </div>
      </div>

      <InviteGuardianModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
    </div>
  );
}
