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
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:348
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
export const fotosSeleccionadas = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fotosSeleccionadas.url(options),
    method: 'post',
})

fotosSeleccionadas.definition = {
    methods: ["post"],
    url: '/admin/pastores/carnets/fotos-seleccionadas',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:348
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
fotosSeleccionadas.url = (options?: RouteQueryOptions) => {
    return fotosSeleccionadas.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:348
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
fotosSeleccionadas.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fotosSeleccionadas.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:348
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
    const fotosSeleccionadasForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: fotosSeleccionadas.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:348
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
        fotosSeleccionadasForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: fotosSeleccionadas.url(options),
            method: 'post',
        })

    fotosSeleccionadas.form = fotosSeleccionadasForm
const carnets = {
    guardarPlantilla: Object.assign(guardarPlantilla, guardarPlantilla),
restablecerPlantilla: Object.assign(restablecerPlantilla, restablecerPlantilla),
fotosSeleccionadas: Object.assign(fotosSeleccionadas, fotosSeleccionadas),
}

export default carnets