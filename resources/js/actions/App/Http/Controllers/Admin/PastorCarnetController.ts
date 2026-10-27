import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:400
 * @route '/validar-credencial/{codigo}'
 */
export const validarCredencial = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validarCredencial.url(args, options),
    method: 'get',
})

validarCredencial.definition = {
    methods: ["get","head"],
    url: '/validar-credencial/{codigo}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:400
 * @route '/validar-credencial/{codigo}'
 */
validarCredencial.url = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { codigo: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    codigo: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        codigo: args.codigo,
                }

    return validarCredencial.definition.url
            .replace('{codigo}', parsedArgs.codigo.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:400
 * @route '/validar-credencial/{codigo}'
 */
validarCredencial.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validarCredencial.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:400
 * @route '/validar-credencial/{codigo}'
 */
validarCredencial.head = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: validarCredencial.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:400
 * @route '/validar-credencial/{codigo}'
 */
    const validarCredencialForm = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: validarCredencial.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:400
 * @route '/validar-credencial/{codigo}'
 */
        validarCredencialForm.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: validarCredencial.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:400
 * @route '/validar-credencial/{codigo}'
 */
        validarCredencialForm.head = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: validarCredencial.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    validarCredencial.form = validarCredencialForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:69
 * @route '/admin/pastores/carnets'
 */
export const carnets = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: carnets.url(options),
    method: 'get',
})

carnets.definition = {
    methods: ["get","head"],
    url: '/admin/pastores/carnets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:69
 * @route '/admin/pastores/carnets'
 */
carnets.url = (options?: RouteQueryOptions) => {
    return carnets.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:69
 * @route '/admin/pastores/carnets'
 */
carnets.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: carnets.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:69
 * @route '/admin/pastores/carnets'
 */
carnets.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: carnets.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:69
 * @route '/admin/pastores/carnets'
 */
    const carnetsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: carnets.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:69
 * @route '/admin/pastores/carnets'
 */
        carnetsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: carnets.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:69
 * @route '/admin/pastores/carnets'
 */
        carnetsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: carnets.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    carnets.form = carnetsForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:249
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:249
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
guardarPlantilla.url = (options?: RouteQueryOptions) => {
    return guardarPlantilla.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:249
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
guardarPlantilla.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: guardarPlantilla.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:249
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
    const guardarPlantillaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: guardarPlantilla.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:249
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
        guardarPlantillaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: guardarPlantilla.url(options),
            method: 'post',
        })
    
    guardarPlantilla.form = guardarPlantillaForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:309
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:309
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
restablecerPlantilla.url = (options?: RouteQueryOptions) => {
    return restablecerPlantilla.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:309
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
restablecerPlantilla.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restablecerPlantilla.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:309
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
    const restablecerPlantillaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restablecerPlantilla.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:309
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
        restablecerPlantillaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restablecerPlantilla.url(options),
            method: 'post',
        })
    
    restablecerPlantilla.form = restablecerPlantillaForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:345
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
export const actualizarFotoPastor = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: actualizarFotoPastor.url(args, options),
    method: 'post',
})

actualizarFotoPastor.definition = {
    methods: ["post"],
    url: '/admin/pastores/{id}/actualizar-foto',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:345
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
actualizarFotoPastor.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return actualizarFotoPastor.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:345
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
actualizarFotoPastor.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: actualizarFotoPastor.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:345
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
    const actualizarFotoPastorForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: actualizarFotoPastor.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:345
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
        actualizarFotoPastorForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: actualizarFotoPastor.url(args, options),
            method: 'post',
        })
    
    actualizarFotoPastor.form = actualizarFotoPastorForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:186
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:186
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:186
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
carnetPdf.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: carnetPdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:186
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
carnetPdf.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: carnetPdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:186
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
    const carnetPdfForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: carnetPdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:186
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
        carnetPdfForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: carnetPdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:186
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:213
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:213
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
bulkCarnetPdf.url = (options?: RouteQueryOptions) => {
    return bulkCarnetPdf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:213
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
bulkCarnetPdf.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkCarnetPdf.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:213
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
    const bulkCarnetPdfForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkCarnetPdf.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:213
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
        bulkCarnetPdfForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkCarnetPdf.url(options),
            method: 'post',
        })
    
    bulkCarnetPdf.form = bulkCarnetPdfForm
const PastorCarnetController = { validarCredencial, carnets, guardarPlantilla, restablecerPlantilla, actualizarFotoPastor, carnetPdf, bulkCarnetPdf }

export default PastorCarnetController