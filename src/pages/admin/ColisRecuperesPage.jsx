import ColisReadOnlyList from './ColisReadOnlyList';
import { getColisRecuperes } from '../../api/colis.api';

export default function ColisRecuperesPage() {
  return <ColisReadOnlyList title="Colis récupérés" fetchFn={getColisRecuperes} emptyMessage="Aucun colis récupéré" />;
}
