import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/iglesias'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/iglesias',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/iglesias'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/iglesias'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/iglesias'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/iglesias'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/iglesias'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/iglesias'
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
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/iglesias/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/iglesias/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/iglesias/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/iglesias/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/iglesias/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/iglesias/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/iglesias/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/iglesias/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
const iglesias = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
}

export default iglesias