import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\PastorExportController::exportMethod
 * @see app/Http/Controllers/Admin/PastorExportController.php:23
 * @route '/admin/pastores/export'
 */
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/admin/pastores/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\PastorExportController::exportMethod
 * @see app/Http/Controllers/Admin/PastorExportController.php:23
 * @route '/admin/pastores/export'
 */
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\PastorExportController::exportMethod
 * @see app/Http/Controllers/Admin/PastorExportController.php:23
 * @route '/admin/pastores/export'
 */
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\PastorExportController::exportMethod
 * @see app/Http/Controllers/Admin/PastorExportController.php:23
 * @route '/admin/pastores/export'
 */
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\PastorExportController::exportMethod
 * @see app/Http/Controllers/Admin/PastorExportController.php:23
 * @route '/admin/pastores/export'
 */
    const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: exportMethod.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\PastorExportController::exportMethod
 * @see app/Http/Controllers/Admin/PastorExportController.php:23
 * @route '/admin/pastores/export'
 */
        exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\PastorExportController::exportMethod
 * @see app/Http/Controllers/Admin/PastorExportController.php:23
 * @route '/admin/pastores/export'
 */
        exportMethodForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: exportMethod.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    exportMethod.form = exportMethodForm
const PastorExportController = { exportMethod, export: exportMethod }

export default PastorExportController