import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::show
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
* @route '/cambiar-contrasena-obligatoria'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/cambiar-contrasena-obligatoria',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::show
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
* @route '/cambiar-contrasena-obligatoria'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::show
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
* @route '/cambiar-contrasena-obligatoria'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::show
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
* @route '/cambiar-contrasena-obligatoria'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::show
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
* @route '/cambiar-contrasena-obligatoria'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::show
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
* @route '/cambiar-contrasena-obligatoria'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::show
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
* @route '/cambiar-contrasena-obligatoria'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::update
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:66
* @route '/cambiar-contrasena-obligatoria'
*/
export const update = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

update.definition = {
    methods: ["post"],
    url: '/cambiar-contrasena-obligatoria',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::update
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:66
* @route '/cambiar-contrasena-obligatoria'
*/
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::update
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:66
* @route '/cambiar-contrasena-obligatoria'
*/
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::update
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:66
* @route '/cambiar-contrasena-obligatoria'
*/
const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::update
* @see app/Http/Controllers/Auth/ForceChangePasswordController.php:66
* @route '/cambiar-contrasena-obligatoria'
*/
updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: update.url(options),
    method: 'post',
})

update.form = updateForm

const ForceChangePasswordController = { show, update }

export default ForceChangePasswordController