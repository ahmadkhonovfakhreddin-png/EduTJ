import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} · EduTJ`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
