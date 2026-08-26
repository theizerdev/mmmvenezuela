import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:29
 * @route '/registro'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/registro',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:29
 * @route '/registro'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:29
 * @route '/registro'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:29
 * @route '/registro'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:29
 * @route '/registro'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:29
 * @route '/registro'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::index
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:29
 * @route '/registro'
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
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:225
 * @route '/registro'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/registro',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:225
 * @route '/registro'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:225
 * @route '/registro'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:225
 * @route '/registro'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::store
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:225
 * @route '/registro'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:91
 * @route '/registro/verificar-cedula/{cedula}'
 */
export const verificarCedula = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verificarCedula.url(args, options),
    method: 'get',
})

verificarCedula.definition = {
    methods: ["get","head"],
    url: '/registro/verificar-cedula/{cedula}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:91
 * @route '/registro/verificar-cedula/{cedula}'
 */
verificarCedula.url = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { cedula: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    cedula: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        cedula: args.cedula,
                }

    return verificarCedula.definition.url
            .replace('{cedula}', parsedArgs.cedula.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:91
 * @route '/registro/verificar-cedula/{cedula}'
 */
verificarCedula.get = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verificarCedula.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:91
 * @route '/registro/verificar-cedula/{cedula}'
 */
verificarCedula.head = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verificarCedula.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:91
 * @route '/registro/verificar-cedula/{cedula}'
 */
    const verificarCedulaForm = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: verificarCedula.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:91
 * @route '/registro/verificar-cedula/{cedula}'
 */
        verificarCedulaForm.get = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verificarCedula.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::verificarCedula
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:91
 * @route '/registro/verificar-cedula/{cedula}'
 */
        verificarCedulaForm.head = (args: { cedula: string | number } | [cedula: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: verificarCedula.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    verificarCedula.form = verificarCedulaForm
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearMunicipioRapido
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1072
 * @route '/registro/crear-municipio'
 */
export const crearMunicipioRapido = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearMunicipioRapido.url(options),
    method: 'post',
})

crearMunicipioRapido.definition = {
    methods: ["post"],
    url: '/registro/crear-municipio',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearMunicipioRapido
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1072
 * @route '/registro/crear-municipio'
 */
crearMunicipioRapido.url = (options?: RouteQueryOptions) => {
    return crearMunicipioRapido.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearMunicipioRapido
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1072
 * @route '/registro/crear-municipio'
 */
crearMunicipioRapido.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearMunicipioRapido.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearMunicipioRapido
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1072
 * @route '/registro/crear-municipio'
 */
    const crearMunicipioRapidoForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: crearMunicipioRapido.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearMunicipioRapido
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1072
 * @route '/registro/crear-municipio'
 */
        crearMunicipioRapidoForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: crearMunicipioRapido.url(options),
            method: 'post',
        })
    
    crearMunicipioRapido.form = crearMunicipioRapidoForm
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearParroquiaRapida
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1111
 * @route '/registro/crear-parroquia'
 */
export const crearParroquiaRapida = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearParroquiaRapida.url(options),
    method: 'post',
})

crearParroquiaRapida.definition = {
    methods: ["post"],
    url: '/registro/crear-parroquia',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearParroquiaRapida
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1111
 * @route '/registro/crear-parroquia'
 */
crearParroquiaRapida.url = (options?: RouteQueryOptions) => {
    return crearParroquiaRapida.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearParroquiaRapida
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1111
 * @route '/registro/crear-parroquia'
 */
crearParroquiaRapida.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: crearParroquiaRapida.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearParroquiaRapida
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1111
 * @route '/registro/crear-parroquia'
 */
    const crearParroquiaRapidaForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: crearParroquiaRapida.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::crearParroquiaRapida
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:1111
 * @route '/registro/crear-parroquia'
 */
        crearParroquiaRapidaForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: crearParroquiaRapida.url(options),
            method: 'post',
        })
    
    crearParroquiaRapida.form = crearParroquiaRapidaForm
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionIndex
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:691
 * @route '/registro/{pastor}/extension'
 */
export const extensionIndex = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: extensionIndex.url(args, options),
    method: 'get',
})

extensionIndex.definition = {
    methods: ["get","head"],
    url: '/registro/{pastor}/extension',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionIndex
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:691
 * @route '/registro/{pastor}/extension'
 */
extensionIndex.url = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pastor: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pastor: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pastor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pastor: typeof args.pastor === 'object'
                ? args.pastor.id
                : args.pastor,
                }

    return extensionIndex.definition.url
            .replace('{pastor}', parsedArgs.pastor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionIndex
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:691
 * @route '/registro/{pastor}/extension'
 */
extensionIndex.get = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: extensionIndex.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionIndex
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:691
 * @route '/registro/{pastor}/extension'
 */
extensionIndex.head = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: extensionIndex.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionIndex
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:691
 * @route '/registro/{pastor}/extension'
 */
    const extensionIndexForm = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: extensionIndex.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionIndex
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:691
 * @route '/registro/{pastor}/extension'
 */
        extensionIndexForm.get = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: extensionIndex.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionIndex
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:691
 * @route '/registro/{pastor}/extension'
 */
        extensionIndexForm.head = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: extensionIndex.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    extensionIndex.form = extensionIndexForm
/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionStore
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:783
 * @route '/registro/{pastor}/extension'
 */
export const extensionStore = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extensionStore.url(args, options),
    method: 'post',
})

extensionStore.definition = {
    methods: ["post"],
    url: '/registro/{pastor}/extension',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionStore
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:783
 * @route '/registro/{pastor}/extension'
 */
extensionStore.url = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { pastor: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { pastor: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    pastor: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        pastor: typeof args.pastor === 'object'
                ? args.pastor.id
                : args.pastor,
                }

    return extensionStore.definition.url
            .replace('{pastor}', parsedArgs.pastor.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionStore
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:783
 * @route '/registro/{pastor}/extension'
 */
extensionStore.post = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: extensionStore.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionStore
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:783
 * @route '/registro/{pastor}/extension'
 */
    const extensionStoreForm = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: extensionStore.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Public\PastorRegistroPublicoController::extensionStore
 * @see app/Http/Controllers/Public/PastorRegistroPublicoController.php:783
 * @route '/registro/{pastor}/extension'
 */
        extensionStoreForm.post = (args: { pastor: number | { id: number } } | [pastor: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: extensionStore.url(args, options),
            method: 'post',
        })
    
    extensionStore.form = extensionStoreForm
const PastorRegistroPublicoController = { index, store, verificarCedula, crearMunicipioRapido, crearParroquiaRapida, extensionIndex, extensionStore }

export default PastorRegistroPublicoController