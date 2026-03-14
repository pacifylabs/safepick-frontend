"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronRight,
  UserCheck,
  MoreHorizontal,
  Clock,
  Phone,
  Mail,
  MapPin,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pencil,
  Plus,
  Eye,
  Pause,
  Play,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  useDelegate,
  useRemoveDelegate,
  useSendReminder,
  useRevokeAuthorization,
  useUpdateAuthorizationStatus,
} from "@/hooks/useDelegates";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";

export default function DelegateProfilePage() {
  const { delegateId } = useParams();
  const router = useRouter();
  const { data: delegate, isLoading, isError } = useDelegate(delegateId as string);
  const { mutate: removeDelegate, isPending: removing } = useRemoveDelegate();
  const { mutate: sendReminder, isPending: reminding } = useSendReminder();
  const { mutate: revokeAuth } = useRevokeAuthorization();
  const { mutate: updateAuthStatus } = useUpdateAuthorizationStatus();

  const [activeTab, setActiveTab] = useState<"AUTHORIZATIONS" | "HISTORY">("AUTHORIZATIONS");

  if (isLoading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-6 space-y-6">
        <div className="h-48 bg-[#0B1A2C] animate-pulse rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white animate-pulse rounded-2xl border border-black/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !delegate) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-6 text-center">
        <div className="w-16 h-16 bg-[#FAECE7] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-[#D85A30]" />
        </div>
        <h2 className="text-[1.25rem] font-semibold text-[#0B1A2C]">Delegate not found</h2>
        <p className="text-[#6B7280] mb-6">This person may have been removed or the link is invalid.</p>
        <Button variant="primary" onClick={() => router.push("/dashboard/delegates")}>
          Back to delegates
        </Button>
      </div>
    );
  }

  const getChildColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-[#1D9E75]", "bg-[#185FA5]", "bg-[#BA7517]", "bg-[#993556]"];
    return colors[Math.abs(hash) % 4];
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove ${delegate.fullName}? This will revoke all their pickup authorizations.`)) {
      removeDelegate(delegate.id, {
        onSuccess: () => router.push("/dashboard/delegates"),
      });
    }
  };

  const profileMenuItems: DropdownItem[] = [
    {
      label: "Edit profile",
      icon: Pencil,
      onClick: () => alert("Edit profile clicked"),
    },
    {
      label: "Suspend access",
      icon: Pause,
      onClick: () => alert("Suspend access clicked"),
    },
    {
      label: "Remove delegate",
      icon: Trash2,
      variant: "danger",
      onClick: handleRemove,
    },
  ];

  const getAuthMenuItems = (auth: any): DropdownItem[] => [
    {
      label: "Edit rules",
      icon: Pencil,
      onClick: () => alert(`Edit rules for ${auth.childName}`),
    },
    {
      label: auth.status === "ACTIVE" ? "Suspend" : "Activate",
      icon: auth.status === "ACTIVE" ? Pause : Play,
      onClick: () => {
        updateAuthStatus({
          delegateId: delegate.id,
          childId: auth.childId,
          status: auth.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
        });
      },
    },
    {
      label: "Revoke access",
      icon: Trash2,
      variant: "danger",
      onClick: () => {
        if (window.confirm(`Are you sure you want to revoke ${delegate.fullName}'s access for ${auth.childName}?`)) {
          revokeAuth({ delegateId: delegate.id, childId: auth.childId });
        }
      },
    },
  ];

  return (
    <div className="max-w-8xl mx-auto px-6 py-6 font-body">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 mb-6 text-[0.875rem]">
        <span className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]" onClick={() => router.push("/dashboard")}>Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[#6B7280] cursor-pointer hover:text-[#0B1A2C]" onClick={() => router.push("/dashboard/delegates")}>Delegates</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#6B7280]" />
        <span className="text-[#0B1A2C] font-medium">{delegate.fullName}</span>
      </div>

      {/* HERO CARD */}
      <div className="bg-[#0B1A2C] rounded-2xl p-8 mb-6 relative z-20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white/10 ${getChildColor(delegate.id)}`}>
              {delegate.photoUrl ? (
                <img src={delegate.photoUrl} alt={delegate.fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                delegate.fullName[0]
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-[1.75rem] font-semibold text-white">
                  {delegate.fullName}
                </h1>
                {delegate.kycStatus === "APPROVED" && (
                  <div className="bg-[#0FA37F] text-white p-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-white/10 text-white/70 px-2.5 py-0.5 rounded-full text-[0.75rem] font-medium capitalize">
                  {delegate.relationship.toLowerCase().replace("_", " ")}
                </span>
                <span className="text-white/40 text-[0.75rem] flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {delegate.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {delegate.kycStatus === "PENDING" ? (
              <Button variant="primary" loading={reminding} onClick={() => sendReminder(delegate.id)}>
                Send Reminder
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                className="bg-white/10 text-white hover:bg-white/20 border-none"
                onClick={() => alert("Edit rules clicked")}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Rules
              </Button>
            )}
            <Dropdown
              align="right"
              trigger={
                <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors ">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              }
              items={profileMenuItems}
            />
          </div>
        </div>

        {/* Status indicator for KYC */}
        {delegate.kycStatus !== "APPROVED" && (
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
            {delegate.kycStatus === "PENDING" ? (
              <>
                <Clock className="w-5 h-5 text-[#EF9F27]" />
                <p className="text-[0.875rem] text-white/70">
                  Awaiting identity verification. You'll be notified once they're ready.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-[#D85A30]" />
                <p className="text-[0.875rem] text-white/70">
                  Identity verification failed. <button className="text-white underline font-medium">View reason</button>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* TABS */}
          <div className="flex gap-6 border-b border-black/[0.06]">
            <button
              onClick={() => setActiveTab("AUTHORIZATIONS")}
              className={`pb-4 text-[0.9rem] font-medium transition-all relative ${
                activeTab === "AUTHORIZATIONS" ? "text-[#0B1A2C]" : "text-[#6B7280] hover:text-[#0B1A2C]"
              }`}
            >
              Authorizations
              {activeTab === "AUTHORIZATIONS" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1A2C]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("HISTORY")}
              className={`pb-4 text-[0.9rem] font-medium transition-all relative ${
                activeTab === "HISTORY" ? "text-[#0B1A2C]" : "text-[#6B7280] hover:text-[#0B1A2C]"
              }`}
            >
              Pickup History
              {activeTab === "HISTORY" && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1A2C]" />
              )}
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "AUTHORIZATIONS" ? (
              delegate.authorizations.length > 0 ? (
                delegate.authorizations.map((auth) => (
                  <div key={auth.childId} className="bg-white border border-black/[0.06] rounded-2xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${getChildColor(auth.childId)}`}>
                        {auth.childName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0B1A2C]">{auth.childName}</p>
                        <p className="text-[0.78rem] text-[#6B7280]">
                          {auth.authType === "RECURRING" ? "Mon–Fri · 2:00pm – 5:00pm" : "One-time authorization"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold ${
                        auth.status === "ACTIVE" ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-[#FAEEDA] text-[#BA7517]"
                      }`}>
                        {auth.status}
                      </span>
                      <Dropdown
                        align="right"
                        trigger={
                          <button className="p-2 hover:bg-[#F2F0EB] rounded-lg text-[#6B7280] transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        }
                        items={getAuthMenuItems(auth)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#F9F9F8] border border-dashed border-black/10 rounded-2xl p-12 text-center">
                  <p className="text-[#6B7280] text-[0.875rem]">No children authorized yet.</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-[#4F46E5]">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Authorize a child
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-[#0FA37F]" />
                      </div>
                      <div className="flex-1 w-px bg-[#F2F0EB] my-1" />
                    </div>
                    <div className="pb-6">
                      <p className="text-[0.875rem] font-medium text-[#0B1A2C]">Successful Pickup</p>
                      <p className="text-[0.78rem] text-[#6B7280]">Picked up Zara Osei · {format(new Date(Date.now() - i * 86400000), "EEE, MMM d · h:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6">
            <h3 className="text-[0.7rem] font-bold text-[#6B7280] uppercase tracking-wider mb-4">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#6B7280]" />
                <p className="text-[0.875rem] text-[#0B1A2C]">{delegate.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#6B7280]" />
                <p className="text-[0.875rem] text-[#0B1A2C]">delegate@example.com</p>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#6B7280]" />
                <p className="text-[0.875rem] text-[#0B1A2C]">Lagos, Nigeria</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FAECE7] border border-[#D85A30]/20 rounded-2xl p-6">
            <h3 className="text-[0.7rem] font-bold text-[#D85A30] uppercase tracking-wider mb-2">Danger Zone</h3>
            <p className="text-[0.82rem] text-[#993C1D] mb-4">
              Removing this delegate will immediately revoke their access to pick up any of your children.
            </p>
            <Button variant="danger" fullWidth loading={removing} onClick={handleRemove}>
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Delegate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
