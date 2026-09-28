import type * as Relay from '../../Relay.js'
import * as Request from './request.js'

/** Compose middleware while preserving downstream resolvers and advertising plugin capabilities. */
export function from(
  create: (next: Request.Handler) => Request.Handler,
  options: from.Options & { multisig: true },
): Relay.multisig.ReturnType
export function from(
  create: (next: Request.Handler) => Request.Handler,
  options?: from.Options,
): Relay.Plugin
export function from(
  create: (next: Request.Handler) => Request.Handler,
  options: from.Options = {},
): Relay.Plugin {
  const plugin: Relay.Plugin = (next) => {
    const handler = create(next)
    if (!options.resolveTokens) return Request.inherit(next, handler)

    const handle: Request.Handler = (request, requestOptions) =>
      handler(request, requestOptions)
    handle[Request.tokens] = options.resolveTokens
    if (handler[Request.deferred])
      handle[Request.deferred] = handler[Request.deferred]
    return Request.inherit(next, Request.inherit(handler, handle))
  }
  if (options.multisig) plugin.multisig = true
  return plugin
}

export declare namespace from {
  export type Options = {
    multisig?: true | undefined
    resolveTokens?: Request.Handler[typeof Request.tokens] | undefined
  }
}
