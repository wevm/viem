import * as Gateway from '../../Gateway.js'
import type { Sandbox } from './types.js'

/**
 * Reads whether a sandbox is running. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { status } = await Actions.compute.status(gateway, {
 *   sandboxId: sandbox.sandboxId,
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The sandbox and its status.
 */
export async function status(
  gateway: Gateway.Gateway,
  options: status.Options,
): Promise<status.ReturnType> {
  const { sandboxId, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId }),
    path: '/compute/status',
    signal,
  })
  return (await response.json()) as status.ReturnType
}

export declare namespace status {
  type Options = {
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = Sandbox & {
    /** Exit code once terminated, otherwise `null`. */
    exitCode: number | null
    /** Sandbox status. */
    status: 'running' | 'terminated'
  }

  type ErrorType = Gateway.request.ErrorType
}
