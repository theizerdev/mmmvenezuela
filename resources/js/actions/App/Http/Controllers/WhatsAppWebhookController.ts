import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/webhooks/whatsapp'
*/
const handleIncoming6670e009b0babe822b08baf5c39cf33a = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleIncoming6670e009b0babe822b08baf5c39cf33a.url(options),
    method: 'post',
})

handleIncoming6670e009b0babe822b08baf5c39cf33a.definition = {
    methods: ["post"],
    url: '/webhooks/whatsapp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/webhooks/whatsapp'
*/
handleIncoming6670e009b0babe822b08baf5c39cf33a.url = (options?: RouteQueryOptions) => {
    return handleIncoming6670e009b0babe822b08baf5c39cf33a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/webhooks/whatsapp'
*/
handleIncoming6670e009b0babe822b08baf5c39cf33a.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleIncoming6670e009b0babe822b08baf5c39cf33a.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/webhooks/whatsapp'
*/
const handleIncoming6670e009b0babe822b08baf5c39cf33aForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handleIncoming6670e009b0babe822b08baf5c39cf33a.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/webhooks/whatsapp'
*/
handleIncoming6670e009b0babe822b08baf5c39cf33aForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handleIncoming6670e009b0babe822b08baf5c39cf33a.url(options),
    method: 'post',
})

handleIncoming6670e009b0babe822b08baf5c39cf33a.form = handleIncoming6670e009b0babe822b08baf5c39cf33aForm
/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/api/webhooks/whatsapp'
*/
const handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0 = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.url(options),
    method: 'post',
})

handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.definition = {
    methods: ["post"],
    url: '/api/webhooks/whatsapp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/api/webhooks/whatsapp'
*/
handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.url = (options?: RouteQueryOptions) => {
    return handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/api/webhooks/whatsapp'
*/
handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/api/webhooks/whatsapp'
*/
const handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0Form = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::handleIncoming
* @see app/Http/Controllers/WhatsAppWebhookController.php:13
* @route '/api/webhooks/whatsapp'
*/
handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0Form.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.url(options),
    method: 'post',
})

handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0.form = handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0Form

/**
* Multiple routes resolve to \App\Http\Controllers\WhatsAppWebhookController::handleIncoming, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `handleIncoming['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const handleIncoming = {
    '/webhooks/whatsapp': handleIncoming6670e009b0babe822b08baf5c39cf33a,
    '/api/webhooks/whatsapp': handleIncoming3f204d7f18794e3b88fcf7e5812dd1f0,
}

const WhatsAppWebhookController = { handleIncoming }

export default WhatsAppWebhookController