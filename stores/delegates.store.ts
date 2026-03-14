import { create } from "zustand";
import { InviteResponse } from "../types/delegates.types";

interface InviteConfig {
  relationship: string;
  specificRelationship?: string;
  delegateName: string;
  delegatePhone: string;
  delegateGender: "MALE" | "FEMALE" | "OTHER" | "";
  childIds: string[];
  kycLevel: "STANDARD" | "ENHANCED";
  expiresInHours: number;
}

interface DelegatesUIState {
  view: "LIST" | "INVITE";
  inviteStep: "CONFIGURE" | "SHARE";
  inviteConfig: InviteConfig;
  createdInvite: InviteResponse | null;
  dismissedBanners: string[];
}

interface DelegatesUIActions {
  setView: (view: "LIST" | "INVITE") => void;
  setInviteStep: (step: "CONFIGURE" | "SHARE") => void;
  updateInviteConfig: (config: Partial<InviteConfig>) => void;
  setCreatedInvite: (invite: InviteResponse | null) => void;
  dismissBanner: (id: string) => void;
  resetInvite: () => void;
}

const initialInviteConfig: InviteConfig = {
  relationship: "",
  specificRelationship: "",
  delegateName: "",
  delegatePhone: "",
  delegateGender: "",
  childIds: [],
  kycLevel: "STANDARD",
  expiresInHours: 48,
};

export const useDelegatesStore = create<DelegatesUIState & DelegatesUIActions>()((set) => ({
  view: "LIST",
  inviteStep: "CONFIGURE",
  inviteConfig: initialInviteConfig,
  createdInvite: null,
  dismissedBanners: [],

  setView: (view) => set({ view }),
  setInviteStep: (step) => set({ inviteStep: step }),
  updateInviteConfig: (config) =>
    set((state) => ({
      inviteConfig: { ...state.inviteConfig, ...config },
    })),
  setCreatedInvite: (invite) => set({ createdInvite: invite }),
  dismissBanner: (id) =>
    set((state) => ({
      dismissedBanners: [...state.dismissedBanners, id],
    })),
  resetInvite: () =>
    set({
      inviteStep: "CONFIGURE",
      inviteConfig: initialInviteConfig,
      createdInvite: null,
    }),
}));
