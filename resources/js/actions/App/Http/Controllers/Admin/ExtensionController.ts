import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:20
 * @route '/admin/extensiones/dashboard'
 */
export const dashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})

dashboard.definition = {
    methods: ["get","head"],
    url: '/admin/extensiones/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:20
 * @route '/admin/extensiones/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:20
 * @route '/admin/extensiones/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:20
 * @route '/admin/extensiones/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:20
 * @route '/admin/extensiones/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:20
 * @route '/admin/extensiones/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:20
 * @route '/admin/extensiones/dashboard'
 */
        dashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    dashboard.form = dashboardForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/extensiones'
 */
const index22bde03ec5e9600d4babd82036a88ef5 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index22bde03ec5e9600d4babd82036a88ef5.url(options),
    method: 'get',
})

index22bde03ec5e9600d4babd82036a88ef5.definition = {
    methods: ["get","head"],
    url: '/admin/extensiones',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/extensiones'
 */
index22bde03ec5e9600d4babd82036a88ef5.url = (options?: RouteQueryOptions) => {
    return index22bde03ec5e9600d4babd82036a88ef5.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/extensiones'
 */
index22bde03ec5e9600d4babd82036a88ef5.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index22bde03ec5e9600d4babd82036a88ef5.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/extensiones'
 */
index22bde03ec5e9600d4babd82036a88ef5.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index22bde03ec5e9600d4babd82036a88ef5.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/extensiones'
 */
    const index22bde03ec5e9600d4babd82036a88ef5Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index22bde03ec5e9600d4babd82036a88ef5.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/extensiones'
 */
        index22bde03ec5e9600d4babd82036a88ef5Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index22bde03ec5e9600d4babd82036a88ef5.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/extensiones'
 */
        index22bde03ec5e9600d4babd82036a88ef5Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index22bde03ec5e9600d4babd82036a88ef5.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index22bde03ec5e9600d4babd82036a88ef5.form = index22bde03ec5e9600d4babd82036a88ef5Form
    /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/iglesias'
 */
const index68f345384922fd4e579b0e04466e9be7 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index68f345384922fd4e579b0e04466e9be7.url(options),
    method: 'get',
})

index68f345384922fd4e579b0e04466e9be7.definition = {
    methods: ["get","head"],
    url: '/admin/iglesias',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/iglesias'
 */
index68f345384922fd4e579b0e04466e9be7.url = (options?: RouteQueryOptions) => {
    return index68f345384922fd4e579b0e04466e9be7.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/iglesias'
 */
index68f345384922fd4e579b0e04466e9be7.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index68f345384922fd4e579b0e04466e9be7.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/iglesias'
 */
index68f345384922fd4e579b0e04466e9be7.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index68f345384922fd4e579b0e04466e9be7.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/iglesias'
 */
    const index68f345384922fd4e579b0e04466e9be7Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index68f345384922fd4e579b0e04466e9be7.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/iglesias'
 */
        index68f345384922fd4e579b0e04466e9be7Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index68f345384922fd4e579b0e04466e9be7.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:164
 * @route '/admin/iglesias'
 */
        index68f345384922fd4e579b0e04466e9be7Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index68f345384922fd4e579b0e04466e9be7.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index68f345384922fd4e579b0e04466e9be7.form = index68f345384922fd4e579b0e04466e9be7Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\ExtensionController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/admin/extensiones': index22bde03ec5e9600d4babd82036a88ef5,
    '/admin/iglesias': index68f345384922fd4e579b0e04466e9be7,
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/extensiones/create'
 */
const create825bdf247914fb5ed0530a47eab30511 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create825bdf247914fb5ed0530a47eab30511.url(options),
    method: 'get',
})

create825bdf247914fb5ed0530a47eab30511.definition = {
    methods: ["get","head"],
    url: '/admin/extensiones/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/extensiones/create'
 */
create825bdf247914fb5ed0530a47eab30511.url = (options?: RouteQueryOptions) => {
    return create825bdf247914fb5ed0530a47eab30511.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/extensiones/create'
 */
create825bdf247914fb5ed0530a47eab30511.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create825bdf247914fb5ed0530a47eab30511.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/extensiones/create'
 */
create825bdf247914fb5ed0530a47eab30511.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create825bdf247914fb5ed0530a47eab30511.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/extensiones/create'
 */
    const create825bdf247914fb5ed0530a47eab30511Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create825bdf247914fb5ed0530a47eab30511.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/extensiones/create'
 */
        create825bdf247914fb5ed0530a47eab30511Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create825bdf247914fb5ed0530a47eab30511.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/extensiones/create'
 */
        create825bdf247914fb5ed0530a47eab30511Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create825bdf247914fb5ed0530a47eab30511.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create825bdf247914fb5ed0530a47eab30511.form = create825bdf247914fb5ed0530a47eab30511Form
    /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/iglesias/create'
 */
const createf47dfe3f80828a572db4b90c76599d65 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createf47dfe3f80828a572db4b90c76599d65.url(options),
    method: 'get',
})

createf47dfe3f80828a572db4b90c76599d65.definition = {
    methods: ["get","head"],
    url: '/admin/iglesias/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/iglesias/create'
 */
createf47dfe3f80828a572db4b90c76599d65.url = (options?: RouteQueryOptions) => {
    return createf47dfe3f80828a572db4b90c76599d65.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/iglesias/create'
 */
createf47dfe3f80828a572db4b90c76599d65.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: createf47dfe3f80828a572db4b90c76599d65.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/iglesias/create'
 */
createf47dfe3f80828a572db4b90c76599d65.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: createf47dfe3f80828a572db4b90c76599d65.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/iglesias/create'
 */
    const createf47dfe3f80828a572db4b90c76599d65Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: createf47dfe3f80828a572db4b90c76599d65.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/iglesias/create'
 */
        createf47dfe3f80828a572db4b90c76599d65Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: createf47dfe3f80828a572db4b90c76599d65.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:220
 * @route '/admin/iglesias/create'
 */
        createf47dfe3f80828a572db4b90c76599d65Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: createf47dfe3f80828a572db4b90c76599d65.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    createf47dfe3f80828a572db4b90c76599d65.form = createf47dfe3f80828a572db4b90c76599d65Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\ExtensionController::create, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `create['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const create = {
    '/admin/extensiones/create': create825bdf247914fb5ed0530a47eab30511,
    '/admin/iglesias/create': createf47dfe3f80828a572db4b90c76599d65,
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:249
 * @route '/admin/extensiones'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/extensiones',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:249
 * @route '/admin/extensiones'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:249
 * @route '/admin/extensiones'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:249
 * @route '/admin/extensiones'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:249
 * @route '/admin/extensiones'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:317
 * @route '/admin/extensiones/{extension}/edit'
 */
export const edit = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/extensiones/{extension}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:317
 * @route '/admin/extensiones/{extension}/edit'
 */
edit.url = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { extension: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    extension: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        extension: args.extension,
                }

    return edit.definition.url
            .replace('{extension}', parsedArgs.extension.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:317
 * @route '/admin/extensiones/{extension}/edit'
 */
edit.get = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:317
 * @route '/admin/extensiones/{extension}/edit'
 */
edit.head = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:317
 * @route '/admin/extensiones/{extension}/edit'
 */
    const editForm = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:317
 * @route '/admin/extensiones/{extension}/edit'
 */
        editForm.get = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:317
 * @route '/admin/extensiones/{extension}/edit'
 */
        editForm.head = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    edit.form = editForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::update
 * @see app/Http/Controllers/Admin/ExtensionController.php:365
 * @route '/admin/extensiones/{extension}'
 */
export const update = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/extensiones/{extension}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::update
 * @see app/Http/Controllers/Admin/ExtensionController.php:365
 * @route '/admin/extensiones/{extension}'
 */
update.url = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { extension: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    extension: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        extension: args.extension,
                }

    return update.definition.url
            .replace('{extension}', parsedArgs.extension.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::update
 * @see app/Http/Controllers/Admin/ExtensionController.php:365
 * @route '/admin/extensiones/{extension}'
 */
update.put = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::update
 * @see app/Http/Controllers/Admin/ExtensionController.php:365
 * @route '/admin/extensiones/{extension}'
 */
    const updateForm = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::update
 * @see app/Http/Controllers/Admin/ExtensionController.php:365
 * @route '/admin/extensiones/{extension}'
 */
        updateForm.put = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/{extension}'
 */
const destroy440bff085c236091f7c075229bd9e9c7 = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy440bff085c236091f7c075229bd9e9c7.url(args, options),
    method: 'delete',
})

destroy440bff085c236091f7c075229bd9e9c7.definition = {
    methods: ["delete"],
    url: '/admin/extensiones/{extension}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/{extension}'
 */
destroy440bff085c236091f7c075229bd9e9c7.url = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { extension: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    extension: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        extension: args.extension,
                }

    return destroy440bff085c236091f7c075229bd9e9c7.definition.url
            .replace('{extension}', parsedArgs.extension.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/{extension}'
 */
destroy440bff085c236091f7c075229bd9e9c7.delete = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy440bff085c236091f7c075229bd9e9c7.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/{extension}'
 */
    const destroy440bff085c236091f7c075229bd9e9c7Form = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy440bff085c236091f7c075229bd9e9c7.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/{extension}'
 */
        destroy440bff085c236091f7c075229bd9e9c7Form.delete = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy440bff085c236091f7c075229bd9e9c7.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy440bff085c236091f7c075229bd9e9c7.form = destroy440bff085c236091f7c075229bd9e9c7Form
    /**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/bulk-destroy'
 */
const destroy701656ab12be2e00223aee05ffa10d40 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroy701656ab12be2e00223aee05ffa10d40.url(options),
    method: 'post',
})

destroy701656ab12be2e00223aee05ffa10d40.definition = {
    methods: ["post"],
    url: '/admin/extensiones/bulk-destroy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/bulk-destroy'
 */
destroy701656ab12be2e00223aee05ffa10d40.url = (options?: RouteQueryOptions) => {
    return destroy701656ab12be2e00223aee05ffa10d40.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/bulk-destroy'
 */
destroy701656ab12be2e00223aee05ffa10d40.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: destroy701656ab12be2e00223aee05ffa10d40.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/bulk-destroy'
 */
    const destroy701656ab12be2e00223aee05ffa10d40Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy701656ab12be2e00223aee05ffa10d40.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:463
 * @route '/admin/extensiones/bulk-destroy'
 */
        destroy701656ab12be2e00223aee05ffa10d40Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy701656ab12be2e00223aee05ffa10d40.url(options),
            method: 'post',
        })
    
    destroy701656ab12be2e00223aee05ffa10d40.form = destroy701656ab12be2e00223aee05ffa10d40Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\ExtensionController::destroy, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `destroy['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const destroy = {
    '/admin/extensiones/{extension}': destroy440bff085c236091f7c075229bd9e9c7,
    '/admin/extensiones/bulk-destroy': destroy701656ab12be2e00223aee05ffa10d40,
}

const ExtensionController = { dashboard, index, create, store, edit, update, destroy }

export default ExtensionController