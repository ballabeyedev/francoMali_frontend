import { useEffect } from 'react';
const TIMEOUT = 30 * 60 * 1000;
export default function useInactivityLogout(logout) {
  useEffect(() => {
    let timer = setTimeout(logout, TIMEOUT);
    const reset = () => { clearTimeout(timer); timer = setTimeout(logout, TIMEOUT); };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => { clearTimeout(timer); events.forEach((e) => window.removeEventListener(e, reset)); };
  }, [logout]);
}
