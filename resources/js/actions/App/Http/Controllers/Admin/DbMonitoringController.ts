import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:18
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
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:18
 * @route '/admin/monitoring/database'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:18
 * @route '/admin/monitoring/database'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:18
 * @route '/admin/monitoring/database'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:18
 * @route '/admin/monitoring/database'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:18
 * @route '/admin/monitoring/database'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::index
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:18
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
* @see \App\Http\Controllers\Admin\DbMonitoringController::getTables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
export const getTables = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTables.url(options),
    method: 'get',
})

getTables.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/database/tables',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getTables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
getTables.url = (options?: RouteQueryOptions) => {
    return getTables.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getTables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
getTables.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getTables.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getTables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
getTables.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getTables.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getTables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
    const getTablesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getTables.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getTables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
        getTablesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getTables.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getTables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
        getTablesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getTables.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getTables.form = getTablesForm
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getMetrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
export const getMetrics = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMetrics.url(options),
    method: 'get',
})

getMetrics.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/database/metrics',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getMetrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
getMetrics.url = (options?: RouteQueryOptions) => {
    return getMetrics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getMetrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
getMetrics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: getMetrics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getMetrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
getMetrics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: getMetrics.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getMetrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
    const getMetricsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: getMetrics.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getMetrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
        getMetricsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getMetrics.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::getMetrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
        getMetricsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: getMetrics.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    getMetrics.form = getMetricsForm
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:187
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
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:187
 * @route '/admin/monitoring/database/verify-password'
 */
verifyPassword.url = (options?: RouteQueryOptions) => {
    return verifyPassword.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:187
 * @route '/admin/monitoring/database/verify-password'
 */
verifyPassword.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: verifyPassword.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:187
 * @route '/admin/monitoring/database/verify-password'
 */
    const verifyPasswordForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: verifyPassword.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::verifyPassword
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:187
 * @route '/admin/monitoring/database/verify-password'
 */
        verifyPasswordForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: verifyPassword.url(options),
            method: 'post',
        })
    
    verifyPassword.form = verifyPasswordForm
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:213
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
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:213
 * @route '/admin/monitoring/database/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:213
 * @route '/admin/monitoring/database/export'
 */
exportMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: exportMethod.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:213
 * @route '/admin/monitoring/database/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: exportMethod.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::exportMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:213
 * @route '/admin/monitoring/database/export'
 */
        exportMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: exportMethod.url(options),
            method: 'post',
        })
    
    exportMethod.form = exportMethodForm
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::importMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:284
 * @route '/admin/monitoring/database/import'
 */
export const importMethod = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

importMethod.definition = {
    methods: ["post"],
    url: '/admin/monitoring/database/import',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::importMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:284
 * @route '/admin/monitoring/database/import'
 */
importMethod.url = (options?: RouteQueryOptions) => {
    return importMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::importMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:284
 * @route '/admin/monitoring/database/import'
 */
importMethod.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: importMethod.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::importMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:284
 * @route '/admin/monitoring/database/import'
 */
    const importMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: importMethod.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::importMethod
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:284
 * @route '/admin/monitoring/database/import'
 */
        importMethodForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: importMethod.url(options),
            method: 'post',
        })
    
    importMethod.form = importMethodForm
const DbMonitoringController = { index, getTables, getMetrics, verifyPassword, exportMethod, importMethod, export: exportMethod, import: importMethod }

export default DbMonitoringController