import { cleanParams } from '@/lib/utils';

export const index = (params?: Record<string, any>) => {
    const query = cleanParams(params || {});
    const queryString = new URLSearchParams(query).toString();
    return `/admin/parroquias${queryString ? `?${queryString}` : ''}`;
};

export const store = () => `/admin/parroquias`;

export const update = (id: number | string) => `/admin/parroquias/${id}`;

export const toggleStatus = (id: number | string) => `/admin/parroquias/${id}/toggle-status`;

export const bulkDestroy = () => `/admin/parroquias/bulk-destroy`;

export default {
    index,
    store,
    update,
    toggleStatus,
    bulkDestroy,
};
