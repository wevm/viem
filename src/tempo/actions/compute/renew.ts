import * as Gateway from '../../Gateway.js'
import type { Sandbox } from './types.js'

/**
 * Pays for more seconds of a sandbox at its per-second rate, up to its
 * `timeout`. A sandbox whose `paidUntil` passes is terminated within about a
 * minute. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { paidUntil } = await Actions.compute.renew(gateway, {
 *   sandboxId: sandbox.sandboxId,
 *   seconds: 300,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The sandbox with its new `paidUntil`.
 */
export async function renew(
  gateway: Gateway.Gateway,
  options: renew.Options,
): Promise<renew.ReturnType> {
  const { sandboxId, seconds, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId, seconds }),
    path: '/compute/renew',
    signal,
  })
  return (await response.json()) as renew.ReturnType
}

export declare namespace renew {
  type Options = {
    /** Sandbox ID. */
    sandboxId: string
    /** Seconds to pay for. */
    seconds: number
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = Sandbox

  type ErrorType = Gateway.request.ErrorType
}
