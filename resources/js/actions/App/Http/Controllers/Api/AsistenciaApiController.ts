import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades/activas'
 */
const actividadesActivas37b9e386598124b350fadd70582bc201 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: actividadesActivas37b9e386598124b350fadd70582bc201.url(options),
    method: 'get',
})

actividadesActivas37b9e386598124b350fadd70582bc201.definition = {
    methods: ["get","head"],
    url: '/api/v1/actividades/activas',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades/activas'
 */
actividadesActivas37b9e386598124b350fadd70582bc201.url = (options?: RouteQueryOptions) => {
    return actividadesActivas37b9e386598124b350fadd70582bc201.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades/activas'
 */
actividadesActivas37b9e386598124b350fadd70582bc201.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: actividadesActivas37b9e386598124b350fadd70582bc201.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades/activas'
 */
actividadesActivas37b9e386598124b350fadd70582bc201.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: actividadesActivas37b9e386598124b350fadd70582bc201.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades/activas'
 */
    const actividadesActivas37b9e386598124b350fadd70582bc201Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: actividadesActivas37b9e386598124b350fadd70582bc201.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades/activas'
 */
        actividadesActivas37b9e386598124b350fadd70582bc201Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: actividadesActivas37b9e386598124b350fadd70582bc201.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades/activas'
 */
        actividadesActivas37b9e386598124b350fadd70582bc201Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: actividadesActivas37b9e386598124b350fadd70582bc201.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    actividadesActivas37b9e386598124b350fadd70582bc201.form = actividadesActivas37b9e386598124b350fadd70582bc201Form
    /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades'
 */
const actividadesActivas175e1e355129cd11241e81ef04618141 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: actividadesActivas175e1e355129cd11241e81ef04618141.url(options),
    method: 'get',
})

actividadesActivas175e1e355129cd11241e81ef04618141.definition = {
    methods: ["get","head"],
    url: '/api/v1/actividades',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades'
 */
actividadesActivas175e1e355129cd11241e81ef04618141.url = (options?: RouteQueryOptions) => {
    return actividadesActivas175e1e355129cd11241e81ef04618141.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades'
 */
actividadesActivas175e1e355129cd11241e81ef04618141.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: actividadesActivas175e1e355129cd11241e81ef04618141.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades'
 */
actividadesActivas175e1e355129cd11241e81ef04618141.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: actividadesActivas175e1e355129cd11241e81ef04618141.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades'
 */
    const actividadesActivas175e1e355129cd11241e81ef04618141Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: actividadesActivas175e1e355129cd11241e81ef04618141.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades'
 */
        actividadesActivas175e1e355129cd11241e81ef04618141Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: actividadesActivas175e1e355129cd11241e81ef04618141.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:20
 * @route '/api/v1/actividades'
 */
        actividadesActivas175e1e355129cd11241e81ef04618141Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: actividadesActivas175e1e355129cd11241e81ef04618141.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    actividadesActivas175e1e355129cd11241e81ef04618141.form = actividadesActivas175e1e355129cd11241e81ef04618141Form

/**
* Multiple routes resolve to \App\Http\Controllers\Api\AsistenciaApiController::actividadesActivas, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `actividadesActivas['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const actividadesActivas = {
    '/api/v1/actividades/activas': actividadesActivas37b9e386598124b350fadd70582bc201,
    '/api/v1/actividades': actividadesActivas175e1e355129cd11241e81ef04618141,
}

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::buscarPastor
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:87
 * @route '/api/v1/pastores/buscar'
 */
export const buscarPastor = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastor.url(options),
    method: 'get',
})

buscarPastor.definition = {
    methods: ["get","head"],
    url: '/api/v1/pastores/buscar',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::buscarPastor
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:87
 * @route '/api/v1/pastores/buscar'
 */
buscarPastor.url = (options?: RouteQueryOptions) => {
    return buscarPastor.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::buscarPastor
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:87
 * @route '/api/v1/pastores/buscar'
 */
buscarPastor.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastor.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::buscarPastor
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:87
 * @route '/api/v1/pastores/buscar'
 */
buscarPastor.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buscarPastor.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::buscarPastor
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:87
 * @route '/api/v1/pastores/buscar'
 */
    const buscarPastorForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buscarPastor.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::buscarPastor
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:87
 * @route '/api/v1/pastores/buscar'
 */
        buscarPastorForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastor.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::buscarPastor
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:87
 * @route '/api/v1/pastores/buscar'
 */
        buscarPastorForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastor.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buscarPastor.form = buscarPastorForm
/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::registrarAsistencia
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:156
 * @route '/api/v1/asistencias/registrar'
 */
export const registrarAsistencia = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarAsistencia.url(options),
    method: 'post',
})

registrarAsistencia.definition = {
    methods: ["post"],
    url: '/api/v1/asistencias/registrar',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::registrarAsistencia
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:156
 * @route '/api/v1/asistencias/registrar'
 */
registrarAsistencia.url = (options?: RouteQueryOptions) => {
    return registrarAsistencia.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::registrarAsistencia
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:156
 * @route '/api/v1/asistencias/registrar'
 */
registrarAsistencia.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarAsistencia.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::registrarAsistencia
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:156
 * @route '/api/v1/asistencias/registrar'
 */
    const registrarAsistenciaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registrarAsistencia.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::registrarAsistencia
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:156
 * @route '/api/v1/asistencias/registrar'
 */
        registrarAsistenciaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registrarAsistencia.url(options),
            method: 'post',
        })
    
    registrarAsistencia.form = registrarAsistenciaForm
/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::ultimosEscaneos
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:375
 * @route '/api/v1/actividades/{actividad}/ultimos-escaneos'
 */
export const ultimosEscaneos = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ultimosEscaneos.url(args, options),
    method: 'get',
})

ultimosEscaneos.definition = {
    methods: ["get","head"],
    url: '/api/v1/actividades/{actividad}/ultimos-escaneos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::ultimosEscaneos
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:375
 * @route '/api/v1/actividades/{actividad}/ultimos-escaneos'
 */
ultimosEscaneos.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return ultimosEscaneos.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::ultimosEscaneos
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:375
 * @route '/api/v1/actividades/{actividad}/ultimos-escaneos'
 */
ultimosEscaneos.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ultimosEscaneos.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\AsistenciaApiController::ultimosEscaneos
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:375
 * @route '/api/v1/actividades/{actividad}/ultimos-escaneos'
 */
ultimosEscaneos.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ultimosEscaneos.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::ultimosEscaneos
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:375
 * @route '/api/v1/actividades/{actividad}/ultimos-escaneos'
 */
    const ultimosEscaneosForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: ultimosEscaneos.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::ultimosEscaneos
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:375
 * @route '/api/v1/actividades/{actividad}/ultimos-escaneos'
 */
        ultimosEscaneosForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ultimosEscaneos.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\AsistenciaApiController::ultimosEscaneos
 * @see app/Http/Controllers/Api/AsistenciaApiController.php:375
 * @route '/api/v1/actividades/{actividad}/ultimos-escaneos'
 */
        ultimosEscaneosForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: ultimosEscaneos.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    ultimosEscaneos.form = ultimosEscaneosForm
const AsistenciaApiController = { actividadesActivas, buscarPastor, registrarAsistencia, ultimosEscaneos }

export default AsistenciaApiController