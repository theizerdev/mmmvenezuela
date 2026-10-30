import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:745
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:745
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
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:745
 * @route '/validar-credencial/{codigo}'
 */
validarCredencial.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validarCredencial.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:745
 * @route '/validar-credencial/{codigo}'
 */
validarCredencial.head = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: validarCredencial.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:745
 * @route '/validar-credencial/{codigo}'
 */
    const validarCredencialForm = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: validarCredencial.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:745
 * @route '/validar-credencial/{codigo}'
 */
        validarCredencialForm.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: validarCredencial.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:745
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
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotoServe
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:666
 * @route '/pastores/{filename}'
 */
export const fotoServe = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fotoServe.url(args, options),
    method: 'get',
})

fotoServe.definition = {
    methods: ["get","head"],
    url: '/pastores/{filename}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotoServe
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:666
 * @route '/pastores/{filename}'
 */
fotoServe.url = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions) => {
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

    return fotoServe.definition.url
            .replace('{filename}', parsedArgs.filename.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotoServe
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:666
 * @route '/pastores/{filename}'
 */
fotoServe.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fotoServe.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotoServe
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:666
 * @route '/pastores/{filename}'
 */
fotoServe.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fotoServe.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotoServe
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:666
 * @route '/pastores/{filename}'
 */
    const fotoServeForm = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: fotoServe.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotoServe
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:666
 * @route '/pastores/{filename}'
 */
        fotoServeForm.get = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fotoServe.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorCarnetController::fotoServe
 * @see app/Http/Controllers/Admin/PastorCarnetController.php:666
 * @route '/pastores/{filename}'
 */
        fotoServeForm.head = (args: { filename: string | number } | [filename: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: fotoServe.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    fotoServe.form = fotoServeForm
const pastores = {
    validarCredencial: Object.assign(validarCredencial, validarCredencial),
fotoServe: Object.assign(fotoServe, fotoServe),
}

export default pastores