import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:18
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
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:18
* @route '/admin/monitoring/activities'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:18
* @route '/admin/monitoring/activities'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:18
* @route '/admin/monitoring/activities'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:18
* @route '/admin/monitoring/activities'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:18
* @route '/admin/monitoring/activities'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\ActivityMonitoringController::index
* @see app/Http/Controllers/Admin/ActivityMonitoringController.php:18
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

const ActivityMonitoringController = { index }

export default ActivityMonitoringController