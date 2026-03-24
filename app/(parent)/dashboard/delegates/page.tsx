"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateInvitePayloadSchema, CreateInvitePayload } from "@/types/delegates.types";
import {
  UserPlus,
  Search,
  MoreHorizontal,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Share2,
  X,
  Baby,
  ShieldCheck,
  Building,
  Users,
  Phone,
  User,
  MessageCircle,
  Facebook,
  Instagram,
  AlertCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { useDelegates, useCreateInvite, usePendingInvites, useRevokeInvite } from "@/hooks/useDelegates";
import { useChildren } from "@/hooks/useChildren";
import { useDelegatesStore } from "@/stores/delegates.store";
import { DelegateCard } from "@/components/delegates/DelegateCard";
import { InviteStatusBanner } from "@/components/delegates/InviteStatusBanner";
import { Button } from "@/components/ui/Button";

export default function DelegatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChildId = searchParams.get("child");

  const { data: delegates = [], isLoading: loadingDelegates } = useDelegates();
  const { data: children = [] } = useChildren();
  const { data: pendingInvites = [] } = usePendingInvites();
  const { mutate: createInvite, isPending: creatingInvite } = useCreateInvite();
  const { mutate: revokeInvite } = useRevokeInvite();

  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [searchQuery, setSearchQuery] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);

  const {
    view,
    setView,
    inviteStep,
    setInviteStep,
    inviteConfig,
    updateInviteConfig,
    createdInvite,
    setCreatedInvite,
    resetInvite,
    dismissedBanners,
    dismissBanner,
  } = useDelegatesStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset: resetForm,
  } = useForm<CreateInvitePayload>({
    resolver: zodResolver(CreateInvitePayloadSchema),
    defaultValues: {
      childIds: inviteConfig.childIds || [],
      relationship: (inviteConfig.relationship as any) || "",
      specificRelationship: inviteConfig.specificRelationship || "",
      delegateName: inviteConfig.delegateName || "",
      delegatePhone: inviteConfig.delegatePhone || "",
      delegateGender: (inviteConfig.delegateGender as any) || "",
      kycLevel: inviteConfig.kycLevel || "STANDARD",
      expiresInHours: inviteConfig.expiresInHours || 48,
    },
  });

  const selectedRelationship = watch("relationship");
  const selectedChildIds = watch("childIds");
  const selectedGender = watch("delegateGender");
  const selectedKycLevel = watch("kycLevel");

  useEffect(() => {
    if (initialChildId && !selectedChildIds.includes(initialChildId)) {
      setValue("childIds", [...selectedChildIds, initialChildId]);
      setView("INVITE");
    }
  }, [initialChildId, setValue, selectedChildIds, setView]);

  const onInviteSubmit = (data: CreateInvitePayload) => {
    createInvite(data, {
      onSuccess: (response) => {
        setCreatedInvite(response);
        setInviteStep("SHARE");
      },
    });
  };

  const onInviteError = (errors: any) => {
    if (Object.keys(errors).length > 0) {
      setShowErrorModal(true);
    }
  };

  const [qrCodeData, setQrCodeData] = useState<string>("");
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (initialChildId && !inviteConfig.childIds.includes(initialChildId)) {
      updateInviteConfig({ childIds: [initialChildId] });
      setView("INVITE");
    }
  }, [initialChildId]);

  useEffect(() => {
    if (createdInvite?.inviteUrl && qrRef.current) {
      QRCode.toCanvas(qrRef.current, createdInvite.inviteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#0B1A2C",
          light: "#FFFFFF",
        },
      });
    }
  }, [createdInvite]);

  const handleCreateInvite = () => {
    createInvite(
      {
        childIds: inviteConfig.childIds,
        relationship: inviteConfig.relationship as any,
        specificRelationship: inviteConfig.specificRelationship,
        delegateName: inviteConfig.delegateName,
        delegatePhone: inviteConfig.delegatePhone,
        delegateGender: inviteConfig.delegateGender as any,
        kycLevel: inviteConfig.kycLevel,
        expiresInHours: inviteConfig.expiresInHours,
      },
      {
        onSuccess: (data) => {
          setCreatedInvite(data);
          setInviteStep("SHARE");
        },
      }
    );
  };

  const handleCopyLink = () => {
    if (createdInvite?.inviteUrl) {
      navigator.clipboard.writeText(createdInvite.inviteUrl);
      alert("Invite link copied!");
    }
  };

  const handleShare = () => {
    if (navigator.share && createdInvite?.inviteUrl) {
      navigator.share({
        title: "SafePick Delegate Invite",
        text: `You've been invited to be a pickup delegate on SafePick. Use this link to join:`,
        url: createdInvite.inviteUrl,
      });
    } else {
      handleCopyLink();
    }
  };

  const getChildColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = ["bg-[#1D9E75]", "bg-[#185FA5]", "bg-[#BA7517]", "bg-[#993556]"];
    return colors[Math.abs(hash) % 4];
  };

  if (loadingDelegates) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-10 w-48 bg-[var(--bg-surface)] animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[var(--bg-surface)] animate-pulse rounded-2xl border border-[var(--border)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-8xl font-body">
      <AnimatePresence mode="wait">
        {view === "LIST" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[1.5rem] font-semibold text-[var(--text-primary)]">Delegates</h1>
                <p className="text-[0.875rem] text-[var(--text-secondary)]">Manage who is authorized to pick up your children.</p>
              </div>
              <div className="flex items-center gap-3">
                
                <Button
                  variant="primary"
                  onClick={() => {
                    resetInvite();
                    setView("INVITE");
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Delegate
                </Button>
              </div>
            </div>

            {/* Banners for pending actions */}
            <div className="space-y-3">
              {delegates
                .filter(d => d.kycStatus === "APPROVED" && !dismissedBanners.includes(`banner-${d.id}`))
                .map(d => (
                  <InviteStatusBanner
                    key={d.id}
                    type="KYC_APPROVED"
                    delegateName={d.fullName}
                    onAction={() => router.push(`/dashboard/delegates/${d.id}`)}
                    onDismiss={() => dismissBanner(`banner-${d.id}`)}
                  />
                ))}
            </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[0.875rem]">
                  <span
                    className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)]"
                    onClick={() => router.push("/dashboard")}
                  >
                    Home
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-primary)] font-medium">Delegates</span>
                </div>
                <div className="flex bg-[var(--bg-muted)] rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setViewMode("GRID")}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      viewMode === "GRID" ? "bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("LIST")}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      viewMode === "LIST" ? "bg-[var(--bg-surface)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
                      
            {delegates.length === 0 && pendingInvites.length === 0 ? (
              <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-[#4F46E5]" />
                </div>
                <h3 className="font-body text-[1.1rem] font-semibold text-[var(--text-primary)] mb-2">No delegates yet</h3>
                <p className="font-body text-[0.875rem] text-[var(--text-secondary)] max-w-[280px] leading-relaxed mb-6">
                  Authorize trusted drivers, nannies, or relatives to pick up your children safely.
                </p>
                <Button variant="primary" onClick={() => setView("INVITE")}>
                  Invite your first delegate
                </Button>
              </div>
            ) : viewMode === "GRID" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {delegates.map((delegate) => (
                  <DelegateCard
                    key={delegate.id}
                    delegate={delegate}
                    onClick={() => router.push(`/dashboard/delegates/${delegate.id}`)}
                    onRevoke={() => revokeInvite(delegate.id)}
                  />
                ))}
                
                {/* Pending Invite Placeholders */}
                {pendingInvites.map((invite) => (
                  <div 
                    key={invite.id} 
                    className="bg-[var(--bg-surface-2)] border border-dashed border-[var(--border-strong)] rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)]">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-body text-[0.9rem] font-semibold text-[var(--text-secondary)]">Pending Invite</p>
                          <span className="bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-full px-2 py-0.5 text-[0.7rem] font-medium capitalize">
                            {invite.relationship.toLowerCase()}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => revokeInvite(invite.id)}
                        className="text-[var(--text-secondary)] hover:text-[#D85A30] p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-1.5 mb-4">
                      {invite.childIds.map((id: string) => {
                        const child = children.find(c => c.id === id);
                        return child ? (
                          <div key={id} className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] text-white ${getChildColor(id)}`}>
                            {child.fullName[0]}
                          </div>
                        ) : null;
                      })}
                    </div>
                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="text-[0.7rem] text-[var(--text-secondary)]">Expires in 48h</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(invite.inviteUrl);
                          alert("Link copied!");
                        }}
                        className="text-[0.75rem] text-[#4F46E5] font-medium hover:underline"
                      >
                        Copy link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
                <div className="bg-[var(--bg-surface-2)] border-b border-[var(--border)] px-6 py-3 grid grid-cols-[1.5fr_1fr_1.5fr_1fr_auto] gap-4 items-center">
                  {["Name", "Relationship", "Status", "Authorized For", ""].map((h) => (
                    <span key={h} className="font-body text-[0.75rem] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      {h}
                    </span>
                  ))}
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {delegates.map((delegate) => (
                    <div
                      key={delegate.id}
                      onClick={() => router.push(`/dashboard/delegates/${delegate.id}`)}
                      className="px-6 py-4 grid grid-cols-[1.5fr_1fr_1.5fr_1fr_auto] gap-4 items-center cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[0.8rem] font-bold ${getChildColor(delegate.id)}`}>
                          {delegate.fullName[0]}
                        </div>
                        <p className="text-[0.875rem] font-semibold text-[var(--text-primary)] truncate">{delegate.fullName}</p>
                      </div>
                      <p className="text-[0.82rem] text-[var(--text-secondary)] capitalize">
                        {delegate.relationship.toLowerCase().replace("_", " ")}
                      </p>
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold ${
                          delegate.kycStatus === "APPROVED" ? "bg-[#E1F5EE] text-[#0F6E56]" : "bg-[#FAEEDA] text-[#BA7517]"
                        }`}>
                          {delegate.kycStatus === "APPROVED" ? "Verified" : "Pending"}
                        </span>
                      </div>
                      <div className="flex -space-x-2">
                        {delegate.authorizations.slice(0, 3).map((auth) => (
                          <div 
                            key={auth.childId} 
                            className={`w-7 h-7 rounded-full border-2 border-[var(--bg-surface)] flex items-center justify-center text-[0.6rem] text-white font-bold ${getChildColor(auth.childId)}`}
                            title={auth.childName}
                          >
                            {auth.childName[0]}
                          </div>
                        ))}
                        {delegate.authorizations.length > 3 && (
                          <div className="w-7 h-7 rounded-full bg-[var(--bg-muted)] border-2 border-[var(--bg-surface)] flex items-center justify-center text-[0.6rem] text-[var(--text-secondary)] font-bold">
                            +{delegate.authorizations.length - 3}
                          </div>
                        )}
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="invite"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-[560px] mx-auto"
          >
            <button
              onClick={() => setView("LIST")}
              className="flex items-center text-[0.875rem] text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            >
              <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
              Back to delegates
            </button>

            <div className="bg-[var(--bg-surface)] rounded-2xl p-8 border border-[var(--border)] shadow-sm">
              <AnimatePresence mode="wait">
                {inviteStep === "CONFIGURE" ? (
                  <motion.div
                    key="config"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#0FA37F] mb-1">NEW INVITE</p>
                      <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-1">Invite a delegate</h2>
                      <p className="text-[0.875rem] text-[var(--text-secondary)]">They'll need to verify their identity before they can pick up your children.</p>
                    </div>

                    <form onSubmit={handleSubmit(onInviteSubmit, onInviteError)} className="space-y-4">
                      {/* Children Selection */}
                      <div className="space-y-2">
                        <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Who can they pick up?</label>
                        <Controller
                          name="childIds"
                          control={control}
                          render={({ field }) => (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                {children.map((child) => (
                                  <button
                                    key={child.id}
                                    type="button"
                                    onClick={() => {
                                      const newIds = field.value.includes(child.id)
                                        ? field.value.filter((id) => id !== child.id)
                                        : [...field.value, child.id];
                                      field.onChange(newIds);
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                      field.value.includes(child.id)
                                        ? "border-[#0FA37F] bg-[#E1F5EE]/30"
                                        : "border-[var(--border)] bg-[var(--bg-surface-2)] hover:border-[var(--border-strong)]"
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.7rem] text-white ${getChildColor(child.id)}`}>
                                      {child.fullName[0]}
                                    </div>
                                    <span className="text-[0.82rem] font-medium text-[var(--text-primary)] truncate">{child.fullName.split(" ")[0]}</span>
                                  </button>
                                ))}
                              </div>
                              {errors.childIds && (
                                <p className="text-[0.7rem] text-coral mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.childIds.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>

                      {/* Relationship */}
                      <div className="space-y-2">
                        <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Relationship</label>
                        <Controller
                          name="relationship"
                          control={control}
                          render={({ field }) => (
                            <>
                              <select
                                {...field}
                                className={`w-full bg-[var(--bg-surface-2)] border rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] ${
                                  errors.relationship ? "border-coral" : "border-[var(--border)]"
                                }`}
                              >
                                <option value="">Select relationship</option>
                                <option value="DRIVER">Driver</option>
                                <option value="NANNY">Nanny</option>
                                <option value="RELATIVE">Relative</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="OTHER">Other</option>
                              </select>
                              {errors.relationship && (
                                <p className="text-[0.7rem] text-coral mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {errors.relationship.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>

                      {/* Specific Relationship for RELATIVE */}
                      <AnimatePresence>
                        {selectedRelationship === "RELATIVE" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 overflow-hidden"
                          >
                            <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">What's their relationship? (e.g. Brother, Sister, Uncle...)</label>
                            <Controller
                              name="specificRelationship"
                              control={control}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="e.g. Brother"
                                  className="w-full bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F]"
                                />
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Delegate Info */}
                      <div className="pt-2 space-y-4">
                        <div className="space-y-2">
                          <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Delegate Name</label>
                          <Controller
                            name="delegateName"
                            control={control}
                            render={({ field }) => (
                              <>
                                <div className="relative">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                  <input
                                    {...field}
                                    type="text"
                                    placeholder="Enter full name"
                                    className={`w-full bg-[var(--bg-surface-2)] border rounded-xl pl-11 pr-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] ${
                                      errors.delegateName ? "border-coral" : "border-[var(--border)]"
                                    }`}
                                  />
                                </div>
                                {errors.delegateName && (
                                  <p className="text-[0.7rem] text-coral mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.delegateName.message}
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Phone Number</label>
                          <Controller
                            name="delegatePhone"
                            control={control}
                            render={({ field }) => (
                              <>
                                <div className="relative">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                                  <input
                                    {...field}
                                    type="tel"
                                    placeholder="+234..."
                                    className={`w-full bg-[var(--bg-surface-2)] border rounded-xl pl-11 pr-4 py-3 text-[0.875rem] outline-none focus:border-[#0FA37F] ${
                                      errors.delegatePhone ? "border-coral" : "border-[var(--border)]"
                                    }`}
                                  />
                                </div>
                                {errors.delegatePhone && (
                                  <p className="text-[0.7rem] text-coral mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.delegatePhone.message}
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Gender</label>
                          <Controller
                            name="delegateGender"
                            control={control}
                            render={({ field }) => (
                              <>
                                <div className="grid grid-cols-3 gap-2">
                                  {["MALE", "FEMALE", "OTHER"].map((gender) => (
                                    <button
                                      key={gender}
                                      type="button"
                                      onClick={() => field.onChange(gender)}
                                      className={`py-2.5 rounded-xl border text-[0.82rem] font-medium transition-all ${
                                        field.value === gender
                                          ? "border-[#0FA37F] bg-[#E1F5EE] text-[var(--text-primary)]"
                                          : "border-[var(--border)] bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                                      }`}
                                    >
                                      {gender.charAt(0) + gender.slice(1).toLowerCase()}
                                    </button>
                                  ))}
                                </div>
                                {errors.delegateGender && (
                                  <p className="text-[0.7rem] text-coral mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.delegateGender.message}
                                  </p>
                                )}
                              </>
                            )}
                          />
                        </div>
                      </div>

                      {/* KYC Level */}
                      <div className="space-y-2">
                        <label className="text-[0.78rem] font-medium text-[var(--text-primary)]/70">Verification Level</label>
                        <Controller
                          name="kycLevel"
                          control={control}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <button
                                type="button"
                                onClick={() => field.onChange("STANDARD")}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                                  field.value === "STANDARD"
                                    ? "border-[#0FA37F] bg-[#E1F5EE]/30"
                                    : "border-[var(--border)] bg-[var(--bg-surface-2)]"
                                }`}
                              >
                                <ShieldCheck className={`w-5 h-5 mt-0.5 ${field.value === "STANDARD" ? "text-[#0FA37F]" : "text-[var(--text-secondary)]"}`} />
                                <div>
                                  <p className="text-[0.875rem] font-semibold text-[var(--text-primary)]">Standard</p>
                                  <p className="text-[0.72rem] text-[var(--text-secondary)]">Photo ID + Phone verification</p>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => field.onChange("ENHANCED")}
                                className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                                  field.value === "ENHANCED"
                                    ? "border-[#0FA37F] bg-[#E1F5EE]/30"
                                    : "border-[var(--border)] bg-[var(--bg-surface-2)]"
                                }`}
                              >
                                <ShieldCheck className={`w-5 h-5 mt-0.5 ${field.value === "ENHANCED" ? "text-[#0FA37F]" : "text-[var(--text-secondary)]"}`} />
                                <div>
                                  <p className="text-[0.875rem] font-semibold text-[var(--text-primary)]">Enhanced</p>
                                  <p className="text-[0.72rem] text-[var(--text-secondary)]">Background check + Address verification</p>
                                </div>
                              </button>
                            </div>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        className="h-12 rounded-xl mt-4"
                        loading={creatingInvite}
                      >
                        Generate Invite Link
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="share"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-[#0FA37F]" />
                    </div>
                    <h2 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-2">Invite link ready!</h2>
                    <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8 max-w-[320px]">
                      Share this link with your delegate. It will expire in {inviteConfig.expiresInHours} hours.
                    </p>

                    <div className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-2xl p-6 mb-8 w-full flex flex-col items-center">
                      <canvas ref={qrRef} className="mb-4" />
                      <div className="flex items-center gap-2 w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3 py-2.5">
                        <p className="flex-1 text-[0.75rem] text-[var(--text-secondary)] truncate text-left">
                          {createdInvite?.inviteUrl}
                        </p>
                        <button 
                          onClick={handleCopyLink}
                          className="p-1.5 hover:bg-[var(--bg-muted)] rounded-lg text-[#4F46E5] transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                      <Button variant="ghost" fullWidth onClick={() => setView("LIST")}>
                        Done
                      </Button>
                      <Button variant="primary" fullWidth onClick={handleShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
                      </Button>
                    </div>

                    <div className="mt-6 w-full pt-6 border-t border-[var(--border)]">
                      <p className="text-[0.75rem] font-medium text-[var(--text-secondary)] mb-4 uppercase tracking-wider">Share via Social Media</p>
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => {
                            const url = `https://wa.me/?text=${encodeURIComponent(`Hi! Please use this link to join SafePick as a delegate: ${createdInvite?.inviteUrl}`)}`;
                            window.open(url, "_blank");
                          }}
                          className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => {
                            const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(createdInvite?.inviteUrl || "")}`;
                            window.open(url, "_blank");
                          }}
                          className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors"
                          title="Share on Facebook"
                        >
                          <Facebook className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => {
                            // Instagram doesn't have a direct share URL for web, usually copy link is the way
                            navigator.clipboard.writeText(createdInvite?.inviteUrl || "");
                            alert("Link copied for Instagram sharing!");
                          }}
                          className="w-12 h-12 rounded-full bg-[#E4405F]/10 flex items-center justify-center text-[#E4405F] hover:bg-[#E4405F]/20 transition-colors"
                          title="Share on Instagram"
                        >
                          <Instagram className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Error Modal */}
      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[var(--bg-surface)] rounded-2xl p-8 border border-[var(--border)] shadow-xl max-w-[400px] w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-coral" />
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[var(--text-primary)] mb-2">Missing Information</h3>
              <p className="text-[0.875rem] text-[var(--text-secondary)] mb-8 leading-relaxed">
                Please ensure all required fields are filled correctly before generating the invite link.
              </p>
              
              <div className="space-y-3">
                {Object.keys(errors).length > 0 && (
                  <div className="text-left bg-coral/5 rounded-xl p-4 mb-6 border border-coral/10">
                    <p className="text-[0.75rem] font-bold text-coral uppercase tracking-wider mb-2">Errors found:</p>
                    <ul className="space-y-1.5">
                      {Object.entries(errors).map(([field, error]: [string, any]) => (
                        <li key={field} className="text-[0.8rem] text-[var(--text-secondary)] flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
                          <span>{error.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <Button variant="primary" fullWidth onClick={() => setShowErrorModal(false)}>
                  Got it, I'll fix it
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
