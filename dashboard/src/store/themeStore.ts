import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  fontSize: number;
  scale: number;
  isCollapsed: boolean;
  toggleTheme: () => void;
  setFontSize: (size: number) => void;
  setScale: (scale: number) => void;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      fontSize: 16,
      scale: 1,
      isCollapsed: false,
      toggleTheme: () =>
        set((state) => {
          const next = !state.isDark;
          if (next) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { isDark: next };
        }),
      setFontSize: (size: number) => {
        set({ fontSize: size });
        document.documentElement.style.setProperty('--content-font-size', `${size}px`);
      },
      setScale: (scale: number) => {
        set({ scale });
        document.documentElement.style.setProperty('--app-scale', scale.toString());
      },
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    }),
    {
      name: "supplio-theme-storage",
    }
  )
);

// Helper to initialize theme on load
export const initTheme = () => {
  const storeRaw = localStorage.getItem("supplio-theme-storage");
  const store = storeRaw ? JSON.parse(storeRaw) : { state: { isDark: false, fontSize: 16, scale: 1 } };
  const { isDark, fontSize, scale } = store.state || {};

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  document.documentElement.style.setProperty('--content-font-size', `${fontSize || 16}px`);
  document.documentElement.style.setProperty('--app-scale', (scale || 1).toString());
};
