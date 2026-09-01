import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\EstadoController::index
* @see app/Http/Controllers/Admin/EstadoController.php:14
* @route '/admin/estados'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/estados',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\EstadoController::index
* @see app/Http/Controllers/Admin/EstadoController.php:14
* @route '/admin/estados'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EstadoController::index
* @see app/Http/Controllers/Admin/EstadoController.php:14
* @route '/admin/estados'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::index
* @see app/Http/Controllers/Admin/EstadoController.php:14
* @route '/admin/estados'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::index
* @see app/Http/Controllers/Admin/EstadoController.php:14
* @route '/admin/estados'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::index
* @see app/Http/Controllers/Admin/EstadoController.php:14
* @route '/admin/estados'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::index
* @see app/Http/Controllers/Admin/EstadoController.php:14
* @route '/admin/estados'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\Admin\EstadoController::store
* @see app/Http/Controllers/Admin/EstadoController.php:69
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

/**
* @see \App\Http\Controllers\Admin\EstadoController::store
* @see app/Http/Controllers/Admin/EstadoController.php:69
* @route '/admin/estados'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EstadoController::store
* @see app/Http/Controllers/Admin/EstadoController.php:69
* @route '/admin/estados'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::store
* @see app/Http/Controllers/Admin/EstadoController.php:69
* @route '/admin/estados'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::store
* @see app/Http/Controllers/Admin/EstadoController.php:69
* @route '/admin/estados'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\EstadoController::update
* @see app/Http/Controllers/Admin/EstadoController.php:98
* @route '/admin/estados/{estado}'
*/
export const update = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/estados/{estado}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\EstadoController::update
* @see app/Http/Controllers/Admin/EstadoController.php:98
* @route '/admin/estados/{estado}'
*/
update.url = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { estado: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { estado: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            estado: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        estado: typeof args.estado === 'object'
        ? args.estado.id
        : args.estado,
    }

    return update.definition.url
            .replace('{estado}', parsedArgs.estado.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EstadoController::update
* @see app/Http/Controllers/Admin/EstadoController.php:98
* @route '/admin/estados/{estado}'
*/
update.put = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::update
* @see app/Http/Controllers/Admin/EstadoController.php:98
* @route '/admin/estados/{estado}'
*/
const updateForm = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::update
* @see app/Http/Controllers/Admin/EstadoController.php:98
* @route '/admin/estados/{estado}'
*/
updateForm.put = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

update.form = updateForm

/**
* @see \App\Http\Controllers\Admin\EstadoController::toggleStatus
* @see app/Http/Controllers/Admin/EstadoController.php:129
* @route '/admin/estados/{estado}/toggle-status'
*/
export const toggleStatus = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.definition = {
    methods: ["post"],
    url: '/admin/estados/{estado}/toggle-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\EstadoController::toggleStatus
* @see app/Http/Controllers/Admin/EstadoController.php:129
* @route '/admin/estados/{estado}/toggle-status'
*/
toggleStatus.url = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { estado: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { estado: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            estado: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        estado: typeof args.estado === 'object'
        ? args.estado.id
        : args.estado,
    }

    return toggleStatus.definition.url
            .replace('{estado}', parsedArgs.estado.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EstadoController::toggleStatus
* @see app/Http/Controllers/Admin/EstadoController.php:129
* @route '/admin/estados/{estado}/toggle-status'
*/
toggleStatus.post = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::toggleStatus
* @see app/Http/Controllers/Admin/EstadoController.php:129
* @route '/admin/estados/{estado}/toggle-status'
*/
const toggleStatusForm = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::toggleStatus
* @see app/Http/Controllers/Admin/EstadoController.php:129
* @route '/admin/estados/{estado}/toggle-status'
*/
toggleStatusForm.post = (args: { estado: number | { id: number } } | [estado: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.form = toggleStatusForm

/**
* @see \App\Http\Controllers\Admin\EstadoController::bulkDestroy
* @see app/Http/Controllers/Admin/EstadoController.php:149
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

/**
* @see \App\Http\Controllers\Admin\EstadoController::bulkDestroy
* @see app/Http/Controllers/Admin/EstadoController.php:149
* @route '/admin/estados/bulk-destroy'
*/
bulkDestroy.url = (options?: RouteQueryOptions) => {
    return bulkDestroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\EstadoController::bulkDestroy
* @see app/Http/Controllers/Admin/EstadoController.php:149
* @route '/admin/estados/bulk-destroy'
*/
bulkDestroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::bulkDestroy
* @see app/Http/Controllers/Admin/EstadoController.php:149
* @route '/admin/estados/bulk-destroy'
*/
const bulkDestroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\EstadoController::bulkDestroy
* @see app/Http/Controllers/Admin/EstadoController.php:149
* @route '/admin/estados/bulk-destroy'
*/
bulkDestroyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(options),
    method: 'post',
})

bulkDestroy.form = bulkDestroyForm

const EstadoController = { index, store, update, toggleStatus, bulkDestroy }

export default EstadoController