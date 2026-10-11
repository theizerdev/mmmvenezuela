import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ActividadController::index
 * @see app/Http/Controllers/Admin/ActividadController.php:17
 * @route '/admin/actividades'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/actividades',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActividadController::index
 * @see app/Http/Controllers/Admin/ActividadController.php:17
 * @route '/admin/actividades'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActividadController::index
 * @see app/Http/Controllers/Admin/ActividadController.php:17
 * @route '/admin/actividades'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ActividadController::index
 * @see app/Http/Controllers/Admin/ActividadController.php:17
 * @route '/admin/actividades'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ActividadController::index
 * @see app/Http/Controllers/Admin/ActividadController.php:17
 * @route '/admin/actividades'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ActividadController::index
 * @see app/Http/Controllers/Admin/ActividadController.php:17
 * @route '/admin/actividades'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ActividadController::index
 * @see app/Http/Controllers/Admin/ActividadController.php:17
 * @route '/admin/actividades'
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
* @see \App\Http\Controllers\Admin\ActividadController::create
 * @see app/Http/Controllers/Admin/ActividadController.php:91
 * @route '/admin/actividades/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActividadController::create
 * @see app/Http/Controllers/Admin/ActividadController.php:91
 * @route '/admin/actividades/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActividadController::create
 * @see app/Http/Controllers/Admin/ActividadController.php:91
 * @route '/admin/actividades/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ActividadController::create
 * @see app/Http/Controllers/Admin/ActividadController.php:91
 * @route '/admin/actividades/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ActividadController::create
 * @see app/Http/Controllers/Admin/ActividadController.php:91
 * @route '/admin/actividades/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ActividadController::create
 * @see app/Http/Controllers/Admin/ActividadController.php:91
 * @route '/admin/actividades/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ActividadController::create
 * @see app/Http/Controllers/Admin/ActividadController.php:91
 * @route '/admin/actividades/create'
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
* @see \App\Http\Controllers\Admin\ActividadController::store
 * @see app/Http/Controllers/Admin/ActividadController.php:96
 * @route '/admin/actividades'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/actividades',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\ActividadController::store
 * @see app/Http/Controllers/Admin/ActividadController.php:96
 * @route '/admin/actividades'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActividadController::store
 * @see app/Http/Controllers/Admin/ActividadController.php:96
 * @route '/admin/actividades'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\ActividadController::store
 * @see app/Http/Controllers/Admin/ActividadController.php:96
 * @route '/admin/actividades'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ActividadController::store
 * @see app/Http/Controllers/Admin/ActividadController.php:96
 * @route '/admin/actividades'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\ActividadController::edit
 * @see app/Http/Controllers/Admin/ActividadController.php:169
 * @route '/admin/actividades/{actividad}/edit'
 */
export const edit = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActividadController::edit
 * @see app/Http/Controllers/Admin/ActividadController.php:169
 * @route '/admin/actividades/{actividad}/edit'
 */
edit.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { actividad: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    actividad: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        actividad: args.actividad,
                }

    return edit.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActividadController::edit
 * @see app/Http/Controllers/Admin/ActividadController.php:169
 * @route '/admin/actividades/{actividad}/edit'
 */
edit.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ActividadController::edit
 * @see app/Http/Controllers/Admin/ActividadController.php:169
 * @route '/admin/actividades/{actividad}/edit'
 */
edit.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ActividadController::edit
 * @see app/Http/Controllers/Admin/ActividadController.php:169
 * @route '/admin/actividades/{actividad}/edit'
 */
    const editForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: edit.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ActividadController::edit
 * @see app/Http/Controllers/Admin/ActividadController.php:169
 * @route '/admin/actividades/{actividad}/edit'
 */
        editForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: edit.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ActividadController::edit
 * @see app/Http/Controllers/Admin/ActividadController.php:169
 * @route '/admin/actividades/{actividad}/edit'
 */
        editForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\Admin\ActividadController::update
 * @see app/Http/Controllers/Admin/ActividadController.php:174
 * @route '/admin/actividades/{actividad}'
 */
export const update = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/actividades/{actividad}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\ActividadController::update
 * @see app/Http/Controllers/Admin/ActividadController.php:174
 * @route '/admin/actividades/{actividad}'
 */
update.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { actividad: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    actividad: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        actividad: args.actividad,
                }

    return update.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActividadController::update
 * @see app/Http/Controllers/Admin/ActividadController.php:174
 * @route '/admin/actividades/{actividad}'
 */
update.put = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\ActividadController::update
 * @see app/Http/Controllers/Admin/ActividadController.php:174
 * @route '/admin/actividades/{actividad}'
 */
    const updateForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ActividadController::update
 * @see app/Http/Controllers/Admin/ActividadController.php:174
 * @route '/admin/actividades/{actividad}'
 */
        updateForm.put = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ActividadController::destroy
 * @see app/Http/Controllers/Admin/ActividadController.php:263
 * @route '/admin/actividades/{actividad}'
 */
export const destroy = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/actividades/{actividad}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ActividadController::destroy
 * @see app/Http/Controllers/Admin/ActividadController.php:263
 * @route '/admin/actividades/{actividad}'
 */
destroy.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { actividad: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    actividad: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        actividad: args.actividad,
                }

    return destroy.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActividadController::destroy
 * @see app/Http/Controllers/Admin/ActividadController.php:263
 * @route '/admin/actividades/{actividad}'
 */
destroy.delete = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\ActividadController::destroy
 * @see app/Http/Controllers/Admin/ActividadController.php:263
 * @route '/admin/actividades/{actividad}'
 */
    const destroyForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\ActividadController::destroy
 * @see app/Http/Controllers/Admin/ActividadController.php:263
 * @route '/admin/actividades/{actividad}'
 */
        destroyForm.delete = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Admin\ActividadController::monitor
 * @see app/Http/Controllers/Admin/ActividadController.php:275
 * @route '/admin/actividades/{actividad}/monitor'
 */
export const monitor = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monitor.url(args, options),
    method: 'get',
})

monitor.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/monitor',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActividadController::monitor
 * @see app/Http/Controllers/Admin/ActividadController.php:275
 * @route '/admin/actividades/{actividad}/monitor'
 */
monitor.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { actividad: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    actividad: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        actividad: args.actividad,
                }

    return monitor.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActividadController::monitor
 * @see app/Http/Controllers/Admin/ActividadController.php:275
 * @route '/admin/actividades/{actividad}/monitor'
 */
monitor.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: monitor.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\ActividadController::monitor
 * @see app/Http/Controllers/Admin/ActividadController.php:275
 * @route '/admin/actividades/{actividad}/monitor'
 */
monitor.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: monitor.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\ActividadController::monitor
 * @see app/Http/Controllers/Admin/ActividadController.php:275
 * @route '/admin/actividades/{actividad}/monitor'
 */
    const monitorForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: monitor.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\ActividadController::monitor
 * @see app/Http/Controllers/Admin/ActividadController.php:275
 * @route '/admin/actividades/{actividad}/monitor'
 */
        monitorForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: monitor.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\ActividadController::monitor
 * @see app/Http/Controllers/Admin/ActividadController.php:275
 * @route '/admin/actividades/{actividad}/monitor'
 */
        monitorForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: monitor.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    monitor.form = monitorForm
const ActividadController = { index, create, store, edit, update, destroy, monitor }

export default ActividadController