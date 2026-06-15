import { useState, useEffect, useCallback } from 'react';
import { logger } from '../../utils/logger';

const LEVELS = { error: '#ef4444', warn: '#f59e0b', info: '#3b82f6' };

export default function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  const refresh = useCallback(() => setLogs(logger.getLogs(100)), []);

  // Ctrl+Shift+L pour ouvrir/fermer
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        setOpen((o) => !o);
        refresh();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [refresh]);

  useEffect(() => { if (open) refresh(); }, [open, refresh]);

  if (!open) return (
    <button
      onClick={() => { setOpen(true); refresh(); }}
      style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 99999,
        background: '#1f2937', color: '#f9fafb', border: 'none',
        borderRadius: 10, padding: '6px 12px', fontSize: 12,
        fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)',
        opacity: 0.7,
      }}
      title="Ctrl+Shift+L"
    >
      🪲 Logs
    </button>
  );

  const displayed = filter === 'all' ? logs : logs.filter((l) => l.level === filter);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0f172a', borderRadius: 16, width: '100%', maxWidth: 900,
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <span style={{ color: '#f9fafb', fontWeight: 700, fontSize: 14 }}>🪲 Nanei Debug Logs</span>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {['all', 'error', 'warn', 'info'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                background: filter === f ? '#3b82f6' : 'rgba(255,255,255,.08)',
                color: filter === f ? '#fff' : 'rgba(255,255,255,.5)',
              }}>{f}</button>
            ))}
          </div>
          <button onClick={refresh} style={{ background: 'rgba(255,255,255,.08)', border: 'none', borderRadius: 6, color: '#9ca3af', padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>↻ Refresh</button>
          <button onClick={() => { logger.clear(); refresh(); }} style={{ background: 'rgba(239,68,68,.15)', border: 'none', borderRadius: 6, color: '#ef4444', padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>🗑 Clear</button>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Logs */}
        <div style={{ overflow: 'auto', flex: 1, padding: '8px 0' }}>
          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#4b5563', fontSize: 13 }}>Aucun log</div>
          ) : displayed.map((log, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '160px 50px 120px 1fr',
              gap: 8, padding: '5px 16px', fontSize: 11, fontFamily: 'monospace',
              borderBottom: '1px solid rgba(255,255,255,.04)',
            }}>
              <span style={{ color: '#4b5563' }}>{log.ts?.slice(11, 23)}</span>
              <span style={{ color: LEVELS[log.level] || '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{log.level}</span>
              <span style={{ color: '#60a5fa' }}>{log.context}</span>
              <div>
                <span style={{ color: '#e5e7eb' }}>{log.message}</span>
                {log.data !== undefined && (
                  <pre style={{ margin: '2px 0 0', color: '#9ca3af', fontSize: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : String(log.data)}
                  </pre>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '8px 16px', color: '#4b5563', fontSize: 10, borderTop: '1px solid rgba(255,255,255,.05)' }}>
          {displayed.length} log(s) — Ctrl+Shift+L pour fermer — console: window.__nanei_logs()
        </div>
      </div>
    </div>
  );
}
