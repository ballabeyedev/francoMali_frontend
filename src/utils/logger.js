const MAX_LOGS = 100;
const STORAGE_KEY = 'nanei_logs';

const COLORS = {
  info:  'color:#60a5fa;font-weight:600',
  warn:  'color:#f59e0b;font-weight:600',
  error: 'color:#ef4444;font-weight:600',
};

function now() {
  return new Date().toISOString();
}

function store(entry) {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    logs.unshift(entry);
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

  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
  const style = COLORS[level] || '';
  if (data !== undefined) {
    fn(`%c[${context}] ${message}`, style, data);
  } else {
    fn(`%c[${context}] ${message}`, style);
  }
}

export const logger = {
  info:  (context, message, data) => log('info',  context, message, data),
  warn:  (context, message, data) => log('warn',  context, message, data),
  error: (context, message, data) => log('error', context, message, data),

  getLogs: (n = 50) => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').slice(0, n);
    } catch { return []; }
  },

  clear: () => localStorage.removeItem(STORAGE_KEY),
};

if (typeof window !== 'undefined') {
  window.__nanei_logs = () => logger.getLogs();
  window.__nanei_clear = () => logger.clear();
}
