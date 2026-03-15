"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Pencil,
  MoreHorizontal,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  Pause,
  Play,
  Trash2,
  PauseCircle,
  ShieldOff,
  AlertTriangle,
  X,
  FileText,
  Lock,
} from "lucide-react";
import {
  useDelegate,
  useRemoveDelegate,
  useSendReminder,
  useRequestKYCAccess,
} from "@/hooks/useDelegates";
import { useAuthorizations } from "@/hooks/useAuthorizations";
import { Button } from "@/components/ui/Button";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { EditRulesModal } from "@/components/delegates/EditRulesModal";
import { useToastStore } from "@/stores/toast.store";
import { SectionLabel } from "@/components/ui/SectionLabel";

export default function DelegateProfilePage() {
  const { delegateId } = useParams();
  const router = useRouter();
  const { addToast } = useToastStore();
  
  const { data: delegate, isLoading, isError } = useDelegate(delegateId as string);
  const { mutate: removeDelegate, isPending: removing } = useRemoveDelegate();
  const { mutate: sendReminder, isPending: reminding } = useSendReminder();
  const { mutate: requestKYCAccess, isPending: requestingAccess } = useRequestKYCAccess();
  
  const { updateAuthorization, deleteAuthorization, revokeAllAccess } = useAuthorizations();

  const [activeTab, setActiveTab] = useState<"AUTHORIZATIONS" | "HISTORY">("AUTHORIZATIONS");
  const [selectedAuth, setSelectedAuth] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Confirmation Bottom Sheet State
  const [confirmSheet, setConfirmSheet] = useState<{
    type: "SUSPEND" | "REACTIVATE" | "REVOKE_SINGLE" | "REVOKE_ALL";
    auth?: any;
    isOpen: boolean;
  }>({ type: "SUSPEND", isOpen: false });
  
  const [revokeConfirmInput, setRevokeConfirmInput] = useState("");

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

  const handleEditRules = (auth: any) => {
    setSelectedAuth(auth);
    setIsEditModalOpen(true);
  };

  const handleSendReminder = () => {
    sendReminder(delegate.id, {
      onSuccess: () => {
        addToast({
          message: `Reminder sent to ${delegate.fullName}`,
          variant: "success",
          icon: <CheckCircle className="w-5 h-5 text-[#0FA37F]" />,
        });
      },
      onError: () => {
        addToast({
          message: `Could not send reminder. Please try again.`,
          variant: "danger",
          icon: <AlertCircle className="w-5 h-5 text-[#D85A30]" />,
        });
      },
    });
  };

  const handleRequestKYCAccess = () => {
    requestKYCAccess(delegate.id, {
      onSuccess: () => {
        addToast({
          message: "KYC access requested. Admin will review your request.",
          variant: "success",
          icon: <CheckCircle className="w-5 h-5 text-[#0FA37F]" />,
        });
      },
      onError: () => {
        addToast({
          message: "Could not request KYC access. Try again.",
          variant: "danger",
          icon: <AlertCircle className="w-5 h-5 text-[#D85A30]" />,
        });
      },
    });
  };

  const openConfirmSheet = (type: "SUSPEND" | "REACTIVATE" | "REVOKE_SINGLE" | "REVOKE_ALL", auth?: any) => {
    setConfirmSheet({ type, auth, isOpen: true });
    setRevokeConfirmInput("");
  };

  const handleConfirmAction = async () => {
    const { type, auth } = confirmSheet;
    
    try {
      if (type === "SUSPEND" || type === "REACTIVATE") {
        const newStatus = type === "SUSPEND" ? "SUSPENDED" : "ACTIVE";
        await updateAuthorization.mutateAsync({
          authId: auth.id,
          data: { status: newStatus },
        });
        
        addToast({
          message: `${type === "SUSPEND" ? "Access suspended" : "Access reactivated"} for ${auth.childName}`,
          variant: type === "SUSPEND" ? "warning" : "success",
          icon: type === "SUSPEND" ? <PauseCircle className="w-5 h-5 text-[#EF9F27]" /> : <CheckCircle className="w-5 h-5 text-[#0FA37F]" />,
        });
      } else if (type === "REVOKE_SINGLE") {
        await deleteAuthorization.mutateAsync(auth.id);
        addToast({
          message: `Access revoked for ${auth.childName}`,
          variant: "danger",
          icon: <ShieldOff className="w-5 h-5 text-[#D85A30]" />,
        });
      } else if (type === "REVOKE_ALL") {
        await revokeAllAccess.mutateAsync(delegate.id);
        addToast({
          message: `All access revoked for ${delegate.fullName}`,
          variant: "danger",
          icon: <AlertTriangle className="w-5 h-5 text-[#D85A30]" />,
        });
        setTimeout(() => router.push("/dashboard/delegates"), 1500);
      }
      
      setConfirmSheet({ ...confirmSheet, isOpen: false });
    } catch (err) {
      addToast({
        message: "Could not update access. Try again.",
        variant: "danger",
      });
    }
  };

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
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0FA37F]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>
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
                  <div className="bg-[#0FA37F] text-white p-1 rounded-full shadow-sm">
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
              <Button variant="primary" loading={reminding} onClick={handleSendReminder}>
                Send Reminder
              </Button>
            ) : (
              delegate.authorizations.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="bg-white/10 text-white hover:bg-white/20 border-none px-6"
                  onClick={() => handleEditRules(delegate.authorizations[0])}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Rules
                </Button>
              )
            )}
            <Dropdown
              align="right"
              trigger={
                <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              }
              items={[
                { label: "Edit profile", icon: Pencil, onClick: () => {} },
                { label: "Revoke all access", icon: Trash2, variant: "danger", onClick: () => openConfirmSheet("REVOKE_ALL") }
              ]}
            />
          </div>
        </div>

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
                <AlertCircle className="w-5 h-5 text-[#D85A30]" />
                <p className="text-[0.875rem] text-white/70">
                  Identity verification failed. <button className="text-white underline font-medium ml-1">View reason</button>
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-6 border-b border-black/[0.06]">
            {(["AUTHORIZATIONS", "HISTORY"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[0.9rem] font-medium transition-all relative ${
                  activeTab === tab ? "text-[#0B1A2C]" : "text-[#6B7280] hover:text-[#0B1A2C]"
                }`}
              >
                {tab === "AUTHORIZATIONS" ? "Authorizations" : "Pickup History"}
                {activeTab === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0B1A2C]" />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4 min-h-[200px]">
            {activeTab === "AUTHORIZATIONS" ? (
              <AnimatePresence mode="popLayout">
                {delegate.authorizations.length > 0 ? (
                  delegate.authorizations.map((auth) => (
                    <motion.div 
                      key={auth.childId} 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, marginBottom: 0, overflow: "hidden" }}
                      transition={{ duration: 0.4 }}
                      className="bg-white border border-black/[0.06] rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${getChildColor(auth.childId)}`}>
                            {auth.childName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B1A2C]">{auth.childName}</p>
                            <p className="text-[0.78rem] text-[#6B7280]">
                              {auth.authType === "RECURRING" 
                                ? `${auth.allowedDays?.join(", ")} · ${auth.allowedTimeStart} – ${auth.allowedTimeEnd}` 
                                : auth.authType === "ONE_TIME" 
                                ? `One-time: ${auth.validFrom}`
                                : `Range: ${auth.validFrom} – ${auth.validUntil}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => openConfirmSheet(auth.status === "ACTIVE" ? "SUSPEND" : "REACTIVATE", auth)}
                            disabled={updateAuthorization.isPending && selectedAuth?.id === auth.id}
                            className={`w-12 h-6 rounded-full transition-all relative ${
                              auth.status === "ACTIVE" ? "bg-[#0FA37F]" : "bg-[#E8E6E1]"
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm flex items-center justify-center ${
                              auth.status === "ACTIVE" ? "right-1" : "left-1"
                            }`}>
                              {updateAuthorization.isPending && selectedAuth?.id === auth.id && (
                                <div className="w-2.5 h-2.5 border-2 border-[#0B1A2C]/10 border-t-[#0B1A2C] rounded-full animate-spin" />
                              )}
                            </div>
                          </button>
                          <Dropdown
                            align="right"
                            trigger={
                              <button className="p-2 hover:bg-[#F2F0EB] rounded-lg text-[#6B7280] transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            }
                            items={[
                              { label: "Edit rules", icon: Pencil, onClick: () => handleEditRules(auth) },
                              { label: "Revoke access", icon: Trash2, variant: "danger", onClick: () => openConfirmSheet("REVOKE_SINGLE", auth) }
                            ]}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-[#F2F0EB]">
                        <span className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full ${
                          auth.status === "ACTIVE" ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-[#FAEEDA] text-[#BA7517]"
                        }`}>
                          {auth.status}
                        </span>
                        <button 
                          onClick={() => openConfirmSheet("REVOKE_SINGLE", auth)}
                          className="text-[#D85A30] text-[0.75rem] font-medium hover:underline flex items-center gap-1"
                        >
                          Revoke
                          {deleteAuthorization.isPending && selectedAuth?.id === auth.id && (
                            <div className="w-3 h-3 border-2 border-[#D85A30]/10 border-t-[#D85A30] rounded-full animate-spin" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                    <p className="font-body text-[0.875rem] text-[#6B7280]">No active authorizations for this delegate.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-[#0FA37F]" />
                      </div>
                      <div className="flex-1 w-px bg-[#F2F0EB] my-1" />
                    </div>
                    <div className="pb-6">
                      <p className="text-[0.875rem] font-medium text-[#0B1A2C]">Successful Pickup</p>
                      <p className="text-[0.78rem] text-[#6B7280]">Picked up Zara Osei · Mon, Mar {15-i} · 3:45 PM</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* KYC FILE ACCESS */}
          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[0.7rem] font-bold text-[#6B7280] uppercase tracking-wider mb-4">KYC Documents</h3>
            
            {delegate.kycAccessStatus === "GRANTED" ? (
              <div className="space-y-4">
                <p className="text-[0.82rem] text-[#6B7280] mb-4">
                  Access to KYC documents has been granted by the admin.
                </p>
                <Button variant="outline" fullWidth className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  View KYC File
                </Button>
              </div>
            ) : delegate.kycAccessStatus === "REQUESTED" ? (
              <div className="space-y-4">
                <div className="bg-[#FAEEDA] rounded-xl p-3 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#EF9F27] mt-0.5" />
                  <p className="text-[0.78rem] text-[#BA7517] leading-relaxed">
                    Your request to view KYC documents is pending admin approval.
                  </p>
                </div>
                <Button variant="outline" fullWidth disabled className="opacity-50">
                  Request Pending
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[0.82rem] text-[#6B7280] mb-4 leading-relaxed">
                  To view the identity documents submitted by this delegate, you must first request access.
                </p>
                <Button 
                  variant="outline" 
                  fullWidth 
                  className="flex items-center gap-2 border-[#0FA37F] text-[#0FA37F] hover:bg-[#E1F5EE]"
                  onClick={handleRequestKYCAccess}
                  loading={requestingAccess}
                >
                  <Lock className="w-4 h-4" />
                  Request KYC Access
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white border border-black/[0.06] rounded-2xl p-6 shadow-sm">
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
            <Button variant="danger" fullWidth onClick={() => openConfirmSheet("REVOKE_ALL")}>
              <Trash2 className="w-4 h-4 mr-2" />
              Revoke all access
            </Button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION BOTTOM SHEET */}
      <AnimatePresence>
        {confirmSheet.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmSheet({ ...confirmSheet, isOpen: false })}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] p-6 z-[61] shadow-2xl md:max-w-[480px] md:mx-auto md:bottom-6 md:rounded-[28px]"
            >
              <div className="w-12 h-1.5 bg-[#F2F0EB] rounded-full mx-auto mb-6 md:hidden" />
              
              <div className="text-center">
                {confirmSheet.type === "SUSPEND" ? (
                  <div className="w-12 h-12 rounded-2xl bg-[#FAEEDA] flex items-center justify-center mx-auto mb-4">
                    <PauseCircle className="w-6 h-6 text-[#EF9F27]" />
                  </div>
                ) : confirmSheet.type === "REACTIVATE" ? (
                  <div className="w-12 h-12 rounded-2xl bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-[#0FA37F]" />
                  </div>
                ) : confirmSheet.type === "REVOKE_SINGLE" ? (
                  <div className="w-12 h-12 rounded-2xl bg-[#FAECE7] flex items-center justify-center mx-auto mb-4">
                    <ShieldOff className="w-6 h-6 text-[#D85A30]" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#FAECE7] flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-[#D85A30]" />
                  </div>
                )}

                <h2 className="font-display text-[1.25rem] font-semibold text-[#0B1A2C] mb-2">
                  {confirmSheet.type === "SUSPEND" ? "Suspend access?" : 
                   confirmSheet.type === "REACTIVATE" ? "Reactivate access?" :
                   confirmSheet.type === "REVOKE_SINGLE" ? `Revoke access for ${confirmSheet.auth?.childName}?` :
                   "Revoke all access?"}
                </h2>
                <p className="font-body text-[0.875rem] text-[#6B7280] mb-6">
                  {confirmSheet.type === "SUSPEND" ? `${delegate.fullName} will not be able to pick up ${confirmSheet.auth?.childName} until you re-enable this.` :
                   confirmSheet.type === "REACTIVATE" ? `${delegate.fullName} will be able to pick up ${confirmSheet.auth?.childName} again immediately.` :
                   confirmSheet.type === "REVOKE_SINGLE" ? `${delegate.fullName} will no longer be able to pick up ${confirmSheet.auth?.childName}. This takes effect immediately.` :
                   `${delegate.fullName} will lose access to ALL children immediately. This takes effect right now.`}
                </p>

                {(confirmSheet.type === "REVOKE_SINGLE" || confirmSheet.type === "REVOKE_ALL") && (
                  <div className="bg-[#FAECE7] rounded-xl p-3 mb-6">
                    <p className="font-body text-[0.78rem] text-[#993C1D]">
                      {confirmSheet.type === "REVOKE_SINGLE" 
                        ? "You can re-authorize them later if needed."
                        : `This removes ${delegate.authorizations.length} authorization(s). You can re-authorize each child individually later.`}
                    </p>
                  </div>
                )}

                {confirmSheet.type === "REVOKE_ALL" && (
                  <div className="text-left mb-6">
                    <label className="block font-body text-[0.78rem] text-[#0B1A2C]/70 mb-2">
                      Type REVOKE to confirm
                    </label>
                    <input
                      type="text"
                      placeholder="REVOKE"
                      value={revokeConfirmInput}
                      onChange={(e) => setRevokeConfirmInput(e.target.value)}
                      className="w-full px-4 py-3 bg-[#F2F0EB] border border-black/10 rounded-xl font-body text-[0.875rem] outline-none focus:border-[#D85A30]/30 transition-all"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    variant={confirmSheet.type === "REVOKE_SINGLE" || confirmSheet.type === "REVOKE_ALL" ? "danger" : "primary"}
                    fullWidth
                    disabled={confirmSheet.type === "REVOKE_ALL" && revokeConfirmInput !== "REVOKE"}
                    loading={updateAuthorization.isPending || deleteAuthorization.isPending || removing}
                    onClick={handleConfirmAction}
                  >
                    {confirmSheet.type === "SUSPEND" ? "Yes, suspend access" :
                     confirmSheet.type === "REACTIVATE" ? "Yes, reactivate" :
                     confirmSheet.type === "REVOKE_SINGLE" ? "Yes, revoke access" :
                     "Revoke all access"}
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setConfirmSheet({ ...confirmSheet, isOpen: false })}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {selectedAuth && (
        <EditRulesModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAuth(null);
          }}
          authorization={selectedAuth}
          delegateName={delegate.fullName}
          childName={selectedAuth.childName}
        />
      )}
    </div>
  );
}
