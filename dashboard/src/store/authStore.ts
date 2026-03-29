import { create } from "zustand";
import type { User } from "../types";
import type { DashboardLanguage } from "../i18n/translations";

interface AuthState {
  user: User | null;
  token: string | null;
  language: DashboardLanguage;
  activeCompanyId: string | null;
  demoSelectedRole: string | null; // For demo mode role switching
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  setLanguage: (lang: DashboardLanguage) => void;
  setActiveCompany: (companyId: string) => void;
  setDemoSelectedRole: (role: string | null) => void; // Demo role switcher
  getEffectiveRole: () => string | null; // Get actual role (with demo override)
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const storedToken = localStorage.getItem("token");
  const storedLang =
    (localStorage.getItem("language") as DashboardLanguage) || "uz";
  const storedCompanyId =
    localStorage.getItem("activeCompanyId") || storedUser?.companyId || null;
  const storedDemoRole = localStorage.getItem("demoSelectedRole");

  return {
    user: storedUser,
    token: storedToken,
    language: storedLang,
    activeCompanyId: storedCompanyId,
    demoSelectedRole: storedDemoRole,
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
      const prev = localStorage.getItem("activeCompanyId");
      localStorage.setItem("activeCompanyId", companyId);
      set({ activeCompanyId: companyId });
      if (prev && prev !== companyId) {
        window.location.reload();
      }
    },
    setDemoSelectedRole: (role: string | null) => {
      if (role) {
        localStorage.setItem("demoSelectedRole", role);
      } else {
        localStorage.removeItem("demoSelectedRole");
      }
      set({ demoSelectedRole: role });
    },
    getEffectiveRole: () => {
      const state = get();
      return state.demoSelectedRole || state.user?.roleType || null;
    },
    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("activeCompanyId");
      localStorage.removeItem("demoSelectedRole");
      set({
        user: null,
        token: null,
        activeCompanyId: null,
        demoSelectedRole: null,
      });
    },
  };
});
