import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::index
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:14
 * @route '/admin/monitoring/registration'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/monitoring/registration',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::index
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:14
 * @route '/admin/monitoring/registration'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::index
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:14
 * @route '/admin/monitoring/registration'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::index
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:14
 * @route '/admin/monitoring/registration'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::index
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:14
 * @route '/admin/monitoring/registration'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::index
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:14
 * @route '/admin/monitoring/registration'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::index
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:14
 * @route '/admin/monitoring/registration'
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
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::update
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:22
 * @route '/admin/monitoring/registration'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/monitoring/registration',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::update
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:22
 * @route '/admin/monitoring/registration'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::update
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:22
 * @route '/admin/monitoring/registration'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::update
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:22
 * @route '/admin/monitoring/registration'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\RegistroPublicoMonitoringController::update
 * @see app/Http/Controllers/Admin/RegistroPublicoMonitoringController.php:22
 * @route '/admin/monitoring/registration'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const registration = {
    index: Object.assign(index, index),
update: Object.assign(update, update),
}

export default registration