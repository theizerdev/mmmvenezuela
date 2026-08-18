import { cleanParams } from '@/lib/utils';

export const index = (params?: Record<string, any>) => {
    const query = cleanParams(params || {});
    const queryString = new URLSearchParams(query).toString();
    return `/admin/pastores${queryString ? `?${queryString}` : ''}`;
};

export const create = () => `/admin/pastores/create`;

export const store = () => `/admin/pastores`;

export const edit = (id: number | string) => `/admin/pastores/${id}/edit`;

export const update = (id: number | string) => `/admin/pastores/${id}`;

export const toggleStatus = (id: number | string) => `/admin/pastores/${id}/toggle-status`;

export const bulkDestroy = () => `/admin/pastores/bulk-destroy`;

export default {
    index,
    create,
    store,
    edit,
    update,
    toggleStatus,
    bulkDestroy,
};
