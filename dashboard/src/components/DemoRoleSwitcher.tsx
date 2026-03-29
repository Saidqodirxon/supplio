import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Shuffle } from "lucide-react";
import clsx from "clsx";

const DEMO_ROLES = [
  { value: "OWNER", label: "Owner / Distributor" },
  { value: "MANAGER", label: "Manager" },
  { value: "SALES", label: "Sales" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "CUSTOM", label: "Custom Role" },
];

export default function DemoRoleSwitcher() {
  const { demoSelectedRole, setDemoSelectedRole, getEffectiveRole } =
    useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const effectiveRole = getEffectiveRole();

  const currentLabel =
    DEMO_ROLES.find((r) => r.value === effectiveRole)?.label || "Select Role";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all"
      >
        <Shuffle className="w-4 h-4" />
        {currentLabel}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Demo Role Switcher
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Test different roles. Changes apply instantly.
            </p>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {DEMO_ROLES.map((role) => (
              <button
                key={role.value}
                onClick={() => {
                  setDemoSelectedRole(
                    demoSelectedRole === role.value ? null : role.value
                  );
                  setIsOpen(false);
                }}
                className={clsx(
                  "w-full px-4 py-3 text-left text-sm font-semibold transition-all border-l-4 flex items-center justify-between",
                  effectiveRole === role.value
                    ? "bg-blue-50 dark:bg-blue-500/10 border-l-blue-600 dark:border-l-blue-400 text-blue-700 dark:text-blue-400"
                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-transparent text-slate-700 dark:text-slate-300"
                )}
              >
                <span>{role.label}</span>
                {effectiveRole === role.value && (
                  <span className="text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded-md">
                    ACTIVE
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
            <button
              onClick={() => {
                setDemoSelectedRole(null);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
