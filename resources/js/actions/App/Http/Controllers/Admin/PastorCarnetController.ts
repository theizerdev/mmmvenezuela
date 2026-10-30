import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:744
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:744
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:744
 * @route '/validar-credencial/{codigo}'
 */
validarCredencial.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validarCredencial.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:744
 * @route '/validar-credencial/{codigo}'
 */
validarCredencial.head = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: validarCredencial.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:744
 * @route '/validar-credencial/{codigo}'
 */
    const validarCredencialForm = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: validarCredencial.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:744
 * @route '/validar-credencial/{codigo}'
 */
        validarCredencialForm.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: validarCredencial.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:744
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
* @see \App\Http\Controllers\Admin\PastorCarnetController::servirFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:665
 * @route '/pastores/{filename}'
 */
export const servirFotoPastor = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servirFotoPastor.url(args, options),
    method: 'get',
})

servirFotoPastor.definition = {
    methods: ["get","head"],
    url: '/pastores/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::servirFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:665
 * @route '/pastores/{filename}'
 */
servirFotoPastor.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { filename: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    filename: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        filename: args.filename,
                }

    return servirFotoPastor.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::servirFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:665
 * @route '/pastores/{filename}'
 */
servirFotoPastor.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: servirFotoPastor.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::servirFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:665
 * @route '/pastores/{filename}'
 */
servirFotoPastor.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: servirFotoPastor.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::servirFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:665
 * @route '/pastores/{filename}'
 */
    const servirFotoPastorForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: servirFotoPastor.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::servirFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:665
 * @route '/pastores/{filename}'
 */
        servirFotoPastorForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servirFotoPastor.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::servirFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:665
 * @route '/pastores/{filename}'
 */
        servirFotoPastorForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: servirFotoPastor.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    servirFotoPastor.form = servirFotoPastorForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:70
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:70
 * @route '/admin/pastores/carnets'
 */
carnets.url = (options?: RouteQueryOptions) => {
    return carnets.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:70
 * @route '/admin/pastores/carnets'
 */
carnets.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: carnets.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:70
 * @route '/admin/pastores/carnets'
 */
carnets.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: carnets.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:70
 * @route '/admin/pastores/carnets'
 */
    const carnetsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: carnets.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:70
 * @route '/admin/pastores/carnets'
 */
        carnetsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: carnets.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnets
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:70
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:253
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:253
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
guardarPlantilla.url = (options?: RouteQueryOptions) => {
    return guardarPlantilla.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:253
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
guardarPlantilla.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: guardarPlantilla.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:253
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
    const guardarPlantillaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: guardarPlantilla.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::guardarPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:253
 * @route '/admin/pastores/carnets/guardar-plantilla'
 */
        guardarPlantillaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: guardarPlantilla.url(options),
            method: 'post',
        })
    
    guardarPlantilla.form = guardarPlantillaForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:313
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:313
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
restablecerPlantilla.url = (options?: RouteQueryOptions) => {
    return restablecerPlantilla.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:313
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
restablecerPlantilla.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: restablecerPlantilla.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:313
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
    const restablecerPlantillaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: restablecerPlantilla.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::restablecerPlantilla
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:313
 * @route '/admin/pastores/carnets/restablecer-plantilla'
 */
        restablecerPlantillaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: restablecerPlantilla.url(options),
            method: 'post',
        })
    
    restablecerPlantilla.form = restablecerPlantillaForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:349
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:349
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
fotosSeleccionadas.url = (options?: RouteQueryOptions) => {
    return fotosSeleccionadas.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:349
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
fotosSeleccionadas.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fotosSeleccionadas.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:349
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
    const fotosSeleccionadasForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: fotosSeleccionadas.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotosSeleccionadas
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:349
 * @route '/admin/pastores/carnets/fotos-seleccionadas'
 */
        fotosSeleccionadasForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: fotosSeleccionadas.url(options),
            method: 'post',
        })
    
    fotosSeleccionadas.form = fotosSeleccionadasForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:376
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:376
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:376
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
actualizarFotoPastor.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: actualizarFotoPastor.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:376
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
    const actualizarFotoPastorForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: actualizarFotoPastor.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::actualizarFotoPastor
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:376
 * @route '/admin/pastores/{id}/actualizar-foto'
 */
        actualizarFotoPastorForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: actualizarFotoPastor.url(args, options),
            method: 'post',
        })
    
    actualizarFotoPastor.form = actualizarFotoPastorForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaAnalyzeFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:484
 * @route '/admin/pastores/{id}/ia-analyze'
 */
export const iaAnalyzeFoto = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: iaAnalyzeFoto.url(args, options),
    method: 'post',
})

iaAnalyzeFoto.definition = {
    methods: ["post"],
    url: '/admin/pastores/{id}/ia-analyze',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaAnalyzeFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:484
 * @route '/admin/pastores/{id}/ia-analyze'
 */
iaAnalyzeFoto.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return iaAnalyzeFoto.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaAnalyzeFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:484
 * @route '/admin/pastores/{id}/ia-analyze'
 */
iaAnalyzeFoto.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: iaAnalyzeFoto.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaAnalyzeFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:484
 * @route '/admin/pastores/{id}/ia-analyze'
 */
    const iaAnalyzeFotoForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: iaAnalyzeFoto.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaAnalyzeFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:484
 * @route '/admin/pastores/{id}/ia-analyze'
 */
        iaAnalyzeFotoForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: iaAnalyzeFoto.url(args, options),
            method: 'post',
        })
    
    iaAnalyzeFoto.form = iaAnalyzeFotoForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaRemoveBgFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:512
 * @route '/admin/pastores/{id}/ia-remove-bg'
 */
export const iaRemoveBgFoto = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: iaRemoveBgFoto.url(args, options),
    method: 'post',
})

iaRemoveBgFoto.definition = {
    methods: ["post"],
    url: '/admin/pastores/{id}/ia-remove-bg',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaRemoveBgFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:512
 * @route '/admin/pastores/{id}/ia-remove-bg'
 */
iaRemoveBgFoto.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return iaRemoveBgFoto.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaRemoveBgFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:512
 * @route '/admin/pastores/{id}/ia-remove-bg'
 */
iaRemoveBgFoto.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: iaRemoveBgFoto.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaRemoveBgFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:512
 * @route '/admin/pastores/{id}/ia-remove-bg'
 */
    const iaRemoveBgFotoForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: iaRemoveBgFoto.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaRemoveBgFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:512
 * @route '/admin/pastores/{id}/ia-remove-bg'
 */
        iaRemoveBgFotoForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: iaRemoveBgFoto.url(args, options),
            method: 'post',
        })
    
    iaRemoveBgFoto.form = iaRemoveBgFotoForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaEnhanceFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:546
 * @route '/admin/pastores/{id}/ia-enhance'
 */
export const iaEnhanceFoto = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: iaEnhanceFoto.url(args, options),
    method: 'post',
})

iaEnhanceFoto.definition = {
    methods: ["post"],
    url: '/admin/pastores/{id}/ia-enhance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaEnhanceFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:546
 * @route '/admin/pastores/{id}/ia-enhance'
 */
iaEnhanceFoto.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return iaEnhanceFoto.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaEnhanceFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:546
 * @route '/admin/pastores/{id}/ia-enhance'
 */
iaEnhanceFoto.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: iaEnhanceFoto.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaEnhanceFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:546
 * @route '/admin/pastores/{id}/ia-enhance'
 */
    const iaEnhanceFotoForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: iaEnhanceFoto.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::iaEnhanceFoto
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:546
 * @route '/admin/pastores/{id}/ia-enhance'
 */
        iaEnhanceFotoForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: iaEnhanceFoto.url(args, options),
            method: 'post',
        })
    
    iaEnhanceFoto.form = iaEnhanceFotoForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkIaEnhance
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:604
 * @route '/admin/pastores/bulk-ia-enhance'
 */
export const bulkIaEnhance = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkIaEnhance.url(options),
    method: 'post',
})

bulkIaEnhance.definition = {
    methods: ["post"],
    url: '/admin/pastores/bulk-ia-enhance',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkIaEnhance
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:604
 * @route '/admin/pastores/bulk-ia-enhance'
 */
bulkIaEnhance.url = (options?: RouteQueryOptions) => {
    return bulkIaEnhance.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkIaEnhance
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:604
 * @route '/admin/pastores/bulk-ia-enhance'
 */
bulkIaEnhance.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkIaEnhance.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkIaEnhance
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:604
 * @route '/admin/pastores/bulk-ia-enhance'
 */
    const bulkIaEnhanceForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkIaEnhance.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkIaEnhance
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:604
 * @route '/admin/pastores/bulk-ia-enhance'
 */
        bulkIaEnhanceForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkIaEnhance.url(options),
            method: 'post',
        })
    
    bulkIaEnhance.form = bulkIaEnhanceForm
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:187
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:187
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:187
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
carnetPdf.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: carnetPdf.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:187
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
carnetPdf.head = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: carnetPdf.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:187
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
    const carnetPdfForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: carnetPdf.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:187
 * @route '/admin/pastores/{id}/carnet-pdf'
 */
        carnetPdfForm.get = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: carnetPdf.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::carnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:187
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:215
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:215
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
bulkCarnetPdf.url = (options?: RouteQueryOptions) => {
    return bulkCarnetPdf.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:215
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
bulkCarnetPdf.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkCarnetPdf.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:215
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
    const bulkCarnetPdfForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkCarnetPdf.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::bulkCarnetPdf
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:215
 * @route '/admin/pastores/bulk-carnet-pdf'
 */
        bulkCarnetPdfForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkCarnetPdf.url(options),
            method: 'post',
        })
    
    bulkCarnetPdf.form = bulkCarnetPdfForm
const PastorCarnetController = { validarCredencial, servirFotoPastor, carnets, guardarPlantilla, restablecerPlantilla, fotosSeleccionadas, actualizarFotoPastor, iaAnalyzeFoto, iaRemoveBgFoto, iaEnhanceFoto, bulkIaEnhance, carnetPdf, bulkCarnetPdf }

export default PastorCarnetController