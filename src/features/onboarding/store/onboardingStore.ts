// Local UI state for the onboarding flow: the role the user picked before sign-up.
import { create } from "zustand";
import type { UserRole } from "@shared/types/database.types";

type OnboardingStore = {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  selectedRole: null,
  setSelectedRole: (role) => set({ selectedRole: role }),
}));
