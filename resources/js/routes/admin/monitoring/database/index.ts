import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:17
 * @route '/admin/monitoring/database'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/database',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:17
 * @route '/admin/monitoring/database'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:17
 * @route '/admin/monitoring/database'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:17
 * @route '/admin/monitoring/database'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:17
 * @route '/admin/monitoring/database'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:17
 * @route '/admin/monitoring/database'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:17
 * @route '/admin/monitoring/database'
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
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:121
 * @route '/admin/monitoring/database/metrics'
 */
export const metrics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metrics.url(options),
    method: 'get',
})

metrics.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/database/metrics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:121
 * @route '/admin/monitoring/database/metrics'
 */
metrics.url = (options?: RouteQueryOptions) => {
    return metrics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:121
 * @route '/admin/monitoring/database/metrics'
 */
metrics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metrics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:121
 * @route '/admin/monitoring/database/metrics'
 */
metrics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: metrics.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:121
 * @route '/admin/monitoring/database/metrics'
 */
    const metricsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: metrics.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:121
 * @route '/admin/monitoring/database/metrics'
 */
        metricsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: metrics.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:121
 * @route '/admin/monitoring/database/metrics'
 */
        metricsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: metrics.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    metrics.form = metricsForm
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:159
 * @route '/admin/monitoring/database/verify-password'
 */
export const verifyPassword = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyPassword.url(options),
    method: 'post',
})

verifyPassword.definition = {
    methods: ["post"],
    url: '/admin/monitoring/database/verify-password',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:159
 * @route '/admin/monitoring/database/verify-password'
 */
verifyPassword.url = (options?: RouteQueryOptions) => {
    return verifyPassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:159
 * @route '/admin/monitoring/database/verify-password'
 */
verifyPassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyPassword.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:159
 * @route '/admin/monitoring/database/verify-password'
 */
    const verifyPasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verifyPassword.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:159
 * @route '/admin/monitoring/database/verify-password'
 */
        verifyPasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verifyPassword.url(options),
            method: 'post',
        })
    
    verifyPassword.form = verifyPasswordForm
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:185
 * @route '/admin/monitoring/database/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exportMethod.url(options),
    method: 'post',
})

exportMethod.definition = {
    methods: ["post"],
    url: '/admin/monitoring/database/export',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:185
 * @route '/admin/monitoring/database/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:185
 * @route '/admin/monitoring/database/export'
 */
exportMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exportMethod.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:185
 * @route '/admin/monitoring/database/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: exportMethod.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:185
 * @route '/admin/monitoring/database/export'
 */
        exportMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: exportMethod.url(options),
            method: 'post',
        })
    
    exportMethod.form = exportMethodForm
const database = {
    index: Object.assign(index, index),
metrics: Object.assign(metrics, metrics),
verifyPassword: Object.assign(verifyPassword, verifyPassword),
export: Object.assign(exportMethod, exportMethod),
}

export default database