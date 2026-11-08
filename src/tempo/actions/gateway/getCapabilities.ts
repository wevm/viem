import * as Gateway from '../../Gateway.js'

/**
 * Reads the Gateway's free discovery document: chain, currencies, prices,
 * limits, and models.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const capabilities = await Actions.gateway.getCapabilities(Gateway.from())
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The Gateway capabilities.
 */
export async function getCapabilities(
  gateway: Gateway.Gateway,
  options: getCapabilities.Options = {},
): Promise<getCapabilities.ReturnType> {
  return Gateway.getCapabilities(gateway, options)
}

export declare namespace getCapabilities {
  type Options = Gateway.getCapabilities.Options

  type ReturnType = Gateway.Capabilities

  type ErrorType = Gateway.request.ErrorType
}
