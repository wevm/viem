import * as Gateway from '../../Gateway.js'

/**
 * Deletes a key from the app's key-value store. Paid per request.
 *
 * @experimental
 *
 * @example
 * ```ts
 * import { Actions, Gateway } from 'viem/tempo'
 *
 * const gateway = Gateway.from({ fetch: mppx.fetch })
 *
 * const { deleted } = await Actions.kv.delete(gateway, { key: 'counter' })
 * ```
 *
 * @param gateway - Gateway connection.
 * @param options - Options.
 * @returns Whether the key existed.
 */
export async function delete_(
  gateway: Gateway.Gateway,
  options: delete_.Options,
): Promise<delete_.ReturnType> {
  const { key, signal } = options
  const response = await Gateway.request(gateway, {
    body: JSON.stringify({ key }),
    path: '/kv/delete',
    signal,
  })
  return (await response.json()) as delete_.ReturnType
}

export declare namespace delete_ {
  type Options = {
    /** Key. */
    key: string
    /** Signal to abort the request. */
    signal?: AbortSignal | undefined
  }

  type ReturnType = {
    /** Whether the key existed. */
    deleted: boolean
  }

  type ErrorType = Gateway.request.ErrorType
}
