import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WhatsAppWebhookController::whatsapp
 * @see app/Http/Controllers/WhatsAppWebhookController.php:13
 * @route '/webhooks/whatsapp'
 */
export const whatsapp = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsapp.url(options),
    method: 'post',
})

whatsapp.definition = {
    methods: ["post"],
    url: '/webhooks/whatsapp',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::whatsapp
 * @see app/Http/Controllers/WhatsAppWebhookController.php:13
 * @route '/webhooks/whatsapp'
 */
whatsapp.url = (options?: RouteQueryOptions) => {
    return whatsapp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WhatsAppWebhookController::whatsapp
 * @see app/Http/Controllers/WhatsAppWebhookController.php:13
 * @route '/webhooks/whatsapp'
 */
whatsapp.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsapp.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\WhatsAppWebhookController::whatsapp
 * @see app/Http/Controllers/WhatsAppWebhookController.php:13
 * @route '/webhooks/whatsapp'
 */
    const whatsappForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: whatsapp.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\WhatsAppWebhookController::whatsapp
 * @see app/Http/Controllers/WhatsAppWebhookController.php:13
 * @route '/webhooks/whatsapp'
 */
        whatsappForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: whatsapp.url(options),
            method: 'post',
        })
    
    whatsapp.form = whatsappForm
const webhooks = {
    whatsapp: Object.assign(whatsapp, whatsapp),
}

export default webhooks