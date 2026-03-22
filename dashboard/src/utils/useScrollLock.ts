import { useEffect } from 'react';

/**
 * Locks the main scroll area when a modal is open.
 * Prevents background scroll and avoids layout shift.
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    const main = document.getElementById('main-scroll');
    if (!main) return;

    if (isLocked) {
      main.classList.add('scroll-locked');
    } else {
      main.classList.remove('scroll-locked');
    }

    return () => {
      main.classList.remove('scroll-locked');
    };
  }, [isLocked]);
}
