import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
* @see app/Http/Controllers/Admin/PastorCarnetController.php:64
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
* @see app/Http/Controllers/Admin/PastorCarnetController.php:64
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
* @see app/Http/Controllers/Admin/PastorCarnetController.php:64
* @route '/validar-credencial/{codigo}'
*/
validarCredencial.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validarCredencial.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
* @see app/Http/Controllers/Admin/PastorCarnetController.php:64
* @route '/validar-credencial/{codigo}'
*/
validarCredencial.head = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: validarCredencial.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
* @see app/Http/Controllers/Admin/PastorCarnetController.php:64
* @route '/validar-credencial/{codigo}'
*/
const validarCredencialForm = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: validarCredencial.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
* @see app/Http/Controllers/Admin/PastorCarnetController.php:64
* @route '/validar-credencial/{codigo}'
*/
validarCredencialForm.get = (args: { codigo: string | number } | [codigo: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: validarCredencial.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\PastorCarnetController::validarCredencial
* @see app/Http/Controllers/Admin/PastorCarnetController.php:64
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

const pastores = {
    validarCredencial: Object.assign(validarCredencial, validarCredencial),
}

export default pastores