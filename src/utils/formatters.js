export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatPrice = (amount, currency = '€') => {
  if (amount == null) return '—';
  return `${Number(amount).toFixed(2)} ${currency}`;
};

export const formatWeight = (kg) => {
  if (kg == null) return '—';
  return `${kg} kg`;
};

export const truncate = (str, n = 40) => {
  if (!str) return '';
  return str.length > n ? str.slice(0, n) + '…' : str;
};
