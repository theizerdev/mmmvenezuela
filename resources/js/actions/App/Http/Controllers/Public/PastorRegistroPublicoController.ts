import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:24
 * @route '/registro'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/registro',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:24
 * @route '/registro'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:24
 * @route '/registro'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:24
 * @route '/registro'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:24
 * @route '/registro'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:24
 * @route '/registro'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:24
 * @route '/registro'
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
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:198
 * @route '/registro'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/registro',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:198
 * @route '/registro'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:198
 * @route '/registro'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:198
 * @route '/registro'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:198
 * @route '/registro'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:81
 * @route '/registro/verificar-cedula/{cedula}'
 */
export const verificarCedula = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verificarCedula.url(args, options),
    method: 'get',
})

verificarCedula.definition = {
    methods: ["get","head"],
    url: '/registro/verificar-cedula/{cedula}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:81
 * @route '/registro/verificar-cedula/{cedula}'
 */
verificarCedula.url = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cedula: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cedula: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cedula: args.cedula,
                }

    return verificarCedula.definition.url
            .replace('{cedula}', parsedArgs.cedula.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:81
 * @route '/registro/verificar-cedula/{cedula}'
 */
verificarCedula.get = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verificarCedula.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:81
 * @route '/registro/verificar-cedula/{cedula}'
 */
verificarCedula.head = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verificarCedula.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:81
 * @route '/registro/verificar-cedula/{cedula}'
 */
    const verificarCedulaForm = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verificarCedula.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:81
 * @route '/registro/verificar-cedula/{cedula}'
 */
        verificarCedulaForm.get = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verificarCedula.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:81
 * @route '/registro/verificar-cedula/{cedula}'
 */
        verificarCedulaForm.head = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verificarCedula.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verificarCedula.form = verificarCedulaForm
const PastorRegistroPublicoController = { index, store, verificarCedula }

export default PastorRegistroPublicoController