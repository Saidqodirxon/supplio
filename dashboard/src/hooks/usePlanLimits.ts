import { useState } from 'react';

/**
 * When the backend returns status 402/403 with { limitReached: true, resource: '...' },
 * call triggerUpgrade(resource) to show the upgrade modal.
 */
export function usePlanLimits() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>();

  const triggerUpgrade = (reason?: string) => {
    setUpgradeReason(reason);
    setShowUpgrade(true);
  };

  /** Call after an API error. Returns true if it was a limit error (so caller can skip toast). */
  const handleApiError = (err: unknown): boolean => {
    const e = err as { response?: { status?: number; data?: { limitReached?: boolean; resource?: string } } };
    if (e?.response?.status === 402 || e?.response?.data?.limitReached) {
      triggerUpgrade(e?.response?.data?.resource);
      return true;
    }
    return false;
  };

  return { showUpgrade, setShowUpgrade, upgradeReason, triggerUpgrade, handleApiError };
}
