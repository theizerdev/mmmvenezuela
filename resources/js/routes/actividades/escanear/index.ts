import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::publicMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
export const publicMethod = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: publicMethod.url(args, options),
    method: 'get',
})

publicMethod.definition = {
    methods: ["get","head"],
    url: '/actividades/{actividad}/escanear',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::publicMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
publicMethod.url = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return publicMethod.definition.url
            .replace('{actividad}', parsedArgs.actividad.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AsistenciaController::publicMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
publicMethod.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: publicMethod.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AsistenciaController::publicMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
publicMethod.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: publicMethod.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AsistenciaController::publicMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
    const publicMethodForm = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: publicMethod.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::publicMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
        publicMethodForm.get = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: publicMethod.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AsistenciaController::publicMethod
 * @see app/Http/Controllers/Admin/AsistenciaController.php:23
 * @route '/actividades/{actividad}/escanear'
 */
        publicMethodForm.head = (args: { actividad: string | number } | [actividad: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: publicMethod.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    publicMethod.form = publicMethodForm
const escanear = {
    public: Object.assign(publicMethod, publicMethod),
}

export default escanear