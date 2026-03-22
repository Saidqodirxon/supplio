import { create } from "zustand";
import type { User } from "../types";
import type { DashboardLanguage } from "../i18n/translations";

interface AuthState {
  user: User | null;
  token: string | null;
  language: DashboardLanguage;
  activeCompanyId: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setLanguage: (lang: DashboardLanguage) => void;
  setActiveCompany: (companyId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const storedToken = localStorage.getItem("token");
  const storedLang =
    (localStorage.getItem("language") as DashboardLanguage) || "uz";
  const storedCompanyId =
    localStorage.getItem("activeCompanyId") || storedUser?.companyId || null;

  return {
    user: storedUser,
    token: storedToken,
    language: storedLang,
    activeCompanyId: storedCompanyId,
    setAuth: (user, token) => {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("activeCompanyId", user.companyId);
      set({ user, token, activeCompanyId: user.companyId });
    },
    updateUser: (userData) => {
      set((state) => {
        if (!state.user) return state;
        const updatedUser = { ...state.user, ...userData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { user: updatedUser };
      });
    },
    setLanguage: (language) => {
      localStorage.setItem("language", language);
      set({ language });
    },
    setActiveCompany: (companyId) => {
      localStorage.setItem("activeCompanyId", companyId);
      set({ activeCompanyId: companyId });
      // In production, we might refresh window or re-fetch all data
      window.location.reload();
    },
    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("activeCompanyId");
      set({ user: null, token: null, activeCompanyId: null });
    },
  };
});
