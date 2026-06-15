import useTitle from '../../hooks/useTitle';
import ColisReadOnlyList from './ColisReadOnlyList';
import { getColisRecuperes } from '../../api/colis.api';

export default function ColisRecuperesPage() {
  useTitle('Colis récupérés');
  return <ColisReadOnlyList title="Colis récupérés" fetchFn={getColisRecuperes} emptyMessage="Aucun colis récupéré" />;
}
