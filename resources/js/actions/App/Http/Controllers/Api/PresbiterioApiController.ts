import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::login
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:21
 * @route '/api/v1/auth/login'
 */
export const login = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

login.definition = {
    methods: ["post"],
    url: '/api/v1/auth/login',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::login
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:21
 * @route '/api/v1/auth/login'
 */
login.url = (options?: RouteQueryOptions) => {
    return login.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::login
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:21
 * @route '/api/v1/auth/login'
 */
login.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: login.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::login
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:21
 * @route '/api/v1/auth/login'
 */
    const loginForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: login.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::login
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:21
 * @route '/api/v1/auth/login'
 */
        loginForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: login.url(options),
            method: 'post',
        })
    
    login.form = loginForm
/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::logout
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:89
 * @route '/api/v1/auth/logout'
 */
export const logout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

logout.definition = {
    methods: ["post"],
    url: '/api/v1/auth/logout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::logout
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:89
 * @route '/api/v1/auth/logout'
 */
logout.url = (options?: RouteQueryOptions) => {
    return logout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::logout
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:89
 * @route '/api/v1/auth/logout'
 */
logout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: logout.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::logout
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:89
 * @route '/api/v1/auth/logout'
 */
    const logoutForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: logout.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::logout
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:89
 * @route '/api/v1/auth/logout'
 */
        logoutForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: logout.url(options),
            method: 'post',
        })
    
    logout.form = logoutForm
/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::updatePushSettings
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:105
 * @route '/api/v1/auth/push-settings'
 */
export const updatePushSettings = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updatePushSettings.url(options),
    method: 'post',
})

updatePushSettings.definition = {
    methods: ["post"],
    url: '/api/v1/auth/push-settings',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::updatePushSettings
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:105
 * @route '/api/v1/auth/push-settings'
 */
updatePushSettings.url = (options?: RouteQueryOptions) => {
    return updatePushSettings.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::updatePushSettings
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:105
 * @route '/api/v1/auth/push-settings'
 */
updatePushSettings.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updatePushSettings.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::updatePushSettings
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:105
 * @route '/api/v1/auth/push-settings'
 */
    const updatePushSettingsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updatePushSettings.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::updatePushSettings
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:105
 * @route '/api/v1/auth/push-settings'
 */
        updatePushSettingsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updatePushSettings.url(options),
            method: 'post',
        })
    
    updatePushSettings.form = updatePushSettingsForm
/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::presbiteroDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:138
 * @route '/api/v1/presbitero/dashboard'
 */
export const presbiteroDashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: presbiteroDashboard.url(options),
    method: 'get',
})

presbiteroDashboard.definition = {
    methods: ["get","head"],
    url: '/api/v1/presbitero/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::presbiteroDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:138
 * @route '/api/v1/presbitero/dashboard'
 */
presbiteroDashboard.url = (options?: RouteQueryOptions) => {
    return presbiteroDashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::presbiteroDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:138
 * @route '/api/v1/presbitero/dashboard'
 */
presbiteroDashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: presbiteroDashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::presbiteroDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:138
 * @route '/api/v1/presbitero/dashboard'
 */
presbiteroDashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: presbiteroDashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::presbiteroDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:138
 * @route '/api/v1/presbitero/dashboard'
 */
    const presbiteroDashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: presbiteroDashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::presbiteroDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:138
 * @route '/api/v1/presbitero/dashboard'
 */
        presbiteroDashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: presbiteroDashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::presbiteroDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:138
 * @route '/api/v1/presbitero/dashboard'
 */
        presbiteroDashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: presbiteroDashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    presbiteroDashboard.form = presbiteroDashboardForm
/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::supervisorDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:359
 * @route '/api/v1/supervisor/dashboard'
 */
export const supervisorDashboard = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: supervisorDashboard.url(options),
    method: 'get',
})

supervisorDashboard.definition = {
    methods: ["get","head"],
    url: '/api/v1/supervisor/dashboard',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::supervisorDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:359
 * @route '/api/v1/supervisor/dashboard'
 */
supervisorDashboard.url = (options?: RouteQueryOptions) => {
    return supervisorDashboard.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::supervisorDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:359
 * @route '/api/v1/supervisor/dashboard'
 */
supervisorDashboard.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: supervisorDashboard.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Api\PresbiterioApiController::supervisorDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:359
 * @route '/api/v1/supervisor/dashboard'
 */
supervisorDashboard.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: supervisorDashboard.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::supervisorDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:359
 * @route '/api/v1/supervisor/dashboard'
 */
    const supervisorDashboardForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: supervisorDashboard.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::supervisorDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:359
 * @route '/api/v1/supervisor/dashboard'
 */
        supervisorDashboardForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: supervisorDashboard.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Api\PresbiterioApiController::supervisorDashboard
 * @see app/Http/Controllers/Api/PresbiterioApiController.php:359
 * @route '/api/v1/supervisor/dashboard'
 */
        supervisorDashboardForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: supervisorDashboard.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    supervisorDashboard.form = supervisorDashboardForm
const PresbiterioApiController = { login, logout, updatePushSettings, presbiteroDashboard, supervisorDashboard }

export default PresbiterioApiController