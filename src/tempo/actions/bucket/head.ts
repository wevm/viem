import * as Gateway from '../../Gateway.js'
import type { Metadata } from './types.js'

/**
 * Reads the metadata of an object in the app's bucket. Returns `null` when the
 * object does not exist or expired. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const metadata = await Actions.bucket.head(gateway, { key: 'notes/today.txt' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns The object metadata, or `null`.
 */
export async function head(
  gateway: Gateway.Gateway,
  options: head.Options,
): Promise<head.ReturnType> {
  const { key, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/bucket/head',
    signal,
  })
  return (await response.json()) as head.ReturnType
}

export declare namespace head {
  type Options = {
    /** Object key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = Metadata | null

  type ErrorType = Gateway.request.ErrorType
}
