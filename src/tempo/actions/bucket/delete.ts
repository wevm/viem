import * as Gateway from '../../Gateway.js'

/**
 * Deletes an object from the app's bucket. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * await Actions.bucket.delete(gateway, { key: 'notes/today.txt' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns Whether the request succeeded.
 */
export async function delete_(
  gateway: Gateway.Gateway,
  options: delete_.Options,
): Promise<delete_.ReturnType> {
  const { key, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/bucket/delete',
    signal,
  })
  return (await response.json()) as delete_.ReturnType
}

export declare namespace delete_ {
  type Options = {
    /** Object key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Whether the request succeeded. */
    deleted: boolean
  }

  type ErrorType = Gateway.request.ErrorType
}
