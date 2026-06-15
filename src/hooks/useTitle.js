import { useEffect } from 'react';

export default function useTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — Nanei Admin` : 'Nanei Admin';
    return () => { document.title = prev; };
  }, [title]);
}
