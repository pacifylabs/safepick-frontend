import { create } from "zustand";

interface ChildrenUIState {
  selectedChildId: string | null;
  registrationStep: "DETAILS" | "GUARDIAN" | "REVIEW";
  registrationDraft: {
    fullName?: string;
    dateOfBirth?: string;
    grade?: string;
    photoUrl?: string;
    guardianPhone?: string;
    guardianName?: string;
  };
}

interface ChildrenUIActions {
  setSelectedChild: (id: string | null) => void;
  setRegistrationStep: (step: "DETAILS" | "GUARDIAN" | "REVIEW") => void;
  updateDraft: (data: Partial<ChildrenUIState["registrationDraft"]>) => void;
  clearDraft: () => void;
}

export const useChildrenStore = create<ChildrenUIState & ChildrenUIActions>((set) => ({
  selectedChildId: null,
  registrationStep: "DETAILS",
  registrationDraft: {},
  setSelectedChild: (id: string | null) => set({ selectedChildId: id }),
  setRegistrationStep: (step: "DETAILS" | "GUARDIAN" | "REVIEW") => set({ registrationStep: step }),
  updateDraft: (data: Partial<ChildrenUIState["registrationDraft"]>) =>
    set((state) => ({
      registrationDraft: { ...state.registrationDraft, ...data },
    })),
  clearDraft: () => set({ registrationDraft: {}, registrationStep: "DETAILS" }),
}));
