"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/ui/AuthCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { apiFetch } from "@/services/apiClient";

type InviteData = {
  inviterName: string;
  children: string[];
  relationship: string;
  expiryDate: string;
};

function DelegateJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [state, setState] = useState<"VALIDATING" | "VALID" | "INVALID">("VALIDATING");
  const [inviteData, setInviteData] = useState<InviteData | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await apiFetch<any>(`/delegates/invite/${token}/validate`);
        if (response.valid) {
          setInviteData(response.data);
          setState("VALID");
        } else {
          setState("INVALID");
        }
      } catch (err) {
        setState("INVALID");
      }
    };

    if (token) {
      validateToken();
    } else {
      setState("INVALID");
    }
  }, [token]);

  return (
    <>
      {state === "VALIDATING" && (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--auth-border)] border-t-teal" />
          <p className="font-body text-[0.9rem] text-[var(--auth-text-muted)]">Verifying your invite...</p>
        </div>
      )}

      {state === "VALID" && inviteData && (
        <>
          <div className="mb-4 sm:mb-6 flex items-center gap-3 rounded-[14px] border border-[var(--auth-border)] bg-[var(--auth-surface)] p-3 sm:p-4">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-mid text-xs sm:text-sm font-semibold text-white uppercase">
              {inviteData.inviterName.charAt(0)}
            </div>
            <div>
              <p className="font-body text-[0.8rem] sm:text-[0.85rem] font-medium text-white">
                {inviteData.inviterName} invited you
              </p>
              <p className="font-body text-[0.7rem] sm:text-[0.75rem] text-[var(--auth-text-muted)]">to pick up their child</p>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <span className="font-body text-[0.75rem] font-medium uppercase tracking-widest text-teal-mid">
              DELEGATE INVITATION
            </span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-white">
              You've been <i className="text-teal-mid not-italic">invited</i>
            </h1>

            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
              {inviteData.children.map((child) => (
                <div
                  key={child}
                  className="flex items-center gap-1.5 rounded-full border border-teal/20 bg-teal/10 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[0.74rem] sm:text-[0.78rem] text-teal"
                >
                  <span>👤</span>
                  {child}
                </div>
              ))}
            </div>

            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
              <div className="rounded-full bg-[var(--auth-surface)] px-2.5 sm:px-3 py-1 sm:py-1.5 text-[0.7rem] sm:text-[0.75rem] text-[var(--auth-text-muted)]">
                Role: {inviteData.relationship}
              </div>
            </div>

            <p className="mt-4 sm:mt-6 text-[0.74rem] sm:text-[0.78rem] text-[var(--auth-text-muted)]">
              Invite expires {new Date(inviteData.expiryDate).toLocaleDateString()}
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push(`/delegate/kyc?token=${token}`)}
          >
            Accept invite & verify identity
          </Button>

          <div className="mt-4 sm:mt-6 text-center">
            <Link href="/" className="text-[0.75rem] sm:text-[0.8rem] text-[var(--auth-text-muted)] hover:text-white hover:underline">
              Not you? Ignore this invite.
            </Link>
          </div>
        </>
      )}

      {state === "INVALID" && (
        <div className="py-6 sm:py-8 text-center">
          <div className="mx-auto mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-coral/20 text-coral">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="sm:w-8 sm:h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-semibold text-white">Invite expired</h2>
          <p className="mx-auto mt-2 sm:mt-3 max-w-[280px] font-body text-[0.85rem] sm:text-[0.9rem] leading-relaxed text-[var(--auth-text-muted)]">
            This link is no longer valid. Ask the parent to send a new one.
          </p>
          <Button
            variant="ghost"
            fullWidth
            className="mt-6 sm:mt-8 text-[var(--auth-text-muted)]"
            onClick={() => router.push("/")}
          >
            Back to home
          </Button>
        </div>
      )}
    </>
  );
}

export default function DelegateJoinPage() {
  return (
    <AuthCard>
      <Suspense
        fallback={
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--auth-border)] border-t-teal" />
            <p className="font-body text-[0.9rem] text-[var(--auth-text-muted)]">Loading invitation...</p>
          </div>
        }
      >
        <DelegateJoinContent />
      </Suspense>
    </AuthCard>
  );
}
