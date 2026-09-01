import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsapp
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
export const whatsapp = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsapp.url(options),
    method: 'get',
})

whatsapp.definition = {
    methods: ["get","head"],
    url: '/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsapp
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsapp.url = (options?: RouteQueryOptions) => {
    return whatsapp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsapp
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsapp.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsapp.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsapp
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsapp.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsapp.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsapp
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
const whatsappForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsapp.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsapp
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsappForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsapp.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsapp
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsappForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsapp.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsapp.form = whatsappForm

const docs = {
    whatsapp: Object.assign(whatsapp, whatsapp),
}

export default docs