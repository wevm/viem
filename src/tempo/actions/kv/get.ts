import * as Gateway from '../../Gateway.js'
import type { Entry } from './types.js'

/**
 * Reads a key from the app's key-value store. Returns `null` when the key does
 * not exist or expired. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const entry = await Actions.kv.get(gateway, { key: 'counter' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The entry, or `null`.
 */
export async function get(
  gateway: Gateway.Gateway,
  options: get.Options,
): Promise<get.ReturnType> {
  const { key, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/kv/get',
    signal,
  })
  return (await response.json()) as get.ReturnType
}

export declare namespace get {
  type Options = {
    /** Key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = Entry | null

  type ErrorType = Gateway.request.ErrorType
}
