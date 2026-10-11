import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
export const registrar = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrar.url(options),
    method: 'post',
})

registrar.definition = {
    methods: ["post"],
    url: '/admin/actividades/asistencias/registrar',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
registrar.url = (options?: RouteQueryOptions) => {
    return registrar.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
registrar.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrar.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
    const registrarForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registrar.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
        registrarForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registrar.url(options),
            method: 'post',
        })
    
    registrar.form = registrarForm
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
export const enrolarRostro = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostro.url(options),
    method: 'post',
})

enrolarRostro.definition = {
    methods: ["post"],
    url: '/admin/actividades/asistencias/enrolar-rostro',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
enrolarRostro.url = (options?: RouteQueryOptions) => {
    return enrolarRostro.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
enrolarRostro.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostro.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
    const enrolarRostroForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enrolarRostro.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
        enrolarRostroForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enrolarRostro.url(options),
            method: 'post',
        })
    
    enrolarRostro.form = enrolarRostroForm
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
export const buscarPastores = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastores.url(options),
    method: 'get',
})

buscarPastores.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/asistencias/buscar-pastores',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores.url = (options?: RouteQueryOptions) => {
    return buscarPastores.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastores.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buscarPastores.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
    const buscarPastoresForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buscarPastores.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
        buscarPastoresForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastores.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
        buscarPastoresForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastores.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buscarPastores.form = buscarPastoresForm
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
export const revertir = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertir.url(args, options),
    method: 'delete',
})

revertir.definition = {
    methods: ["delete"],
    url: '/admin/actividades/asistencias/{asistencia}/revertir',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
revertir.url = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { asistencia: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    asistencia: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        asistencia: args.asistencia,
                }

    return revertir.definition.url
            .replace('{asistencia}', parsedArgs.asistencia.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
revertir.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertir.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
    const revertirForm = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: revertir.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
        revertirForm.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: revertir.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    revertir.form = revertirForm
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:484
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
export const exportMethod = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/exportar-asistencia',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:484
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
exportMethod.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportMethod.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:484
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
exportMethod.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:484
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
exportMethod.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:484
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
    const exportMethodForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:484
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
        exportMethodForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:484
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
        exportMethodForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
const asistencias = {
    registrar: Object.assign(registrar, registrar),
enrolarRostro: Object.assign(enrolarRostro, enrolarRostro),
buscarPastores: Object.assign(buscarPastores, buscarPastores),
revertir: Object.assign(revertir, revertir),
export: Object.assign(exportMethod, exportMethod),
}

export default asistencias