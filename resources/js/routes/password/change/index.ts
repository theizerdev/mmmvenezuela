import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::form
 * @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
 * @route '/cambiar-contrasena-obligatoria'
 */
export const form = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(options),
    method: 'get',
})

form.definition = {
    methods: ["get","head"],
    url: '/cambiar-contrasena-obligatoria',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::form
 * @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
 * @route '/cambiar-contrasena-obligatoria'
 */
form.url = (options?: RouteQueryOptions) => {
    return form.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::form
 * @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
 * @route '/cambiar-contrasena-obligatoria'
 */
form.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: form.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::form
 * @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
 * @route '/cambiar-contrasena-obligatoria'
 */
form.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: form.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::form
 * @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
 * @route '/cambiar-contrasena-obligatoria'
 */
    const formForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: form.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::form
 * @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
 * @route '/cambiar-contrasena-obligatoria'
 */
        formForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: form.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Auth\ForceChangePasswordController::form
 * @see app/Http/Controllers/Auth/ForceChangePasswordController.php:20
 * @route '/cambiar-contrasena-obligatoria'
 */
        formForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: form.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    form.form = formForm
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
const change = {
    form: Object.assign(form, form),
update: Object.assign(update, update),
}

export default change