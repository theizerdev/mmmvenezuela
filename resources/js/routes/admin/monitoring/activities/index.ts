import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:21
* @route '/admin/monitoring/activities'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/activities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:21
* @route '/admin/monitoring/activities'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:21
* @route '/admin/monitoring/activities'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:21
* @route '/admin/monitoring/activities'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:21
* @route '/admin/monitoring/activities'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:21
* @route '/admin/monitoring/activities'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:21
* @route '/admin/monitoring/activities'
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
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::exportMethod
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:211
* @route '/admin/monitoring/activities/export'
*/
export const exportMethod = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

exportMethod.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/activities/export',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::exportMethod
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:211
* @route '/admin/monitoring/activities/export'
*/
exportMethod.url = (options?: RouteQueryOptions) => {
    return exportMethod.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::exportMethod
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:211
* @route '/admin/monitoring/activities/export'
*/
exportMethod.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::exportMethod
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:211
* @route '/admin/monitoring/activities/export'
*/
exportMethod.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: exportMethod.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::exportMethod
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:211
* @route '/admin/monitoring/activities/export'
*/
const exportMethodForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::exportMethod
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:211
* @route '/admin/monitoring/activities/export'
*/
exportMethodForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: exportMethod.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::exportMethod
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:211
* @route '/admin/monitoring/activities/export'
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

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::clear
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:255
* @route '/admin/monitoring/activities/clear'
*/
export const clear = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(options),
    method: 'delete',
})

clear.definition = {
    methods: ["delete"],
    url: '/admin/monitoring/activities/clear',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::clear
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:255
* @route '/admin/monitoring/activities/clear'
*/
clear.url = (options?: RouteQueryOptions) => {
    return clear.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::clear
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:255
* @route '/admin/monitoring/activities/clear'
*/
clear.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: clear.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::clear
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:255
* @route '/admin/monitoring/activities/clear'
*/
const clearForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: clear.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::clear
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:255
* @route '/admin/monitoring/activities/clear'
*/
clearForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: clear.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

clear.form = clearForm

const activities = {
    index: Object.assign(index, index),
    export: Object.assign(exportMethod, exportMethod),
    clear: Object.assign(clear, clear),
}

export default activities