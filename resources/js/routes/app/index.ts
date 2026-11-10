import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults, validateParameters } from './../../wayfinder'
/**
 * @see routes/web.php:100
 * @route '/presbitero/{any?}'
 */
export const presbiterio = (args?: { any?: string | number } | [any: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: presbiterio.url(args, options),
    method: 'get',
})

presbiterio.definition = {
    methods: ["get","head"],
    url: '/presbitero/{any?}',
} satisfies RouteDefinition<["get","head"]>

/**
 * @see routes/web.php:100
 * @route '/presbitero/{any?}'
 */
presbiterio.url = (args?: { any?: string | number } | [any: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { any: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    any: args[0],
                }
    }

    args = applyUrlDefaults(args)

    validateParameters(args, [
            "any",
        ])

    const parsedArgs = {
                        any: args?.any,
                }

    return presbiterio.definition.url
            .replace('{any?}', parsedArgs.any?.toString() ?? '')
            .replace(/\/+$/, '') + queryParams(options)
}

/**
 * @see routes/web.php:100
 * @route '/presbitero/{any?}'
 */
presbiterio.get = (args?: { any?: string | number } | [any: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: presbiterio.url(args, options),
    method: 'get',
})
/**
 * @see routes/web.php:100
 * @route '/presbitero/{any?}'
 */
presbiterio.head = (args?: { any?: string | number } | [any: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: presbiterio.url(args, options),
    method: 'head',
})

    /**
 * @see routes/web.php:100
 * @route '/presbitero/{any?}'
 */
    const presbiterioForm = (args?: { any?: string | number } | [any: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: presbiterio.url(args, options),
        method: 'get',
    })

            /**
 * @see routes/web.php:100
 * @route '/presbitero/{any?}'
 */
        presbiterioForm.get = (args?: { any?: string | number } | [any: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: presbiterio.url(args, options),
            method: 'get',
        })
            /**
 * @see routes/web.php:100
 * @route '/presbitero/{any?}'
 */
        presbiterioForm.head = (args?: { any?: string | number } | [any: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: presbiterio.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    presbiterio.form = presbiterioForm
const app = {
    presbiterio: Object.assign(presbiterio, presbiterio),
}

export default app