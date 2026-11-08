import * as Gateway from '../../Gateway.js'
import type { Sandbox } from './types.js'

/**
 * Lists the app's sandboxes that have not ended. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { sandboxes } = await Actions.compute.list(gateway)
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns A page of sandboxes and the next cursor.
 */
export async function list(
  gateway: Gateway.Gateway,
  options: list.Options = {},
): Promise<list.ReturnType> {
  const { cursor, limit, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ cursor, limit }),
    path: '/compute/list',
    signal,
  })
  return (await response.json()) as list.ReturnType
}

export declare namespace list {
  type Options = {
    /** Cursor from a previous page. */
    cursor?: string | undefined
    /** Maximum sandboxes per page. */
    limit?: number | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Cursor of the next page, or `null` on the last page. */
    cursor: string | null
    /** Sandboxes on this page. */
    sandboxes: readonly Sandbox[]
  }

  type ErrorType = Gateway.request.ErrorType
}
