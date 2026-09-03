import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\IntegrationController::update
 * @see app/Http/Controllers/Admin/IntegrationController.php:198
 * @route '/admin/integrations/google-smtp'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/admin/integrations/google-smtp',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::update
 * @see app/Http/Controllers/Admin/IntegrationController.php:198
 * @route '/admin/integrations/google-smtp'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::update
 * @see app/Http/Controllers/Admin/IntegrationController.php:198
 * @route '/admin/integrations/google-smtp'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\Admin\IntegrationController::update
 * @see app/Http/Controllers/Admin/IntegrationController.php:198
 * @route '/admin/integrations/google-smtp'
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
* @see \App\Http\Controllers\Admin\IntegrationController::update
 * @see app/Http/Controllers/Admin/IntegrationController.php:198
 * @route '/admin/integrations/google-smtp'
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
/**
* @see \App\Http\Controllers\Admin\IntegrationController::test
 * @see app/Http/Controllers/Admin/IntegrationController.php:271
 * @route '/admin/integrations/google-smtp/test'
 */
export const test = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

test.definition = {
    methods: ["post"],
    url: '/admin/integrations/google-smtp/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::test
 * @see app/Http/Controllers/Admin/IntegrationController.php:271
 * @route '/admin/integrations/google-smtp/test'
 */
test.url = (options?: RouteQueryOptions) => {
    return test.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::test
 * @see app/Http/Controllers/Admin/IntegrationController.php:271
 * @route '/admin/integrations/google-smtp/test'
 */
test.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: test.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\IntegrationController::test
 * @see app/Http/Controllers/Admin/IntegrationController.php:271
 * @route '/admin/integrations/google-smtp/test'
 */
    const testForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: test.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\IntegrationController::test
 * @see app/Http/Controllers/Admin/IntegrationController.php:271
 * @route '/admin/integrations/google-smtp/test'
 */
        testForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: test.url(options),
            method: 'post',
        })
    
    test.form = testForm
const googleSmtp = {
    update: Object.assign(update, update),
test: Object.assign(test, test),
}

export default googleSmtp