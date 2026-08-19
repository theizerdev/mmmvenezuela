import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ParroquiaController::index
* @see app/Http/Controllers/Admin/ParroquiaController.php:20
* @route '/admin/parroquias'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/parroquias',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::index
* @see app/Http/Controllers/Admin/ParroquiaController.php:20
* @route '/admin/parroquias'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::index
* @see app/Http/Controllers/Admin/ParroquiaController.php:20
* @route '/admin/parroquias'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::index
* @see app/Http/Controllers/Admin/ParroquiaController.php:20
* @route '/admin/parroquias'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::index
* @see app/Http/Controllers/Admin/ParroquiaController.php:20
* @route '/admin/parroquias'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::index
* @see app/Http/Controllers/Admin/ParroquiaController.php:20
* @route '/admin/parroquias'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::index
* @see app/Http/Controllers/Admin/ParroquiaController.php:20
* @route '/admin/parroquias'
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
* @see \App\Http\Controllers\Admin\ParroquiaController::store
* @see app/Http/Controllers/Admin/ParroquiaController.php:107
* @route '/admin/parroquias'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/parroquias',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::store
* @see app/Http/Controllers/Admin/ParroquiaController.php:107
* @route '/admin/parroquias'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::store
* @see app/Http/Controllers/Admin/ParroquiaController.php:107
* @route '/admin/parroquias'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::store
* @see app/Http/Controllers/Admin/ParroquiaController.php:107
* @route '/admin/parroquias'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::store
* @see app/Http/Controllers/Admin/ParroquiaController.php:107
* @route '/admin/parroquias'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::update
* @see app/Http/Controllers/Admin/ParroquiaController.php:130
* @route '/admin/parroquias/{parroquia}'
*/
export const update = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/parroquias/{parroquia}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::update
* @see app/Http/Controllers/Admin/ParroquiaController.php:130
* @route '/admin/parroquias/{parroquia}'
*/
update.url = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parroquia: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { parroquia: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            parroquia: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        parroquia: typeof args.parroquia === 'object'
        ? args.parroquia.id
        : args.parroquia,
    }

    return update.definition.url
            .replace('{parroquia}', parsedArgs.parroquia.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::update
* @see app/Http/Controllers/Admin/ParroquiaController.php:130
* @route '/admin/parroquias/{parroquia}'
*/
update.put = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::update
* @see app/Http/Controllers/Admin/ParroquiaController.php:130
* @route '/admin/parroquias/{parroquia}'
*/
const updateForm = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::update
* @see app/Http/Controllers/Admin/ParroquiaController.php:130
* @route '/admin/parroquias/{parroquia}'
*/
updateForm.put = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ParroquiaController::toggleStatus
* @see app/Http/Controllers/Admin/ParroquiaController.php:153
* @route '/admin/parroquias/{parroquia}/toggle-status'
*/
export const toggleStatus = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.definition = {
    methods: ["post"],
    url: '/admin/parroquias/{parroquia}/toggle-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::toggleStatus
* @see app/Http/Controllers/Admin/ParroquiaController.php:153
* @route '/admin/parroquias/{parroquia}/toggle-status'
*/
toggleStatus.url = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { parroquia: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { parroquia: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            parroquia: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        parroquia: typeof args.parroquia === 'object'
        ? args.parroquia.id
        : args.parroquia,
    }

    return toggleStatus.definition.url
            .replace('{parroquia}', parsedArgs.parroquia.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::toggleStatus
* @see app/Http/Controllers/Admin/ParroquiaController.php:153
* @route '/admin/parroquias/{parroquia}/toggle-status'
*/
toggleStatus.post = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::toggleStatus
* @see app/Http/Controllers/Admin/ParroquiaController.php:153
* @route '/admin/parroquias/{parroquia}/toggle-status'
*/
const toggleStatusForm = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleStatus.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::toggleStatus
* @see app/Http/Controllers/Admin/ParroquiaController.php:153
* @route '/admin/parroquias/{parroquia}/toggle-status'
*/
toggleStatusForm.post = (args: { parroquia: number | { id: number } } | [parroquia: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.form = toggleStatusForm

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::bulkDestroy
* @see app/Http/Controllers/Admin/ParroquiaController.php:166
* @route '/admin/parroquias/bulk-destroy'
*/
export const bulkDestroy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

bulkDestroy.definition = {
    methods: ["post"],
    url: '/admin/parroquias/bulk-destroy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::bulkDestroy
* @see app/Http/Controllers/Admin/ParroquiaController.php:166
* @route '/admin/parroquias/bulk-destroy'
*/
bulkDestroy.url = (options?: RouteQueryOptions) => {
    return bulkDestroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::bulkDestroy
* @see app/Http/Controllers/Admin/ParroquiaController.php:166
* @route '/admin/parroquias/bulk-destroy'
*/
bulkDestroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::bulkDestroy
* @see app/Http/Controllers/Admin/ParroquiaController.php:166
* @route '/admin/parroquias/bulk-destroy'
*/
const bulkDestroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ParroquiaController::bulkDestroy
* @see app/Http/Controllers/Admin/ParroquiaController.php:166
* @route '/admin/parroquias/bulk-destroy'
*/
bulkDestroyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: bulkDestroy.url(options),
    method: 'post',
})

bulkDestroy.form = bulkDestroyForm

const parroquias = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
    update: Object.assign(update, update),
    toggleStatus: Object.assign(toggleStatus, toggleStatus),
    bulkDestroy: Object.assign(bulkDestroy, bulkDestroy),
}

export default parroquias