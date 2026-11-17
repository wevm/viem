import * as Gateway from '../../Gateway.js'
import type { Metadata } from './types.js'

/**
 * Lists objects in the app's bucket by key prefix. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { cursor, objects } = await Actions.bucket.list(gateway, {
 *   prefix: 'notes/',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns A page of object metadata and the next cursor.
 */
export async function list(
  gateway: Gateway.Gateway,
  options: list.Options = {},
): Promise<list.ReturnType> {
  const { cursor, limit, prefix, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ cursor, limit, prefix }),
    path: '/bucket/list',
    signal,
  })
  return (await response.json()) as list.ReturnType
}

export declare namespace list {
  type Options = {
    /** Cursor from a previous page. */
    cursor?: string | undefined
    /** Maximum objects per page. */
    limit?: number | undefined
    /** Key prefix. */
    prefix?: string | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Cursor of the next page, or `null` on the last page. */
    cursor: string | null
    /** Objects on this page. */
    objects: readonly Metadata[]
  }

  type ErrorType = Gateway.request.ErrorType
}
