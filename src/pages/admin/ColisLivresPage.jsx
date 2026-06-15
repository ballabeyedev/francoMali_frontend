import ColisReadOnlyList from './ColisReadOnlyList';
import { getColisLivres } from '../../api/colis.api';

export default function ColisLivresPage() {
  return <ColisReadOnlyList title="Colis livrés" fetchFn={getColisLivres} emptyMessage="Aucun colis livré" />;
}
