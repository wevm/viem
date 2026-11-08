import * as Gateway from '../../Gateway.js'
import type { Entry } from './types.js'

/**
 * Writes a JSON value to the app's key-value store. Paid per request.
 *
 * Pass `ifVersion` to write conditionally: `null` creates the key only if it
 * does not exist, and a version replaces the value only if it is still that
 * version. A failed condition throws `Gateway.VersionConflictError`.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const entry = await Actions.kv.set(gateway, {
 *   ifVersion: null,
 *   key: 'counter',
 *   value: { count: 1 },
 * })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The written entry.
 */
export async function set(
  gateway: Gateway.Gateway,
  options: set.Options,
): Promise<set.ReturnType> {
  const { ifVersion, key, signal, ttl, value } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ ifVersion, key, ttl, value }),
    path: '/kv/set',
    signal,
  })
  return (await response.json()) as set.ReturnType
}

export declare namespace set {
  type Options = {
    /**
     * Write condition: `null` creates the key only if it does not exist; a
     * version replaces the value only if it is still that version.
     */
    ifVersion?: number | null | undefined
    /** Key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
    /**
     * Time to live in seconds. Without it, the entry is kept for the Gateway's
     * longest retention (`limits.retentionSeconds`).
     */
    ttl?: number | undefined
    /** JSON-serializable value. */
    value: unknown
  }

  type ReturnType = Entry

  type ErrorType = Gateway.request.ErrorType
}
