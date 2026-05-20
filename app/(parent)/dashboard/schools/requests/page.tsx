"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Building,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { useSchoolRequestsList, useReviewSchoolRequest } from "@/hooks/useSchoolRequests";
import { useAuthStore } from "@/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  SchoolRequestItem,
  SchoolRequestStatus,
} from "@/types/school-requests.types";

const statusBadge: Record<SchoolRequestStatus, { variant: "sand" | "teal" | "danger"; label: string }> = {
  PENDING: { variant: "sand", label: "Pending" },
  APPROVED: { variant: "teal", label: "Approved" },
  REJECTED: { variant: "danger", label: "Rejected" },
};

export default function SchoolRequestsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "SCHOOL_ADMIN";
  const { addToast } = useToastStore();
  const { mutate: reviewRequest, isPending: reviewing } = useReviewSchoolRequest();

  const [statusFilter, setStatusFilter] = useState<SchoolRequestStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [reviewTarget, setReviewTarget] = useState<SchoolRequestItem | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [adminNotes, setAdminNotes] = useState("");

  const queryStatus = statusFilter === "ALL" ? undefined : statusFilter;
  const { data, isLoading } = useSchoolRequestsList({ status: queryStatus, page, limit: 20 });

  const requests = data?.requests ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const handleReview = () => {
    if (!reviewTarget) return;
    reviewRequest(
      {
        id: reviewTarget.id,
        data: {
          action: reviewAction,
          adminNotes: reviewAction === "REJECTED" ? adminNotes : adminNotes || undefined,
        },
      },
      {
        onSuccess: (res) => {
          addToast({ message: res.message, variant: "success" });
          setReviewTarget(null);
          setAdminNotes("");
        },
        onError: (err: any) => {
          addToast({ message: err.message || "Review failed", variant: "danger" });
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-6xl font-body">
      <div className="flex items-center gap-2 text-[0.875rem] mb-6">
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard/schools")}>Schools</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-primary)] font-medium">School Requests</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[1.5rem] font-semibold text-[var(--text-primary)]">
            {isAdmin ? "School Requests" : "My Requests"}
          </h1>
          <p className="text-[0.875rem] text-[var(--text-secondary)]">
            {isAdmin
              ? "Review and manage requests from parents."
              : "Track your school registration requests."}
          </p>
        </div>
        {!isAdmin && (
          <Button variant="primary" onClick={() => router.push("/dashboard/schools/request")}>
            <Plus className="w-4 h-4 mr-2" />
            Request a School
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2 rounded-full text-[0.8rem] font-medium transition-colors ${
              statusFilter === s
                ? "bg-navy text-white"
                : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
            }`}
          >
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--bg-surface)] animate-pulse rounded-2xl border border-[var(--border)]" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#4F46E5]" />
          </div>
          <h3 className="text-[1.1rem] font-semibold text-[var(--text-primary)] mb-2">
            No requests found
          </h3>
          <p className="text-[0.875rem] text-[var(--text-secondary)] max-w-[320px] leading-relaxed mb-6">
            {statusFilter !== "ALL"
              ? `No ${statusFilter.toLowerCase()} requests.`
              : isAdmin
                ? "No school requests have been submitted yet."
                : "You haven't submitted any school requests yet."}
          </p>
          {!isAdmin && statusFilter === "ALL" && (
            <Button variant="primary" onClick={() => router.push("/dashboard/schools/request")}>
              Request a School
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-5 hover:border-[var(--border-strong)] transition-all flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className="text-[1rem] font-semibold text-[var(--text-primary)] cursor-pointer hover:text-teal"
                    onClick={() => router.push(`/dashboard/schools/requests/${req.id}`)}
                  >
                    {req.schoolName}
                  </h3>
                  <Badge variant={statusBadge[req.status].variant}>
                    {statusBadge[req.status].label}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1 text-[0.8rem] text-[var(--text-secondary)]">
                  <span>{req.schoolAddress}</span>
                  {isAdmin && (
                    <span className="flex items-center gap-1">
                      by {req.parentName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/schools/requests/${req.id}`)}
                >
                  View Details
                </Button>
                {isAdmin && req.status === "PENDING" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setReviewTarget(req)}
                  >
                    Review
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-[0.875rem] text-[var(--text-secondary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-[0.875rem] text-[var(--text-secondary)]">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-[0.875rem] text-[var(--text-secondary)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {reviewTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-xl max-w-[520px] w-full p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                <Building className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <div>
                <h3 className="text-[1.1rem] font-semibold text-[var(--text-primary)]">
                  Review Request
                </h3>
                <p className="text-[0.875rem] text-[var(--text-secondary)] mt-1">
                  {reviewTarget.schoolName} &mdash; {reviewTarget.schoolAddress}
                </p>
                <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">
                  Requested by {reviewTarget.parentName} ({reviewTarget.parentPhone})
                </p>
              </div>
            </div>

            {reviewTarget.notes && (
              <div className="bg-[var(--bg-surface-2)] rounded-xl p-4 mb-6">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)] mb-1">Parent Notes</p>
                <p className="text-[0.875rem] text-[var(--text-primary)]">{reviewTarget.notes}</p>
              </div>
            )}

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setReviewAction("APPROVED")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[0.875rem] font-medium transition-all ${
                  reviewAction === "APPROVED"
                    ? "bg-teal/10 border-teal text-teal"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setReviewAction("REJECTED")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[0.875rem] font-medium transition-all ${
                  reviewAction === "REJECTED"
                    ? "bg-coral/10 border-coral text-coral"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                Reject
              </button>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">
                {reviewAction === "REJECTED" ? "Reason for rejection *" : "Admin Notes (optional)"}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  reviewAction === "REJECTED"
                    ? "Explain why this request was rejected..."
                    : "Any notes about this approval..."
                }
                rows={3}
                className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)] resize-none"
              />
              {reviewAction === "REJECTED" && !adminNotes.trim() && (
                <p className="text-[0.7rem] text-coral flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  A reason is required when rejecting
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => { setReviewTarget(null); setAdminNotes(""); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                loading={reviewing}
                disabled={reviewAction === "REJECTED" && !adminNotes.trim()}
                onClick={handleReview}
              >
                {reviewAction === "APPROVED" ? "Approve Request" : "Reject Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
