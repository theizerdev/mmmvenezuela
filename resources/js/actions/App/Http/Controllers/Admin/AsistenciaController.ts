import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/admin/actividades/{actividad}/escanear'
 */
const scanner54c63c9eae9aa2719ef0ca57e75d2ddb = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
    method: 'get',
})

scanner54c63c9eae9aa2719ef0ca57e75d2ddb.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/escanear',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/admin/actividades/{actividad}/escanear'
 */
scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return scanner54c63c9eae9aa2719ef0ca57e75d2ddb.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/admin/actividades/{actividad}/escanear'
 */
scanner54c63c9eae9aa2719ef0ca57e75d2ddb.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/admin/actividades/{actividad}/escanear'
 */
scanner54c63c9eae9aa2719ef0ca57e75d2ddb.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/admin/actividades/{actividad}/escanear'
 */
    const scanner54c63c9eae9aa2719ef0ca57e75d2ddbForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/admin/actividades/{actividad}/escanear'
 */
        scanner54c63c9eae9aa2719ef0ca57e75d2ddbForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/admin/actividades/{actividad}/escanear'
 */
        scanner54c63c9eae9aa2719ef0ca57e75d2ddbForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    scanner54c63c9eae9aa2719ef0ca57e75d2ddb.form = scanner54c63c9eae9aa2719ef0ca57e75d2ddbForm
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/actividades/{actividad}/escanear'
 */
const scanner7b96cc10e3ee0d3adca0340068715b9b = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
    method: 'get',
})

scanner7b96cc10e3ee0d3adca0340068715b9b.definition = {
    methods: ["get","head"],
    url: '/actividades/{actividad}/escanear',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/actividades/{actividad}/escanear'
 */
scanner7b96cc10e3ee0d3adca0340068715b9b.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return scanner7b96cc10e3ee0d3adca0340068715b9b.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/actividades/{actividad}/escanear'
 */
scanner7b96cc10e3ee0d3adca0340068715b9b.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/actividades/{actividad}/escanear'
 */
scanner7b96cc10e3ee0d3adca0340068715b9b.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/actividades/{actividad}/escanear'
 */
    const scanner7b96cc10e3ee0d3adca0340068715b9bForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/actividades/{actividad}/escanear'
 */
        scanner7b96cc10e3ee0d3adca0340068715b9bForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:21
 * @route '/actividades/{actividad}/escanear'
 */
        scanner7b96cc10e3ee0d3adca0340068715b9bForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    scanner7b96cc10e3ee0d3adca0340068715b9b.form = scanner7b96cc10e3ee0d3adca0340068715b9bForm

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::scanner, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `scanner['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const scanner = {
    '/admin/actividades/{actividad}/escanear': scanner54c63c9eae9aa2719ef0ca57e75d2ddb,
    '/actividades/{actividad}/escanear': scanner7b96cc10e3ee0d3adca0340068715b9b,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
const registrarced1926607ac828774fabc913273fe0c = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarced1926607ac828774fabc913273fe0c.url(options),
    method: 'post',
})

registrarced1926607ac828774fabc913273fe0c.definition = {
    methods: ["post"],
    url: '/admin/actividades/asistencias/registrar',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
registrarced1926607ac828774fabc913273fe0c.url = (options?: RouteQueryOptions) => {
    return registrarced1926607ac828774fabc913273fe0c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
registrarced1926607ac828774fabc913273fe0c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarced1926607ac828774fabc913273fe0c.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
    const registrarced1926607ac828774fabc913273fe0cForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registrarced1926607ac828774fabc913273fe0c.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/admin/actividades/asistencias/registrar'
 */
        registrarced1926607ac828774fabc913273fe0cForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registrarced1926607ac828774fabc913273fe0c.url(options),
            method: 'post',
        })
    
    registrarced1926607ac828774fabc913273fe0c.form = registrarced1926607ac828774fabc913273fe0cForm
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/actividades/asistencias/registrar'
 */
const registrarfa6699d26865f666949ba8a11f59e3fe = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarfa6699d26865f666949ba8a11f59e3fe.url(options),
    method: 'post',
})

registrarfa6699d26865f666949ba8a11f59e3fe.definition = {
    methods: ["post"],
    url: '/actividades/asistencias/registrar',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/actividades/asistencias/registrar'
 */
registrarfa6699d26865f666949ba8a11f59e3fe.url = (options?: RouteQueryOptions) => {
    return registrarfa6699d26865f666949ba8a11f59e3fe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/actividades/asistencias/registrar'
 */
registrarfa6699d26865f666949ba8a11f59e3fe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarfa6699d26865f666949ba8a11f59e3fe.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/actividades/asistencias/registrar'
 */
    const registrarfa6699d26865f666949ba8a11f59e3feForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registrarfa6699d26865f666949ba8a11f59e3fe.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:97
 * @route '/actividades/asistencias/registrar'
 */
        registrarfa6699d26865f666949ba8a11f59e3feForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registrarfa6699d26865f666949ba8a11f59e3fe.url(options),
            method: 'post',
        })
    
    registrarfa6699d26865f666949ba8a11f59e3fe.form = registrarfa6699d26865f666949ba8a11f59e3feForm

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::registrar, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `registrar['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const registrar = {
    '/admin/actividades/asistencias/registrar': registrarced1926607ac828774fabc913273fe0c,
    '/actividades/asistencias/registrar': registrarfa6699d26865f666949ba8a11f59e3fe,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
const enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url(options),
    method: 'post',
})

enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.definition = {
    methods: ["post"],
    url: '/admin/actividades/asistencias/enrolar-rostro',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url = (options?: RouteQueryOptions) => {
    return enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
    const enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
        enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url(options),
            method: 'post',
        })
    
    enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.form = enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0Form
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/actividades/asistencias/enrolar-rostro'
 */
const enrolarRostrof70604ef4d31408f12dbfccad6a369e0 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url(options),
    method: 'post',
})

enrolarRostrof70604ef4d31408f12dbfccad6a369e0.definition = {
    methods: ["post"],
    url: '/actividades/asistencias/enrolar-rostro',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/actividades/asistencias/enrolar-rostro'
 */
enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url = (options?: RouteQueryOptions) => {
    return enrolarRostrof70604ef4d31408f12dbfccad6a369e0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/actividades/asistencias/enrolar-rostro'
 */
enrolarRostrof70604ef4d31408f12dbfccad6a369e0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/actividades/asistencias/enrolar-rostro'
 */
    const enrolarRostrof70604ef4d31408f12dbfccad6a369e0Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:272
 * @route '/actividades/asistencias/enrolar-rostro'
 */
        enrolarRostrof70604ef4d31408f12dbfccad6a369e0Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url(options),
            method: 'post',
        })
    
    enrolarRostrof70604ef4d31408f12dbfccad6a369e0.form = enrolarRostrof70604ef4d31408f12dbfccad6a369e0Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `enrolarRostro['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const enrolarRostro = {
    '/admin/actividades/asistencias/enrolar-rostro': enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0,
    '/actividades/asistencias/enrolar-rostro': enrolarRostrof70604ef4d31408f12dbfccad6a369e0,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
const buscarPastores0efce1fc19105db9dd749ad1d9b68072 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
    method: 'get',
})

buscarPastores0efce1fc19105db9dd749ad1d9b68072.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/asistencias/buscar-pastores',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores0efce1fc19105db9dd749ad1d9b68072.url = (options?: RouteQueryOptions) => {
    return buscarPastores0efce1fc19105db9dd749ad1d9b68072.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores0efce1fc19105db9dd749ad1d9b68072.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores0efce1fc19105db9dd749ad1d9b68072.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
    const buscarPastores0efce1fc19105db9dd749ad1d9b68072Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
        buscarPastores0efce1fc19105db9dd749ad1d9b68072Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
        buscarPastores0efce1fc19105db9dd749ad1d9b68072Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buscarPastores0efce1fc19105db9dd749ad1d9b68072.form = buscarPastores0efce1fc19105db9dd749ad1d9b68072Form
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/actividades/asistencias/buscar-pastores'
 */
const buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
    method: 'get',
})

buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.definition = {
    methods: ["get","head"],
    url: '/actividades/asistencias/buscar-pastores',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/actividades/asistencias/buscar-pastores'
 */
buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url = (options?: RouteQueryOptions) => {
    return buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/actividades/asistencias/buscar-pastores'
 */
buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/actividades/asistencias/buscar-pastores'
 */
buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/actividades/asistencias/buscar-pastores'
 */
    const buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebdForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/actividades/asistencias/buscar-pastores'
 */
        buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebdForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:428
 * @route '/actividades/asistencias/buscar-pastores'
 */
        buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebdForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.form = buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebdForm

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::buscarPastores, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `buscarPastores['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const buscarPastores = {
    '/admin/actividades/asistencias/buscar-pastores': buscarPastores0efce1fc19105db9dd749ad1d9b68072,
    '/actividades/asistencias/buscar-pastores': buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
const revertir7388346d9d7b4ed0741ace909f8ea2ab = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertir7388346d9d7b4ed0741ace909f8ea2ab.url(args, options),
    method: 'delete',
})

revertir7388346d9d7b4ed0741ace909f8ea2ab.definition = {
    methods: ["delete"],
    url: '/admin/actividades/asistencias/{asistencia}/revertir',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
revertir7388346d9d7b4ed0741ace909f8ea2ab.url = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return revertir7388346d9d7b4ed0741ace909f8ea2ab.definition.url
            .replace('{asistencia}', parsedArgs.asistencia.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
revertir7388346d9d7b4ed0741ace909f8ea2ab.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertir7388346d9d7b4ed0741ace909f8ea2ab.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
    const revertir7388346d9d7b4ed0741ace909f8ea2abForm = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: revertir7388346d9d7b4ed0741ace909f8ea2ab.url(args, {
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
        revertir7388346d9d7b4ed0741ace909f8ea2abForm.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: revertir7388346d9d7b4ed0741ace909f8ea2ab.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    revertir7388346d9d7b4ed0741ace909f8ea2ab.form = revertir7388346d9d7b4ed0741ace909f8ea2abForm
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/actividades/asistencias/{asistencia}/revertir'
 */
const revertird0e3a5eb593cdaa2cf81734eb2805318 = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertird0e3a5eb593cdaa2cf81734eb2805318.url(args, options),
    method: 'delete',
})

revertird0e3a5eb593cdaa2cf81734eb2805318.definition = {
    methods: ["delete"],
    url: '/actividades/asistencias/{asistencia}/revertir',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/actividades/asistencias/{asistencia}/revertir'
 */
revertird0e3a5eb593cdaa2cf81734eb2805318.url = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return revertird0e3a5eb593cdaa2cf81734eb2805318.definition.url
            .replace('{asistencia}', parsedArgs.asistencia.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/actividades/asistencias/{asistencia}/revertir'
 */
revertird0e3a5eb593cdaa2cf81734eb2805318.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertird0e3a5eb593cdaa2cf81734eb2805318.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:466
 * @route '/actividades/asistencias/{asistencia}/revertir'
 */
    const revertird0e3a5eb593cdaa2cf81734eb2805318Form = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: revertird0e3a5eb593cdaa2cf81734eb2805318.url(args, {
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
 * @route '/actividades/asistencias/{asistencia}/revertir'
 */
        revertird0e3a5eb593cdaa2cf81734eb2805318Form.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: revertird0e3a5eb593cdaa2cf81734eb2805318.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    revertird0e3a5eb593cdaa2cf81734eb2805318.form = revertird0e3a5eb593cdaa2cf81734eb2805318Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::revertir, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `revertir['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const revertir = {
    '/admin/actividades/asistencias/{asistencia}/revertir': revertir7388346d9d7b4ed0741ace909f8ea2ab,
    '/actividades/asistencias/{asistencia}/revertir': revertird0e3a5eb593cdaa2cf81734eb2805318,
}

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
const AsistenciaController = { scanner, registrar, enrolarRostro, buscarPastores, revertir, exportMethod, export: exportMethod }

export default AsistenciaController