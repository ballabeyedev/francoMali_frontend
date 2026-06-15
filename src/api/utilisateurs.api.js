import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
const E = ENDPOINTS.UTILISATEURS;
export const getUtilisateurs       = ()      => api.get(E.LISTE);
export const getNombreUtilisateurs = ()      => api.get(E.NOMBRE);
export const rechercherUtilisateur = (q)     => api.get(E.RECHERCHE, { params: { q } });
export const activerUtilisateur    = (id)    => api.patch(E.ACTIVER(id));
export const desactiverUtilisateur = (id)    => api.patch(E.DESACTIVER(id));
