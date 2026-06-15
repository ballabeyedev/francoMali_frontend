import { useState, useEffect, useCallback, useRef } from 'react';

export default function usePageData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => { fetchFnRef.current = fetchFn; });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFnRef.current();
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.userMessage ?? 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}
