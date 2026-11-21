import * as Gateway from '../Gateway.js'

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
 * @param parameters - Parameters.
 * @returns The Gateway capabilities.
 */
export async function getCapabilities(
  gateway: Gateway.Gateway,
  parameters: getCapabilities.Parameters = {},
): Promise<getCapabilities.ReturnValue> {
  return Gateway.getCapabilities(gateway, parameters)
}

export declare namespace getCapabilities {
  type Parameters = Gateway.getCapabilities.Options

  type ReturnValue = Gateway.Capabilities

  type ErrorType = Gateway.request.ErrorType
}
