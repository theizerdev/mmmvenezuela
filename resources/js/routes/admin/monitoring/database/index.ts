import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\Admin\DbMonitoringController::tables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
export const tables = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tables.url(options),
    method: 'get',
})

tables.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/database/tables',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::tables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
tables.url = (options?: RouteQueryOptions) => {
    return tables.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::tables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
tables.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: tables.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::tables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
tables.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: tables.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::tables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
    const tablesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: tables.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::tables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
        tablesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tables.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::tables
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:55
 * @route '/admin/monitoring/database/tables'
 */
        tablesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: tables.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    tables.form = tablesForm
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
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
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
metrics.url = (options?: RouteQueryOptions) => {
    return metrics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
metrics.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: metrics.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
metrics.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: metrics.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
    const metricsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: metrics.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
 * @route '/admin/monitoring/database/metrics'
 */
        metricsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: metrics.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\DbMonitoringController::metrics
 * @see app/Http/Controllers/Admin/DbMonitoringController.php:149
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
const database = {
    index: Object.assign(index, index),
tables: Object.assign(tables, tables),
metrics: Object.assign(metrics, metrics),
verifyPassword: Object.assign(verifyPassword, verifyPassword),
export: Object.assign(exportMethod, exportMethod),
import: Object.assign(importMethod, importMethod),
}

export default database