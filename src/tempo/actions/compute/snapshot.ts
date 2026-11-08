import * as Gateway from '../../Gateway.js'

/**
 * Saves a sandbox's filesystem as a snapshot kept for 30 days. Pass it to
 * `create` to start new sandboxes from it. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { snapshot } = await Actions.compute.snapshot(gateway, {
 *   sandboxId: sandbox.sandboxId,
 * })
 * const copy = await Actions.compute.create(gateway, { snapshot })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The snapshot ID and its expiry.
 */
export async function snapshot(
  gateway: Gateway.Gateway,
  options: snapshot.Options,
): Promise<snapshot.ReturnType> {
  const { sandboxId, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ sandboxId }),
    path: '/compute/snapshot',
    signal,
  })
  return (await response.json()) as snapshot.ReturnType
}

export declare namespace snapshot {
  type Options = {
    /** Sandbox ID. */
    sandboxId: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Creation time as a Unix timestamp in milliseconds. */
    createdAt: number
    /** Expiry as a Unix timestamp in milliseconds. */
    expiresAt: number
    /** Snapshot ID. */
    snapshot: string
  }

  type ErrorType = Gateway.request.ErrorType
}
