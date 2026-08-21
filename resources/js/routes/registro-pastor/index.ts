import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:20
 * @route '/registro-pastor'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/registro-pastor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:20
 * @route '/registro-pastor'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:20
 * @route '/registro-pastor'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:20
 * @route '/registro-pastor'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:20
 * @route '/registro-pastor'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:20
 * @route '/registro-pastor'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:20
 * @route '/registro-pastor'
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
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:74
 * @route '/registro-pastor'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/registro-pastor',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:74
 * @route '/registro-pastor'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:74
 * @route '/registro-pastor'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:74
 * @route '/registro-pastor'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:74
 * @route '/registro-pastor'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
const registroPastor = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
}

export default registroPastor