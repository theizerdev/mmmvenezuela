import { cleanParams } from '@/lib/utils';

export const index = (params?: Record<string, any>) => {
    const query = cleanParams(params || {});
    const queryString = new URLSearchParams(query).toString();
    return `/admin/municipios${queryString ? `?${queryString}` : ''}`;
};

export const store = () => `/admin/municipios`;

export const update = (id: number | string) => `/admin/municipios/${id}`;

export const toggleStatus = (id: number | string) => `/admin/municipios/${id}/toggle-status`;

export const bulkDestroy = () => `/admin/municipios/bulk-destroy`;

export default {
    index,
    store,
    update,
    toggleStatus,
    bulkDestroy,
};
