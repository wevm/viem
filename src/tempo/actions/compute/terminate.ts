import * as Gateway from '../../Gateway.js'

/**
 * Terminates a sandbox. The Gateway credits the unused rest of its lease back
 * to the payment channel. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * await Actions.compute.terminate(gateway, { sandboxId: sandbox.sandboxId })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The final status.
 */
export async function terminate(
  gateway: Gateway.Gateway,
  options: terminate.Options,
): Promise<terminate.ReturnType> {
  const { sandboxId, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId }),
    path: '/compute/terminate',
    signal,
  })
  return (await response.json()) as terminate.ReturnType
}

export declare namespace terminate {
  type Options = {
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Exit code of the sandbox, or `null`. */
    exitCode: number | null
    /** Amount credited back for the unused lease, in currency units. */
    refunded: number
    /** Sandbox ID. */
    sandboxId: string
    /** Sandbox status. */
    status: 'terminated'
  }

  type ErrorType = Gateway.request.ErrorType
}
