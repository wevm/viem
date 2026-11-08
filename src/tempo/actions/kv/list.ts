import * as Gateway from '../../Gateway.js'
import type { Entry } from './types.js'

/**
 * Lists entries in the app's key-value store by key prefix, in key order. Paid
 * per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { cursor, entries } = await Actions.kv.list(gateway, {
 *   prefix: 'settings/',
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns A page of entries and the next cursor.
 */
export async function list(
  gateway: Gateway.Gateway,
  options: list.Options = {},
): Promise<list.ReturnType> {
  const { cursor, limit, prefix, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ cursor, limit, prefix }),
    path: '/kv/list',
    signal,
  })
  return (await response.json()) as list.ReturnType
}

export declare namespace list {
  type Options = {
    /** Cursor from a previous page. */
    cursor?: string | undefined
    /** Maximum entries per page. */
    limit?: number | undefined
    /** Key prefix. */
    prefix?: string | undefined
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Cursor of the next page, or `null` on the last page. */
    cursor: string | null
    /** Entries on this page. */
    entries: readonly Entry[]
  }

  type ErrorType = Gateway.request.ErrorType
}
