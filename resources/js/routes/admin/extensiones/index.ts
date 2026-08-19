import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:22
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:22
 * @route '/admin/extensiones/dashboard'
 */
dashboard.url = (options?: RouteQueryOptions) => {
    return dashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:22
 * @route '/admin/extensiones/dashboard'
 */
dashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: dashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:22
 * @route '/admin/extensiones/dashboard'
 */
dashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: dashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:22
 * @route '/admin/extensiones/dashboard'
 */
    const dashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: dashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:22
 * @route '/admin/extensiones/dashboard'
 */
        dashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: dashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::dashboard
 * @see app/Http/Controllers/Admin/ExtensionController.php:22
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/extensiones'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/extensiones',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/extensiones'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/extensiones'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/extensiones'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/extensiones'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/extensiones'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::index
 * @see app/Http/Controllers/Admin/ExtensionController.php:166
 * @route '/admin/extensiones'
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
 * @route '/admin/extensiones/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/extensiones/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/extensiones/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/extensiones/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/extensiones/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/extensiones/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/extensiones/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::create
 * @see app/Http/Controllers/Admin/ExtensionController.php:222
 * @route '/admin/extensiones/create'
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
/**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:251
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:251
 * @route '/admin/extensiones'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:251
 * @route '/admin/extensiones'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:251
 * @route '/admin/extensiones'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::store
 * @see app/Http/Controllers/Admin/ExtensionController.php:251
 * @route '/admin/extensiones'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:319
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:319
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:319
 * @route '/admin/extensiones/{extension}/edit'
 */
edit.get = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:319
 * @route '/admin/extensiones/{extension}/edit'
 */
edit.head = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:319
 * @route '/admin/extensiones/{extension}/edit'
 */
    const editForm = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:319
 * @route '/admin/extensiones/{extension}/edit'
 */
        editForm.get = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ExtensionController::edit
 * @see app/Http/Controllers/Admin/ExtensionController.php:319
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:367
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:367
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:367
 * @route '/admin/extensiones/{extension}'
 */
update.put = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::update
 * @see app/Http/Controllers/Admin/ExtensionController.php:367
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
 * @see app/Http/Controllers/Admin/ExtensionController.php:367
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
* @see \App\Http\Controllers\Admin\ExtensionController::verifySecurity
 * @see app/Http/Controllers/Admin/ExtensionController.php:479
 * @route '/admin/extensiones/verify-security'
 */
export const verifySecurity = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifySecurity.url(options),
    method: 'post',
})

verifySecurity.definition = {
    methods: ["post"],
    url: '/admin/extensiones/verify-security',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::verifySecurity
 * @see app/Http/Controllers/Admin/ExtensionController.php:479
 * @route '/admin/extensiones/verify-security'
 */
verifySecurity.url = (options?: RouteQueryOptions) => {
    return verifySecurity.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::verifySecurity
 * @see app/Http/Controllers/Admin/ExtensionController.php:479
 * @route '/admin/extensiones/verify-security'
 */
verifySecurity.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifySecurity.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::verifySecurity
 * @see app/Http/Controllers/Admin/ExtensionController.php:479
 * @route '/admin/extensiones/verify-security'
 */
    const verifySecurityForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verifySecurity.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::verifySecurity
 * @see app/Http/Controllers/Admin/ExtensionController.php:479
 * @route '/admin/extensiones/verify-security'
 */
        verifySecurityForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verifySecurity.url(options),
            method: 'post',
        })
    
    verifySecurity.form = verifySecurityForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::uploadDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:502
 * @route '/admin/extensiones/{extension}/documento'
 */
export const uploadDocumento = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadDocumento.url(args, options),
    method: 'post',
})

uploadDocumento.definition = {
    methods: ["post"],
    url: '/admin/extensiones/{extension}/documento',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::uploadDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:502
 * @route '/admin/extensiones/{extension}/documento'
 */
uploadDocumento.url = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return uploadDocumento.definition.url
            .replace('{extension}', parsedArgs.extension.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::uploadDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:502
 * @route '/admin/extensiones/{extension}/documento'
 */
uploadDocumento.post = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: uploadDocumento.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::uploadDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:502
 * @route '/admin/extensiones/{extension}/documento'
 */
    const uploadDocumentoForm = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: uploadDocumento.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::uploadDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:502
 * @route '/admin/extensiones/{extension}/documento'
 */
        uploadDocumentoForm.post = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: uploadDocumento.url(args, options),
            method: 'post',
        })
    
    uploadDocumento.form = uploadDocumentoForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::deleteDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:550
 * @route '/admin/extensiones/{extension}/documento'
 */
export const deleteDocumento = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteDocumento.url(args, options),
    method: 'delete',
})

deleteDocumento.definition = {
    methods: ["delete"],
    url: '/admin/extensiones/{extension}/documento',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::deleteDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:550
 * @route '/admin/extensiones/{extension}/documento'
 */
deleteDocumento.url = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return deleteDocumento.definition.url
            .replace('{extension}', parsedArgs.extension.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::deleteDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:550
 * @route '/admin/extensiones/{extension}/documento'
 */
deleteDocumento.delete = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: deleteDocumento.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::deleteDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:550
 * @route '/admin/extensiones/{extension}/documento'
 */
    const deleteDocumentoForm = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: deleteDocumento.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::deleteDocumento
 * @see app/Http/Controllers/Admin/ExtensionController.php:550
 * @route '/admin/extensiones/{extension}/documento'
 */
        deleteDocumentoForm.delete = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: deleteDocumento.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    deleteDocumento.form = deleteDocumentoForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/{extension}'
 */
export const destroy = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/extensiones/{extension}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/{extension}'
 */
destroy.url = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return destroy.definition.url
            .replace('{extension}', parsedArgs.extension.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/{extension}'
 */
destroy.delete = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/{extension}'
 */
    const destroyForm = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::destroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/{extension}'
 */
        destroyForm.delete = (args: { extension: string | number } | [extension: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\Admin\ExtensionController::bulkDestroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/bulk-destroy'
 */
export const bulkDestroy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

bulkDestroy.definition = {
    methods: ["post"],
    url: '/admin/extensiones/bulk-destroy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ExtensionController::bulkDestroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/bulk-destroy'
 */
bulkDestroy.url = (options?: RouteQueryOptions) => {
    return bulkDestroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ExtensionController::bulkDestroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/bulk-destroy'
 */
bulkDestroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ExtensionController::bulkDestroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/bulk-destroy'
 */
    const bulkDestroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkDestroy.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ExtensionController::bulkDestroy
 * @see app/Http/Controllers/Admin/ExtensionController.php:465
 * @route '/admin/extensiones/bulk-destroy'
 */
        bulkDestroyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkDestroy.url(options),
            method: 'post',
        })
    
    bulkDestroy.form = bulkDestroyForm
const extensiones = {
    dashboard: Object.assign(dashboard, dashboard),
index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
verifySecurity: Object.assign(verifySecurity, verifySecurity),
uploadDocumento: Object.assign(uploadDocumento, uploadDocumento),
deleteDocumento: Object.assign(deleteDocumento, deleteDocumento),
destroy: Object.assign(destroy, destroy),
bulkDestroy: Object.assign(bulkDestroy, bulkDestroy),
}

export default extensiones