import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'

/**
 * @see \App\Http\Controllers\Admin\EstadoController::index
 * @route '/admin/estados'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get", "head"],
    url: '/admin/estados',
} satisfies RouteDefinition<["get", "head"]>

index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
 * @see \App\Http\Controllers\Admin\EstadoController::store
 * @route '/admin/estados'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/estados',
} satisfies RouteDefinition<["post"]>

store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
 * @see \App\Http\Controllers\Admin\EstadoController::update
 * @route '/admin/estados/{estado}'
 */
export const update = (args: { estado: number | { id: number } } | [estado: number | { id: number }] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/estados/{estado}',
} satisfies RouteDefinition<["put"]>

update.url = (args: { estado: number | { id: number } } | [estado: number | { id: number }] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { estado: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { estado: args.id }
    }

    if (Array.isArray(args)) {
        args = { estado: args[0] }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        estado: typeof args.estado === 'object' ? args.estado.id : args.estado,
    }

    return update.definition.url
        .replace('{estado}', parsedArgs.estado.toString())
        .replace(/\/+$/, '') + queryParams(options)
}

update.put = (args: { estado: number | { id: number } } | [estado: number | { id: number }] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
 * @see \App\Http\Controllers\Admin\EstadoController::toggleStatus
 * @route '/admin/estados/{estado}/toggle-status'
 */
export const toggleStatus = (args: { estado: number | { id: number } } | [estado: number | { id: number }] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.definition = {
    methods: ["post"],
    url: '/admin/estados/{estado}/toggle-status',
} satisfies RouteDefinition<["post"]>

toggleStatus.url = (args: { estado: number | { id: number } } | [estado: number | { id: number }] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { estado: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { estado: args.id }
    }

    if (Array.isArray(args)) {
        args = { estado: args[0] }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        estado: typeof args.estado === 'object' ? args.estado.id : args.estado,
    }

    return toggleStatus.definition.url
        .replace('{estado}', parsedArgs.estado.toString())
        .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see \App\Http\Controllers\Admin\EstadoController::bulkDestroy
 * @route '/admin/estados/bulk-destroy'
 */
export const bulkDestroy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

bulkDestroy.definition = {
    methods: ["post"],
    url: '/admin/estados/bulk-destroy',
} satisfies RouteDefinition<["post"]>

bulkDestroy.url = (options?: RouteQueryOptions) => {
    return bulkDestroy.definition.url + queryParams(options)
}

bulkDestroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

const estados = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    toggleStatus: Object.assign(toggleStatus, toggleStatus),
    bulkDestroy: Object.assign(bulkDestroy, bulkDestroy),
}

export default estados
