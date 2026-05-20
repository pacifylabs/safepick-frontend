"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Building,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Link,
  Unlink,
  ExternalLink,
  AlertCircle,
  Users,
  ArrowLeft,
} from "lucide-react";
import { useSchool, useDeleteSchool, useLinkChild, useUnlinkChild } from "@/hooks/useSchoolsManagement";
import { useChildren } from "@/hooks/useChildren";
import { useAuthStore } from "@/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SchoolDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "SCHOOL_ADMIN";
  const { data: school, isLoading } = useSchool(id);
  const { data: children = [] } = useChildren();
  const { mutate: deleteSchool, isPending: deleting } = useDeleteSchool();
  const { mutate: linkChild, isPending: linking } = useLinkChild();
  const { mutate: unlinkChild, isPending: unlinking } = useUnlinkChild();
  const { addToast } = useToastStore();

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [childSearch, setChildSearch] = useState("");
  const debouncedChildSearch = useDebouncedValue(childSearch, 300);

  const linkedChildIds = new Set((school?.children || []).map((c: any) => c.id));
  const unlinkedChildren = children.filter(
    (c) => !linkedChildIds.has(c.id) &&
      (debouncedChildSearch.length < 2 ||
        c.fullName.toLowerCase().includes(debouncedChildSearch.toLowerCase()))
  );

  const handleDelete = () => {
    deleteSchool(id, {
      onSuccess: () => {
        addToast({ message: "School deleted", variant: "success" });
        router.push("/dashboard/schools");
      },
      onError: (err: any) => {
        addToast({ message: String(err?.data?.message || err?.message || "Failed to delete school"), variant: "danger" });
      },
    });
  };

  const handleLink = (childId: string) => {
    linkChild(
      { schoolId: id, childId },
      {
        onSuccess: () => {
          addToast({ message: `Child linked to ${school?.name || "school"} — pending verification`, variant: "success" });
          setShowLinkModal(false);
          setChildSearch("");
        },
        onError: (err: any) => {
          addToast({ message: String(err?.data?.message || err?.message || "Failed to link child"), variant: "danger" });
        },
      }
    );
  };

  const handleUnlink = (childId: string) => {
    unlinkChild(
      { schoolId: id, childId },
      {
        onSuccess: () => {
          addToast({ message: "Child unlinked from school", variant: "success" });
        },
        onError: (err: any) => {
          addToast({ message: String(err?.data?.message || err?.message || "Failed to unlink child"), variant: "danger" });
        },
      }
    );
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

  if (!school) {
    return (
      <div className="p-6 text-center">
        <p className="text-[var(--text-secondary)]">School not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/dashboard/schools")}>
          Back to schools
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl font-body">
      <div className="flex items-center gap-2 text-[0.875rem] mb-6">
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]" onClick={() => router.push("/dashboard/schools")}>Schools</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
        <span className="text-[var(--text-primary)] font-medium">{school.name}</span>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <Building className="w-7 h-7 text-[#4F46E5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[1.5rem] font-semibold text-[var(--text-primary)]">{school.name}</h1>
                {school.verified ? (
                  <Badge variant="teal">Verified</Badge>
                ) : (
                  <Badge variant="sand">Unverified</Badge>
                )}
              </div>
              <div className="mt-3 space-y-1.5">
                <p className="flex items-center gap-2 text-[0.875rem] text-[var(--text-secondary)]">
                  <MapPin className="w-4 h-4" />
                  {school.address}
                </p>
                <p className="flex items-center gap-2 text-[0.875rem] text-[var(--text-secondary)]">
                  <Phone className="w-4 h-4" />
                  {school.phone}
                </p>
                <p className="flex items-center gap-2 text-[0.875rem] text-[var(--text-secondary)]">
                  <Mail className="w-4 h-4" />
                  {school.email}
                </p>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/schools/${id}/edit`)}
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[1.1rem] font-semibold text-[var(--text-primary)]">Linked Children</h2>
            <p className="text-[0.8rem] text-[var(--text-secondary)]">
              {(school as any).children?.length || 0} child{(school as any).children?.length !== 1 ? "ren" : ""} linked to this school
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowLinkModal(true)}>
            <Link className="w-4 h-4 mr-1.5" />
            Link Child
          </Button>
        </div>

        {(school as any).children?.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[0.9rem] text-[var(--text-secondary)]">No children linked yet</p>
            <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">Link children to this school to manage enrollment.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {(school as any).children?.map((child: any) => (
              <div key={child.id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center text-[0.75rem] font-medium text-teal">
                    {child.fullName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-medium text-[var(--text-primary)]">{child.fullName}</p>
                    <p className="text-[0.75rem] text-[var(--text-muted)]">
                      {typeof child.enrollmentStatus === "string" ? child.enrollmentStatus : "ENROLLED"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlink(child.id)}
                  disabled={unlinking}
                  className="flex items-center gap-1 text-[0.8rem] text-coral hover:text-coral/80 transition-colors disabled:opacity-50"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Unlink
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showLinkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-xl max-w-[480px] w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-[1.1rem] font-semibold text-[var(--text-primary)]">Link Child to School</h3>
                <button onClick={() => { setShowLinkModal(false); setChildSearch(""); }} className="p-1 hover:bg-[var(--bg-muted)] rounded-lg text-[var(--text-secondary)]">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="Search children..."
                  value={childSearch}
                  onChange={(e) => setChildSearch(e.target.value)}
                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[0.875rem] outline-none focus:border-[#0FA37F] text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {unlinkedChildren.length === 0 ? (
                <p className="text-center text-[0.875rem] text-[var(--text-secondary)] py-8">
                  {debouncedChildSearch.length >= 2 ? "No children match your search." : "All children are already linked."}
                </p>
              ) : (
                unlinkedChildren.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleLink(child.id)}
                    disabled={linking}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-surface-2)] transition-colors text-left disabled:opacity-50 border border-transparent hover:border-[var(--border)]"
                  >
                    <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center text-[0.75rem] font-medium text-teal flex-shrink-0">
                      {child.fullName?.charAt(0) || "?"}
                    </div>
                    <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{child.fullName}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] shadow-xl max-w-[400px] w-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-coral" />
            </div>
            <h3 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-2">Delete School?</h3>
            <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8 leading-relaxed">
              This action cannot be undone. All data associated with {school.name} will be permanently removed.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
