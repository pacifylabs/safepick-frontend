"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  FileWarning,
  Fingerprint,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import {
  useChangeProfilePassword,
  useCreateProfileIncidentReport,
  useCreateProfileSecondaryGuardian,
  useProfile,
  useProfileIncidentReports,
  useProfileSecondaryGuardians,
  useProfileSecuritySettings,
  useRevokeProfileSecondaryGuardian,
  useUpdateProfile,
  useUpdateProfileSecuritySettings,
} from "@/hooks/useProfile";
import { useChildren } from "@/hooks/useChildren";
import { getApiErrorMessage } from "@/services/apiError";
import { useAuthStore } from "@/stores/auth.store";
import { useToastStore } from "@/stores/toast.store";
import {
  ProfileIncidentReport,
  ProfileSecondaryGuardian,
  ProfileSecuritySettings,
} from "@/types/profile.types";

const emailField = z
  .union([z.literal(""), z.string().email("Enter a valid email address")])
  .optional();

const phoneField = z
  .string()
  .min(7, "Enter a valid phone number")
  .regex(/^\+?[0-9\s()-]{7,20}$/, "Enter a valid phone number");

const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: emailField,
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const guardianFormSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: phoneField,
  email: emailField,
  relationship: z.string().optional(),
});
type GuardianFormValues = z.infer<typeof guardianFormSchema>;

const incidentFormSchema = z.object({
  childId: z.string().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  occurredAt: z.string().optional(),
});
type IncidentFormValues = z.infer<typeof incidentFormSchema>;

type SectionId = "profile" | "security" | "guardians" | "incidents";

const sections: Array<{ id: SectionId; label: string; icon: typeof UserRound }> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "guardians", label: "Guardians", icon: Users },
  { id: "incidents", label: "Reports", icon: FileWarning },
];

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(name?: string) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function emptyToUndefined(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.78rem] font-medium text-[var(--text-primary)]">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
      <p className="mt-1 min-h-[1rem] text-[0.72rem] text-[#D85A30]">{error ?? ""}</p>
    </label>
  );
}

function inputClasses(hasError?: boolean) {
  return [
    "w-full rounded-xl border bg-[var(--bg-surface)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none transition-colors",
    "placeholder:text-[var(--text-secondary)]/60",
    hasError
      ? "border-[#D85A30] focus:border-[#D85A30] focus:ring-2 focus:ring-[#D85A30]/15"
      : "border-[var(--border-strong)] focus:border-[#0FA37F] focus:ring-2 focus:ring-[#0FA37F]/15",
  ].join(" ");
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  icon: Icon,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  icon: typeof Bell;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-4 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-muted)] text-[var(--text-primary)]">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#0FA37F]" : "bg-[var(--bg-muted)]",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        ].join(" ")}
        aria-pressed={checked}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-0.1" : "-translate-x-5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function StatusBadge({ value }: { value?: string }) {
  const normalized = value ?? "UNKNOWN";
  const color =
    normalized === "ACTIVE"
      ? "border-[#0FA37F]/20 bg-[#E1F5EE] text-[#0FA37F]"
      : normalized.includes("PENDING")
        ? "border-[#EF9F27]/25 bg-[#FAEEDA] text-[#BA7517]"
        : normalized.includes("REVOK") || normalized.includes("REMOVED")
          ? "border-[#D85A30]/25 bg-[#FAECE7] text-[#D85A30]"
          : "border-[var(--border)] bg-[var(--bg-muted)] text-[var(--text-secondary)]";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase ${color}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

function SeverityBadge({ severity }: { severity?: string }) {
  const value = severity ?? "LOW";
  const color =
    value === "CRITICAL" || value === "HIGH"
      ? "bg-[#FAECE7] text-[#D85A30]"
      : value === "MEDIUM"
        ? "bg-[#FAEEDA] text-[#BA7517]"
        : "bg-[#E1F5EE] text-[#0FA37F]";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase ${color}`}>
      {value}
    </span>
  );
}

export default function GuardianProfilePage() {
  const router = useRouter();
  const { addToast } = useToastStore();
  const clearSession = useAuthStore((state: any) => state.clearSession);
  const setSession = useAuthStore((state: any) => state.setSession);
  const accessToken = useAuthStore((state: any) => state.accessToken);
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [guardianFormOpen, setGuardianFormOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ProfileSecondaryGuardian | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileQuery = useProfile();
  const securityQuery = useProfileSecuritySettings();
  const guardiansQuery = useProfileSecondaryGuardians();
  const incidentsQuery = useProfileIncidentReports();
  const { data: children = [] } = useChildren();

  const updateProfile = useUpdateProfile();
  const updateSecurity = useUpdateProfileSecuritySettings();
  const changePassword = useChangeProfilePassword();
  const createGuardian = useCreateProfileSecondaryGuardian();
  const revokeGuardian = useRevokeProfileSecondaryGuardian();
  const createIncident = useCreateProfileIncidentReport();

  const profile = profileQuery.data;
  const securitySettings = securityQuery.data ?? profile?.securitySettings;
  const guardians = guardiansQuery.data ?? profile?.secondaryGuardians ?? [];
  const incidentReports = incidentsQuery.data ?? [];

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: "", email: "" },
  });
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const guardianForm = useForm<GuardianFormValues>({
    resolver: zodResolver(guardianFormSchema),
    defaultValues: { fullName: "", phone: "", email: "", relationship: "" },
  });
  const incidentForm = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: { title: "", description: "", severity: "LOW", childId: "", occurredAt: "" },
  });

  useEffect(() => {
    if (!profile) return;
    profileForm.reset({
      fullName: profile.fullName,
      email: profile.email ?? "",
    });
  }, [profile, profileForm]);

  const joinedDate = useMemo(() => formatDate(profile?.createdAt), [profile?.createdAt]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    try {
      const updated = await updateProfile.mutateAsync({
        fullName: values.fullName.trim(),
        email: emptyToUndefined(values.email),
      });
      if (accessToken) {
        setSession(updated as any, accessToken);
      }
      addToast({ message: "Profile updated successfully", variant: "success" });
    } catch (err) {
      addToast({ message: getApiErrorMessage(err, "Could not update profile"), variant: "danger" });
    }
  };

  const handleSecurityToggle = async (
    key: keyof Pick<
      ProfileSecuritySettings,
      | "biometricEnabled"
      | "pushNotificationsEnabled"
      | "pickupAlertsEnabled"
      | "incidentAlertsEnabled"
    >,
    value: boolean
  ) => {
    try {
      await updateSecurity.mutateAsync({ [key]: value });
      addToast({ message: "Security settings updated", variant: "success" });
    } catch (err) {
      addToast({ message: getApiErrorMessage(err, "Could not update security settings"), variant: "danger" });
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      addToast({
        message: "Password changed successfully. Please log in again.",
        variant: "success",
        duration: 5000,
      });
      clearSession();
      router.push("/login");
    } catch (err) {
      addToast({ message: getApiErrorMessage(err, "Could not change password"), variant: "danger" });
    }
  };

  const handleGuardianSubmit = async (values: GuardianFormValues) => {
    try {
      await createGuardian.mutateAsync({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: emptyToUndefined(values.email),
        relationship: emptyToUndefined(values.relationship),
      });
      guardianForm.reset();
      setGuardianFormOpen(false);
      addToast({ message: "Secondary guardian added", variant: "success" });
    } catch (err) {
      addToast({ message: getApiErrorMessage(err, "Could not add guardian"), variant: "danger" });
    }
  };

  const handleRevokeGuardian = async () => {
    if (!revokeTarget) return;

    try {
      await revokeGuardian.mutateAsync(revokeTarget.id);
      addToast({ message: "Secondary guardian revoked", variant: "success" });
      setRevokeTarget(null);
    } catch (err) {
      addToast({ message: getApiErrorMessage(err, "Could not revoke guardian"), variant: "danger" });
    }
  };

  const handleIncidentSubmit = async (values: IncidentFormValues) => {
    try {
      await createIncident.mutateAsync({
        title: values.title.trim(),
        description: values.description.trim(),
        severity: values.severity,
        childId: emptyToUndefined(values.childId),
        occurredAt: emptyToUndefined(values.occurredAt),
      });
      incidentForm.reset({ title: "", description: "", severity: "LOW", childId: "", occurredAt: "" });
      addToast({ message: "Incident report created", variant: "success" });
    } catch (err) {
      addToast({ message: getApiErrorMessage(err, "Could not create incident report"), variant: "danger" });
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="w-full px-4 py-6 sm:px-6">
        <div className="h-28 animate-pulse rounded-xl bg-[var(--bg-surface)]" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="hidden h-64 animate-pulse rounded-xl bg-[var(--bg-surface)] lg:block" />
          <div className="h-96 animate-pulse rounded-xl bg-[var(--bg-surface)]" />
        </div>
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="w-full px-4 py-6 sm:px-6">
        <section className="rounded-xl border border-[#D85A30]/20 bg-[#FAECE7] p-6">
          <AlertTriangle className="h-9 w-9 text-[#D85A30]" />
          <h1 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">
            Unable to load profile
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {getApiErrorMessage(profileQuery.error, "Please check your connection and try again.")}
          </p>
          <Button className="mt-5" onClick={() => profileQuery.refetch()}>
            Try again
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-5 pb-24 sm:px-6 sm:py-8 md:pb-8">
      <section className="border-b border-[var(--border)] pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1D9E75] text-lg font-semibold text-white sm:h-20 sm:w-20">
              {getInitials(profile.fullName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                  {profile.fullName}
                </h1>
                {profile.phoneVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#0FA37F]/20 bg-[#E1F5EE] px-2.5 py-1 text-xs font-semibold text-[#0FA37F]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Phone verified
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {profile.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {profile.role}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>
          </div>
          <Button className="text-gray" variant="outline" size="sm" onClick={() => profileQuery.refetch()}>
            Refresh
          </Button>
        </div>
      </section>

      <div className="sticky top-0 z-20 -mx-4 mt-4 overflow-x-auto border-b border-[var(--border)] bg-[var(--bg-surface-2)] px-4 py-2 lg:hidden">
        <div className="flex min-w-max gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                activeSection === section.id
                  ? "bg-[#0B1A2C] text-white"
                  : "bg-[var(--bg-surface)] text-[var(--text-secondary)]",
              ].join(" ")}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={[
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    active
                      ? "bg-[#EEF2FF] text-[#3730A3]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0">
          {activeSection === "profile" ? (
            <div className="space-y-8">
              <section>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Profile details
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Keep your guardian name and optional email up to date.
                  </p>
                </div>
                <form
                  onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <Field label="Full name" error={profileForm.formState.errors.fullName?.message}>
                    <input
                      {...profileForm.register("fullName")}
                      className={inputClasses(!!profileForm.formState.errors.fullName)}
                    />
                  </Field>
                  <Field label="Email address (optional)" error={profileForm.formState.errors.email?.message}>
                    <input
                      {...profileForm.register("email")}
                      type="email"
                      placeholder="you@example.com"
                      className={inputClasses(!!profileForm.formState.errors.email)}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Button type="submit" loading={updateProfile.isPending} disabled={updateProfile.isPending}>
                      Save profile
                    </Button>
                  </div>
                </form>
              </section>

              <section className="border-t border-[var(--border)] pt-6">
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Change password
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    You will be signed out after a successful password change.
                  </p>
                </div>
                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                  className="grid gap-4 sm:grid-cols-3"
                >
                  <Field label="Current password" error={passwordForm.formState.errors.currentPassword?.message}>
                    <div className="relative">
                      <input
                        {...passwordForm.register("currentPassword")}
                        type={showCurrentPassword ? "text" : "password"}
                        className={inputClasses(!!passwordForm.formState.errors.currentPassword)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="New password" error={passwordForm.formState.errors.newPassword?.message}>
                    <div className="relative">
                      <input
                        {...passwordForm.register("newPassword")}
                        type={showNewPassword ? "text" : "password"}
                        className={inputClasses(!!passwordForm.formState.errors.newPassword)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="Confirm password" error={passwordForm.formState.errors.confirmPassword?.message}>
                    <div className="relative">
                      <input
                        {...passwordForm.register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        className={inputClasses(!!passwordForm.formState.errors.confirmPassword)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <div className="sm:col-span-3">
                    <Button type="submit" loading={changePassword.isPending} disabled={changePassword.isPending}>
                      Change password
                    </Button>
                  </div>
                </form>
              </section>
            </div>
          ) : null}

          {activeSection === "security" ? (
            <section>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Security settings
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Manage account access and alert preferences.
                </p>
              </div>
              {securityQuery.isLoading && !securitySettings ? (
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading security settings...
                </div>
              ) : securitySettings ? (
                <div className="divide-y divide-[var(--border)]">
                  <Toggle
                    label="Biometric login"
                    description="Allow device biometrics for faster account access where supported."
                    icon={Fingerprint}
                    checked={securitySettings.biometricEnabled}
                    disabled={updateSecurity.isPending}
                    onChange={(value) => handleSecurityToggle("biometricEnabled", value)}
                  />
                  <Toggle
                    label="Push notifications"
                    description="Receive important SafePick notifications on this device."
                    icon={Smartphone}
                    checked={securitySettings.pushNotificationsEnabled}
                    disabled={updateSecurity.isPending}
                    onChange={(value) => handleSecurityToggle("pushNotificationsEnabled", value)}
                  />
                  <Toggle
                    label="Pickup alerts"
                    description="Notify you when pickup approvals or gate events need attention."
                    icon={Bell}
                    checked={securitySettings.pickupAlertsEnabled}
                    disabled={updateSecurity.isPending}
                    onChange={(value) => handleSecurityToggle("pickupAlertsEnabled", value)}
                  />
                  <Toggle
                    label="Incident alerts"
                    description="Notify you when a school or delegate reports an incident."
                    icon={AlertTriangle}
                    checked={securitySettings.incidentAlertsEnabled}
                    disabled={updateSecurity.isPending}
                    onChange={(value) => handleSecurityToggle("incidentAlertsEnabled", value)}
                  />
                </div>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">
                  Security settings are not available yet.
                </p>
              )}
            </section>
          ) : null}

          {activeSection === "guardians" ? (
            <section>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    Secondary guardians
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Trusted contacts who can help when you are unavailable.
                  </p>
                </div>
                <Button size="sm" onClick={() => setGuardianFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add guardian
                </Button>
              </div>

              {guardiansQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading guardians...
                </div>
              ) : guardians.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border-strong)] p-6 text-center">
                  <Users className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
                  <p className="mt-3 text-sm font-medium text-[var(--text-primary)]">
                    No secondary guardians yet
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Add someone trusted to receive escalation alerts.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {guardians.map((guardian) => (
                    <GuardianRow
                      key={guardian.id}
                      guardian={guardian}
                      onRevoke={() => setRevokeTarget(guardian)}
                    />
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {activeSection === "incidents" ? (
            <section className="space-y-8">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Create incident report
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Record safety issues or unusual pickup events.
                </p>
              </div>

              <form
                onSubmit={incidentForm.handleSubmit(handleIncidentSubmit)}
                className="grid gap-4 sm:grid-cols-2"
              >
                <Field label="Title" error={incidentForm.formState.errors.title?.message}>
                  <input
                    {...incidentForm.register("title")}
                    placeholder="Late pickup handoff"
                    className={inputClasses(!!incidentForm.formState.errors.title)}
                  />
                </Field>
                <Field label="Severity" error={incidentForm.formState.errors.severity?.message}>
                  <select
                    {...incidentForm.register("severity")}
                    className={inputClasses(!!incidentForm.formState.errors.severity)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </Field>
                <Field label="Child (optional)" error={incidentForm.formState.errors.childId?.message}>
                  <select
                    {...incidentForm.register("childId")}
                    className={inputClasses(!!incidentForm.formState.errors.childId)}
                  >
                    <option value="">No child selected</option>
                    {children.map((child: any) => (
                      <option key={child.id} value={child.id}>
                        {child.fullName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Occurred date (optional)" error={incidentForm.formState.errors.occurredAt?.message}>
                  <input
                    {...incidentForm.register("occurredAt")}
                    type="datetime-local"
                    className={inputClasses(!!incidentForm.formState.errors.occurredAt)}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description" error={incidentForm.formState.errors.description?.message}>
                    <textarea
                      {...incidentForm.register("description")}
                      rows={4}
                      placeholder="Describe what happened and who was involved."
                      className={inputClasses(!!incidentForm.formState.errors.description)}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" loading={createIncident.isPending} disabled={createIncident.isPending}>
                    Create report
                  </Button>
                </div>
              </form>

              <div className="border-t border-[var(--border)] pt-6">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Recent reports
                </h3>
                {incidentsQuery.isLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading reports...
                  </div>
                ) : incidentReports.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--text-secondary)]">
                    No incident reports have been created yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {incidentReports.map((report) => (
                      <IncidentRow key={report.id} report={report} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {guardianFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl bg-[var(--bg-surface)] p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Add secondary guardian
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Email and relationship are optional.
                </p>
              </div>
              <button
                onClick={() => setGuardianFormOpen(false)}
                className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={guardianForm.handleSubmit(handleGuardianSubmit)} className="grid gap-3">
              <Field label="Full name" error={guardianForm.formState.errors.fullName?.message}>
                <input
                  {...guardianForm.register("fullName")}
                  className={inputClasses(!!guardianForm.formState.errors.fullName)}
                />
              </Field>
              <Field label="Phone number" error={guardianForm.formState.errors.phone?.message}>
                <input
                  {...guardianForm.register("phone")}
                  type="tel"
                  placeholder="+234 801 234 5678"
                  className={inputClasses(!!guardianForm.formState.errors.phone)}
                />
              </Field>
              <Field label="Email address (optional)" error={guardianForm.formState.errors.email?.message}>
                <input
                  {...guardianForm.register("email")}
                  type="email"
                  className={inputClasses(!!guardianForm.formState.errors.email)}
                />
              </Field>
              <Field label="Relationship (optional)" error={guardianForm.formState.errors.relationship?.message}>
                <input
                  {...guardianForm.register("relationship")}
                  placeholder="Aunt, uncle, family friend"
                  className={inputClasses(!!guardianForm.formState.errors.relationship)}
                />
              </Field>
              <div className="mt-1 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="ghost" onClick={() => setGuardianFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={createGuardian.isPending} disabled={createGuardian.isPending}>
                  Add guardian
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {revokeTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-[var(--bg-surface)] p-5 shadow-2xl sm:rounded-2xl">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Revoke guardian access?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {revokeTarget.fullName} will no longer be able to act as a secondary guardian.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setRevokeTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                loading={revokeGuardian.isPending}
                disabled={revokeGuardian.isPending}
                onClick={handleRevokeGuardian}
              >
                Revoke access
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GuardianRow({
  guardian,
  onRevoke,
}: {
  guardian: ProfileSecondaryGuardian;
  onRevoke: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--text-primary)]">{guardian.fullName}</p>
            <StatusBadge value={guardian.status} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              {guardian.phone}
            </span>
            {guardian.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {guardian.email}
              </span>
            ) : null}
            {guardian.relationship ? <span>{guardian.relationship}</span> : null}
          </div>
        </div>
        <button
          onClick={onRevoke}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-[#D85A30] hover:bg-[#FAECE7] sm:self-center"
        >
          <Trash2 className="h-4 w-4" />
          Revoke
        </button>
      </div>
    </div>
  );
}

function IncidentRow({ report }: { report: ProfileIncidentReport }) {
  const childName = report.childName ?? report.child?.fullName;
  const date = report.occurredAt ?? report.createdAt;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--text-primary)]">{report.title}</p>
            <SeverityBadge severity={report.severity} />
            {report.status ? <StatusBadge value={report.status} /> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">
            {childName ? <span>{childName}</span> : <span>No child linked</span>}
            <span>{formatDate(date)}</span>
          </div>
        </div>
        <FileWarning className="hidden h-5 w-5 text-[var(--text-secondary)] sm:block" />
      </div>
    </div>
  );
}
