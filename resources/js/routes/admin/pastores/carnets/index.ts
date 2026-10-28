import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:252
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
export const guardarPlantilla = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: guardarPlantilla.url(options),
    method: 'post',
})

guardarPlantilla.definition = {
    methods: ["post"],
    url: '/admin/pastores/carnets/guardar-plantilla',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:252
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
guardarPlantilla.url = (options?: RouteQueryOptions) => {
    return guardarPlantilla.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:252
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
guardarPlantilla.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: guardarPlantilla.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:252
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
    const guardarPlantillaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: guardarPlantilla.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:252
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
        guardarPlantillaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: guardarPlantilla.url(options),
            method: 'post',
        })
    
    guardarPlantilla.form = guardarPlantillaForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:312
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
export const restablecerPlantilla = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restablecerPlantilla.url(options),
    method: 'post',
})

restablecerPlantilla.definition = {
    methods: ["post"],
    url: '/admin/pastores/carnets/restablecer-plantilla',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:312
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
restablecerPlantilla.url = (options?: RouteQueryOptions) => {
    return restablecerPlantilla.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:312
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
restablecerPlantilla.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restablecerPlantilla.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:312
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
    const restablecerPlantillaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restablecerPlantilla.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:312
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
        restablecerPlantillaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restablecerPlantilla.url(options),
            method: 'post',
        })
    
    restablecerPlantilla.form = restablecerPlantillaForm
const carnets = {
    guardarPlantilla: Object.assign(guardarPlantilla, guardarPlantilla),
restablecerPlantilla: Object.assign(restablecerPlantilla, restablecerPlantilla),
}

export default carnets