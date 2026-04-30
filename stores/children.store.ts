import { create } from "zustand";

interface ChildrenUIState {
  selectedChildId: string | null;
  registrationStep: "DETAILS" | "REVIEW";
  registrationDraft: {
    fullName?: string;
    dateOfBirth?: string;
    grade?: string;
    photoUrl?: string;
  };
}

interface ChildrenUIActions {
  setSelectedChild: (id: string | null) => void;
  setRegistrationStep: (step: "DETAILS" | "REVIEW") => void;
  updateDraft: (data: Partial<ChildrenUIState["registrationDraft"]>) => void;
  clearDraft: () => void;
}

export const useChildrenStore = create((set: any) => ({
  selectedChildId: null,
  registrationStep: "DETAILS",
  registrationDraft: {},
  setSelectedChild: (id: string | null) => set({ selectedChildId: id }),
  setRegistrationStep: (step: "DETAILS" | "REVIEW") => set({ registrationStep: step }),
  updateDraft: (data: Partial<ChildrenUIState["registrationDraft"]>) =>
    set((state: any) => ({
      registrationDraft: { ...state.registrationDraft, ...data },
    })),
  clearDraft: () => set({ registrationDraft: {}, registrationStep: "DETAILS" }),
}));
