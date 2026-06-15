import Badge from '../../components/common/Badge';

export const statutBadge = (statut) => {
  const s = (statut || '').toLowerCase();
  if (s.includes('livr')) return <Badge variant="success">Livré</Badge>;
  if (s.includes('récup') || s.includes('recup')) return <Badge variant="info">Récupéré</Badge>;
  if (s.includes('attente')) return <Badge variant="warning">En attente</Badge>;
  return <Badge>{statut || '—'}</Badge>;
};

export const typeLabel = (t) => {
  const v = (t || '').toLowerCase();
  if (v.includes('mar')) return 'Maritime';
  if (v.includes('aér') || v.includes('aer')) return 'Aérien';
  return t || '—';
};
