import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
const whatsappDocs09f19fee25de3507901aa68cef1f226a = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDocs09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

whatsappDocs09f19fee25de3507901aa68cef1f226a.definition = {
    methods: ["get","head"],
    url: '/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsappDocs09f19fee25de3507901aa68cef1f226a.url = (options?: RouteQueryOptions) => {
    return whatsappDocs09f19fee25de3507901aa68cef1f226a.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsappDocs09f19fee25de3507901aa68cef1f226a.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDocs09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsappDocs09f19fee25de3507901aa68cef1f226a.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappDocs09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
const whatsappDocs09f19fee25de3507901aa68cef1f226aForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocs09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsappDocs09f19fee25de3507901aa68cef1f226aForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocs09f19fee25de3507901aa68cef1f226a.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs'
*/
whatsappDocs09f19fee25de3507901aa68cef1f226aForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocs09f19fee25de3507901aa68cef1f226a.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappDocs09f19fee25de3507901aa68cef1f226a.form = whatsappDocs09f19fee25de3507901aa68cef1f226aForm
/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs/whatsapp'
*/
const whatsappDocs4692d2f7959e2384314370a7c586c7b4 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDocs4692d2f7959e2384314370a7c586c7b4.url(options),
    method: 'get',
})

whatsappDocs4692d2f7959e2384314370a7c586c7b4.definition = {
    methods: ["get","head"],
    url: '/docs/whatsapp',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs/whatsapp'
*/
whatsappDocs4692d2f7959e2384314370a7c586c7b4.url = (options?: RouteQueryOptions) => {
    return whatsappDocs4692d2f7959e2384314370a7c586c7b4.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs/whatsapp'
*/
whatsappDocs4692d2f7959e2384314370a7c586c7b4.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDocs4692d2f7959e2384314370a7c586c7b4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs/whatsapp'
*/
whatsappDocs4692d2f7959e2384314370a7c586c7b4.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappDocs4692d2f7959e2384314370a7c586c7b4.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs/whatsapp'
*/
const whatsappDocs4692d2f7959e2384314370a7c586c7b4Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocs4692d2f7959e2384314370a7c586c7b4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs/whatsapp'
*/
whatsappDocs4692d2f7959e2384314370a7c586c7b4Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocs4692d2f7959e2384314370a7c586c7b4.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/docs/whatsapp'
*/
whatsappDocs4692d2f7959e2384314370a7c586c7b4Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocs4692d2f7959e2384314370a7c586c7b4.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappDocs4692d2f7959e2384314370a7c586c7b4.form = whatsappDocs4692d2f7959e2384314370a7c586c7b4Form
/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/admin/integrations/whatsapp/docs'
*/
const whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.url(options),
    method: 'get',
})

whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/whatsapp/docs',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/admin/integrations/whatsapp/docs'
*/
whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.url = (options?: RouteQueryOptions) => {
    return whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/admin/integrations/whatsapp/docs'
*/
whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/admin/integrations/whatsapp/docs'
*/
whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/admin/integrations/whatsapp/docs'
*/
const whatsappDocsebbd1c16ecbdef581a00afd294d7eb4dForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/admin/integrations/whatsapp/docs'
*/
whatsappDocsebbd1c16ecbdef581a00afd294d7eb4dForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDocs
* @see app/Http/Controllers/Admin/IntegrationController.php:600
* @route '/admin/integrations/whatsapp/docs'
*/
whatsappDocsebbd1c16ecbdef581a00afd294d7eb4dForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d.form = whatsappDocsebbd1c16ecbdef581a00afd294d7eb4dForm

/**
* Multiple routes resolve to \App\Http\Controllers\Admin\IntegrationController::whatsappDocs, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `whatsappDocs['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const whatsappDocs = {
    '/docs': whatsappDocs09f19fee25de3507901aa68cef1f226a,
    '/docs/whatsapp': whatsappDocs4692d2f7959e2384314370a7c586c7b4,
    '/admin/integrations/whatsapp/docs': whatsappDocsebbd1c16ecbdef581a00afd294d7eb4d,
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::index
* @see app/Http/Controllers/Admin/IntegrationController.php:24
* @route '/admin/integrations'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/integrations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::index
* @see app/Http/Controllers/Admin/IntegrationController.php:24
* @route '/admin/integrations'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::index
* @see app/Http/Controllers/Admin/IntegrationController.php:24
* @route '/admin/integrations'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::index
* @see app/Http/Controllers/Admin/IntegrationController.php:24
* @route '/admin/integrations'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::index
* @see app/Http/Controllers/Admin/IntegrationController.php:24
* @route '/admin/integrations'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::index
* @see app/Http/Controllers/Admin/IntegrationController.php:24
* @route '/admin/integrations'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::index
* @see app/Http/Controllers/Admin/IntegrationController.php:24
* @route '/admin/integrations'
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
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxMap
* @see app/Http/Controllers/Admin/IntegrationController.php:80
* @route '/admin/integrations/map'
*/
export const mapboxMap = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mapboxMap.url(options),
    method: 'get',
})

mapboxMap.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/map',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxMap
* @see app/Http/Controllers/Admin/IntegrationController.php:80
* @route '/admin/integrations/map'
*/
mapboxMap.url = (options?: RouteQueryOptions) => {
    return mapboxMap.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxMap
* @see app/Http/Controllers/Admin/IntegrationController.php:80
* @route '/admin/integrations/map'
*/
mapboxMap.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mapboxMap.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxMap
* @see app/Http/Controllers/Admin/IntegrationController.php:80
* @route '/admin/integrations/map'
*/
mapboxMap.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mapboxMap.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxMap
* @see app/Http/Controllers/Admin/IntegrationController.php:80
* @route '/admin/integrations/map'
*/
const mapboxMapForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mapboxMap.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxMap
* @see app/Http/Controllers/Admin/IntegrationController.php:80
* @route '/admin/integrations/map'
*/
mapboxMapForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mapboxMap.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxMap
* @see app/Http/Controllers/Admin/IntegrationController.php:80
* @route '/admin/integrations/map'
*/
mapboxMapForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mapboxMap.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

mapboxMap.form = mapboxMapForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxNavigation
* @see app/Http/Controllers/Admin/IntegrationController.php:102
* @route '/admin/integrations/map/navigation'
*/
export const mapboxNavigation = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mapboxNavigation.url(options),
    method: 'get',
})

mapboxNavigation.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/map/navigation',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxNavigation
* @see app/Http/Controllers/Admin/IntegrationController.php:102
* @route '/admin/integrations/map/navigation'
*/
mapboxNavigation.url = (options?: RouteQueryOptions) => {
    return mapboxNavigation.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxNavigation
* @see app/Http/Controllers/Admin/IntegrationController.php:102
* @route '/admin/integrations/map/navigation'
*/
mapboxNavigation.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: mapboxNavigation.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxNavigation
* @see app/Http/Controllers/Admin/IntegrationController.php:102
* @route '/admin/integrations/map/navigation'
*/
mapboxNavigation.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: mapboxNavigation.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxNavigation
* @see app/Http/Controllers/Admin/IntegrationController.php:102
* @route '/admin/integrations/map/navigation'
*/
const mapboxNavigationForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mapboxNavigation.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxNavigation
* @see app/Http/Controllers/Admin/IntegrationController.php:102
* @route '/admin/integrations/map/navigation'
*/
mapboxNavigationForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mapboxNavigation.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mapboxNavigation
* @see app/Http/Controllers/Admin/IntegrationController.php:102
* @route '/admin/integrations/map/navigation'
*/
mapboxNavigationForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: mapboxNavigation.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

mapboxNavigation.form = mapboxNavigationForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMapbox
* @see app/Http/Controllers/Admin/IntegrationController.php:124
* @route '/admin/integrations/mapbox'
*/
export const updateMapbox = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMapbox.url(options),
    method: 'put',
})

updateMapbox.definition = {
    methods: ["put"],
    url: '/admin/integrations/mapbox',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMapbox
* @see app/Http/Controllers/Admin/IntegrationController.php:124
* @route '/admin/integrations/mapbox'
*/
updateMapbox.url = (options?: RouteQueryOptions) => {
    return updateMapbox.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMapbox
* @see app/Http/Controllers/Admin/IntegrationController.php:124
* @route '/admin/integrations/mapbox'
*/
updateMapbox.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMapbox.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMapbox
* @see app/Http/Controllers/Admin/IntegrationController.php:124
* @route '/admin/integrations/mapbox'
*/
const updateMapboxForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMapbox.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMapbox
* @see app/Http/Controllers/Admin/IntegrationController.php:124
* @route '/admin/integrations/mapbox'
*/
updateMapboxForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMapbox.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateMapbox.form = updateMapboxForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleMaps
* @see app/Http/Controllers/Admin/IntegrationController.php:154
* @route '/admin/integrations/google-maps'
*/
export const updateGoogleMaps = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateGoogleMaps.url(options),
    method: 'put',
})

updateGoogleMaps.definition = {
    methods: ["put"],
    url: '/admin/integrations/google-maps',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleMaps
* @see app/Http/Controllers/Admin/IntegrationController.php:154
* @route '/admin/integrations/google-maps'
*/
updateGoogleMaps.url = (options?: RouteQueryOptions) => {
    return updateGoogleMaps.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleMaps
* @see app/Http/Controllers/Admin/IntegrationController.php:154
* @route '/admin/integrations/google-maps'
*/
updateGoogleMaps.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateGoogleMaps.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleMaps
* @see app/Http/Controllers/Admin/IntegrationController.php:154
* @route '/admin/integrations/google-maps'
*/
const updateGoogleMapsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateGoogleMaps.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleMaps
* @see app/Http/Controllers/Admin/IntegrationController.php:154
* @route '/admin/integrations/google-maps'
*/
updateGoogleMapsForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateGoogleMaps.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateGoogleMaps.form = updateGoogleMapsForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleSmtp
* @see app/Http/Controllers/Admin/IntegrationController.php:184
* @route '/admin/integrations/google-smtp'
*/
export const updateGoogleSmtp = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateGoogleSmtp.url(options),
    method: 'put',
})

updateGoogleSmtp.definition = {
    methods: ["put"],
    url: '/admin/integrations/google-smtp',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleSmtp
* @see app/Http/Controllers/Admin/IntegrationController.php:184
* @route '/admin/integrations/google-smtp'
*/
updateGoogleSmtp.url = (options?: RouteQueryOptions) => {
    return updateGoogleSmtp.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleSmtp
* @see app/Http/Controllers/Admin/IntegrationController.php:184
* @route '/admin/integrations/google-smtp'
*/
updateGoogleSmtp.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateGoogleSmtp.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleSmtp
* @see app/Http/Controllers/Admin/IntegrationController.php:184
* @route '/admin/integrations/google-smtp'
*/
const updateGoogleSmtpForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateGoogleSmtp.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateGoogleSmtp
* @see app/Http/Controllers/Admin/IntegrationController.php:184
* @route '/admin/integrations/google-smtp'
*/
updateGoogleSmtpForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateGoogleSmtp.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateGoogleSmtp.form = updateGoogleSmtpForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::googleSmtpTest
* @see app/Http/Controllers/Admin/IntegrationController.php:231
* @route '/admin/integrations/google-smtp/test'
*/
export const googleSmtpTest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: googleSmtpTest.url(options),
    method: 'post',
})

googleSmtpTest.definition = {
    methods: ["post"],
    url: '/admin/integrations/google-smtp/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::googleSmtpTest
* @see app/Http/Controllers/Admin/IntegrationController.php:231
* @route '/admin/integrations/google-smtp/test'
*/
googleSmtpTest.url = (options?: RouteQueryOptions) => {
    return googleSmtpTest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::googleSmtpTest
* @see app/Http/Controllers/Admin/IntegrationController.php:231
* @route '/admin/integrations/google-smtp/test'
*/
googleSmtpTest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: googleSmtpTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::googleSmtpTest
* @see app/Http/Controllers/Admin/IntegrationController.php:231
* @route '/admin/integrations/google-smtp/test'
*/
const googleSmtpTestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: googleSmtpTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::googleSmtpTest
* @see app/Http/Controllers/Admin/IntegrationController.php:231
* @route '/admin/integrations/google-smtp/test'
*/
googleSmtpTestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: googleSmtpTest.url(options),
    method: 'post',
})

googleSmtpTest.form = googleSmtpTestForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailgun
* @see app/Http/Controllers/Admin/IntegrationController.php:305
* @route '/admin/integrations/mailgun'
*/
export const updateMailgun = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMailgun.url(options),
    method: 'put',
})

updateMailgun.definition = {
    methods: ["put"],
    url: '/admin/integrations/mailgun',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailgun
* @see app/Http/Controllers/Admin/IntegrationController.php:305
* @route '/admin/integrations/mailgun'
*/
updateMailgun.url = (options?: RouteQueryOptions) => {
    return updateMailgun.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailgun
* @see app/Http/Controllers/Admin/IntegrationController.php:305
* @route '/admin/integrations/mailgun'
*/
updateMailgun.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMailgun.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailgun
* @see app/Http/Controllers/Admin/IntegrationController.php:305
* @route '/admin/integrations/mailgun'
*/
const updateMailgunForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMailgun.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailgun
* @see app/Http/Controllers/Admin/IntegrationController.php:305
* @route '/admin/integrations/mailgun'
*/
updateMailgunForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMailgun.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateMailgun.form = updateMailgunForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailgunTest
* @see app/Http/Controllers/Admin/IntegrationController.php:348
* @route '/admin/integrations/mailgun/test'
*/
export const mailgunTest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mailgunTest.url(options),
    method: 'post',
})

mailgunTest.definition = {
    methods: ["post"],
    url: '/admin/integrations/mailgun/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailgunTest
* @see app/Http/Controllers/Admin/IntegrationController.php:348
* @route '/admin/integrations/mailgun/test'
*/
mailgunTest.url = (options?: RouteQueryOptions) => {
    return mailgunTest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailgunTest
* @see app/Http/Controllers/Admin/IntegrationController.php:348
* @route '/admin/integrations/mailgun/test'
*/
mailgunTest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mailgunTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailgunTest
* @see app/Http/Controllers/Admin/IntegrationController.php:348
* @route '/admin/integrations/mailgun/test'
*/
const mailgunTestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: mailgunTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailgunTest
* @see app/Http/Controllers/Admin/IntegrationController.php:348
* @route '/admin/integrations/mailgun/test'
*/
mailgunTestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: mailgunTest.url(options),
    method: 'post',
})

mailgunTest.form = mailgunTestForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailpit
* @see app/Http/Controllers/Admin/IntegrationController.php:425
* @route '/admin/integrations/mailpit'
*/
export const updateMailpit = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMailpit.url(options),
    method: 'put',
})

updateMailpit.definition = {
    methods: ["put"],
    url: '/admin/integrations/mailpit',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailpit
* @see app/Http/Controllers/Admin/IntegrationController.php:425
* @route '/admin/integrations/mailpit'
*/
updateMailpit.url = (options?: RouteQueryOptions) => {
    return updateMailpit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailpit
* @see app/Http/Controllers/Admin/IntegrationController.php:425
* @route '/admin/integrations/mailpit'
*/
updateMailpit.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateMailpit.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailpit
* @see app/Http/Controllers/Admin/IntegrationController.php:425
* @route '/admin/integrations/mailpit'
*/
const updateMailpitForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMailpit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateMailpit
* @see app/Http/Controllers/Admin/IntegrationController.php:425
* @route '/admin/integrations/mailpit'
*/
updateMailpitForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateMailpit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateMailpit.form = updateMailpitForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailpitTest
* @see app/Http/Controllers/Admin/IntegrationController.php:470
* @route '/admin/integrations/mailpit/test'
*/
export const mailpitTest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mailpitTest.url(options),
    method: 'post',
})

mailpitTest.definition = {
    methods: ["post"],
    url: '/admin/integrations/mailpit/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailpitTest
* @see app/Http/Controllers/Admin/IntegrationController.php:470
* @route '/admin/integrations/mailpit/test'
*/
mailpitTest.url = (options?: RouteQueryOptions) => {
    return mailpitTest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailpitTest
* @see app/Http/Controllers/Admin/IntegrationController.php:470
* @route '/admin/integrations/mailpit/test'
*/
mailpitTest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: mailpitTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailpitTest
* @see app/Http/Controllers/Admin/IntegrationController.php:470
* @route '/admin/integrations/mailpit/test'
*/
const mailpitTestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: mailpitTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::mailpitTest
* @see app/Http/Controllers/Admin/IntegrationController.php:470
* @route '/admin/integrations/mailpit/test'
*/
mailpitTestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: mailpitTest.url(options),
    method: 'post',
})

mailpitTest.form = mailpitTestForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateControlAcceso
* @see app/Http/Controllers/Admin/IntegrationController.php:537
* @route '/admin/integrations/control-acceso'
*/
export const updateControlAcceso = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateControlAcceso.url(options),
    method: 'put',
})

updateControlAcceso.definition = {
    methods: ["put"],
    url: '/admin/integrations/control-acceso',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateControlAcceso
* @see app/Http/Controllers/Admin/IntegrationController.php:537
* @route '/admin/integrations/control-acceso'
*/
updateControlAcceso.url = (options?: RouteQueryOptions) => {
    return updateControlAcceso.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateControlAcceso
* @see app/Http/Controllers/Admin/IntegrationController.php:537
* @route '/admin/integrations/control-acceso'
*/
updateControlAcceso.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateControlAcceso.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateControlAcceso
* @see app/Http/Controllers/Admin/IntegrationController.php:537
* @route '/admin/integrations/control-acceso'
*/
const updateControlAccesoForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateControlAcceso.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateControlAcceso
* @see app/Http/Controllers/Admin/IntegrationController.php:537
* @route '/admin/integrations/control-acceso'
*/
updateControlAccesoForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateControlAcceso.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateControlAcceso.form = updateControlAccesoForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::controlAccesoTest
* @see app/Http/Controllers/Admin/IntegrationController.php:571
* @route '/admin/integrations/control-acceso/test'
*/
export const controlAccesoTest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: controlAccesoTest.url(options),
    method: 'post',
})

controlAccesoTest.definition = {
    methods: ["post"],
    url: '/admin/integrations/control-acceso/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::controlAccesoTest
* @see app/Http/Controllers/Admin/IntegrationController.php:571
* @route '/admin/integrations/control-acceso/test'
*/
controlAccesoTest.url = (options?: RouteQueryOptions) => {
    return controlAccesoTest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::controlAccesoTest
* @see app/Http/Controllers/Admin/IntegrationController.php:571
* @route '/admin/integrations/control-acceso/test'
*/
controlAccesoTest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: controlAccesoTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::controlAccesoTest
* @see app/Http/Controllers/Admin/IntegrationController.php:571
* @route '/admin/integrations/control-acceso/test'
*/
const controlAccesoTestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: controlAccesoTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::controlAccesoTest
* @see app/Http/Controllers/Admin/IntegrationController.php:571
* @route '/admin/integrations/control-acceso/test'
*/
controlAccesoTestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: controlAccesoTest.url(options),
    method: 'post',
})

controlAccesoTest.form = controlAccesoTestForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:623
* @route '/admin/integrations/whatsapp'
*/
export const whatsappIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappIndex.url(options),
    method: 'get',
})

whatsappIndex.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/whatsapp',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:623
* @route '/admin/integrations/whatsapp'
*/
whatsappIndex.url = (options?: RouteQueryOptions) => {
    return whatsappIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:623
* @route '/admin/integrations/whatsapp'
*/
whatsappIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:623
* @route '/admin/integrations/whatsapp'
*/
whatsappIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappIndex.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:623
* @route '/admin/integrations/whatsapp'
*/
const whatsappIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:623
* @route '/admin/integrations/whatsapp'
*/
whatsappIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:623
* @route '/admin/integrations/whatsapp'
*/
whatsappIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappIndex.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappIndex.form = whatsappIndexForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappStatus
* @see app/Http/Controllers/Admin/IntegrationController.php:685
* @route '/admin/integrations/whatsapp/status'
*/
export const whatsappStatus = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappStatus.url(options),
    method: 'get',
})

whatsappStatus.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/whatsapp/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappStatus
* @see app/Http/Controllers/Admin/IntegrationController.php:685
* @route '/admin/integrations/whatsapp/status'
*/
whatsappStatus.url = (options?: RouteQueryOptions) => {
    return whatsappStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappStatus
* @see app/Http/Controllers/Admin/IntegrationController.php:685
* @route '/admin/integrations/whatsapp/status'
*/
whatsappStatus.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappStatus.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappStatus
* @see app/Http/Controllers/Admin/IntegrationController.php:685
* @route '/admin/integrations/whatsapp/status'
*/
whatsappStatus.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappStatus.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappStatus
* @see app/Http/Controllers/Admin/IntegrationController.php:685
* @route '/admin/integrations/whatsapp/status'
*/
const whatsappStatusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappStatus.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappStatus
* @see app/Http/Controllers/Admin/IntegrationController.php:685
* @route '/admin/integrations/whatsapp/status'
*/
whatsappStatusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappStatus.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappStatus
* @see app/Http/Controllers/Admin/IntegrationController.php:685
* @route '/admin/integrations/whatsapp/status'
*/
whatsappStatusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappStatus.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappStatus.form = whatsappStatusForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappQueueStats
* @see app/Http/Controllers/Admin/IntegrationController.php:914
* @route '/admin/integrations/whatsapp/queue-stats'
*/
export const whatsappQueueStats = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappQueueStats.url(options),
    method: 'get',
})

whatsappQueueStats.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/whatsapp/queue-stats',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappQueueStats
* @see app/Http/Controllers/Admin/IntegrationController.php:914
* @route '/admin/integrations/whatsapp/queue-stats'
*/
whatsappQueueStats.url = (options?: RouteQueryOptions) => {
    return whatsappQueueStats.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappQueueStats
* @see app/Http/Controllers/Admin/IntegrationController.php:914
* @route '/admin/integrations/whatsapp/queue-stats'
*/
whatsappQueueStats.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappQueueStats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappQueueStats
* @see app/Http/Controllers/Admin/IntegrationController.php:914
* @route '/admin/integrations/whatsapp/queue-stats'
*/
whatsappQueueStats.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappQueueStats.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappQueueStats
* @see app/Http/Controllers/Admin/IntegrationController.php:914
* @route '/admin/integrations/whatsapp/queue-stats'
*/
const whatsappQueueStatsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappQueueStats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappQueueStats
* @see app/Http/Controllers/Admin/IntegrationController.php:914
* @route '/admin/integrations/whatsapp/queue-stats'
*/
whatsappQueueStatsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappQueueStats.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappQueueStats
* @see app/Http/Controllers/Admin/IntegrationController.php:914
* @route '/admin/integrations/whatsapp/queue-stats'
*/
whatsappQueueStatsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappQueueStats.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappQueueStats.form = whatsappQueueStatsForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:712
* @route '/admin/integrations/whatsapp/update'
*/
export const whatsappUpdate = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: whatsappUpdate.url(options),
    method: 'put',
})

whatsappUpdate.definition = {
    methods: ["put"],
    url: '/admin/integrations/whatsapp/update',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:712
* @route '/admin/integrations/whatsapp/update'
*/
whatsappUpdate.url = (options?: RouteQueryOptions) => {
    return whatsappUpdate.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:712
* @route '/admin/integrations/whatsapp/update'
*/
whatsappUpdate.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: whatsappUpdate.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:712
* @route '/admin/integrations/whatsapp/update'
*/
const whatsappUpdateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappUpdate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:712
* @route '/admin/integrations/whatsapp/update'
*/
whatsappUpdateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappUpdate.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

whatsappUpdate.form = whatsappUpdateForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdateAntiBan
* @see app/Http/Controllers/Admin/IntegrationController.php:988
* @route '/admin/integrations/whatsapp/antiban'
*/
export const whatsappUpdateAntiBan = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappUpdateAntiBan.url(options),
    method: 'post',
})

whatsappUpdateAntiBan.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/antiban',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdateAntiBan
* @see app/Http/Controllers/Admin/IntegrationController.php:988
* @route '/admin/integrations/whatsapp/antiban'
*/
whatsappUpdateAntiBan.url = (options?: RouteQueryOptions) => {
    return whatsappUpdateAntiBan.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdateAntiBan
* @see app/Http/Controllers/Admin/IntegrationController.php:988
* @route '/admin/integrations/whatsapp/antiban'
*/
whatsappUpdateAntiBan.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappUpdateAntiBan.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdateAntiBan
* @see app/Http/Controllers/Admin/IntegrationController.php:988
* @route '/admin/integrations/whatsapp/antiban'
*/
const whatsappUpdateAntiBanForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappUpdateAntiBan.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappUpdateAntiBan
* @see app/Http/Controllers/Admin/IntegrationController.php:988
* @route '/admin/integrations/whatsapp/antiban'
*/
whatsappUpdateAntiBanForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappUpdateAntiBan.url(options),
    method: 'post',
})

whatsappUpdateAntiBan.form = whatsappUpdateAntiBanForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappGenerateToken
* @see app/Http/Controllers/Admin/IntegrationController.php:760
* @route '/admin/integrations/whatsapp/generate-token'
*/
export const whatsappGenerateToken = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappGenerateToken.url(options),
    method: 'post',
})

whatsappGenerateToken.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/generate-token',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappGenerateToken
* @see app/Http/Controllers/Admin/IntegrationController.php:760
* @route '/admin/integrations/whatsapp/generate-token'
*/
whatsappGenerateToken.url = (options?: RouteQueryOptions) => {
    return whatsappGenerateToken.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappGenerateToken
* @see app/Http/Controllers/Admin/IntegrationController.php:760
* @route '/admin/integrations/whatsapp/generate-token'
*/
whatsappGenerateToken.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappGenerateToken.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappGenerateToken
* @see app/Http/Controllers/Admin/IntegrationController.php:760
* @route '/admin/integrations/whatsapp/generate-token'
*/
const whatsappGenerateTokenForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappGenerateToken.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappGenerateToken
* @see app/Http/Controllers/Admin/IntegrationController.php:760
* @route '/admin/integrations/whatsapp/generate-token'
*/
whatsappGenerateTokenForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappGenerateToken.url(options),
    method: 'post',
})

whatsappGenerateToken.form = whatsappGenerateTokenForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSync
* @see app/Http/Controllers/Admin/IntegrationController.php:787
* @route '/admin/integrations/whatsapp/sync'
*/
export const whatsappSync = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappSync.url(options),
    method: 'post',
})

whatsappSync.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/sync',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSync
* @see app/Http/Controllers/Admin/IntegrationController.php:787
* @route '/admin/integrations/whatsapp/sync'
*/
whatsappSync.url = (options?: RouteQueryOptions) => {
    return whatsappSync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSync
* @see app/Http/Controllers/Admin/IntegrationController.php:787
* @route '/admin/integrations/whatsapp/sync'
*/
whatsappSync.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappSync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSync
* @see app/Http/Controllers/Admin/IntegrationController.php:787
* @route '/admin/integrations/whatsapp/sync'
*/
const whatsappSyncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappSync.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSync
* @see app/Http/Controllers/Admin/IntegrationController.php:787
* @route '/admin/integrations/whatsapp/sync'
*/
whatsappSyncForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappSync.url(options),
    method: 'post',
})

whatsappSync.form = whatsappSyncForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappConnect
* @see app/Http/Controllers/Admin/IntegrationController.php:825
* @route '/admin/integrations/whatsapp/connect'
*/
export const whatsappConnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappConnect.url(options),
    method: 'post',
})

whatsappConnect.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappConnect
* @see app/Http/Controllers/Admin/IntegrationController.php:825
* @route '/admin/integrations/whatsapp/connect'
*/
whatsappConnect.url = (options?: RouteQueryOptions) => {
    return whatsappConnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappConnect
* @see app/Http/Controllers/Admin/IntegrationController.php:825
* @route '/admin/integrations/whatsapp/connect'
*/
whatsappConnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappConnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappConnect
* @see app/Http/Controllers/Admin/IntegrationController.php:825
* @route '/admin/integrations/whatsapp/connect'
*/
const whatsappConnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappConnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappConnect
* @see app/Http/Controllers/Admin/IntegrationController.php:825
* @route '/admin/integrations/whatsapp/connect'
*/
whatsappConnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappConnect.url(options),
    method: 'post',
})

whatsappConnect.form = whatsappConnectForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDisconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:862
* @route '/admin/integrations/whatsapp/disconnect'
*/
export const whatsappDisconnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappDisconnect.url(options),
    method: 'post',
})

whatsappDisconnect.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/disconnect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDisconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:862
* @route '/admin/integrations/whatsapp/disconnect'
*/
whatsappDisconnect.url = (options?: RouteQueryOptions) => {
    return whatsappDisconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDisconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:862
* @route '/admin/integrations/whatsapp/disconnect'
*/
whatsappDisconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappDisconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDisconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:862
* @route '/admin/integrations/whatsapp/disconnect'
*/
const whatsappDisconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappDisconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDisconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:862
* @route '/admin/integrations/whatsapp/disconnect'
*/
whatsappDisconnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappDisconnect.url(options),
    method: 'post',
})

whatsappDisconnect.form = whatsappDisconnectForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappReconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:891
* @route '/admin/integrations/whatsapp/reconnect'
*/
export const whatsappReconnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappReconnect.url(options),
    method: 'post',
})

whatsappReconnect.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/reconnect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappReconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:891
* @route '/admin/integrations/whatsapp/reconnect'
*/
whatsappReconnect.url = (options?: RouteQueryOptions) => {
    return whatsappReconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappReconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:891
* @route '/admin/integrations/whatsapp/reconnect'
*/
whatsappReconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappReconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappReconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:891
* @route '/admin/integrations/whatsapp/reconnect'
*/
const whatsappReconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappReconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappReconnect
* @see app/Http/Controllers/Admin/IntegrationController.php:891
* @route '/admin/integrations/whatsapp/reconnect'
*/
whatsappReconnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappReconnect.url(options),
    method: 'post',
})

whatsappReconnect.form = whatsappReconnectForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSendMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1102
* @route '/admin/integrations/whatsapp/send-message'
*/
export const whatsappSendMessage = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappSendMessage.url(options),
    method: 'post',
})

whatsappSendMessage.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/send-message',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSendMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1102
* @route '/admin/integrations/whatsapp/send-message'
*/
whatsappSendMessage.url = (options?: RouteQueryOptions) => {
    return whatsappSendMessage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSendMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1102
* @route '/admin/integrations/whatsapp/send-message'
*/
whatsappSendMessage.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappSendMessage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSendMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1102
* @route '/admin/integrations/whatsapp/send-message'
*/
const whatsappSendMessageForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappSendMessage.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappSendMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1102
* @route '/admin/integrations/whatsapp/send-message'
*/
whatsappSendMessageForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappSendMessage.url(options),
    method: 'post',
})

whatsappSendMessage.form = whatsappSendMessageForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappCheckNumber
* @see app/Http/Controllers/Admin/IntegrationController.php:934
* @route '/admin/integrations/whatsapp/check-number'
*/
export const whatsappCheckNumber = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappCheckNumber.url(options),
    method: 'post',
})

whatsappCheckNumber.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/check-number',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappCheckNumber
* @see app/Http/Controllers/Admin/IntegrationController.php:934
* @route '/admin/integrations/whatsapp/check-number'
*/
whatsappCheckNumber.url = (options?: RouteQueryOptions) => {
    return whatsappCheckNumber.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappCheckNumber
* @see app/Http/Controllers/Admin/IntegrationController.php:934
* @route '/admin/integrations/whatsapp/check-number'
*/
whatsappCheckNumber.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappCheckNumber.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappCheckNumber
* @see app/Http/Controllers/Admin/IntegrationController.php:934
* @route '/admin/integrations/whatsapp/check-number'
*/
const whatsappCheckNumberForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappCheckNumber.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappCheckNumber
* @see app/Http/Controllers/Admin/IntegrationController.php:934
* @route '/admin/integrations/whatsapp/check-number'
*/
whatsappCheckNumberForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappCheckNumber.url(options),
    method: 'post',
})

whatsappCheckNumber.form = whatsappCheckNumberForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappPreviewSpintax
* @see app/Http/Controllers/Admin/IntegrationController.php:958
* @route '/admin/integrations/whatsapp/preview-spintax'
*/
export const whatsappPreviewSpintax = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappPreviewSpintax.url(options),
    method: 'post',
})

whatsappPreviewSpintax.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/preview-spintax',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappPreviewSpintax
* @see app/Http/Controllers/Admin/IntegrationController.php:958
* @route '/admin/integrations/whatsapp/preview-spintax'
*/
whatsappPreviewSpintax.url = (options?: RouteQueryOptions) => {
    return whatsappPreviewSpintax.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappPreviewSpintax
* @see app/Http/Controllers/Admin/IntegrationController.php:958
* @route '/admin/integrations/whatsapp/preview-spintax'
*/
whatsappPreviewSpintax.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappPreviewSpintax.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappPreviewSpintax
* @see app/Http/Controllers/Admin/IntegrationController.php:958
* @route '/admin/integrations/whatsapp/preview-spintax'
*/
const whatsappPreviewSpintaxForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappPreviewSpintax.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappPreviewSpintax
* @see app/Http/Controllers/Admin/IntegrationController.php:958
* @route '/admin/integrations/whatsapp/preview-spintax'
*/
whatsappPreviewSpintaxForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappPreviewSpintax.url(options),
    method: 'post',
})

whatsappPreviewSpintax.form = whatsappPreviewSpintaxForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappAddToBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1051
* @route '/admin/integrations/whatsapp/blacklist'
*/
export const whatsappAddToBlacklist = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappAddToBlacklist.url(options),
    method: 'post',
})

whatsappAddToBlacklist.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/blacklist',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappAddToBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1051
* @route '/admin/integrations/whatsapp/blacklist'
*/
whatsappAddToBlacklist.url = (options?: RouteQueryOptions) => {
    return whatsappAddToBlacklist.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappAddToBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1051
* @route '/admin/integrations/whatsapp/blacklist'
*/
whatsappAddToBlacklist.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappAddToBlacklist.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappAddToBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1051
* @route '/admin/integrations/whatsapp/blacklist'
*/
const whatsappAddToBlacklistForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappAddToBlacklist.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappAddToBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1051
* @route '/admin/integrations/whatsapp/blacklist'
*/
whatsappAddToBlacklistForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappAddToBlacklist.url(options),
    method: 'post',
})

whatsappAddToBlacklist.form = whatsappAddToBlacklistForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRemoveFromBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1079
* @route '/admin/integrations/whatsapp/blacklist/{phone}'
*/
export const whatsappRemoveFromBlacklist = (args: { phone: string | number } | [phone: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: whatsappRemoveFromBlacklist.url(args, options),
    method: 'delete',
})

whatsappRemoveFromBlacklist.definition = {
    methods: ["delete"],
    url: '/admin/integrations/whatsapp/blacklist/{phone}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRemoveFromBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1079
* @route '/admin/integrations/whatsapp/blacklist/{phone}'
*/
whatsappRemoveFromBlacklist.url = (args: { phone: string | number } | [phone: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { phone: args }
    }

    if (Array.isArray(args)) {
        args = {
            phone: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        phone: args.phone,
    }

    return whatsappRemoveFromBlacklist.definition.url
            .replace('{phone}', parsedArgs.phone.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRemoveFromBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1079
* @route '/admin/integrations/whatsapp/blacklist/{phone}'
*/
whatsappRemoveFromBlacklist.delete = (args: { phone: string | number } | [phone: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: whatsappRemoveFromBlacklist.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRemoveFromBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1079
* @route '/admin/integrations/whatsapp/blacklist/{phone}'
*/
const whatsappRemoveFromBlacklistForm = (args: { phone: string | number } | [phone: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappRemoveFromBlacklist.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRemoveFromBlacklist
* @see app/Http/Controllers/Admin/IntegrationController.php:1079
* @route '/admin/integrations/whatsapp/blacklist/{phone}'
*/
whatsappRemoveFromBlacklistForm.delete = (args: { phone: string | number } | [phone: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappRemoveFromBlacklist.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

whatsappRemoveFromBlacklist.form = whatsappRemoveFromBlacklistForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDiagnostic
* @see app/Http/Controllers/Admin/IntegrationController.php:1266
* @route '/admin/integrations/whatsapp/diagnostic'
*/
export const whatsappDiagnostic = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDiagnostic.url(options),
    method: 'get',
})

whatsappDiagnostic.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/whatsapp/diagnostic',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDiagnostic
* @see app/Http/Controllers/Admin/IntegrationController.php:1266
* @route '/admin/integrations/whatsapp/diagnostic'
*/
whatsappDiagnostic.url = (options?: RouteQueryOptions) => {
    return whatsappDiagnostic.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDiagnostic
* @see app/Http/Controllers/Admin/IntegrationController.php:1266
* @route '/admin/integrations/whatsapp/diagnostic'
*/
whatsappDiagnostic.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappDiagnostic.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDiagnostic
* @see app/Http/Controllers/Admin/IntegrationController.php:1266
* @route '/admin/integrations/whatsapp/diagnostic'
*/
whatsappDiagnostic.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappDiagnostic.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDiagnostic
* @see app/Http/Controllers/Admin/IntegrationController.php:1266
* @route '/admin/integrations/whatsapp/diagnostic'
*/
const whatsappDiagnosticForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDiagnostic.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDiagnostic
* @see app/Http/Controllers/Admin/IntegrationController.php:1266
* @route '/admin/integrations/whatsapp/diagnostic'
*/
whatsappDiagnosticForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDiagnostic.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappDiagnostic
* @see app/Http/Controllers/Admin/IntegrationController.php:1266
* @route '/admin/integrations/whatsapp/diagnostic'
*/
whatsappDiagnosticForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappDiagnostic.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappDiagnostic.form = whatsappDiagnosticForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappMessages
* @see app/Http/Controllers/Admin/IntegrationController.php:1302
* @route '/admin/integrations/whatsapp/messages'
*/
export const whatsappMessages = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappMessages.url(options),
    method: 'get',
})

whatsappMessages.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/whatsapp/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappMessages
* @see app/Http/Controllers/Admin/IntegrationController.php:1302
* @route '/admin/integrations/whatsapp/messages'
*/
whatsappMessages.url = (options?: RouteQueryOptions) => {
    return whatsappMessages.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappMessages
* @see app/Http/Controllers/Admin/IntegrationController.php:1302
* @route '/admin/integrations/whatsapp/messages'
*/
whatsappMessages.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappMessages.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappMessages
* @see app/Http/Controllers/Admin/IntegrationController.php:1302
* @route '/admin/integrations/whatsapp/messages'
*/
whatsappMessages.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappMessages.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappMessages
* @see app/Http/Controllers/Admin/IntegrationController.php:1302
* @route '/admin/integrations/whatsapp/messages'
*/
const whatsappMessagesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappMessages.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappMessages
* @see app/Http/Controllers/Admin/IntegrationController.php:1302
* @route '/admin/integrations/whatsapp/messages'
*/
whatsappMessagesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappMessages.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappMessages
* @see app/Http/Controllers/Admin/IntegrationController.php:1302
* @route '/admin/integrations/whatsapp/messages'
*/
whatsappMessagesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappMessages.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappMessages.form = whatsappMessagesForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRetryMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1358
* @route '/admin/integrations/whatsapp/messages/{id}/retry'
*/
export const whatsappRetryMessage = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappRetryMessage.url(args, options),
    method: 'post',
})

whatsappRetryMessage.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/messages/{id}/retry',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRetryMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1358
* @route '/admin/integrations/whatsapp/messages/{id}/retry'
*/
whatsappRetryMessage.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return whatsappRetryMessage.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRetryMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1358
* @route '/admin/integrations/whatsapp/messages/{id}/retry'
*/
whatsappRetryMessage.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappRetryMessage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRetryMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1358
* @route '/admin/integrations/whatsapp/messages/{id}/retry'
*/
const whatsappRetryMessageForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappRetryMessage.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappRetryMessage
* @see app/Http/Controllers/Admin/IntegrationController.php:1358
* @route '/admin/integrations/whatsapp/messages/{id}/retry'
*/
whatsappRetryMessageForm.post = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappRetryMessage.url(args, options),
    method: 'post',
})

whatsappRetryMessage.form = whatsappRetryMessageForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesStore
* @see app/Http/Controllers/Admin/IntegrationController.php:1388
* @route '/admin/integrations/whatsapp/templates'
*/
export const whatsappTemplatesStore = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappTemplatesStore.url(options),
    method: 'post',
})

whatsappTemplatesStore.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/templates',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesStore
* @see app/Http/Controllers/Admin/IntegrationController.php:1388
* @route '/admin/integrations/whatsapp/templates'
*/
whatsappTemplatesStore.url = (options?: RouteQueryOptions) => {
    return whatsappTemplatesStore.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesStore
* @see app/Http/Controllers/Admin/IntegrationController.php:1388
* @route '/admin/integrations/whatsapp/templates'
*/
whatsappTemplatesStore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappTemplatesStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesStore
* @see app/Http/Controllers/Admin/IntegrationController.php:1388
* @route '/admin/integrations/whatsapp/templates'
*/
const whatsappTemplatesStoreForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappTemplatesStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesStore
* @see app/Http/Controllers/Admin/IntegrationController.php:1388
* @route '/admin/integrations/whatsapp/templates'
*/
whatsappTemplatesStoreForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappTemplatesStore.url(options),
    method: 'post',
})

whatsappTemplatesStore.form = whatsappTemplatesStoreForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:1418
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
export const whatsappTemplatesUpdate = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: whatsappTemplatesUpdate.url(args, options),
    method: 'put',
})

whatsappTemplatesUpdate.definition = {
    methods: ["put"],
    url: '/admin/integrations/whatsapp/templates/{id}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:1418
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
whatsappTemplatesUpdate.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return whatsappTemplatesUpdate.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:1418
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
whatsappTemplatesUpdate.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: whatsappTemplatesUpdate.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:1418
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
const whatsappTemplatesUpdateForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappTemplatesUpdate.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesUpdate
* @see app/Http/Controllers/Admin/IntegrationController.php:1418
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
whatsappTemplatesUpdateForm.put = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappTemplatesUpdate.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

whatsappTemplatesUpdate.form = whatsappTemplatesUpdateForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesDestroy
* @see app/Http/Controllers/Admin/IntegrationController.php:1443
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
export const whatsappTemplatesDestroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: whatsappTemplatesDestroy.url(args, options),
    method: 'delete',
})

whatsappTemplatesDestroy.definition = {
    methods: ["delete"],
    url: '/admin/integrations/whatsapp/templates/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesDestroy
* @see app/Http/Controllers/Admin/IntegrationController.php:1443
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
whatsappTemplatesDestroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return whatsappTemplatesDestroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesDestroy
* @see app/Http/Controllers/Admin/IntegrationController.php:1443
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
whatsappTemplatesDestroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: whatsappTemplatesDestroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesDestroy
* @see app/Http/Controllers/Admin/IntegrationController.php:1443
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
const whatsappTemplatesDestroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappTemplatesDestroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappTemplatesDestroy
* @see app/Http/Controllers/Admin/IntegrationController.php:1443
* @route '/admin/integrations/whatsapp/templates/{id}'
*/
whatsappTemplatesDestroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappTemplatesDestroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

whatsappTemplatesDestroy.form = whatsappTemplatesDestroyForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastRecipients
* @see app/Http/Controllers/Admin/IntegrationController.php:1459
* @route '/admin/integrations/whatsapp/broadcast/recipients'
*/
export const whatsappBroadcastRecipients = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappBroadcastRecipients.url(options),
    method: 'get',
})

whatsappBroadcastRecipients.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/whatsapp/broadcast/recipients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastRecipients
* @see app/Http/Controllers/Admin/IntegrationController.php:1459
* @route '/admin/integrations/whatsapp/broadcast/recipients'
*/
whatsappBroadcastRecipients.url = (options?: RouteQueryOptions) => {
    return whatsappBroadcastRecipients.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastRecipients
* @see app/Http/Controllers/Admin/IntegrationController.php:1459
* @route '/admin/integrations/whatsapp/broadcast/recipients'
*/
whatsappBroadcastRecipients.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: whatsappBroadcastRecipients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastRecipients
* @see app/Http/Controllers/Admin/IntegrationController.php:1459
* @route '/admin/integrations/whatsapp/broadcast/recipients'
*/
whatsappBroadcastRecipients.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: whatsappBroadcastRecipients.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastRecipients
* @see app/Http/Controllers/Admin/IntegrationController.php:1459
* @route '/admin/integrations/whatsapp/broadcast/recipients'
*/
const whatsappBroadcastRecipientsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappBroadcastRecipients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastRecipients
* @see app/Http/Controllers/Admin/IntegrationController.php:1459
* @route '/admin/integrations/whatsapp/broadcast/recipients'
*/
whatsappBroadcastRecipientsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappBroadcastRecipients.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastRecipients
* @see app/Http/Controllers/Admin/IntegrationController.php:1459
* @route '/admin/integrations/whatsapp/broadcast/recipients'
*/
whatsappBroadcastRecipientsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: whatsappBroadcastRecipients.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

whatsappBroadcastRecipients.form = whatsappBroadcastRecipientsForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastSend
* @see app/Http/Controllers/Admin/IntegrationController.php:1585
* @route '/admin/integrations/whatsapp/broadcast/send'
*/
export const whatsappBroadcastSend = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappBroadcastSend.url(options),
    method: 'post',
})

whatsappBroadcastSend.definition = {
    methods: ["post"],
    url: '/admin/integrations/whatsapp/broadcast/send',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastSend
* @see app/Http/Controllers/Admin/IntegrationController.php:1585
* @route '/admin/integrations/whatsapp/broadcast/send'
*/
whatsappBroadcastSend.url = (options?: RouteQueryOptions) => {
    return whatsappBroadcastSend.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastSend
* @see app/Http/Controllers/Admin/IntegrationController.php:1585
* @route '/admin/integrations/whatsapp/broadcast/send'
*/
whatsappBroadcastSend.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: whatsappBroadcastSend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastSend
* @see app/Http/Controllers/Admin/IntegrationController.php:1585
* @route '/admin/integrations/whatsapp/broadcast/send'
*/
const whatsappBroadcastSendForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappBroadcastSend.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::whatsappBroadcastSend
* @see app/Http/Controllers/Admin/IntegrationController.php:1585
* @route '/admin/integrations/whatsapp/broadcast/send'
*/
whatsappBroadcastSendForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: whatsappBroadcastSend.url(options),
    method: 'post',
})

whatsappBroadcastSend.form = whatsappBroadcastSendForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::validacionesIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:1148
* @route '/admin/integrations/validaciones'
*/
export const validacionesIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validacionesIndex.url(options),
    method: 'get',
})

validacionesIndex.definition = {
    methods: ["get","head"],
    url: '/admin/integrations/validaciones',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::validacionesIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:1148
* @route '/admin/integrations/validaciones'
*/
validacionesIndex.url = (options?: RouteQueryOptions) => {
    return validacionesIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::validacionesIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:1148
* @route '/admin/integrations/validaciones'
*/
validacionesIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: validacionesIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::validacionesIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:1148
* @route '/admin/integrations/validaciones'
*/
validacionesIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: validacionesIndex.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::validacionesIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:1148
* @route '/admin/integrations/validaciones'
*/
const validacionesIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: validacionesIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::validacionesIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:1148
* @route '/admin/integrations/validaciones'
*/
validacionesIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: validacionesIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::validacionesIndex
* @see app/Http/Controllers/Admin/IntegrationController.php:1148
* @route '/admin/integrations/validaciones'
*/
validacionesIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: validacionesIndex.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

validacionesIndex.form = validacionesIndexForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateJaak
* @see app/Http/Controllers/Admin/IntegrationController.php:1169
* @route '/admin/integrations/jaak'
*/
export const updateJaak = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateJaak.url(options),
    method: 'put',
})

updateJaak.definition = {
    methods: ["put"],
    url: '/admin/integrations/jaak',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateJaak
* @see app/Http/Controllers/Admin/IntegrationController.php:1169
* @route '/admin/integrations/jaak'
*/
updateJaak.url = (options?: RouteQueryOptions) => {
    return updateJaak.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateJaak
* @see app/Http/Controllers/Admin/IntegrationController.php:1169
* @route '/admin/integrations/jaak'
*/
updateJaak.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: updateJaak.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateJaak
* @see app/Http/Controllers/Admin/IntegrationController.php:1169
* @route '/admin/integrations/jaak'
*/
const updateJaakForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateJaak.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::updateJaak
* @see app/Http/Controllers/Admin/IntegrationController.php:1169
* @route '/admin/integrations/jaak'
*/
updateJaakForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateJaak.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateJaak.form = updateJaakForm

/**
* @see \App\Http\Controllers\Admin\IntegrationController::jaakTest
* @see app/Http/Controllers/Admin/IntegrationController.php:1201
* @route '/admin/integrations/jaak/test'
*/
export const jaakTest = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: jaakTest.url(options),
    method: 'post',
})

jaakTest.definition = {
    methods: ["post"],
    url: '/admin/integrations/jaak/test',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\IntegrationController::jaakTest
* @see app/Http/Controllers/Admin/IntegrationController.php:1201
* @route '/admin/integrations/jaak/test'
*/
jaakTest.url = (options?: RouteQueryOptions) => {
    return jaakTest.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\IntegrationController::jaakTest
* @see app/Http/Controllers/Admin/IntegrationController.php:1201
* @route '/admin/integrations/jaak/test'
*/
jaakTest.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: jaakTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::jaakTest
* @see app/Http/Controllers/Admin/IntegrationController.php:1201
* @route '/admin/integrations/jaak/test'
*/
const jaakTestForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: jaakTest.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Admin\IntegrationController::jaakTest
* @see app/Http/Controllers/Admin/IntegrationController.php:1201
* @route '/admin/integrations/jaak/test'
*/
jaakTestForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: jaakTest.url(options),
    method: 'post',
})

jaakTest.form = jaakTestForm

const IntegrationController = { whatsappDocs, index, mapboxMap, mapboxNavigation, updateMapbox, updateGoogleMaps, updateGoogleSmtp, googleSmtpTest, updateMailgun, mailgunTest, updateMailpit, mailpitTest, updateControlAcceso, controlAccesoTest, whatsappIndex, whatsappStatus, whatsappQueueStats, whatsappUpdate, whatsappUpdateAntiBan, whatsappGenerateToken, whatsappSync, whatsappConnect, whatsappDisconnect, whatsappReconnect, whatsappSendMessage, whatsappCheckNumber, whatsappPreviewSpintax, whatsappAddToBlacklist, whatsappRemoveFromBlacklist, whatsappDiagnostic, whatsappMessages, whatsappRetryMessage, whatsappTemplatesStore, whatsappTemplatesUpdate, whatsappTemplatesDestroy, whatsappBroadcastRecipients, whatsappBroadcastSend, validacionesIndex, updateJaak, jaakTest }

export default IntegrationController