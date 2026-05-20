"use client";

import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Building,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  User,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { useSchoolRequest, useCancelSchoolRequest } from "@/hooks/useSchoolRequests";
import { useAuthStore } from "@/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { SchoolRequestStatus } from "@/types/school-requests.types";

const statusConfig: Record<SchoolRequestStatus, { variant: "sand" | "teal" | "danger"; icon: typeof Clock; label: string }> = {
  PENDING: { variant: "sand", icon: Clock, label: "Pending Review" },
  APPROVED: { variant: "teal", icon: CheckCircle, label: "Approved" },
  REJECTED: { variant: "danger", icon: XCircle, label: "Rejected" },
};

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "SCHOOL_ADMIN";
  const { addToast } = useToastStore();
  const { data: request, isLoading } = useSchoolRequest(id);
  const { mutate: cancelRequest, isPending: cancelling } = useCancelSchoolRequest();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = () => {
    cancelRequest(id, {
      onSuccess: () => {
        addToast({ message: "Request cancelled", variant: "success" });
        router.push("/dashboard/schools/requests");
      },
      onError: (err: any) => {
        addToast({ message: err.message || "Failed to cancel", variant: "danger" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl">
        <div className="h-6 w-64 bg-[var(--bg-surface)] animate-pulse rounded mb-6" />
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-[var(--bg-surface-2)] animate-pulse rounded w-3/4" />
          ))}
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--text-secondary)]">Request not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/dashboard/schools/requests")}>
          Back to requests
        </Button>
      </div>
    );
  }

  const status = statusConfig[request.status];

  return (
    <div className="p-6 max-w-4xl font-body">
      <div className="flex items-center gap-2 text-[0.875rem] mb-6">
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard/schools")}>Schools</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard/schools/requests")}>Requests</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-primary)] font-medium">{request.schoolName}</span>
      </div>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[0.875rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <Building className="w-7 h-7 text-[#4F46E5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[1.5rem] font-semibold text-[var(--text-primary)]">{request.schoolName}</h1>
                <Badge variant={status.variant}>
                  <status.icon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <div className="mt-3 space-y-1.5">
                <p className="flex items-center gap-2 text-[0.875rem] text-[var(--text-secondary)]">
                  <MapPin className="w-4 h-4" />
                  {request.schoolAddress}
                </p>
                {request.schoolPhone && (
                  <p className="flex items-center gap-2 text-[0.875rem] text-[var(--text-secondary)]">
                    <Phone className="w-4 h-4" />
                    {request.schoolPhone}
                  </p>
                )}
                {request.schoolEmail && (
                  <p className="flex items-center gap-2 text-[0.875rem] text-[var(--text-secondary)]">
                    <Mail className="w-4 h-4" />
                    {request.schoolEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          {request.status === "PENDING" && !isAdmin && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Cancel Request
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-4">Request Details</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[0.875rem]">
              <span className="text-[var(--text-secondary)]">Request ID</span>
              <span className="text-[var(--text-primary)] font-mono text-[0.8rem]">{request.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between text-[0.875rem]">
              <span className="text-[var(--text-secondary)]">Created</span>
              <span className="text-[var(--text-primary)]">
                {new Date(request.createdAt).toLocaleDateString(undefined, {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-[0.875rem]">
              <span className="text-[var(--text-secondary)]">Last Updated</span>
              <span className="text-[var(--text-primary)]">
                {new Date(request.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </div>
            {request.reviewedAt && (
              <div className="flex items-center justify-between text-[0.875rem]">
                <span className="text-[var(--text-secondary)]">Reviewed</span>
                <span className="text-[var(--text-primary)]">
                  {new Date(request.reviewedAt).toLocaleDateString(undefined, {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#4F46E5] mb-4">Parent Information</p>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[0.875rem]">
              <User className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-primary)]">{request.parentName}</span>
            </div>
            <div className="flex items-center gap-2 text-[0.875rem]">
              <Phone className="w-4 h-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-primary)]">{request.parentPhone}</span>
            </div>
          </div>
        </div>
      </div>

      {request.notes && (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-6 mb-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] mb-3">Parent Notes</p>
          <p className="text-[0.875rem] text-[var(--text-primary)] leading-relaxed">{request.notes}</p>
        </div>
      )}

      {request.adminNotes && (
        <div className={`rounded-2xl border p-6 mb-6 ${
          request.status === "APPROVED"
            ? "bg-teal/5 border-teal/20"
            : "bg-coral/5 border-coral/20"
        }`}>
          <div className="flex items-center gap-2 mb-3">
            {request.status === "APPROVED" ? (
              <CheckCircle className="w-5 h-5 text-teal" />
            ) : (
              <XCircle className="w-5 h-5 text-coral" />
            )}
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              Admin {request.status === "APPROVED" ? "Notes" : "Rejection Reason"}
            </p>
          </div>
          <p className="text-[0.875rem] text-[var(--text-primary)] leading-relaxed">{request.adminNotes}</p>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-xl max-w-[400px] w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-coral" />
            </div>
            <h3 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-2">Cancel Request?</h3>
            <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8 leading-relaxed">
              This will cancel your request for <strong>{request.schoolName}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowCancelConfirm(false)}>
                Keep Request
              </Button>
              <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>
                Yes, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
