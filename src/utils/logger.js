/**
 * Logger production — stocke les 100 derniers logs dans localStorage.
 * Accessible dans le navigateur via : Ctrl+Shift+L (panneau visuel)
 * ou console : JSON.parse(localStorage.getItem('nanei_logs') || '[]')
 */

const MAX_LOGS = 100;
const STORAGE_KEY = 'nanei_logs';
const isDev = import.meta.env.DEV;

function now() {
  return new Date().toISOString();
}

function store(entry) {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    logs.unshift(entry); // plus récent en premier
    if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch { /* quota plein — ignorer */ }
}

function log(level, context, message, data) {
  const entry = {
    ts: now(),
    level,
    context,
    message,
    ...(data !== undefined ? { data } : {}),
  };
  store(entry);
  if (isDev) {
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    fn(`[${level.toUpperCase()}][${context}]`, message, data ?? '');
  }
}

export const logger = {
  info:  (context, message, data) => log('info',  context, message, data),
  warn:  (context, message, data) => log('warn',  context, message, data),
  error: (context, message, data) => log('error', context, message, data),

  /** Retourne les N derniers logs */
  getLogs: (n = 50) => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').slice(0, n);
    } catch { return []; }
  },

  /** Efface tous les logs */
  clear: () => localStorage.removeItem(STORAGE_KEY),
};

// Exposer sur window pour debug console rapide
if (typeof window !== 'undefined') {
  window.__nanei_logs = () => logger.getLogs();
  window.__nanei_clear = () => logger.clear();
}
