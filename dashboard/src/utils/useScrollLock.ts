import { useEffect } from 'react';

/**
 * Locks the main scroll area when a modal is open.
 * Prevents background scroll and avoids layout shift.
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    const main = document.getElementById('main-scroll');
    const body = document.body;
    const html = document.documentElement;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    if (isLocked) {
      main?.classList.add('scroll-locked');
      body.style.overflow = 'hidden';
      body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
      html.style.overflow = 'hidden';
    } else {
      main?.classList.remove('scroll-locked');
      body.style.overflow = '';
      body.style.paddingRight = '';
      html.style.overflow = '';
    }

    return () => {
      main?.classList.remove('scroll-locked');
      body.style.overflow = '';
      body.style.paddingRight = '';
      html.style.overflow = '';
    };
  }, [isLocked]);
}
