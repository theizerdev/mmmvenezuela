import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/admin/actividades/{actividad}/escanear'
 */
scanner54c63c9eae9aa2719ef0ca57e75d2ddb.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/admin/actividades/{actividad}/escanear'
 */
scanner54c63c9eae9aa2719ef0ca57e75d2ddb.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/admin/actividades/{actividad}/escanear'
 */
    const scanner54c63c9eae9aa2719ef0ca57e75d2ddbForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/admin/actividades/{actividad}/escanear'
 */
        scanner54c63c9eae9aa2719ef0ca57e75d2ddbForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scanner54c63c9eae9aa2719ef0ca57e75d2ddb.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
scanner7b96cc10e3ee0d3adca0340068715b9b.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
scanner7b96cc10e3ee0d3adca0340068715b9b.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
    const scanner7b96cc10e3ee0d3adca0340068715b9bForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
        scanner7b96cc10e3ee0d3adca0340068715b9bForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: scanner7b96cc10e3ee0d3adca0340068715b9b.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::scanner
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
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
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `scanner['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const scanner = {
    '/admin/actividades/{actividad}/escanear': scanner54c63c9eae9aa2719ef0ca57e75d2ddb,
    '/actividades/{actividad}/escanear': scanner7b96cc10e3ee0d3adca0340068715b9b,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/admin/actividades/asistencias/registrar'
 */
registrarced1926607ac828774fabc913273fe0c.url = (options?: RouteQueryOptions) => {
    return registrarced1926607ac828774fabc913273fe0c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/admin/actividades/asistencias/registrar'
 */
registrarced1926607ac828774fabc913273fe0c.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarced1926607ac828774fabc913273fe0c.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/admin/actividades/asistencias/registrar'
 */
    const registrarced1926607ac828774fabc913273fe0cForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registrarced1926607ac828774fabc913273fe0c.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/admin/actividades/asistencias/registrar'
 */
        registrarced1926607ac828774fabc913273fe0cForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registrarced1926607ac828774fabc913273fe0c.url(options),
            method: 'post',
        })
    
    registrarced1926607ac828774fabc913273fe0c.form = registrarced1926607ac828774fabc913273fe0cForm
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/actividades/asistencias/registrar'
 */
registrarfa6699d26865f666949ba8a11f59e3fe.url = (options?: RouteQueryOptions) => {
    return registrarfa6699d26865f666949ba8a11f59e3fe.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/actividades/asistencias/registrar'
 */
registrarfa6699d26865f666949ba8a11f59e3fe.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: registrarfa6699d26865f666949ba8a11f59e3fe.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/actividades/asistencias/registrar'
 */
    const registrarfa6699d26865f666949ba8a11f59e3feForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: registrarfa6699d26865f666949ba8a11f59e3fe.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::registrar
 * @see app/Http/Controllers/Admin/AsistenciaController.php:104
 * @route '/actividades/asistencias/registrar'
 */
        registrarfa6699d26865f666949ba8a11f59e3feForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: registrarfa6699d26865f666949ba8a11f59e3fe.url(options),
            method: 'post',
        })
    
    registrarfa6699d26865f666949ba8a11f59e3fe.form = registrarfa6699d26865f666949ba8a11f59e3feForm

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::registrar, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `registrar['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const registrar = {
    '/admin/actividades/asistencias/registrar': registrarced1926607ac828774fabc913273fe0c,
    '/actividades/asistencias/registrar': registrarfa6699d26865f666949ba8a11f59e3fe,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url = (options?: RouteQueryOptions) => {
    return enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
    const enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/admin/actividades/asistencias/enrolar-rostro'
 */
        enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.url(options),
            method: 'post',
        })
    
    enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0.form = enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0Form
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/actividades/asistencias/enrolar-rostro'
 */
enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url = (options?: RouteQueryOptions) => {
    return enrolarRostrof70604ef4d31408f12dbfccad6a369e0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/actividades/asistencias/enrolar-rostro'
 */
enrolarRostrof70604ef4d31408f12dbfccad6a369e0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/actividades/asistencias/enrolar-rostro'
 */
    const enrolarRostrof70604ef4d31408f12dbfccad6a369e0Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro
 * @see app/Http/Controllers/Admin/AsistenciaController.php:339
 * @route '/actividades/asistencias/enrolar-rostro'
 */
        enrolarRostrof70604ef4d31408f12dbfccad6a369e0Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: enrolarRostrof70604ef4d31408f12dbfccad6a369e0.url(options),
            method: 'post',
        })
    
    enrolarRostrof70604ef4d31408f12dbfccad6a369e0.form = enrolarRostrof70604ef4d31408f12dbfccad6a369e0Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::enrolarRostro, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `enrolarRostro['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const enrolarRostro = {
    '/admin/actividades/asistencias/enrolar-rostro': enrolarRostroc7c61b7bbaddad4748d0230bad92dfd0,
    '/actividades/asistencias/enrolar-rostro': enrolarRostrof70604ef4d31408f12dbfccad6a369e0,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores0efce1fc19105db9dd749ad1d9b68072.url = (options?: RouteQueryOptions) => {
    return buscarPastores0efce1fc19105db9dd749ad1d9b68072.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores0efce1fc19105db9dd749ad1d9b68072.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
buscarPastores0efce1fc19105db9dd749ad1d9b68072.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
    const buscarPastores0efce1fc19105db9dd749ad1d9b68072Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/admin/actividades/asistencias/buscar-pastores'
 */
        buscarPastores0efce1fc19105db9dd749ad1d9b68072Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastores0efce1fc19105db9dd749ad1d9b68072.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/actividades/asistencias/buscar-pastores'
 */
buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url = (options?: RouteQueryOptions) => {
    return buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/actividades/asistencias/buscar-pastores'
 */
buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/actividades/asistencias/buscar-pastores'
 */
buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/actividades/asistencias/buscar-pastores'
 */
    const buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebdForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
 * @route '/actividades/asistencias/buscar-pastores'
 */
        buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebdForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::buscarPastores
 * @see app/Http/Controllers/Admin/AsistenciaController.php:497
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
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `buscarPastores['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const buscarPastores = {
    '/admin/actividades/asistencias/buscar-pastores': buscarPastores0efce1fc19105db9dd749ad1d9b68072,
    '/actividades/asistencias/buscar-pastores': buscarPastoresa65fc48ae153fe1c4567f9cfa38f3ebd,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
 * @route '/admin/actividades/asistencias/{asistencia}/revertir'
 */
revertir7388346d9d7b4ed0741ace909f8ea2ab.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertir7388346d9d7b4ed0741ace909f8ea2ab.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
 * @route '/actividades/asistencias/{asistencia}/revertir'
 */
revertird0e3a5eb593cdaa2cf81734eb2805318.delete = (args: { asistencia: string | number } | [asistencia: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: revertird0e3a5eb593cdaa2cf81734eb2805318.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::revertir
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:541
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
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `revertir['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const revertir = {
    '/admin/actividades/asistencias/{asistencia}/revertir': revertir7388346d9d7b4ed0741ace909f8ea2ab,
    '/actividades/asistencias/{asistencia}/revertir': revertird0e3a5eb593cdaa2cf81734eb2805318,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/admin/actividades/{actividad}/sesion-info'
 */
const obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.url(args, options),
    method: 'get',
})

obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/sesion-info',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/admin/actividades/{actividad}/sesion-info'
 */
obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/admin/actividades/{actividad}/sesion-info'
 */
obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/admin/actividades/{actividad}/sesion-info'
 */
obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/admin/actividades/{actividad}/sesion-info'
 */
    const obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2dForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/admin/actividades/{actividad}/sesion-info'
 */
        obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2dForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/admin/actividades/{actividad}/sesion-info'
 */
        obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2dForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d.form = obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2dForm
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/actividades/{actividad}/sesion-info'
 */
const obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57 = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.url(args, options),
    method: 'get',
})

obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.definition = {
    methods: ["get","head"],
    url: '/actividades/{actividad}/sesion-info',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/actividades/{actividad}/sesion-info'
 */
obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/actividades/{actividad}/sesion-info'
 */
obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/actividades/{actividad}/sesion-info'
 */
obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/actividades/{actividad}/sesion-info'
 */
    const obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57Form = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/actividades/{actividad}/sesion-info'
 */
        obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57Form.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo
 * @see app/Http/Controllers/Admin/AsistenciaController.php:714
 * @route '/actividades/{actividad}/sesion-info'
 */
        obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57Form.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57.form = obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::obtenerSesionInfo, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `obtenerSesionInfo['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const obtenerSesionInfo = {
    '/admin/actividades/{actividad}/sesion-info': obtenerSesionInfo3b4debd50ebba28463d2d66f62cc6f2d,
    '/actividades/{actividad}/sesion-info': obtenerSesionInfo988f0e38d68b15811dfff2fad0e34b57,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/admin/actividades/{actividad}/crear-sesion-rapida'
 */
const crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65 = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.url(args, options),
    method: 'post',
})

crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.definition = {
    methods: ["post"],
    url: '/admin/actividades/{actividad}/crear-sesion-rapida',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/admin/actividades/{actividad}/crear-sesion-rapida'
 */
crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/admin/actividades/{actividad}/crear-sesion-rapida'
 */
crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/admin/actividades/{actividad}/crear-sesion-rapida'
 */
    const crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65Form = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/admin/actividades/{actividad}/crear-sesion-rapida'
 */
        crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65Form.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.url(args, options),
            method: 'post',
        })
    
    crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65.form = crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65Form
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/actividades/{actividad}/crear-sesion-rapida'
 */
const crearSesionRapidadf535cde05c6ee146a324a3da91aedb9 = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.url(args, options),
    method: 'post',
})

crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.definition = {
    methods: ["post"],
    url: '/actividades/{actividad}/crear-sesion-rapida',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/actividades/{actividad}/crear-sesion-rapida'
 */
crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/actividades/{actividad}/crear-sesion-rapida'
 */
crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/actividades/{actividad}/crear-sesion-rapida'
 */
    const crearSesionRapidadf535cde05c6ee146a324a3da91aedb9Form = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida
 * @see app/Http/Controllers/Admin/AsistenciaController.php:740
 * @route '/actividades/{actividad}/crear-sesion-rapida'
 */
        crearSesionRapidadf535cde05c6ee146a324a3da91aedb9Form.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.url(args, options),
            method: 'post',
        })
    
    crearSesionRapidadf535cde05c6ee146a324a3da91aedb9.form = crearSesionRapidadf535cde05c6ee146a324a3da91aedb9Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::crearSesionRapida, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `crearSesionRapida['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const crearSesionRapida = {
    '/admin/actividades/{actividad}/crear-sesion-rapida': crearSesionRapida9f4c6f131e44638e7af6135c2fa5ad65,
    '/actividades/{actividad}/crear-sesion-rapida': crearSesionRapidadf535cde05c6ee146a324a3da91aedb9,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/admin/actividades/{actividad}/activar-sesion'
 */
const activarSesionc54b7670ba5aebb57c27247e9c005de4 = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activarSesionc54b7670ba5aebb57c27247e9c005de4.url(args, options),
    method: 'post',
})

activarSesionc54b7670ba5aebb57c27247e9c005de4.definition = {
    methods: ["post"],
    url: '/admin/actividades/{actividad}/activar-sesion',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/admin/actividades/{actividad}/activar-sesion'
 */
activarSesionc54b7670ba5aebb57c27247e9c005de4.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return activarSesionc54b7670ba5aebb57c27247e9c005de4.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/admin/actividades/{actividad}/activar-sesion'
 */
activarSesionc54b7670ba5aebb57c27247e9c005de4.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activarSesionc54b7670ba5aebb57c27247e9c005de4.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/admin/actividades/{actividad}/activar-sesion'
 */
    const activarSesionc54b7670ba5aebb57c27247e9c005de4Form = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: activarSesionc54b7670ba5aebb57c27247e9c005de4.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/admin/actividades/{actividad}/activar-sesion'
 */
        activarSesionc54b7670ba5aebb57c27247e9c005de4Form.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: activarSesionc54b7670ba5aebb57c27247e9c005de4.url(args, options),
            method: 'post',
        })
    
    activarSesionc54b7670ba5aebb57c27247e9c005de4.form = activarSesionc54b7670ba5aebb57c27247e9c005de4Form
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/actividades/{actividad}/activar-sesion'
 */
const activarSesione2a54dbd504c877b6b7cc7962a5dcc91 = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activarSesione2a54dbd504c877b6b7cc7962a5dcc91.url(args, options),
    method: 'post',
})

activarSesione2a54dbd504c877b6b7cc7962a5dcc91.definition = {
    methods: ["post"],
    url: '/actividades/{actividad}/activar-sesion',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/actividades/{actividad}/activar-sesion'
 */
activarSesione2a54dbd504c877b6b7cc7962a5dcc91.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return activarSesione2a54dbd504c877b6b7cc7962a5dcc91.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/actividades/{actividad}/activar-sesion'
 */
activarSesione2a54dbd504c877b6b7cc7962a5dcc91.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: activarSesione2a54dbd504c877b6b7cc7962a5dcc91.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/actividades/{actividad}/activar-sesion'
 */
    const activarSesione2a54dbd504c877b6b7cc7962a5dcc91Form = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: activarSesione2a54dbd504c877b6b7cc7962a5dcc91.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::activarSesion
 * @see app/Http/Controllers/Admin/AsistenciaController.php:774
 * @route '/actividades/{actividad}/activar-sesion'
 */
        activarSesione2a54dbd504c877b6b7cc7962a5dcc91Form.post = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: activarSesione2a54dbd504c877b6b7cc7962a5dcc91.url(args, options),
            method: 'post',
        })
    
    activarSesione2a54dbd504c877b6b7cc7962a5dcc91.form = activarSesione2a54dbd504c877b6b7cc7962a5dcc91Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::activarSesion, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `activarSesion['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const activarSesion = {
    '/admin/actividades/{actividad}/activar-sesion': activarSesionc54b7670ba5aebb57c27247e9c005de4,
    '/actividades/{actividad}/activar-sesion': activarSesione2a54dbd504c877b6b7cc7962a5dcc91,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/admin/actividades/{actividad}/padron-offline'
 */
const padronOffline495c1a374c0c6ac3f031733b8acdd12d = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: padronOffline495c1a374c0c6ac3f031733b8acdd12d.url(args, options),
    method: 'get',
})

padronOffline495c1a374c0c6ac3f031733b8acdd12d.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/padron-offline',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/admin/actividades/{actividad}/padron-offline'
 */
padronOffline495c1a374c0c6ac3f031733b8acdd12d.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return padronOffline495c1a374c0c6ac3f031733b8acdd12d.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/admin/actividades/{actividad}/padron-offline'
 */
padronOffline495c1a374c0c6ac3f031733b8acdd12d.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: padronOffline495c1a374c0c6ac3f031733b8acdd12d.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/admin/actividades/{actividad}/padron-offline'
 */
padronOffline495c1a374c0c6ac3f031733b8acdd12d.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: padronOffline495c1a374c0c6ac3f031733b8acdd12d.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/admin/actividades/{actividad}/padron-offline'
 */
    const padronOffline495c1a374c0c6ac3f031733b8acdd12dForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: padronOffline495c1a374c0c6ac3f031733b8acdd12d.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/admin/actividades/{actividad}/padron-offline'
 */
        padronOffline495c1a374c0c6ac3f031733b8acdd12dForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: padronOffline495c1a374c0c6ac3f031733b8acdd12d.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/admin/actividades/{actividad}/padron-offline'
 */
        padronOffline495c1a374c0c6ac3f031733b8acdd12dForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: padronOffline495c1a374c0c6ac3f031733b8acdd12d.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    padronOffline495c1a374c0c6ac3f031733b8acdd12d.form = padronOffline495c1a374c0c6ac3f031733b8acdd12dForm
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/actividades/{actividad}/padron-offline'
 */
const padronOffline06aed0a8d5f39d130b038b38469fe99f = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: padronOffline06aed0a8d5f39d130b038b38469fe99f.url(args, options),
    method: 'get',
})

padronOffline06aed0a8d5f39d130b038b38469fe99f.definition = {
    methods: ["get","head"],
    url: '/actividades/{actividad}/padron-offline',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/actividades/{actividad}/padron-offline'
 */
padronOffline06aed0a8d5f39d130b038b38469fe99f.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return padronOffline06aed0a8d5f39d130b038b38469fe99f.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/actividades/{actividad}/padron-offline'
 */
padronOffline06aed0a8d5f39d130b038b38469fe99f.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: padronOffline06aed0a8d5f39d130b038b38469fe99f.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/actividades/{actividad}/padron-offline'
 */
padronOffline06aed0a8d5f39d130b038b38469fe99f.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: padronOffline06aed0a8d5f39d130b038b38469fe99f.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/actividades/{actividad}/padron-offline'
 */
    const padronOffline06aed0a8d5f39d130b038b38469fe99fForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: padronOffline06aed0a8d5f39d130b038b38469fe99f.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/actividades/{actividad}/padron-offline'
 */
        padronOffline06aed0a8d5f39d130b038b38469fe99fForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: padronOffline06aed0a8d5f39d130b038b38469fe99f.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::padronOffline
 * @see app/Http/Controllers/Admin/AsistenciaController.php:813
 * @route '/actividades/{actividad}/padron-offline'
 */
        padronOffline06aed0a8d5f39d130b038b38469fe99fForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: padronOffline06aed0a8d5f39d130b038b38469fe99f.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    padronOffline06aed0a8d5f39d130b038b38469fe99f.form = padronOffline06aed0a8d5f39d130b038b38469fe99fForm

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::padronOffline, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `padronOffline['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const padronOffline = {
    '/admin/actividades/{actividad}/padron-offline': padronOffline495c1a374c0c6ac3f031733b8acdd12d,
    '/actividades/{actividad}/padron-offline': padronOffline06aed0a8d5f39d130b038b38469fe99f,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/admin/actividades/asistencias/sincronizar-lote'
 */
const sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.url(options),
    method: 'post',
})

sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.definition = {
    methods: ["post"],
    url: '/admin/actividades/asistencias/sincronizar-lote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/admin/actividades/asistencias/sincronizar-lote'
 */
sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.url = (options?: RouteQueryOptions) => {
    return sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/admin/actividades/asistencias/sincronizar-lote'
 */
sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/admin/actividades/asistencias/sincronizar-lote'
 */
    const sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/admin/actividades/asistencias/sincronizar-lote'
 */
        sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.url(options),
            method: 'post',
        })
    
    sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93.form = sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93Form
    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/actividades/asistencias/sincronizar-lote'
 */
const sincronizarLotef126b0349c7c56470d9174098dab2772 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sincronizarLotef126b0349c7c56470d9174098dab2772.url(options),
    method: 'post',
})

sincronizarLotef126b0349c7c56470d9174098dab2772.definition = {
    methods: ["post"],
    url: '/actividades/asistencias/sincronizar-lote',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/actividades/asistencias/sincronizar-lote'
 */
sincronizarLotef126b0349c7c56470d9174098dab2772.url = (options?: RouteQueryOptions) => {
    return sincronizarLotef126b0349c7c56470d9174098dab2772.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/actividades/asistencias/sincronizar-lote'
 */
sincronizarLotef126b0349c7c56470d9174098dab2772.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sincronizarLotef126b0349c7c56470d9174098dab2772.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/actividades/asistencias/sincronizar-lote'
 */
    const sincronizarLotef126b0349c7c56470d9174098dab2772Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sincronizarLotef126b0349c7c56470d9174098dab2772.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote
 * @see app/Http/Controllers/Admin/AsistenciaController.php:870
 * @route '/actividades/asistencias/sincronizar-lote'
 */
        sincronizarLotef126b0349c7c56470d9174098dab2772Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sincronizarLotef126b0349c7c56470d9174098dab2772.url(options),
            method: 'post',
        })
    
    sincronizarLotef126b0349c7c56470d9174098dab2772.form = sincronizarLotef126b0349c7c56470d9174098dab2772Form

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\AsistenciaController::sincronizarLote, so this export is a
* dictionary keyed by URI rather than a callable, with the verbs prefixed where two routes share a URI.
* Call a specific route with `sincronizarLote['<key>'](...)`, or import the route by name from your
* generated `routes/` directory.
*/
export const sincronizarLote = {
    '/admin/actividades/asistencias/sincronizar-lote': sincronizarLote9eaf6a6b7cc4c4ce0cfb739994f35d93,
    '/actividades/asistencias/sincronizar-lote': sincronizarLotef126b0349c7c56470d9174098dab2772,
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportExcel
 * @see app/Http/Controllers/Admin/AsistenciaController.php:562
 * @route '/admin/actividades/{actividad}/exportar-excel'
 */
export const exportExcel = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportExcel.url(args, options),
    method: 'get',
})

exportExcel.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/exportar-excel',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportExcel
 * @see app/Http/Controllers/Admin/AsistenciaController.php:562
 * @route '/admin/actividades/{actividad}/exportar-excel'
 */
exportExcel.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportExcel.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportExcel
 * @see app/Http/Controllers/Admin/AsistenciaController.php:562
 * @route '/admin/actividades/{actividad}/exportar-excel'
 */
exportExcel.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportExcel.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportExcel
 * @see app/Http/Controllers/Admin/AsistenciaController.php:562
 * @route '/admin/actividades/{actividad}/exportar-excel'
 */
exportExcel.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportExcel.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportExcel
 * @see app/Http/Controllers/Admin/AsistenciaController.php:562
 * @route '/admin/actividades/{actividad}/exportar-excel'
 */
    const exportExcelForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportExcel.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportExcel
 * @see app/Http/Controllers/Admin/AsistenciaController.php:562
 * @route '/admin/actividades/{actividad}/exportar-excel'
 */
        exportExcelForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportExcel.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportExcel
 * @see app/Http/Controllers/Admin/AsistenciaController.php:562
 * @route '/admin/actividades/{actividad}/exportar-excel'
 */
        exportExcelForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportExcel.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportExcel.form = exportExcelForm
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportPdf
 * @see app/Http/Controllers/Admin/AsistenciaController.php:570
 * @route '/admin/actividades/{actividad}/exportar-pdf'
 */
export const exportPdf = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
})

exportPdf.definition = {
    methods: ["get","head"],
    url: '/admin/actividades/{actividad}/exportar-pdf',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportPdf
 * @see app/Http/Controllers/Admin/AsistenciaController.php:570
 * @route '/admin/actividades/{actividad}/exportar-pdf'
 */
exportPdf.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return exportPdf.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportPdf
 * @see app/Http/Controllers/Admin/AsistenciaController.php:570
 * @route '/admin/actividades/{actividad}/exportar-pdf'
 */
exportPdf.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportPdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportPdf
 * @see app/Http/Controllers/Admin/AsistenciaController.php:570
 * @route '/admin/actividades/{actividad}/exportar-pdf'
 */
exportPdf.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportPdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportPdf
 * @see app/Http/Controllers/Admin/AsistenciaController.php:570
 * @route '/admin/actividades/{actividad}/exportar-pdf'
 */
    const exportPdfForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportPdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportPdf
 * @see app/Http/Controllers/Admin/AsistenciaController.php:570
 * @route '/admin/actividades/{actividad}/exportar-pdf'
 */
        exportPdfForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportPdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportPdf
 * @see app/Http/Controllers/Admin/AsistenciaController.php:570
 * @route '/admin/actividades/{actividad}/exportar-pdf'
 */
        exportPdfForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportPdf.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportPdf.form = exportPdfForm
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:625
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:625
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
 * @see app/Http/Controllers/Admin/AsistenciaController.php:625
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
exportMethod.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:625
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
exportMethod.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:625
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
    const exportMethodForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:625
 * @route '/admin/actividades/{actividad}/exportar-asistencia'
 */
        exportMethodForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::exportMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:625
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
const AsistenciaController = { scanner, registrar, enrolarRostro, buscarPastores, revertir, obtenerSesionInfo, crearSesionRapida, activarSesion, padronOffline, sincronizarLote, exportExcel, exportPdf, exportMethod, export: exportMethod }

export default AsistenciaController