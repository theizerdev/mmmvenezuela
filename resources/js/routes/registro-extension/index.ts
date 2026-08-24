import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:629
 * @route '/registro/{pastor}/extension'
 */
export const index = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/registro/{pastor}/extension',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:629
 * @route '/registro/{pastor}/extension'
 */
index.url = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pastor: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pastor: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pastor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pastor: typeof args.pastor === 'object'
                ? args.pastor.id
                : args.pastor,
                }

    return index.definition.url
            .replace('{pastor}', parsedArgs.pastor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:629
 * @route '/registro/{pastor}/extension'
 */
index.get = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:629
 * @route '/registro/{pastor}/extension'
 */
index.head = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:629
 * @route '/registro/{pastor}/extension'
 */
    const indexForm = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:629
 * @route '/registro/{pastor}/extension'
 */
        indexForm.get = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:629
 * @route '/registro/{pastor}/extension'
 */
        indexForm.head = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(args, {
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
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:712
 * @route '/registro/{pastor}/extension'
 */
export const store = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/registro/{pastor}/extension',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:712
 * @route '/registro/{pastor}/extension'
 */
store.url = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pastor: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pastor: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pastor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pastor: typeof args.pastor === 'object'
                ? args.pastor.id
                : args.pastor,
                }

    return store.definition.url
            .replace('{pastor}', parsedArgs.pastor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:712
 * @route '/registro/{pastor}/extension'
 */
store.post = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:712
 * @route '/registro/{pastor}/extension'
 */
    const storeForm = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:712
 * @route '/registro/{pastor}/extension'
 */
        storeForm.post = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(args, options),
            method: 'post',
        })
    
    store.form = storeForm
const registroExtension = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
}

export default registroExtension