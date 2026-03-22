import { create } from "zustand";
import api from "../services/api";

interface FeatureState {
  flags: Record<string, boolean>;
  isLoading: boolean;
  fetchFlags: () => Promise<void>;
  isEnabled: (key: string) => boolean;
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  flags: {},
  isLoading: false,
  fetchFlags: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get("/company/features");
      set({ flags: res.data });
    } catch (err) {
      console.error("Failed to fetch feature flags:", err);
    } finally {
      set({ isLoading: false });
    }
  },
  isEnabled: (key: string) => {
    return !!get().flags[key];
  },
}));
