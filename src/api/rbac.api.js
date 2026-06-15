import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

export const getAdmins           = ()           => api.get(ENDPOINTS.RBAC.ADMINS);
export const creerAdmin          = (data)       => api.post(ENDPOINTS.RBAC.ADMINS, data);
export const supprimerAdmin      = (id)         => api.delete(ENDPOINTS.RBAC.ADMIN_BY_ID(id));
export const getAdminPermissions = (id)         => api.get(ENDPOINTS.RBAC.ADMIN_PERMISSIONS(id));
export const updateAdminPerms    = (id, p)      => api.put(ENDPOINTS.RBAC.ADMIN_PERMISSIONS(id), { permissions: p });
export const getMenus            = ()           => api.get(ENDPOINTS.RBAC.MENUS);
export const creerMenu           = (data)       => api.post(ENDPOINTS.RBAC.MENUS, data);
export const updateMenu          = (id, data)   => api.put(ENDPOINTS.RBAC.MENU_BY_ID(id), data);
export const supprimerMenu       = (id)         => api.delete(ENDPOINTS.RBAC.MENU_BY_ID(id));
