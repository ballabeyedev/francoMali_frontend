import { useState, useMemo } from 'react';

export default function useSort(data, defaultKey = null) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState('asc');

  const toggle = (key) => {
    if (key === sortKey) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    if (!sortKey || !Array.isArray(data)) return data;
    return [...data].sort((a, b) => {
      const va = a?.[sortKey] ?? '';
      const vb = b?.[sortKey] ?? '';
      const cmp = String(va).localeCompare(String(vb), 'fr', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  // SortIcon is a render function, not a component — call as sortIcon(colKey), not <SortIcon />
  const sortIcon = (colKey) => {
    const active = sortKey === colKey;
    const arrow = active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕';
    return arrow;
  };

  return { sorted, toggle, sortKey, sortDir, sortIcon };
}
