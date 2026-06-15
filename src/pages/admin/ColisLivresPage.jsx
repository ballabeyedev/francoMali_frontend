import useTitle from '../../hooks/useTitle';
import ColisReadOnlyList from './ColisReadOnlyList';
import { getColisLivres } from '../../api/colis.api';

export default function ColisLivresPage() {
  useTitle('Colis livrés');
  return <ColisReadOnlyList title="Colis livrés" fetchFn={getColisLivres} emptyMessage="Aucun colis livré" />;
}
