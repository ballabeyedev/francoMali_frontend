import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';
const E = ENDPOINTS.ADMINS;
export const getAdmins       = ()      => api.get(E.LISTE);
export const getNombreAdmins = ()      => api.get(E.NOMBRE);
export const rechercherAdmin = (q)     => api.get(E.RECHERCHE, { params: { q } });
export const ajouterAdmin    = (data)  => api.post(E.AJOUTER, data);
export const activerAdmin    = (id)    => api.put(E.ACTIVER(id));
export const desactiverAdmin = (id)    => api.put(E.DESACTIVER(id));
