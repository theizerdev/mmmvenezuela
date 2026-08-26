import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PastorController::index
 * @see app/Http/Controllers/Admin/PastorController.php:24
 * @route '/admin/pastores'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/pastores',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorController::index
 * @see app/Http/Controllers/Admin/PastorController.php:24
 * @route '/admin/pastores'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorController::index
 * @see app/Http/Controllers/Admin/PastorController.php:24
 * @route '/admin/pastores'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorController::index
 * @see app/Http/Controllers/Admin/PastorController.php:24
 * @route '/admin/pastores'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorController::index
 * @see app/Http/Controllers/Admin/PastorController.php:24
 * @route '/admin/pastores'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorController::index
 * @see app/Http/Controllers/Admin/PastorController.php:24
 * @route '/admin/pastores'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorController::index
 * @see app/Http/Controllers/Admin/PastorController.php:24
 * @route '/admin/pastores'
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
* @see \App\Http\Controllers\Admin\PastorController::create
 * @see app/Http/Controllers/Admin/PastorController.php:91
 * @route '/admin/pastores/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/pastores/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorController::create
 * @see app/Http/Controllers/Admin/PastorController.php:91
 * @route '/admin/pastores/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorController::create
 * @see app/Http/Controllers/Admin/PastorController.php:91
 * @route '/admin/pastores/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorController::create
 * @see app/Http/Controllers/Admin/PastorController.php:91
 * @route '/admin/pastores/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorController::create
 * @see app/Http/Controllers/Admin/PastorController.php:91
 * @route '/admin/pastores/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorController::create
 * @see app/Http/Controllers/Admin/PastorController.php:91
 * @route '/admin/pastores/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorController::create
 * @see app/Http/Controllers/Admin/PastorController.php:91
 * @route '/admin/pastores/create'
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
* @see \App\Http\Controllers\Admin\PastorController::store
 * @see app/Http/Controllers/Admin/PastorController.php:124
 * @route '/admin/pastores'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/pastores',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorController::store
 * @see app/Http/Controllers/Admin/PastorController.php:124
 * @route '/admin/pastores'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorController::store
 * @see app/Http/Controllers/Admin/PastorController.php:124
 * @route '/admin/pastores'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorController::store
 * @see app/Http/Controllers/Admin/PastorController.php:124
 * @route '/admin/pastores'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorController::store
 * @see app/Http/Controllers/Admin/PastorController.php:124
 * @route '/admin/pastores'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\PastorController::edit
 * @see app/Http/Controllers/Admin/PastorController.php:264
 * @route '/admin/pastores/{pastore}/edit'
 */
export const edit = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/pastores/{pastore}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorController::edit
 * @see app/Http/Controllers/Admin/PastorController.php:264
 * @route '/admin/pastores/{pastore}/edit'
 */
edit.url = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pastore: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pastore: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pastore: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pastore: typeof args.pastore === 'object'
                ? args.pastore.id
                : args.pastore,
                }

    return edit.definition.url
            .replace('{pastore}', parsedArgs.pastore.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorController::edit
 * @see app/Http/Controllers/Admin/PastorController.php:264
 * @route '/admin/pastores/{pastore}/edit'
 */
edit.get = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorController::edit
 * @see app/Http/Controllers/Admin/PastorController.php:264
 * @route '/admin/pastores/{pastore}/edit'
 */
edit.head = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorController::edit
 * @see app/Http/Controllers/Admin/PastorController.php:264
 * @route '/admin/pastores/{pastore}/edit'
 */
    const editForm = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorController::edit
 * @see app/Http/Controllers/Admin/PastorController.php:264
 * @route '/admin/pastores/{pastore}/edit'
 */
        editForm.get = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorController::edit
 * @see app/Http/Controllers/Admin/PastorController.php:264
 * @route '/admin/pastores/{pastore}/edit'
 */
        editForm.head = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\PastorPlanillaController::planilla
 * @see app/Http/Controllers/Admin/PastorPlanillaController.php:19
 * @route '/admin/pastores/{id}/planilla'
 */
export const planilla = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: planilla.url(args, options),
    method: 'get',
})

planilla.definition = {
    methods: ["get","head"],
    url: '/admin/pastores/{id}/planilla',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorPlanillaController::planilla
 * @see app/Http/Controllers/Admin/PastorPlanillaController.php:19
 * @route '/admin/pastores/{id}/planilla'
 */
planilla.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return planilla.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorPlanillaController::planilla
 * @see app/Http/Controllers/Admin/PastorPlanillaController.php:19
 * @route '/admin/pastores/{id}/planilla'
 */
planilla.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: planilla.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorPlanillaController::planilla
 * @see app/Http/Controllers/Admin/PastorPlanillaController.php:19
 * @route '/admin/pastores/{id}/planilla'
 */
planilla.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: planilla.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorPlanillaController::planilla
 * @see app/Http/Controllers/Admin/PastorPlanillaController.php:19
 * @route '/admin/pastores/{id}/planilla'
 */
    const planillaForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: planilla.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorPlanillaController::planilla
 * @see app/Http/Controllers/Admin/PastorPlanillaController.php:19
 * @route '/admin/pastores/{id}/planilla'
 */
        planillaForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: planilla.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorPlanillaController::planilla
 * @see app/Http/Controllers/Admin/PastorPlanillaController.php:19
 * @route '/admin/pastores/{id}/planilla'
 */
        planillaForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: planilla.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    planilla.form = planillaForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:25
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
export const carnetPdf = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: carnetPdf.url(args, options),
    method: 'get',
})

carnetPdf.definition = {
    methods: ["get","head"],
    url: '/admin/pastores/{id}/carnet-pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:25
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
carnetPdf.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    id: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        id: args.id,
                }

    return carnetPdf.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:25
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
carnetPdf.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: carnetPdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:25
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
carnetPdf.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: carnetPdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:25
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
    const carnetPdfForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: carnetPdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:25
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
        carnetPdfForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: carnetPdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:25
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
        carnetPdfForm.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: carnetPdf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    carnetPdf.form = carnetPdfForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:42
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
export const bulkCarnetPdf = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkCarnetPdf.url(options),
    method: 'post',
})

bulkCarnetPdf.definition = {
    methods: ["post"],
    url: '/admin/pastores/bulk-carnet-pdf',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:42
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
bulkCarnetPdf.url = (options?: RouteQueryOptions) => {
    return bulkCarnetPdf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:42
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
bulkCarnetPdf.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkCarnetPdf.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:42
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
    const bulkCarnetPdfForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkCarnetPdf.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:42
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
        bulkCarnetPdfForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkCarnetPdf.url(options),
            method: 'post',
        })
    
    bulkCarnetPdf.form = bulkCarnetPdfForm
/**
* @see \App\Http\Controllers\Admin\PastorController::update
 * @see app/Http/Controllers/Admin/PastorController.php:301
 * @route '/admin/pastores/{pastore}'
 */
export const update = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/pastores/{pastore}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\PastorController::update
 * @see app/Http/Controllers/Admin/PastorController.php:301
 * @route '/admin/pastores/{pastore}'
 */
update.url = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pastore: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pastore: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pastore: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pastore: typeof args.pastore === 'object'
                ? args.pastore.id
                : args.pastore,
                }

    return update.definition.url
            .replace('{pastore}', parsedArgs.pastore.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorController::update
 * @see app/Http/Controllers/Admin/PastorController.php:301
 * @route '/admin/pastores/{pastore}'
 */
update.put = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\PastorController::update
 * @see app/Http/Controllers/Admin/PastorController.php:301
 * @route '/admin/pastores/{pastore}'
 */
    const updateForm = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorController::update
 * @see app/Http/Controllers/Admin/PastorController.php:301
 * @route '/admin/pastores/{pastore}'
 */
        updateForm.put = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\PastorController::toggleStatus
 * @see app/Http/Controllers/Admin/PastorController.php:425
 * @route '/admin/pastores/{pastore}/toggle-status'
 */
export const toggleStatus = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

toggleStatus.definition = {
    methods: ["post"],
    url: '/admin/pastores/{pastore}/toggle-status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorController::toggleStatus
 * @see app/Http/Controllers/Admin/PastorController.php:425
 * @route '/admin/pastores/{pastore}/toggle-status'
 */
toggleStatus.url = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pastore: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pastore: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pastore: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pastore: typeof args.pastore === 'object'
                ? args.pastore.id
                : args.pastore,
                }

    return toggleStatus.definition.url
            .replace('{pastore}', parsedArgs.pastore.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorController::toggleStatus
 * @see app/Http/Controllers/Admin/PastorController.php:425
 * @route '/admin/pastores/{pastore}/toggle-status'
 */
toggleStatus.post = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: toggleStatus.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorController::toggleStatus
 * @see app/Http/Controllers/Admin/PastorController.php:425
 * @route '/admin/pastores/{pastore}/toggle-status'
 */
    const toggleStatusForm = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: toggleStatus.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorController::toggleStatus
 * @see app/Http/Controllers/Admin/PastorController.php:425
 * @route '/admin/pastores/{pastore}/toggle-status'
 */
        toggleStatusForm.post = (args: { pastore: number | { id: number } } | [pastore: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: toggleStatus.url(args, options),
            method: 'post',
        })
    
    toggleStatus.form = toggleStatusForm
/**
* @see \App\Http\Controllers\Admin\PastorController::bulkDestroy
 * @see app/Http/Controllers/Admin/PastorController.php:438
 * @route '/admin/pastores/bulk-destroy'
 */
export const bulkDestroy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

bulkDestroy.definition = {
    methods: ["post"],
    url: '/admin/pastores/bulk-destroy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorController::bulkDestroy
 * @see app/Http/Controllers/Admin/PastorController.php:438
 * @route '/admin/pastores/bulk-destroy'
 */
bulkDestroy.url = (options?: RouteQueryOptions) => {
    return bulkDestroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorController::bulkDestroy
 * @see app/Http/Controllers/Admin/PastorController.php:438
 * @route '/admin/pastores/bulk-destroy'
 */
bulkDestroy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkDestroy.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorController::bulkDestroy
 * @see app/Http/Controllers/Admin/PastorController.php:438
 * @route '/admin/pastores/bulk-destroy'
 */
    const bulkDestroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkDestroy.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorController::bulkDestroy
 * @see app/Http/Controllers/Admin/PastorController.php:438
 * @route '/admin/pastores/bulk-destroy'
 */
        bulkDestroyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkDestroy.url(options),
            method: 'post',
        })
    
    bulkDestroy.form = bulkDestroyForm
const pastores = {
    index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
edit: Object.assign(edit, edit),
planilla: Object.assign(planilla, planilla),
carnetPdf: Object.assign(carnetPdf, carnetPdf),
bulkCarnetPdf: Object.assign(bulkCarnetPdf, bulkCarnetPdf),
update: Object.assign(update, update),
toggleStatus: Object.assign(toggleStatus, toggleStatus),
bulkDestroy: Object.assign(bulkDestroy, bulkDestroy),
}

export default pastores